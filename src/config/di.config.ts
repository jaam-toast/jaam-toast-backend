import { Container } from "inversify";
import "reflect-metadata";

import { ProjectService } from "../domains/projectService";
import { BuildService } from "../domains/buildService";
import { CmsService } from "../domains/cmsService";
import { UserService } from "../domains/userService";
import { MongodbContentsClient } from "../infrastructure/mongodbContentsClient";
import { MongodbDatabaseClient } from "../infrastructure/mongodbDatabaseClient";
import { JwtTokenClient } from "../infrastructure/jwtTokenClient";
import { AjvSchemaClient } from "../infrastructure/ajvSchemaClient";

import type { Schema } from "../types/schema";
import type { Contents } from "../types/contents";

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
  .bind<ProjectService>("ProjectService")
  .to(ProjectService);

container
  .bind<BuildService>("BuildService")
  .to(BuildService);

container
  .bind<CmsService>("CmsService")
  .to(CmsService);

container
  .bind<UserService>("UserService")
  .to(UserService);

/**
 * Infrastructure Layer
 */

/*
* @Contents Client - Contents를 저장할 Storage와 Contents를 생성할 수 있습니다.
*/
export interface ContentsClient {
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

  createContents: (createContentsOptions: {
    projectName: string;
    schemaName: string;
    contents: Omit<Contents, "_id">;
  }) => Promise<string>;

  updateContents: (updateContentsOptions: {
    projectName: string;
    schemaName: string;
    contentsId: string;
    contents: Partial<Contents>;
  }) => Promise<void>;

  deleteContents: (deleteContentsOptions: {
    projectName: string;
    schemaName: string;
    contentsIds: string[];
  }) => Promise<void>;

  getContents: (getContentsOptions: {
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
  }) => Promise<Contents[]>;
}

container
  .bind<ContentsClient>("MongoDBContentsClient")
  .to(MongodbContentsClient);

/*
 * @Database Client - Database와 관련된 동작들(create, read, update, delete)을 수행합니다.
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
    filter?: { [key: string]: string };
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
  .bind<DatabaseClient>("MongoDBDatabaseClient")
  .to(MongodbDatabaseClient);

/*
 * @Token Client - Token을 생성하고 검증합니다.
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

/*
 * @Schema Client - Schema 형식을 검증하고, Schema에 맞게 data를 검증합니다.
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
