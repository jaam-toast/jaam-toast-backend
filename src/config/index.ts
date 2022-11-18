import dotenv from "dotenv";

process.env.NODE_ENV = process.env.NODE_ENV || "development";

dotenv.config();

const Config = {
  DATABASE_URL: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET_KEY,
  SERVER_URL: process.env.ORIGIN_SERVER_URL,
  CLIENT_URL: process.env.CLIENT_URL,
  CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  USER_CREDENTIAL_ID: process.env.GITHUB_USER_CREDENTIAL_ID,
  USER_CREDENTIAL_TOKEN: process.env.GITHUB_USER_CREDENTIAL_TOKEN,
  WEBHOOK_SECRET_KEY: process.env.GITHUB_WEBHOOK_SECRET_KEY,
  WEBHOOK_PAYLOAD_URL: process.env.GITHUB_WEBHOOK_PAYLOAD_URL,
  INSTANCE_TYPE: process.env.AWS_INSTANCE_TYPE,
  AMI_ID: process.env.AWS_AMI_ID,
  KEY_PAIR_NAME: process.env.AWS_KEY_PAIR_NAME,
  IAM_INSTANCE_PROFILE: process.env.AWS_IAM_INSTANCE_PROFILE,
  INSTANCE_REGION: process.env.AWS_INSTANCE_REGION,
  HOSTED_ZONE_ID: process.env.AWS_HOSTED_ZONE_ID,
  NODEJS_FERMIUM: "14.21.0",
  NODEJS_GALLIUM: "16.18.0",
  CLIENT_OPTIONS: {
    debug: true,
  },
  LOG_FILTERS: {
    verbose: " ",
    userDataFilter: "-epel -HTTP -fedora -Length",
    cloudInitFilter:
      "?cloud ?init -systemd -kernel -rsyslogd -journal -augenrules -rngd -acpid -chronyd -ec2net -auditd -audispd -dhclient -hibinit -network -ssm -cloudwatch -SHA256 -SSH -info",
  },
};

export default Config;
