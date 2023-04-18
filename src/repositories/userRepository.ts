import { injectable } from "inversify";

import User from "./models/User";

import type { Document } from "mongodb";
import type { User as UserType, IdParameter, Project } from "./@types";

export interface IUserRepository {
  create(data: UserType): Promise<Document | null>;
  findOne(options: Partial<UserType>): Promise<Document | null>;
  findById(id: IdParameter): Promise<Document | null>;
  findByIdAndGetProjects(id: IdParameter): Promise<Document | null>;
  findByIdAndUpdateProject(
    userId: IdParameter,
    projectId: IdParameter,
  ): Promise<Document | null>;
  findByIdAndDeleteProject(
    userId: IdParameter,
    projectName: IdParameter,
  ): Promise<Document | null>;
  findOneAndDeleteProject(
    userOption: Partial<User>,
    projectName: string,
  ): Promise<Document | null>;
}

@injectable()
export class UserRepository implements IUserRepository {
  async create(data: UserType) {
    try {
      if (!data) {
        throw Error("Expected 1 arguments, but insufficient arguments.");
      }

      const newUser = await User.create({
        ...data,
      });

      return newUser;
    } catch (error) {
      throw error;
    }
  }

  async findOne(options: Partial<UserType>) {
    try {
      if (!options) {
        throw Error("Expected 1 arguments, but insufficient arguments.");
      }

      const user = await User.findOne(options);

      return user;
    } catch (error) {
      throw error;
    }
  }

  async findById(id: IdParameter) {
    try {
      if (!id) {
        throw Error("Expected 1 arguments, but insufficient arguments.");
      }

      const user = await User.findOne({ _id: id });

      return user;
    } catch (error) {
      throw error;
    }
  }

  async findByIdAndGetProjects(id: IdParameter) {
    try {
      if (!id) {
        throw Error("Expected 1 arguments, but insufficient arguments.");
      }

      const user:
        | {
            projects: string[];
          }
        | undefined = await User.findOne({ _id: id })
        .populate<{ projects: Project[] }>("projects")
        .lean();

      return user?.projects || [];
    } catch (error) {
      throw error;
    }
  }

  async findByIdAndUpdateProject(
    userId: IdParameter,
    projectName: IdParameter,
  ) {
    try {
      if (!userId || !projectName) {
        throw Error("Expected 2 arguments, but insufficient arguments.");
      }

      const user = await User.findByIdAndUpdate(
        { _id: userId },
        { $push: { projects: projectName } },
      );

      return user;
    } catch (error) {
      throw error;
    }
  }

  async findOneAndDeleteProject(username: Partial<User>, projectName: string) {
    try {
      if (!username || !projectName) {
        throw Error("Expected 2 arguments, but insufficient arguments.");
      }

      const user = await User.findOneAndUpdate(
        { username },
        { $pull: { projects: projectName } },
      );

      return user;
    } catch (error) {
      throw error;
    }
  }

  async findByIdAndDeleteProject(userId: IdParameter, projectName: string) {
    try {
      if (!userId || !projectName) {
        throw Error("Expected 2 arguments, but insufficient arguments.");
      }

      const user = await User.findByIdAndUpdate(
        { _id: userId },
        { $pull: { projects: projectName } },
      );

      return user;
    } catch (error) {
      throw error;
    }
  }
}
