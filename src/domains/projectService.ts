import { inject, injectable } from "inversify";
import * as _ from "lodash";
import { formatISO } from "date-fns";

import Config from "../config";

import type { CmsService } from "./cmsService";
import type { BuildService } from "./buildService";
import type {
  SchemaClient,
  DatabaseClient,
  ContentsClient,
} from "../config/di.config";
import type { Project } from "../types/project";
import type { Schema } from "../types/schema";

@injectable()
export class ProjectService {
  private buildService: BuildService;
  private cmsService: CmsService;
  private contentsClient: ContentsClient;
  private databaseClient: DatabaseClient;
  private schemaClient: SchemaClient;

  public constructor(
    @inject("BuildService") buildService: BuildService,
    @inject("CmsService") cmsService: CmsService,
    @inject("MongoDBDatabaseClient") mongodbDatabaseClient: DatabaseClient,
    @inject("MongoDBContentsClient") mongodbContentsClient: ContentsClient,
    @inject("AjvSchemaClient") ajvSchemaClient: SchemaClient,
  ) {
    this.buildService = buildService;
    this.cmsService = cmsService;
    this.contentsClient = mongodbContentsClient;
    this.databaseClient = mongodbDatabaseClient;
    this.schemaClient = ajvSchemaClient;
  }

  private createProjectData({ project }: { project: Project }) {
    return this.databaseClient.create<Project>({
      dbName: Config.APP_DB_NAME,
      collectionName: "projects",
      document: project,
    });
  }

  private readProjectData({ projectName }: { projectName: string }) {
    return this.databaseClient.read<Project>({
      dbName: Config.APP_DB_NAME,
      collectionName: "projects",
      filter: { projectName },
    });
  }

  private updateProjectData({
    projectName,
    project,
  }: {
    projectName: string;
    project: Partial<Project>;
  }) {
    return this.databaseClient.update<Project>({
      dbName: Config.APP_DB_NAME,
      collectionName: "projects",
      filter: { projectName },
      document: project,
    });
  }

  private deleteProjectData({ projectName }: { projectName: string }) {
    return this.databaseClient.delete({
      dbName: Config.APP_DB_NAME,
      collectionName: "projects",
      filter: { projectName },
    });
  }

