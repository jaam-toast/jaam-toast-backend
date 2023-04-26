import { inject, injectable } from "inversify";
import * as _ from "lodash";

import { IBuildService } from "./buildService";
import { ICmsService } from "./cmsService";
import Config from "../config";

import type { BaseProject, Project } from "../types/database";
import type { ContentsClient } from "../infrastructure/mongodbContentsClient";
import type { DatabaseClient } from "../infrastructure/mongodbDatabaseClient";
import type { ObjectId } from "mongodb";

interface IProjectService {
  createProject(options: BaseProject): Promise<void>;

  updateProject(options: Partial<Project>): Promise<void>;

  getByProjectName(projectName: string): Promise<Project | null>;

  deleteProject({ projectName }: { projectName: string }): Promise<void>;

  addSchema(addSchemaOptions: {
    projectName: string;
    schemaName: string;
    schema: {
      title: string;
    };
  }): Promise<void>;

  updateSchema(updateSchemaOptions: {
    projectName: string;
    schemaName: string;
    schema: {
      title: string;
    };
  }): Promise<void>;

  deleteSchema(deleteSchema: {
    projectName: string;
    schemaName: string;
  }): Promise<void>;

  createContents(createContentsOptions: {
    projectName: string;
    schemaName: string;
    contents: { [key: string]: string };
  }): Promise<void>;

  deleteContents(deleteContentsOptions: {
    projectName: string;
    schemaName: string;
    contentsIds: string[];
  }): Promise<void>;
}

/**
 * Inversify.js에서는 @injectable 데코레이터와 @inject 데코레이터를 활용하여 객체를 주입하게 되어있습니다.
 * 의존성이 주입될 곳에는 @injectable 데코레이터를,
 * 생성자 주입을 할 때는 @inject 가 사용됩니다.
 * container에 등록한 class에는 모두 @injectable()을 적용해야 합니다.
 */

@injectable()
export class ProjectService implements IProjectService {
  private buildService: IBuildService;
  private cmsService: ICmsService;
  private contentsClient: ContentsClient;
  private databaseClient: DatabaseClient;
  /**
   *
   * @param buildService: 의존성 주입
   * @param cmsService: 의존성 주입
   */
  public constructor(
    @inject("BuildService") buildService: IBuildService,
    @inject("CmsService") cmsService: ICmsService,
    @inject("MongoDBDatabaseClient") mongodbDatabaseClient: DatabaseClient,
    @inject("MongoDBContentsClient") mongodbContentsClient: ContentsClient,
  ) {
    this.buildService = buildService;
    this.cmsService = cmsService;
    this.contentsClient = mongodbContentsClient;
    this.databaseClient = mongodbDatabaseClient;
  }

  private createProjectData({ project }: { project: BaseProject }) {
    return this.databaseClient.create<BaseProject>({
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

  public async createProject(options: BaseProject) {
    try {
      const {
        repoName,
        repoCloneUrl,
        projectName,
        framework,
        installCommand,
        buildCommand,
        envList,
      } = options;

      await this.createProjectData({ project: options });

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
    schema: {
      title: string;
    };
  }) {
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
    schema: {
      title: string;
    };
  }) {
    try {
      await this.contentsClient.setStorageSchema({
        projectName,
        schemaName,
        jsonSchema: schema,
      });
    } catch (error) {
      throw new Error("Cannot update contents's storage.");
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

      if (!project) {
        throw new Error("Cannot find project");
      }
      if (
        !project.schemaList.find(schema => schema.schemaName === schemaName)
      ) {
        throw new Error("Cannot find schema");
      }

      await this.contentsClient.createContents({
        projectName,
        schemaName,
        contents,
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
    contents: unknown;
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

      return this.contentsClient.updateContents({
        projectName,
        schemaName,
        contentsId,
        contents,
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
      [key: string]: string | number | boolean | ObjectId;
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
      throw new Error("Cannot get contents");
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
