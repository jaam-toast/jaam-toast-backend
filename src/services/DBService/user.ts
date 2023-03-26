import User from "@src/models/User";

import type {
  User as UserType,
  Project,
  UserOptions,
  IdParameter,
} from "@src/types/db";

class UserService {
  static async create(data: UserType) {
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

  static async findById(id: IdParameter) {
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

  static async findOne(options: UserOptions) {
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

  static async findByIdAndGetProjects(id: IdParameter) {
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

  static async findByIdAndUpdateProject(
    userId: IdParameter,
    projectId: IdParameter,
  ) {
    try {
      if (!userId || !projectId) {
        throw Error("Expected 2 arguments, but insufficient arguments.");
      }

      const user = await User.updateOne(
        { _id: userId },
        { $push: { projects: projectId } },
      );

      return user;
    } catch (error) {
      throw error;
    }
  }

  static async findByIdAndDeleteProject(
    userId: IdParameter,
    projectId: IdParameter,
  ) {
    try {
      if (!userId || projectId) {
        throw Error("Expected 2 arguments, but insufficient arguments.");
      }

      const user = await User.updateOne(
        { _id: userId },
        { $pull: { myRepos: projectId } },
      );

      return user;
    } catch (error) {
      throw error;
    }
  }
}

export default UserService;
