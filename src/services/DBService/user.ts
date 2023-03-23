import User from "@src/models/User";
import {
  User as UserType,
  Project,
  IdParameter,
  UserProperty,
} from "@src/types/db";

class UserModel {
  static async create(data: UserType) {
    if (!data) {
      throw Error("Expected 1 arguments, but insufficient arguments.");
    }

    const { username, userGithubUri, userImage, githubAccessToken } = data;

    const newUser = await User.create({
      username,
      userGithubUri,
      userImage,
      githubAccessToken,
    });

    return newUser;
  }

  static async findById(id: IdParameter) {
    if (!id) {
      throw Error("Expected 1 arguments, but insufficient arguments.");
    }

    const user = await User.findOne({ _id: id });

    return user;
  }

  static async findOne(targetData: UserProperty) {
    if (!targetData) {
      throw Error("Expected 1 arguments, but insufficient arguments.");
    }

    const user = await User.findOne({ targetData });

    return user;
  }

  static async findByIdAndGetProjects(id: IdParameter) {
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
  }

  static async findByIdAndUpdateProject(
    userId: IdParameter,
    projectId: IdParameter,
  ) {
    if (!userId || projectId) {
      throw Error("Expected 2 arguments, but insufficient arguments.");
    }

    const user = await User.updateOne(
      { _id: userId },
      { $push: { projects: projectId } },
    );

    return user;
  }

  static async findByIdAndDeleteProject(
    userId: IdParameter,
    projectId: IdParameter,
  ) {
    if (!userId || projectId) {
      throw Error("Expected 2 arguments, but insufficient arguments.");
    }

    const user = await User.updateOne(
      { _id: userId },
      { $pull: { myRepos: projectId } },
    );

    return user;
  }
}

export default UserModel;
