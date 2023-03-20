import {
  EC2Client,
  RunInstancesCommand,
  TerminateInstancesCommand,
  DescribeInstancesCommand,
} from "@aws-sdk/client-ec2";
import { Client as SSHClient } from "ssh2";

import Config from "@src/config";
import { readFileSync } from "fs";
import AsyncChainingClass from "../AsyncChainingClass";

class InstanceClient extends AsyncChainingClass {
  private client = new EC2Client({
    credentials: {
      accessKeyId: Config.ACCESS_KEY_ID,
      secretAccessKey: Config.SECRET_ACCESS_KEY,
    },
    region: Config.INSTANCE_REGION,
  });

  private instanceId?: string;
  private publicIpAddress?: string;
  private instanceStateName?: string;
  private connection: SSHClient | null = null;

  async create(userDataScripts: string[]) {
    try {
      const createInstanceOptions = {
        ImageId: Config.AMI_ID,
        InstanceType: Config.INSTANCE_TYPE,
        KeyName: Config.KEY_PAIR_NAME,
        MinCount: 1,
        MaxCount: 1,
        UserData: Buffer.from(userDataScripts.join("\n")).toString("base64"),
        IamInstanceProfile: {
          Arn: Config.IAM_INSTANCE_PROFILE,
        },
      };
      const command = new RunInstancesCommand(createInstanceOptions);
      const data = await this.client.send(command);
      const instanceId = data?.Instances?.[0]?.InstanceId;

      this.instanceId = instanceId;

      return instanceId;
    } catch (error) {
      throw error;
    }
  }

  async getState(instanceId: string) {
    try {
      const getInstanceOptions = {
        InstanceIds: [instanceId],
        DryRun: false,
      };
      const command = new DescribeInstancesCommand(getInstanceOptions);
      const data = await this.client.send(command);
      const instance = data?.Reservations?.[0]?.Instances?.[0];
      const publicIpAddress = instance?.PublicIpAddress;
      const instanceStateName = instance?.State?.Name;

      this.publicIpAddress = publicIpAddress;
      this.instanceStateName = instanceStateName;

      return {
        publicIpAddress,
        instanceStateName,
      };
    } catch (error) {
      throw error;
    }
  }

  async remove(instanceId: string) {
    try {
      const removeInstanceOptions = {
        InstanceIds: [instanceId],
        DryRun: false,
      };
      const command = new TerminateInstancesCommand(removeInstanceOptions);

      await this.client.send(command);
    } catch (error) {
      throw error;
    }
  }

  connect() {
    this.chain(async () => {
      if (!this.instanceId) {
        throw new Error(
          "instance에 연결하기 전에 먼저 instance를 생성해야 합니다.",
        );
      }
      if (!this.publicIpAddress) {
        const { publicIpAddress } = await this.getState(this.instanceId);

        if (!publicIpAddress) {
          throw new Error(
            "pulic ip address가 아직 생성되지 않은 인스턴스입니다.",
          );
        }

        this.publicIpAddress = publicIpAddress;
      }

      const connection = new SSHClient();

      this.connection = connection;

      const hostName = this.publicIpAddress?.replace(/[.]/g, "-");
      const keyPairName = "jaam-toast-project-deployment";

      await new Promise<void>((resolve, reject) => {
        connection.on("error", reject);

        connection.on("ready", () => {
          console.log("client is ready.");
          connection.removeListener("error", reject);
          resolve();
        });
        connection.on("end", () => {
          if (this.connection === connection) {
            this.connection = null;
          }
        });
        connection.on("close", () => {
          if (this.connection === connection) {
            this.connection = null;
          }
          reject(new Error("No response from server"));
        });

        connection.connect({
          host: `ec2-${hostName}.compute-1.amazonaws.com`,
          port: 22,
          username: "ec2-user",
          privateKey: readFileSync(
            `/Users/gongjaehyeok/.ssh/${keyPairName}.pem`,
          ),
        });
      });
    });

    return this;
  }

  exec(...commands: string[]) {
    this.chain(async () => {
      if (!this.connection) {
        throw new Error(
          "instance에 커맨드를 실행하려면 인스턴스와 접속한 상태여야 합니다.",
        );
      }

      const connection = this.connection!;

      await new Promise<void>((resolve, reject) => {
        connection.exec(commands.join(" && "), (error, stream) => {
          if (error) {
            throw error;
          }

          stream.on("close", () => {
            console.log("command 접속 종료.");
            this.connection = null;
            connection.end();
          });
          stream.on("data", (data: string) => {
            console.log(data.toString());
          });
          stream.stderr.on("data", (data: string) =>
            console.log("Error: ", data.toString()),
          );

          stream.on("end", resolve);
        });
      });
    });

    return this;
  }
}

export default InstanceClient;