  public async createProject({
    space,
    repoName,
    repoCloneUrl,
    projectName,
    framework,
    installCommand,
    buildCommand,
    envList,
    storageKey,
  }: Project) {
    try {
      await this.createProjectData({
        project: {
          space,
          repoName,
          repoCloneUrl,
          projectName,
          framework,
          installCommand,
          buildCommand,
          envList,
          storageKey,
          schemaList: [],
        },
      });

      const [{ buildDomain, buildOriginalDomain }, { cmsDomain, cmsToken }] =
        await Promise.all([
          this.buildService.createBuild({
            repoName,
            repoCloneUrl,
            projectName,
            framework,
            installCommand,
            buildCommand,
            envList,
            storageKey,
            schemaList: [],
          }),
          this.cmsService.createApi({
            projectName,
          }),
        ]);

      await this.updateProjectData({
        projectName,
        project: {
          projectName,
          buildDomain,
          buildOriginalDomain,
          cmsDomain,
          cmsToken,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  public async updateProject({
    projectName,
    ...updateOptions
  }: Partial<Project>) {
    if (!projectName) {
      return;
    }

    await this.updateProjectData({
      projectName,
      project: updateOptions,
    });
  }

  public async getByProjectName(projectName: string): Promise<Project | null> {
    try {
      const [project] = await this.readProjectData({ projectName });

      return project;
    } catch (error) {
      return null;
    }
  }

  public async deleteProject({ projectName }: { projectName: string }) {
    await this.deleteProjectData({ projectName });
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
      throw new Error(
        "The schema field is not of JSON Schema or failed validation.",
      );
    }

    try {
      await this.contentsClient.createStorage({
        projectName,
        jsonSchema: schema,
      });
    } catch (error) {
      throw new Error("Cannot create contents's storage.");
    }

    try {
      const [project] = await this.readProjectData({ projectName });

      if (!project) {
        throw new Error();
      }

      const updatedSchemaList = project.schemaList.concat({
        schemaName,
        schema,
      });

      await this.updateProjectData({
        projectName,
        project: {
          schemaList: updatedSchemaList,
        },
      });
    } catch (error) {
      throw new Error("Cannot update user info.");
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
      const [project] = await this.readProjectData({ projectName });

      if (!project) {
        throw new Error();
      }

      const updatedSchemaList = project.schemaList.map(projectSchema => {
        if (projectSchema.schemaName !== schemaName) {
          return projectSchema;
        }

        return {
          schemaName,
          schema,
        };
      });

      await this.updateProjectData({
        projectName,
        project: {
          schemaList: updatedSchemaList,
        },
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
      await this.contentsClient.deleteStorage({
        projectName,
        schemaName,
      });
    } catch (error) {
      throw new Error("Cannot delete contents's storage.");
    }

    try {
      const [project] = await this.readProjectData({ projectName });

      if (!project) {
        throw new Error();
      }

      const updatedSchemaList = project.schemaList.filter(
        projectSchema => projectSchema.schemaName !== schemaName,
      );

      await this.updateProjectData({
        projectName,
        project: {
          schemaList: updatedSchemaList,
        },
      });
    } catch (error) {
      throw new Error("Cannot update user info.");
    }
  }

  public async createContents({
    projectName,
    schemaName,
    contents,
  }: {
    projectName: string;
    schemaName: string;
    contents: { [key: string]: string };
  }) {
    try {
      const [project] = await this.readProjectData({ projectName });
      const createdAt = formatISO(new Date());

      if (!project) {
        throw new Error("Cannot find project");
      }

      const schemaData = project.schemaList.find(
        schema => schema.schemaName === schemaName,
      );

      if (!schemaData) {
        throw new Error("Cannot find schema");
      }

      this.schemaClient.validateData({
        schema: schemaData.schema,
        data: contents,
      });

      await this.contentsClient.createContents({
        projectName,
        schemaName,
        contents: {
          ...contents,
          _createdAt: createdAt,
          _updatedAt: createdAt,
        },
      });
    } catch (error) {
      throw new Error("Cannot create contents");
    }
  }

  public async updateContents({
    projectName,
    schemaName,
    contentsId,
    contents,
  }: {
    projectName: string;
    schemaName: string;
    contentsId: string;
    contents: { [key: string]: unknown };
  }) {
    try {
      const [project] = await this.readProjectData({ projectName });
      const updatedAt = formatISO(new Date());

      if (!project) {
        throw new Error("Cannot find project");
      }

      const schemaData = project.schemaList.find(
        schema => schema.schemaName === schemaName,
      );

      if (!schemaData) {
        throw new Error("Cannot find schema");
      }

      this.schemaClient.validateData({
        schema: schemaData.schema,
        data: contents,
      });

      return this.contentsClient.updateContents({
        projectName,
        schemaName,
        contentsId,
        contents: {
          ...contents,
          _updatedAt: updatedAt,
        },
      });
    } catch (error) {
      throw new Error("Cannot update contents");
    }
  }

  public async deleteContents({
    projectName,
    schemaName,
    contentsIds,
  }: {
    projectName: string;
    schemaName: string;
    contentsIds: string[];
  }) {
    try {
      const [project] = await this.readProjectData({ projectName });

      if (!project) {
        throw new Error("Cannot find project");
      }
      if (
        !project.schemaList.find(schema => schema.schemaName === schemaName)
      ) {
        throw new Error("Cannot find schema");
      }

      await this.contentsClient.deleteContents({
        projectName,
        schemaName,
        contentsIds,
      });
    } catch (error) {
      throw new Error("Cannot delete contents");
    }
  }

  public async getContents({
    projectName,
    schemaName,
    pagination,
    sort,
    filter,
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
  }) {
    try {
      const [project] = await this.readProjectData({ projectName });

      if (!project) {
        throw new Error("Cannot find project");
      }

      const schemaInfo = project.schemaList.find(
        schema => schema.schemaName === schemaName,
      );

      if (!schemaInfo) {
        throw new Error("Cannot find schema");
      }
    } catch (error) {
      throw error;
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

    return this.contentsClient.getContents({
      projectName,
      schemaName,
      pagination,
      sort: sortQueries,
      filter,
    });
  }
}
