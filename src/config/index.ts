import dotenv from "dotenv";

process.env.NODE_ENV = process.env.NODE_ENV || "development";

dotenv.config();

const Config = {
  DATABASE_URL: process.env.MONGODB_URI!,
  APP_DB_NAME: process.env.APP_DB_NAME!,
  JWT_SECRET: process.env.JWT_SECRET_KEY!,
  SERVER_URL: process.env.ORIGIN_SERVER_URL!,
  SERVER_IP: process.env.ORIGIN_SERVER_IP!,
  SERVER_PORT: process.env.SERVER_PORT!,
  SERVER_DOMAIN: process.env.SERVER_DOMAIN!,
  CLIENT_URL: process.env.CLIENT_URL!,

  // 변경중
  CLIENT_ID: process.env.GITHUB_CLIENT_ID!,
  CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET!,
  USER_CREDENTIAL_ID: process.env.GITHUB_USER_CREDENTIAL_ID!,
  USER_CREDENTIAL_TOKEN: process.env.GITHUB_USER_CREDENTIAL_TOKEN!,
  WEBHOOK_SECRET_KEY: process.env.GITHUB_WEBHOOK_SECRET_KEY!,
  WEBHOOK_PAYLOAD_URL: process.env.GITHUB_WEBHOOK_PAYLOAD_URL!,

  CONTENTS_DATABASE_URL: process.env.MONGODB_CONTENTS_URI!,
  STORAGE_JWT_SECRET: process.env.STORAGE_JWT_SECRET!,
  MAX_NUMBER_PER_PAGE: 20,

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
