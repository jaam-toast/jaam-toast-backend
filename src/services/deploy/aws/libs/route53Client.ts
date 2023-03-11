import { Route53Client } from "@aws-sdk/client-route-53";

import Config from "../../../../config";

const REGION = Config.INSTANCE_REGION;

const route53Client = new Route53Client({ region: REGION });

export default route53Client;
