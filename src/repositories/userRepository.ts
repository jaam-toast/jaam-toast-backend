import User from "./models/User";

import type { Document } from "mongodb";
import type {
  User as UserType,
  Project,
  UserOptions,
  IdParameter,
} from "../types/db";
import { injectable } from "inversify";

export interface IUserRepository {
  create(data: UserType): Promise<Document | null>;
  findOne(options: UserOptions): Promise<Document | null>;
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

  async findOne(options: UserOptions) {
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
            projects: Project[];
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

      console.log({ user });

      return user;
    } catch (error) {
      throw error;
    }
  }

  async findOneAndDeleteProject(username: Partial<User>, projectName: string) {
    try {
      console.log({ username, projectName });

      if (!username || !projectName) {
        throw Error("Expected 2 arguments, but insufficient arguments.");
      }

      const user = await User.findOneAndUpdate(
        { username },
        { $pull: { projects: projectName } },
      );

      console.log({ user });

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
