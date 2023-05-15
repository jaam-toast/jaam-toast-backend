import { Container } from "inversify";
import "reflect-metadata";

import { ProjectRepository } from "../domains/ProjectRepository";
import { UserRepository } from "../domains/UserRepository";
import { StorageService } from "../domains/StorageService";
import { ContentService } from "../domains/ContentsService";
import { BuildService } from "../domains/BuildService";
import { UserService } from "../domains/UserService";
import { S3CloudFrontDeploymentClient } from "../infrastructure/S3CloudFrontDeploymentClient";
import { MongodbContentClient } from "../infrastructure/MongodbContentClient";
import { MongodbDatabaseClient } from "../infrastructure/MongodbDatabaseClient";
import { JwtTokenClient } from "../infrastructure/JwtTokenClient";
import { AjvSchemaClient } from "../infrastructure/AjvSchemaClient";
import { Route53RecordClient } from "../infrastructure/Route53RecordClient";
import { SocketClient } from "../infrastructure/SocketClient";
import { GithubClient } from "../infrastructure/GithubClient";

import type { Schema } from "../@types/schema";
import type { Content } from "../@types/content";
import type { Project } from "../@types/project";
import type { User } from "../@types/user";
import type { S3CloudFrontDeploymentData } from "../infrastructure/S3CloudFrontDeploymentClient";
/**
 * - 의존성 등록
 *   - identifier(ex "ProjectService" 등 string으로 입력된 곳)를 to("등록할 곳")에 등록합니다.
 *
 * - 의존성 주입
 *   - class의 constructor에 `@inject` decorator를 사용해 의존성을 주입시킵니다.
 *   - ex) `constructor(@inject("BuildService") buildService: BuildService) {}`
 *
 */
export const container = new Container();

/**
 * Domain Layer
 */
container
  .bind<BuildService>("BuildService")
  .to(BuildService);

container
  .bind<StorageService>("StorageService")
  .to(StorageService);

container
  .bind<ContentService>("ContentService")
  .to(ContentService)

container
  .bind<UserService>("UserService")
  .to(UserService);

/**
 * Repository
 */
export interface Repository<Document> {
  createDocument: (createDocumentOptions: {
    document: Omit<Document, "_id">;
  }) => Promise<string[]>;

  readDocument: (readDocumentOptions: {
    documentId?: string;
    filter?: { [key: string]: string | number | boolean };
  }) => Promise<(Document | null)[]>;

  updateDocument: (updateDocumentOptions: {
    documentId: string;
    document: Partial<Document>;
  }) => Promise<void>;

  deleteDocument: (deleteDocumentOptions: {
    documentId: string;
  }) => Promise<void>;
}

container
  .bind<Repository<Project>>("ProjectRepository")
  .to(ProjectRepository);

container
  .bind<Repository<User>>("UserRepository")
  .to(UserRepository);

/**
 * Infrastructure Layer
 */

// Build Client
export interface DeploymentClient {
  createDeployment: (createDeploymentOptions: {
    domainName: string;
    resourcePath: string;
  }) => Promise<{
    deploymentData: S3CloudFrontDeploymentData;
    originalBuildDomain: string
  }>;

  updateDeployment: (updateDeploymentOptions: {
    domainName: string;
    resourcePath: string;
    deploymentData: S3CloudFrontDeploymentData;
  }) => Promise<void>;

  getDeploymentStauts?: (getDeploymentStautsOptions: {
    domainName: string;
  }) => Promise<boolean>;

  deleteDeployment: (deleteDeploymentOptions: {
    domainName: string;
    deploymentData: S3CloudFrontDeploymentData;
  }) => Promise<void>;

  updateDeploymentDomain: (updateDeploymentDomainOptions: {
    deploymentData: S3CloudFrontDeploymentData,
    domain: string[],
  }) => Promise<void>;
}

container
  .bind<DeploymentClient>("S3CloudFrontDeploymentClient")
  .to(S3CloudFrontDeploymentClient);

/**
 * Content Client: Content를 저장할 Storage와 Content를 생성할 수 있습니다.
*/
export interface ContentClient {
  createStorage: (createStorageOptions: {
    jsonSchema: {
      title: string;
    };
    projectName: string;
  }) => Promise<void>;

  deleteStorage: (deleteStorageOptions: {
    projectName: string;
    schemaName: string;
  }) => Promise<void>;

