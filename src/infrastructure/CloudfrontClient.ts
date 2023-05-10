import {
  CloudFrontClient as SdkCloudFrontClient,
  CreateCloudFrontOriginAccessIdentityCommand,
  CreateDistributionCommand,
  CreateInvalidationCommand,
  UpdateDistributionCommand,
  GetDistributionConfigCommand,
} from "@aws-sdk/client-cloudfront";
import { omit } from "lodash";

import Config from "./@config";

import type {
  UpdateDistributionCommandInput,
  CreateDistributionCommandInput,
  CreateCloudFrontOriginAccessIdentityCommandOutput,
  CreateDistributionCommandOutput,
} from "@aws-sdk/client-cloudfront";

const S3_ENDPOINT = "s3.amazonaws.com";

const getDefaultOptions = ({
  bucketName,
  OAI_ID,
}: {
  bucketName: string;
  OAI_ID: string;
}): CreateDistributionCommandInput => {
  return {
    DistributionConfig: {
      CallerReference: bucketName,
      Aliases: {
        Quantity: 1,
        Items: [bucketName],
      },
      Origins: {
        Quantity: 1,
        Items: [
          {
            Id: `${bucketName}.${S3_ENDPOINT}`,
            DomainName: `${bucketName}.${S3_ENDPOINT}`,
            S3OriginConfig: {
              OriginAccessIdentity: `origin-access-identity/cloudfront/${OAI_ID}`,
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
        TargetOriginId: `${bucketName}.${S3_ENDPOINT}`,
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
        Quantity: 1,
        Items: [
          {
            PathPattern: "*",
            TargetOriginId: `${bucketName}.${S3_ENDPOINT}`,
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
              Items: ["HEAD", "GET"],
              CachedMethods: {
                Quantity: 2,
                Items: ["HEAD", "GET"],
              },
            },
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
          },
        ],
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
      Comment: "STRING_VALUE",
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
        ACMCertificateArn:
          "arn:aws:acm:us-east-1:665465648042:certificate/2d84679c-3cbb-4b94-a512-383a73de75b1",
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
  };
};

export class CloudFrontClient {
  private client = new SdkCloudFrontClient({
    region: Config.AWS_REGION,
    apiVersion: "2006-03-01",
    credentials: {
      accessKeyId: Config.AWS_ACCESS_KEY_ID,
      secretAccessKey: Config.AWS_SECRET_ACCESS_KEY,
    },
  });

  async createOAI({
    bucketName,
  }: {
    bucketName: string;
  }): Promise<CreateCloudFrontOriginAccessIdentityCommandOutput> {
    try {
      const bucketUrl = `${bucketName}.s3.amazonaws.com`;
      const oaiCommand = new CreateCloudFrontOriginAccessIdentityCommand({
        CloudFrontOriginAccessIdentityConfig: {
          CallerReference: `${Date.now()}`,
          Comment: bucketUrl,
        },
      });

      const oaiResult = await this.client.send(oaiCommand);

      console.log("success", { oaiResult });
      return oaiResult;
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  }

  async deployment({
    bucketName,
    OAI_ID,
  }: {
    bucketName: string;
    OAI_ID: string;
  }): Promise<CreateDistributionCommandOutput> {
    // {
    //   response: {
    //     '$metadata': {
    //       httpStatusCode: 201,
    //       requestId: '34a88a63-eeb1-4f64-960c-bb516e8b1333',
    //       extendedRequestId: undefined,
    //       cfId: undefined,
    //       attempts: 1,
    //       totalRetryDelay: 0
    //     },
    //     Location: 'https://cloudfront.amazonaws.com/2020-05-31/distribution/E4DROL9PY2GIG',
    //     ETag: 'E3STQXXPLTQQII',
    //     Distribution: {
    //       Id: 'E4DROL9PY2GIG',
    //       ARN: 'arn:aws:cloudfront::665465648042:distribution/E4DROL9PY2GIG',
    //       Status: 'InProgress',
    //       LastModifiedTime: 2023-05-10T13:09:43.505Z,
    //       InProgressInvalidationBatches: 0,
    //       DomainName: 'd278jljs9zv71.cloudfront.net',
    //       ActiveTrustedSigners: [Object],
    //       ActiveTrustedKeyGroups: [Object],
    //       DistributionConfig: [Object]
    //     }
    //   }
    // }
    try {
      const command = new CreateDistributionCommand(
        getDefaultOptions({ bucketName, OAI_ID }),
      );
      const response = await this.client.send(command);
      console.log("success", { response });

      return response;
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  }

  async addCustomDomain({
    cloudFrontId,
    domainArray,
  }: {
    cloudFrontId: string;
    domainArray: string[];
  }) {
    try {
      const input = {
        Id: cloudFrontId,
      };
      const command = new GetDistributionConfigCommand(input);
      const data = await this.client.send(command);
      console.log("Distribution updated successfully", data);

      const config = data.DistributionConfig;

      if (!config) {
        return;
      }

      const updateInput: UpdateDistributionCommandInput = {
        ...omit(data, ["ETag", "$metadata"]),
        DistributionConfig: {
          ...config,
          Aliases: {
            Quantity: 2,
            Items: domainArray,
          },
        },
        IfMatch: data.ETag,
        Id: cloudFrontId,
      };

      console.log({ aa: JSON.stringify(updateInput, null, 2) });

      const updateDistributionCommand = new UpdateDistributionCommand(
        updateInput,
      );
      const response = await this.client.send(updateDistributionCommand);

      console.log("success", { response });
    } catch (error) {
      console.log("Error updating distribution", error);
      throw error;
    }
  }

  async createInvalidation({ cloudfrontId }: { cloudfrontId: string }) {
    try {
      const input = {
        DistributionId: cloudfrontId,
        InvalidationBatch: {
          Paths: {
            Quantity: 1,
            Items: ["/*"],
          },
          CallerReference: Date.now().toString(),
        },
      };
      const command = new CreateInvalidationCommand(input);
      const response = await this.client.send(command);

      console.log("success", { response });
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  }
}
