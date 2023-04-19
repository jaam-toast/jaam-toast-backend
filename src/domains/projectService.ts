import { inject, injectable } from "inversify";
import * as _ from "lodash";

import { IBuildService } from "./buildService";
import { ICmsService } from "./cmsService";
import { IProjectRepository } from "../repositories/projectRepository";

import type { Document } from "mongoose";
import type { BaseProject, Project } from "../repositories/@types";
import type { ContentsClient } from "src/infrastructure/mongodbContentsClient";

interface IProjectService {
  createProject(options: BaseProject): Promise<void>;
  updateProject(options: Partial<Project>): Promise<void>;
  getByProjectName(projectName: string): Promise<Document | null>;
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
  deleteSchema(): Promise<void>;
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

  public async getByProjectName(projectName: string) {
    const project = await this.projectRepository.findOne({ projectName });

    return project as Promise<Document | null>;
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

      await this.projectRepository.updateSnapshot(projectName, {
        ...project,
        schemaList: project.schemaList?.concat(schema) ?? [schema],
      });
    } catch (error) {
      throw new Error("Cannot update user info.");
    }
  }

  // public async updateSchema({
  //   projectName,
  //   schemaName,
  // }: {
  //   projectName: string;
  // });
  public async deleteSchema() {}
}
