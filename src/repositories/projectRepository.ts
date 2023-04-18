import { injectable } from "inversify";

import Project from "./models/Project";

import type {
  BaseProject,
  Project as ProjectType,
} from "../repositories/@types";
import type { Document } from "mongodb";

export interface IProjectRepository {
  create(data: BaseProject): Promise<Document | null>;
  findOne(option: Partial<ProjectType>): Promise<Document | null>;
  findOneAndUpdate(
    targetOption: string,
    updateOptions: Partial<ProjectType>,
  ): Promise<Document | null>;
  findOneAndDelete(option: Partial<Project>): Promise<Document | null>;
}

@injectable()
export class ProjectRepository implements IProjectRepository {
  async create(data: BaseProject): Promise<Document | null> {
    try {
      if (!data) {
        throw Error("Expected 1 arguments, but insufficient arguments.");
      }

      const {
        space,
        repoName,
        repoCloneUrl,
        projectName,
        projectUpdatedAt,
        framework,
        installCommand,
        buildCommand,
        envList,
      } = data;

      if (
        !space ||
        !repoName ||
        !repoCloneUrl ||
        !projectName ||
        !projectUpdatedAt ||
        !framework ||
        !installCommand ||
        !buildCommand ||
        !envList
      ) {
        throw Error("Cannot find environment data before create project.");
      }

      const newProject = await Project.create({
        _id: projectName,
        space,
        repoName,
        repoCloneUrl,
        projectName,
        projectUpdatedAt,
        framework,
        installCommand,
        buildCommand,
        envList,
      });

      return newProject;
    } catch (error) {
      throw error;
    }
  }

  async findOne(option: Partial<ProjectType>) {
    try {
      if (!option) {
        throw Error("Expected 1 arguments, but insufficient arguments.");
      }

      const project = await Project.findOne(option);

      return project;
    } catch (error) {
      throw error;
    }
  }

  async findOneAndUpdate(
    projectName: string,
    updateOptions: Partial<ProjectType>,
  ) {
    try {
      if (!projectName || !updateOptions) {
        throw Error("Expected 2 arguments, but insufficient arguments.");
      }

      if (!Object.keys(updateOptions).length) {
        throw Error("Update data type is not valid");
      }

      const updatedProject = await Project.findOneAndUpdate(
        { projectName },
        { $set: updateOptions },
        { new: true },
      );

      return updatedProject;
    } catch (error) {
      throw error;
    }
  }

  async findOneAndDelete(option: Partial<Project>) {
    try {
      if (!option) {
        throw Error("Expected 1 arguments, but insufficient arguments.");
      }

      const deletedProject = await Project.findOneAndDelete(option);

      return deletedProject;
    } catch (error) {
      throw error;
    }
  }
}
