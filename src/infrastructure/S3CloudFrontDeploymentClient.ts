import { createReadStream } from "fs";
import { readdir } from "fs/promises";
import path from "path";
import { injectable } from "inversify";
import {
  S3Client,
  CreateBucketCommand,
  PutObjectCommand,
  PutBucketPolicyCommand,
  GetBucketPolicyStatusCommand,
} from "@aws-sdk/client-s3";
import {
  CloudFrontClient,
  CreateCloudFrontOriginAccessIdentityCommand,
  GetCloudFrontOriginAccessIdentityCommand,
  CreateDistributionCommand,
  CreateInvalidationCommand,
  UpdateDistributionCommand,
  GetDistributionConfigCommand,
} from "@aws-sdk/client-cloudfront";

import Config from "./@config";

import type { DeploymentClient } from "../@config/di.config";
import { waitFor } from "../@utils/waitFor";

@injectable()
export class S3CloudFrontDeploymentClient implements DeploymentClient {
  private s3Client = new S3Client({
    region: Config.AWS_REGION,
    apiVersion: "2006-03-01",
    credentials: {
      accessKeyId: Config.AWS_ACCESS_KEY_ID,
      secretAccessKey: Config.AWS_SECRET_ACCESS_KEY,
    },
  });

  private cloudFrontClient = new CloudFrontClient({
    region: Config.AWS_REGION,
    apiVersion: "2006-03-01",
    credentials: {
      accessKeyId: Config.AWS_ACCESS_KEY_ID,
      secretAccessKey: Config.AWS_SECRET_ACCESS_KEY,
    },
  });

  private async getFiles({
    resourcePath,
  }: {
    resourcePath: string;
  }): Promise<string[]> {
    const dirents = await readdir(resourcePath, { withFileTypes: true });
    const files = await Promise.all(
      dirents.map(dirent => {
        const direntPath = path.resolve(resourcePath, dirent.name);

        return dirent.isDirectory()
          ? this.getFiles({ resourcePath: direntPath })
          : direntPath;
      }),
    );

    return files.flat();
  }

