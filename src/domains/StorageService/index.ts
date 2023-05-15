import { inject, injectable } from "inversify";

import Config from "../../@config";
import { waitFor } from "../../@utils/waitFor";
import { emitEvent } from "../../@utils/emitEvent";
import {
  NotFoundError,
  UnknownError,
  ValidateError,
} from "../../@utils/defineErrors";

import type {
  ContentClient,
  RecordClient,
  Repository,
  SchemaClient,
} from "../../@config/di.config";
import type { Schema } from "../../@types/schema";
import type { Project } from "../../@types/project";
import { BaseError } from "../../@types/baseError";

@injectable()
export class StorageService {
  private projectRepository: Repository<Project>;
  private recordClient: RecordClient;
  private schemaClient: SchemaClient;
  private contentClient: ContentClient;

  constructor(
    @inject("ProjectRepository") projectRepository: Repository<Project>,
    @inject("Route53RecordClient") route53RecordClient: RecordClient,
    @inject("AjvSchemaClient") ajvSchemaClient: SchemaClient,
    @inject("MongodbContentClient") mongodbContentClient: ContentClient,
  ) {
    this.projectRepository = projectRepository;
    this.recordClient = route53RecordClient;
    this.schemaClient = ajvSchemaClient;
    this.contentClient = mongodbContentClient;
  }

  async createStorageDomain({ projectName }: { projectName: string }) {
    try {
      const jaamToastCmsDomain = `api-${projectName}.${Config.SERVER_URL}`;
      const recordId = await this.recordClient.createARecord({
        recordName: jaamToastCmsDomain,
        recordTarget: Config.JAAM_SERVER_DNS_NAME,
      });

      await waitFor({
        act: () => this.recordClient.getRecordStatus({ recordId }),
        until: async isCreated => await isCreated,
      });

      emitEvent("STORAGE_CREATED", {
        storageDomain: jaamToastCmsDomain,
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteStorageDomain({ projectName }: { projectName: string }) {
    try {
      const jaamToastCmsDomain = `api-${projectName}.${Config.SERVER_URL}`;

      await this.recordClient.deleteARecord({
        recordName: jaamToastCmsDomain,
        recordTarget: Config.JAAM_SERVER_DNS_NAME,
      });
    } catch (error) {
      throw error;
    }
  }

  public async addSchema({
    projectName,
    schemaName,
    schema,
  }: {
    projectName: string;
    schemaName: string;
    schema: Schema;
  }) {
    const isValidated = this.schemaClient.validateSchema({
      schema,
    });

    if (!isValidated) {
      throw new ValidateError(
        "The schema field is not of JSON Schema or failed validation.",
      );
    }

    try {
      await this.contentClient.createStorage({
        projectName,
        jsonSchema: schema,
      });

      const [project] = await this.projectRepository.readDocument({
        documentId: projectName,
      });

      if (!project) {
        throw new NotFoundError("Cannot find Project data.");
      }

      emitEvent("SCHEMA_CREATED", {
        projectName,
        schemaName,
        schema,
      });
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }

      throw new UnknownError("Cannot update user info.", error);
    }
  }

  public async updateSchema({
    projectName,
    schemaName,
    schema,
  }: {
    projectName: string;
    schemaName: string;
    schema: Schema;
  }) {
    const isValidated = this.schemaClient.validateSchema({
      schema,
    });

    if (!isValidated) {
      throw new UnknownError(
        "The schema field is not of JSON Schema or failed validation.",
      );
    }

    try {
      const [project] = await this.projectRepository.readDocument({
        documentId: projectName,
      });

      if (!project) {
        throw new NotFoundError(
          "An error occurred while executing the event. Cannot find Project data.",
        );
      }

      const newSchemaList = project.schemaList.map(projectSchema =>
        projectSchema.schemaName === schemaName
          ? { schemaName, schema }
          : projectSchema,
      );

      await this.projectRepository.updateDocument({
        documentId: projectName,
        document: {
          schemaList: newSchemaList,
        },
      });

      emitEvent("SCHEMA_UPDATED", {
        projectName,
        schemaName,
        schema,
      });
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }

      throw new UnknownError("Cannot update schema.", error);
    }
  }

  public async deleteSchema({
    projectName,
    schemaName,
  }: {
    projectName: string;
    schemaName: string;
  }) {
    try {
      await this.contentClient.deleteStorage({
        projectName,
        schemaName,
      });

      emitEvent("SCHEMA_DELETED", {
        projectName,
        schemaName,
      });
    } catch (error) {
      throw new UnknownError("Cannot delete contents's storage.");
    }
  }
}
