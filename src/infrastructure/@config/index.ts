import dotenv from "dotenv";
dotenv.config();

const Config = {
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID!,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET!,
  GITHUB_REDIRECT_URL: process.env.GITHUB_REDIRECT_URL!,

  AWS_REGION: process.env.AWS_INSTANCE_REGION,
  AWS_HOSTED_ZONE_ID: process.env.AWS_HOSTED_ZONE_ID!,
  AWS_DNS_HOSTED_ZONE_ID: process.env.AWS_DNS_HOSTED_ZONE_ID!,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID!,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY!,
  AWS_JAAM_SERVER_DNS_NAME: process.env.AWS_JAAM_SERVER_DNS_NAME!,
  AWS_CLOUDFRONT_HOSTED_ZONE_ID: process.env.AWS_CLOUDFRONT_HOSTED_ZONE_ID!,
  AWS_CERTIFICATE_ARN:
    "arn:aws:acm:us-east-1:665465648042:certificate/2d84679c-3cbb-4b94-a512-383a73de75b1",
};

export default Config;