  createContent: (createContentOptions: {
    projectName: string;
    schemaName: string;
    content: Omit<Content, "_id">;
  }) => Promise<string>;

  updateContent: (updateContentOptions: {
    projectName: string;
    schemaName: string;
    contentId: string;
    content: Partial<Content>;
  }) => Promise<void>;

  deleteContent: (deleteContentOptions: {
    projectName: string;
    schemaName: string;
    contentIds: string[];
  }) => Promise<void>;

  queryContents: (getContentOptions: {
    projectName: string;
    schemaName: string;
    pagination?: {
      page?: number;
      pageLength?: number;
    };
    sort?: {
      [key: string]: "asc" | "desc" | "ascending" | "descending";
    }[];
    filter?: {
      [key: string]: string | number | boolean;
    };
  }) => Promise<(Content | null)[]>;

  getContentsTotalCount: (getContentsTotalCountOptions: {
    projectName: string;
    schemaName: string;
    filter?: {
      [key: string]: string | number | boolean;
    };
  }) => Promise<number>;
}

container
  .bind<ContentClient>("MongodbContentClient")
  .to(MongodbContentClient);

/**
 * Database Client: Database와 관련된 동작들(create, read, update, delete)을 수행합니다.
*/
export interface DatabaseClient {
  create: <Document extends { [key: string]: unknown }>(createOptions: {
    dbName: string;
    collectionName: string;
    document: Document | Document[];
  }) => Promise<string[]>;

  read: <Document extends { [key: string]: unknown }>(readOptions: {
    dbName: string;
    collectionName: string;
    id?: string | string[];
    filter?: { [key: string]: string | number | boolean };
  }) => Promise<(Document | null)[]>;

  update: <Document extends { [key: string]: unknown }>(updateOptions: {
    dbName: string;
    collectionName: string;
    id?: string | string[];
    filter?: { [key: string]: string };
    document: Partial<Document>;
  }) => Promise<void>;

  delete: (deleteOptions: {
    dbName: string;
    collectionName: string;
    id?: string | string[];
    filter?: { [key: string]: string };
  }) => Promise<void>;
}

container
  .bind<DatabaseClient>("MongodbDatabaseClient")
  .to(MongodbDatabaseClient);

/**
 * Token Client: Token을 생성하고 검증합니다.
*/
export interface TokenClient {
  createToken: ({
    payload,
    key,
    options,
  }: {
    payload: Payload;
    key: string;
    options?: { expiresIn?: string | number };
  }) => string;

  validateToken: ({
    token,
    key,
  }: {
    token: string;
    key: string;
  }) => Payload | null;
}

export type Payload = Record<
  string,
  | string
  | number
  | boolean
  | null
  | Array<string | number | boolean | null>
  | Record<
      string,
      string | number | boolean | null | Array<string | number | boolean | null>
    >
>;

container
  .bind<TokenClient>("JwtTokenClient")
  .to(JwtTokenClient);

/**
 * Schema Client: Schema 형식을 검증하고, Schema에 맞게 data를 검증합니다.
*/
export interface SchemaClient {
  validateSchema: (validateSchemaOptions: {
    schema: Schema
  }) => boolean;

  validateData: (validateDataOptions: {
    schema: Schema;
    data: unknown;
  }) => boolean;
}

container
  .bind<SchemaClient>("AjvSchemaClient")
  .to(AjvSchemaClient);

/**
 * RecordClient: A Record / CNAME을 생성, 삭제하고 status를 가져올 수 있습니다.
*/
export interface RecordClient {
  createARecord: (createARecordOptions: {
    recordTarget: string;
    recordName: string;
  }) => Promise<string>;

  deleteARecord: (deleteARecordOptions: {
    recordName: string;
    recordTarget: string;
  }) => Promise<void>;

  createCNAME: (createCNAMEOptions: {
    recordName: string;
    recordTarget: string;
  }) => Promise<string>;

  deleteCNAME: (deleteCNAMEOptions: {
    recordName: string;
    recordTarget: string;
  }) => Promise<void>;

  getRecordStatus: (getRecordStatusOptions: {
    recordId: string;
  }) => Promise<boolean>;
}

container
  .bind<RecordClient>("Route53RecordClient")
  .to(Route53RecordClient);

/**
 * Socket Client
*/
container
  .bind<SocketClient>("SocketClient")
  .to(SocketClient);

/**
 * Github Client
*/
container
  .bind<GithubClient>("GithubClient")
  .to(GithubClient);
