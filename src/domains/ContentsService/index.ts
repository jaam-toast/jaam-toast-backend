import { inject, injectable } from "inversify";

import type {
  ContentClient,
  Repository,
  SchemaClient,
} from "../../@config/di.config";
import { NotFoundError, ValidateError } from "../../@utils/defineErrors";
import { emitEvent } from "../../@utils/emitEvent";

import type { Project } from "../../@types/project";

@injectable()
export class ContentService {
  private projectRepository: Repository<Project>;
  private contentClient: ContentClient;
  private schemaClient: SchemaClient;

  constructor(
    @inject("ProjectRepository") projectRepository: Repository<Project>,
    @inject("MongodbContentClient") mongodbContentClient: ContentClient,
    @inject("AjvSchemaClient") ajvSchemaClient: SchemaClient,
  ) {
    this.projectRepository = projectRepository;
    this.contentClient = mongodbContentClient;
    this.schemaClient = ajvSchemaClient;
  }

  public async createContent({
    projectName,
    schemaName,
    content,
  }: {
    projectName: string;
    schemaName: string;
    content: { [key: string]: unknown };
  }) {
    try {
      const [project] = await this.projectRepository.readDocument({
        documentId: projectName,
      });
      const createdAt = new Date().toISOString();

      if (!project) {
        throw new NotFoundError("Cannot find project");
      }

      const schemaData = project.schemaList.find(
        schema => schema.schemaName === schemaName,
      );

      if (!schemaData) {
        throw new NotFoundError("Cannot find schema");
      }

      const isValidated = this.schemaClient.validateData({
        schema: schemaData.schema,
        data: content,
      });

      if (!isValidated) {
        // TODO: fill error message.
        throw new ValidateError();
      }

      await this.contentClient.createContent({
        projectName,
        schemaName,
        content: {
          ...content,
          _createdAt: createdAt,
          _updatedAt: createdAt,
        },
      });

      emitEvent("CONTENT_CREATED", {
        projectName,
        schema: schemaData.schema,
        content: {
          ...content,
          _createdAt: createdAt,
          _updatedAt: createdAt,
        },
      });
    } catch (error) {
      throw new Error("Cannot create content");
    }
  }

  public async updateContent({
    projectName,
    schemaName,
    contentId,
    content,
  }: {
    projectName: string;
    schemaName: string;
    contentId: string;
    content: { [key: string]: unknown };
  }) {
    try {
      const [project] = await this.projectRepository.readDocument({
        documentId: projectName,
      });
      const updatedAt = new Date().toISOString();

      if (!project) {
        throw new NotFoundError("Cannot find project");
      }

      const schemaData = project.schemaList.find(
        schema => schema.schemaName === schemaName,
      );

      if (!schemaData) {
        throw new NotFoundError("Cannot find schema");
      }

      const isValidate = this.schemaClient.validateData({
        schema: schemaData.schema,
        data: content,
      });

      if (!isValidate) {
        // TODO: fill error message.
        throw new ValidateError();
      }

      this.contentClient.updateContent({
        projectName,
        schemaName,
        contentId,
        content: {
          ...content,
          _updatedAt: updatedAt,
        },
      });

      emitEvent("CONTENT_UPDATED", {
        projectName,
        schema: schemaData.schema,
        content: {
          ...content,
          _updatedAt: updatedAt,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  public async deleteContent({
    projectName,
    schemaName,
    contentIds,
  }: {
    projectName: string;
    schemaName: string;
    contentIds: string[];
  }) {
    try {
      const [project] = await this.projectRepository.readDocument({
        documentId: projectName,
      });

      if (!project) {
        throw new NotFoundError("Cannot find project");
      }

      const schemaData = project.schemaList.find(
        schema => schema.schemaName === schemaName,
      );

      if (!schemaData) {
        throw new NotFoundError("Cannot find schema");
      }

      await this.contentClient.deleteContent({
        projectName,
        schemaName,
        contentIds,
      });

      emitEvent("CONTENT_DELETED", {
        projectName,
        schema: schemaData.schema,
      });
    } catch (error) {
      throw error;
    }
  }

  public async queryContents({
    projectName,
    schemaName,
    pagination,
    sort,
    filter,
    contentId,
  }: {
    projectName: string;
    schemaName: string;
    pagination?: {
      page?: number;
      pageLength?: number;
    };
    sort?: {
      [key: string]: string;
    }[];
    filter?: {
      [key: string]: string | number | boolean;
    };
    contentId?: string;
  }) {
    try {
      const [project] = await this.projectRepository.readDocument({
        documentId: projectName,
      });

      if (!project) {
        throw new NotFoundError("Cannot find project");
      }

      const schemaInfo = project.schemaList.find(
        schema => schema.schemaName === schemaName,
      );

      if (!schemaInfo) {
        throw new NotFoundError("Cannot find schema");
      }
    } catch (error) {
      throw error;
    }

    if (!!contentId) {
      return this.contentClient.queryContents({
        projectName,
        schemaName,
        filter: { id: contentId },
      });
    }

    const sortQueries = sort?.map(sortOption => {
      const sortQuery: { [key: string]: "asc" | "desc" } = {};

      for (const sort in sortOption) {
        if (sortOption.hasOwnProperty(sort)) {
          const order = sortOption[sort];

          if (order === "descending" || order === "desc") {
            sortQuery[sort] = "desc";
          } else {
            sortQuery[sort] = "asc";
          }

          break;
        }
      }

      return sortQuery;
    }) ?? [{ _id: "asc" }];

    return this.contentClient.queryContents({
      projectName,
      schemaName,
      pagination,
      sort: sortQueries,
      filter,
    });
  }

  public getContentsTotalCounts({
    projectName,
    schemaName,
  }: {
    projectName: string;
    schemaName: string;
  }) {
    return this.contentClient.getContentsTotalCount({
      projectName,
      schemaName,
    });
  }
}
