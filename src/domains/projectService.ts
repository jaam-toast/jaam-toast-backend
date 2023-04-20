import { inject, injectable } from "inversify";
import * as _ from "lodash";

import { IBuildService } from "./buildService";
import { ICmsService } from "./cmsService";
import { IProjectRepository } from "../repositories/projectRepository";

import type { BaseProject, Project } from "../repositories/@types";
import type { ContentsClient } from "../infrastructure/mongodbContentsClient";

interface IProjectService {
  createProject(options: BaseProject): Promise<void>;
  updateProject(options: Partial<Project>): Promise<void>;
  getByProjectName(projectName: string): Promise<Project | null>;
  deleteProject({ projectName }: { projectName: string }): Promise<void>;
  addSchema({
    projectName,
    schemaName,
    schema,
  }: {
    projectName: string;
    schemaName: string;
    schema: {
      title: string;
    };
  }): Promise<void>;
  updateSchema({
    projectName,
    schemaName,
    schema,
  }: {
    projectName: string;
    schemaName: string;
    schema: {
      title: string;
    };
  }): Promise<void>;
  deleteSchema({
    projectName,
    schemaName,
  }: {
    projectName: string;
    schemaName: string;
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
  private projectRepository: IProjectRepository;
  private contentsClient: ContentsClient;
  /**
   *
   * @param buildService: 의존성 주입
   * @param cmsService: 의존성 주입
   */
  public constructor(
    @inject("BuildService") buildService: IBuildService,
    @inject("CmsService") cmsService: ICmsService,
    @inject("ProjectRepository") projectRepository: IProjectRepository,
    @inject("MongoDBContentsClient") mongodbContentsClient: ContentsClient,
  ) {
    this.buildService = buildService;
    this.cmsService = cmsService;
    this.projectRepository = projectRepository;
    this.contentsClient = mongodbContentsClient;
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

      await this.projectRepository.create(options);

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

      await this.updateProject({
        projectName,
        buildDomain,
        buildOriginalDomain,
        cmsDomain,
        cmsToken,
      });
    } catch (error) {
      throw error;
    }
  }

  public async updateProject(options: Partial<Project>) {
    await this.projectRepository.findOneAndUpdate(
      options.projectName as string,
      _.omit(options, ["projectName"]),
    );
  }

  public async getByProjectName(projectName: string): Promise<Project | null> {
    try {
      const project = await this.projectRepository.getSnapshot(projectName);

      return project;
    } catch (error) {
      return null;
    }
  }

  public async deleteProject({ projectName }: { projectName: string }) {
    await this.projectRepository.findOneAndDelete({ projectName });
  }

  public async addSchema({
    projectName,
    schema,
  }: {
    projectName: string;
    schema: {
      title: string;
    };
  }) {
    try {
      await this.contentsClient.createRepository({
        projectName,
        jsonSchema: schema,
      });
    } catch (error) {
      throw new Error("Cannot create contents's repository.");
    }

    try {
      const project = await this.projectRepository.getSnapshot(projectName);
      const updatedSchemaList = project.schemaList.concat({
        schemaName: schema.title,
        schema,
      });

      await this.projectRepository.updateSnapshot(projectName, {
        ...project,
        schemaList: updatedSchemaList,
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
      await this.contentsClient.setRepositorySchema({
        projectName,
        schemaName,
        jsonSchema: schema,
      });
    } catch (error) {
      throw new Error("Cannot update contents's repository.");
    }

    try {
      const project = await this.projectRepository.getSnapshot(projectName);
      const updatedSchemaList = project.schemaList.map(projectSchema => {
        if (projectSchema.schemaName !== schemaName) {
          return projectSchema;
        }

        return {
          schemaName,
          schema,
        };
      });

      await this.projectRepository.updateSnapshot(projectName, {
        ...project,
        schemaList: updatedSchemaList,
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
      await this.contentsClient.deleteRepository({
        projectName,
        schemaName,
      });
    } catch (error) {
      throw new Error("Cannot delete contents's repository.");
    }

    try {
      const project = await this.projectRepository.getSnapshot(projectName);
      const updatedSchemaList = project.schemaList.filter(
        projectSchema => projectSchema.schemaName !== schemaName,
      );

      await this.projectRepository.updateSnapshot(projectName, {
        ...project,
        schemaList: updatedSchemaList,
      });
    } catch (error) {
      throw new Error("Cannot update user info.");
    }
  }
}
