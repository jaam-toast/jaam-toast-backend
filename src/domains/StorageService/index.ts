import { inject, injectable } from "inversify";

import Config from "../../@config";
import { waitFor } from "../../@utils/waitFor";
import { emitEvent } from "../../@utils/emitEvent";
import { UnknownError, ValidateError } from "../../@utils/defineErrors";

import type {
  ContentClient,
  RecordClient,
  Repository,
  SchemaClient,
} from "../../@config/di.config";
import type { Schema } from "../../@types/schema";
import type { Project } from "../../@types/project";

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
      /**
       * create CNAME record
       */
      const jaamToastStorageDomain = `api-${projectName}.${Config.SERVER_URL}`;
      const recordId = await this.recordClient.createARecord({
        recordName: jaamToastStorageDomain,
      });

      await waitFor({
        act: () => this.recordClient.getRecordStatus({ recordId }),
        until: async isCreated => await isCreated,
      });

      emitEvent("STORAGE_CREATED", {
        storageDomain: jaamToastStorageDomain,
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteStorageDomain({ projectName }: { projectName: string }) {
    // try {
    //   if (!projectName) {
    //     throw Error(CMS_MESSAGE.DELETE_ERROR.ENVIRONMENT_DATA_NOT_FOUND);
    //   }
    //   await deleteDomain({ subdomain: `api-${projectName}` });
    // } catch (error) {
    //   throw error;
    // }
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
        // TODO: fill error message.
        throw new ValidateError();
      }

      emitEvent("SCHEMA_CREATED", {
        projectName,
        schemaName,
        schema,
      });
    } catch (error) {
      // TODO: fill error message.
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
      throw new Error(
        "The schema field is not of JSON Schema or failed validation.",
      );
    }

    try {
      const [project] = await this.projectRepository.readDocument({
        documentId: projectName,
      });

      if (!project) {
        // TODO: fill error message.
        throw new ValidateError();
      }

      const updatedSchemaList = project.schemaList.map(projectSchema =>
        projectSchema.schemaName !== schemaName
          ? projectSchema
          : {
              schemaName,
              schema,
            },
      );

      emitEvent("SCHEMA_UPDATED", {
        projectName,
        schemaName,
        schema,
      });
    } catch (error) {
      throw new Error("Cannot update user info.");
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
    } catch (error) {
      throw new UnknownError("Cannot delete contents's storage.");
    }

    try {
      const [project] = await this.projectRepository.readDocument({
        documentId: projectName,
      });

      if (!project) {
        // TODO: fill error message.
        throw new Error();
      }

      emitEvent("SCHEMA_DELETED", {
        projectName,
        schemaName,
      });
    } catch (error) {
      throw new UnknownError("Cannot update user info.", error);
    }
  }
}