  async createDeployment({
    domainName,
    resourcePath,
  }: {
    domainName: string;
    resourcePath: string;
  }) {
    try {
      /**
       * Create S3 Bucket
       */
      const createBucketCommand = new CreateBucketCommand({
        Bucket: domainName,
      });

      await this.s3Client.send(createBucketCommand);

      /**
       * Upload Files to S3
       */
      const files = await this.getFiles({ resourcePath });

      for await (const filePath of files) {
        const contentType = (() => {
          switch (path.extname(filePath)) {
            case ".js":
              return "application/javascript";
            case ".html":
              return "text/html";
            case ".txt":
              return "text/plain";
            case ".json":
              return "application/json";
            case ".ico":
              return "image/x-icon";
            case ".svg":
              return "image/svg+xml";
            case ".css":
              return "text/css";
            case ".jpg":
            case ".jpeg":
              return "image/jpeg";
            case ".png":
              return "image/png";
            case ".webp":
              return "image/webp";
            case ".map":
              return "binary/octet-stream";
            default:
              return "application/octet-stream";
          }
        })();
        const putObjectCommand = new PutObjectCommand({
          Key: path.relative(resourcePath, filePath),
          Bucket: domainName,
          Body: createReadStream(filePath),
          ContentType: contentType,
        });

        await this.s3Client.send(putObjectCommand);
      }

      /**
       * Create CloudFront OAI from S3 Bucket
       */
      const createOaiCommand = new CreateCloudFrontOriginAccessIdentityCommand({
        CloudFrontOriginAccessIdentityConfig: {
          CallerReference: domainName,
          Comment: `${domainName}.s3.amazonaws.com`,
        },
      });
      const createOaiResult = await this.cloudFrontClient.send(
        createOaiCommand,
      );
      const oaiId = createOaiResult?.CloudFrontOriginAccessIdentity?.Id;

      if (!oaiId) {
        throw new Error(
          "Cannot find the OAI ID after creating an OAI for S3 bucket.",
        );
      }

      /**
       * Create Policy to S3 Bucket
       */
      const bucketPolicy = JSON.stringify({
        Version: "2008-10-17",
        Id: "PolicyForCloudFrontPrivateContent",
        Statement: [
          {
            Sid: "1",
            Effect: "Allow",
            Principal: {
              AWS: `arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity ${oaiId}`,
            },
            Action: "s3:GetObject",
            Resource: `arn:aws:s3:::${domainName}/*`,
          },
        ],
      });
      const putPolicyCommand = new PutBucketPolicyCommand({
        Bucket: domainName,
        Policy: bucketPolicy,
      });

      await waitFor({
        act: async () => this.s3Client.send(putPolicyCommand),
        until: async result => !!(await result),
        intervalTime: 1000,
      });

      /**
       * Create CloudFront Di333stribution
       */

      const createDistributionCommand = new CreateDistributionCommand({
        DistributionConfig: {
          DefaultRootObject: "index.html",
          CallerReference: domainName,
          Aliases: {
            Quantity: 1,
            Items: [domainName],
          },
          Origins: {
            Quantity: 1,
            Items: [
              {
                Id: `${domainName}.s3.amazonaws.com`,
                DomainName: `${domainName}.s3.amazonaws.com`,
                S3OriginConfig: {
                  OriginAccessIdentity: `origin-access-identity/cloudfront/${oaiId}`,
                },
                OriginShield: {
                  Enabled: false,
                },
              },
            ],
          },
          OriginGroups: {
            Quantity: 0,
            Items: [],
          },
          DefaultCacheBehavior: {
            TargetOriginId: `${domainName}.s3.amazonaws.com`,
            TrustedSigners: {
              Enabled: false,
              Quantity: 0,
              Items: [],
            },
            TrustedKeyGroups: {
              Enabled: false,
              Quantity: 0,
              Items: [],
            },
            ViewerProtocolPolicy: "redirect-to-https",
            AllowedMethods: {
              Quantity: 2,
              Items: ["GET", "HEAD"],
              CachedMethods: {
                Quantity: 2,
                Items: ["GET", "HEAD"],
              },
            },
            SmoothStreaming: false,
            Compress: true,
            LambdaFunctionAssociations: {
              Quantity: 0,
              Items: [],
            },
            FunctionAssociations: {
              Quantity: 0,
              Items: [],
            },
            ForwardedValues: {
              QueryString: false,
              Cookies: {
                Forward: "none",
                WhitelistedNames: {
                  Quantity: 0,
                  Items: [],
                },
              },
              Headers: {
                Quantity: 0,
                Items: [],
              },
              QueryStringCacheKeys: {
                Quantity: 0,
                Items: [],
              },
            },
            MinTTL: 0,
            DefaultTTL: 86400,
            MaxTTL: 31536000,
          },
          CacheBehaviors: {
            Quantity: 0,
          },
          CustomErrorResponses: {
            Quantity: 2,
            Items: [
              {
                ErrorCode: 403,
                ResponsePagePath: "/index.html",
                ResponseCode: "200",
                ErrorCachingMinTTL: 10,
              },
              {
                ErrorCode: 404,
                ResponsePagePath: "/index.html",
                ResponseCode: "200",
                ErrorCachingMinTTL: 10,
              },
            ],
          },
          Comment: domainName,
          Logging: {
            Enabled: false,
            IncludeCookies: false,
            Bucket: "",
            Prefix: "",
          },
          PriceClass: "PriceClass_200",
          Enabled: true,
          ViewerCertificate: {
            CloudFrontDefaultCertificate: false,
            ACMCertificateArn: Config.AWS_CERTIFICATE_ARN,
            SSLSupportMethod: "sni-only",
            MinimumProtocolVersion: "TLSv1.2_2021",
            CertificateSource: "acm",
          },
          Restrictions: {
            GeoRestriction: {
              RestrictionType: "none",
              Quantity: 0,
              Items: [],
            },
          },
          IsIPV6Enabled: true,
        },
      });
      const createDistributionResult = await this.cloudFrontClient.send(
        createDistributionCommand,
      );
      const originalBuildDomain =
        createDistributionResult.Distribution?.DomainName;

      if (!originalBuildDomain) {
        throw new Error(
          "Cannot find the distribution domain after deploying CloudFront.",
        );
      }

      return originalBuildDomain;
    } catch (error) {
      throw error;
    }
  }

  async deleteDeployment({ domainName }: { domainName: string }) {}
}
