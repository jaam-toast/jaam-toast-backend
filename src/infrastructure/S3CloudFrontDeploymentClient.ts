import { createReadStream } from "fs";
import { readdir } from "fs/promises";
import path from "path";
import { injectable } from "inversify";
import {
  S3Client,
  CreateBucketCommand,
  PutObjectCommand,
  PutBucketPolicyCommand,
  ListObjectsCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import {
  CloudFrontClient,
  CreateCloudFrontOriginAccessIdentityCommand,
  DeleteCloudFrontOriginAccessIdentityCommand,
  CreateInvalidationCommand,
  CreateDistributionCommand,
  UpdateDistributionCommand,
  DeleteDistributionCommand,
  GetDistributionConfigCommand,
} from "@aws-sdk/client-cloudfront";
import { omit } from "lodash";
import { Cron } from "croner";

import Config from "./@config";
import { waitFor } from "../@utils/waitFor";
import * as log from "../@utils/log";

import type { DeploymentClient } from "../@config/di.config";

export type S3CloudFrontDeploymentData = {
  deploymentId?: string;
  oaiId?: string;
  oaiETag?: string;
};

type DeleteMessage = {
  createdAt: number;
  payload: S3CloudFrontDeploymentData & {
    distributionEtag: string;
  };
};

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

  constructor() {
    this.initDeleteDistributionCronJob();
  }

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

  private async uploadBucket({
    bucketName,
    resourcePath,
  }: {
    bucketName: string;
    resourcePath: string;
  }) {
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
        Bucket: bucketName,
        Body: createReadStream(filePath),
        ContentType: contentType,
      });

      await this.s3Client.send(putObjectCommand);
    }
  }

  private async clearBucket({ bucketName }: { bucketName: string }) {
    try {
      const listCommand = new ListObjectsCommand({
        Bucket: bucketName,
      });
      const listResult = await this.s3Client.send(listCommand);

      if (!listResult.Contents) {
        return;
      }

      const deleteObjectsCommand = new DeleteObjectsCommand({
        Bucket: bucketName,
        Delete: {
          Objects: listResult.Contents.map(({ Key }) => ({ Key })),
        },
      });

      await this.s3Client.send(deleteObjectsCommand);
    } catch (error) {
      throw error;
    }
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
      await this.uploadBucket({
        bucketName: domainName,
        resourcePath,
      });

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
      const oaiETag = createOaiResult?.ETag;

      if (!oaiId || !oaiETag) {
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
       * Create CloudFront Distribution
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
      const deploymentId = createDistributionResult.Distribution?.Id;

      if (!originalBuildDomain || !deploymentId) {
        throw new Error(
          "Cannot find the distribution domain after deploying CloudFront.",
        );
      }

      return {
        deploymentData: {
          deploymentId,
          oaiId,
          oaiETag,
        },
        originalBuildDomain,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateDeployment({
    domainName,
    resourcePath,
    deploymentData,
  }: {
    domainName: string;
    resourcePath: string;
    deploymentData: S3CloudFrontDeploymentData;
  }) {
    try {
      /**
       * Reupload S3 Bucket
       */
      await this.clearBucket({
        bucketName: domainName,
      });
      await this.uploadBucket({
        bucketName: domainName,
        resourcePath,
      });

      /**
       * Create CloudFront Distribution Invalidation
       */
      const command = new CreateInvalidationCommand({
        DistributionId: deploymentData.deploymentId,
        InvalidationBatch: {
          Paths: {
            Quantity: 1,
            Items: ["/*"],
          },
          CallerReference: domainName,
        },
      });

      await this.cloudFrontClient.send(command);
    } catch (error) {
      throw error;
    }
  }

  async deleteDeployment({
    domainName,
    deploymentData,
  }: {
    domainName: string;
    deploymentData: S3CloudFrontDeploymentData;
  }) {
    try {
      await this.clearBucket({
        bucketName: domainName,
      });

      /**
       * disable distibution
       */
      const command = new GetDistributionConfigCommand({
        Id: deploymentData.deploymentId,
      });
      const defaultCommandConfig = await this.cloudFrontClient.send(command);

      if (
        !defaultCommandConfig ||
        !defaultCommandConfig.DistributionConfig ||
        !defaultCommandConfig.ETag
      ) {
        return;
      }

      const disableContributionCommand = new UpdateDistributionCommand({
        ...omit(defaultCommandConfig, ["ETag", "$metadata"]),
        Id: deploymentData.deploymentId,
        DistributionConfig: {
          ...defaultCommandConfig.DistributionConfig,
          Enabled: false,
        },
        IfMatch: defaultCommandConfig.ETag,
      });

      await this.cloudFrontClient.send(disableContributionCommand);

      const deleteMessage = {
        createdAt: Date.now(),
        payload: {
          distributionEtag: defaultCommandConfig.ETag,
          ...deploymentData,
        },
      };

      this.publishDeleteMessageQueue(deleteMessage);
    } catch (error) {
      throw error;
    }
  }

  private deleteMessageQueue: DeleteMessage[] = [];

  private publishDeleteMessageQueue(deleteMessage: DeleteMessage) {
    this.deleteMessageQueue.push(deleteMessage);
  }

  private initDeleteDistributionCronJob() {
    Cron("*/10 * * * *", () => {
      if (this.deleteMessageQueue.length === 0) {
        return;
      }

      while (
        Date.now() - this.deleteMessageQueue[0].createdAt >
        1000 * 60 * 10
      ) {
        this.deleteDistribution(this.deleteMessageQueue[0].payload);
        this.deleteMessageQueue.shift();
      }
    });
  }

  private async deleteDistribution({
    distributionEtag,
    deploymentId,
    oaiId,
    oaiETag,
  }: S3CloudFrontDeploymentData & {
    distributionEtag: string;
  }) {
    try {
      /**
       * delete distribution
       */
      const deleteDistributionCommand = new DeleteDistributionCommand({
        Id: deploymentId,
        IfMatch: distributionEtag,
      });

      await this.cloudFrontClient.send(deleteDistributionCommand);

      /**
       * delete oai
       */
      const deleteOaiCommand = new DeleteCloudFrontOriginAccessIdentityCommand({
        Id: oaiId,
        IfMatch: oaiETag,
      });

      await this.cloudFrontClient.send(deleteOaiCommand);
    } catch (error) {
      if (error instanceof Error) {
        log.serverError(error.name, error.message, error.stack ?? "");
      }
    }
  }

  async updateDeploymentDomain({
    deploymentData,
    domain,
  }: {
    deploymentData: S3CloudFrontDeploymentData;
    domain: string[];
  }) {
    try {
      const getDistributionCommand = new GetDistributionConfigCommand({
        Id: deploymentData.deploymentId,
      });
      const getDistributionResult = await this.cloudFrontClient.send(
        getDistributionCommand,
      );

      if (!getDistributionResult.DistributionConfig) {
        throw new Error("Cannot update deployment domain.");
      }

      const updateDistributionCommand = new UpdateDistributionCommand({
        ...omit(getDistributionResult, ["ETag", "$metadata"]),
        DistributionConfig: {
          ...getDistributionResult.DistributionConfig,
          Aliases: {
            Quantity: domain.length,
            Items: domain,
          },
        },
        IfMatch: getDistributionResult.ETag,
        Id: deploymentData.deploymentId,
      });

      await this.cloudFrontClient.send(updateDistributionCommand);
    } catch (error) {
      throw error;
    }
  }
}
