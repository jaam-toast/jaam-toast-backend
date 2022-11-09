import { EC2Client } from "@aws-sdk/client-ec2";

import Config from "../../../config";

const REGION = Config.INSTANCE_REGION;

const ec2Client = new EC2Client({ region: REGION });

export default ec2Client;
