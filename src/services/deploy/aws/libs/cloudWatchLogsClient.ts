import { CloudWatchLogsClient } from "@aws-sdk/client-cloudwatch-logs";

import Config from "@src/config";

const REGION = Config.INSTANCE_REGION;

const cwlClient = new CloudWatchLogsClient({ region: REGION });

export default cwlClient;
