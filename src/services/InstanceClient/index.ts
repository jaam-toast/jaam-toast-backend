import {
  EC2Client,
  RunInstancesCommand,
  DescribeInstancesCommand,
  TerminateInstancesCommand,
} from "@aws-sdk/client-ec2";
import Config from "../../config";

class InstanceClient {
  client = new EC2Client({ region: Config.INSTANCE_REGION });

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

      return instanceId;
    } catch (error) {
      throw new Error(
        "Error: Run failed by sending create instance commands to AWS EC2 Client.",
      );
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

      return {
        publicIpAddress,
        instanceStateName,
      };
    } catch (error) {
      throw new Error(
        "Error: Run failed by sending describe instance state commands to AWS EC2 Client.",
      );
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
      throw new Error(
        "Error: Run failed by sending terminate instance commands to AWS EC2 Client.",
      );
    }
  }
}

export default InstanceClient;
