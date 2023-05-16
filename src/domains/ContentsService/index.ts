import { inject, injectable } from "inversify";

import Config from "../../@config";
import {
  NotFoundError,
  UnknownError,
  ValidateError,
} from "../../@utils/defineErrors";
import { emitEvent } from "../../@utils/emitEvent";
import { BaseError } from "../../@types/baseError";

import type {
  ContentClient,
  Repository,
  SchemaClient,
} from "../../@config/di.config";
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
        throw new ValidateError("Content schema validation has failed.");
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
        throw new ValidateError("Content schema validation has failed.");
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
    page,
    pageLength,
    sort,
    order,
    filter,
    contentId,
  }: {
    projectName: string;
    schemaName: string;
    page?: number;
    pageLength?: number;
    sort?: string | string[];
    order?:
      | "asc"
      | "ascending"
      | "desc"
      | "descending"
      | ("asc" | "ascending" | "desc" | "descending")[];
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

      if (!!contentId) {
        return this.contentClient.queryContents({
          projectName,
          schemaName,
          filter: { id: contentId },
        });
      }

      const sortOptionsEntries: [
        string,
        "asc" | "ascending" | "desc" | "descending",
      ][] = (() => {
        if (Array.isArray(sort)) {
          if (Array.isArray(order)) {
            return sort.map((sort, index) => [
              sort,
              typeof order[index] === "string" ? order[index] : "asc",
            ]);
          }
          if (typeof order === "string") {
            return sort.map((sort, index) => [
              sort,
              index === 0 ? order : "asc",
            ]);
          }
          if (!order) {
            return sort.map(sort => [sort, "asc"]);
          }
        }
        if (typeof sort === "string") {
          if (Array.isArray(order)) {
            return [[sort, order[0]]];
          }
          if (typeof order === "string") {
            return [[sort, order]];
          }
          if (!order) {
            return [[sort, "asc"]];
          }
        }

        return [];
      })();
      const sortOptions = Object.fromEntries(sortOptionsEntries);
      const paginationOptions = {
        ...(page ? { page } : { page: 1 }),
        ...(pageLength
          ? { pageLength }
          : { pageLength: Config.MAX_NUMBER_PER_PAGE }),
      };

      return this.contentClient.queryContents({
        projectName,
        schemaName,
        pagination: paginationOptions,
        sort: sortOptions,
        filter,
      });
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }

      throw new UnknownError("An Error Occured during getting contents.");
    }
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
