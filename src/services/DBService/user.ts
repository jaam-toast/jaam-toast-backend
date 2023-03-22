import User from "@src/models/User";
import { Project, User as UserType, MongoDbId } from "@src/types";

type Id = MongoDbId | string;

type Property = {
  username?: string;
  userGithubUri?: string;
  userImage?: string;
  githubAccessToken?: string;
  projects?: MongoDbId[];
};

class UserModel {
  static async create(data: UserType) {
    const { username, userGithubUri, userImage, githubAccessToken } = data;

    const newUser = await User.create({
      username,
      userGithubUri,
      userImage,
      githubAccessToken,
    });

    return newUser;
  }

  static async findById(id: Id) {
    const user = await User.findOne({ _id: id });

    return user;
  }

  static async findByProperty(property: Property) {
    if (!property) {
      throw Error("Expected 1 arguments, but insufficient arguments.");
    }

    const user = await User.findOne({ property });

    return user;
  }

  static async findByIdAndGetProjects(id: Id) {
    const user = await User.findOne({ _id: id })
      .populate<{ projects: Project[] }>("projects")
      .lean();

    const userProjects = user?.projects || [];

    return userProjects;
  }

  static async findByIdAndUpdateProject(
    userId: string,
    projectId: UserType["_id"],
  ) {
    const user = await User.updateOne(
      { _id: userId },
      { $push: { projects: projectId } },
    );

    return user;
  }

  static async findByIdAndDeleteProject(
    userId: string | UserType["_id"],
    projectId: string | UserType["_id"],
  ) {
    const user = await User.updateOne(
      { _id: userId },
      { $pull: { myRepos: projectId } },
    );

    return user;
  }
}

export default UserModel;
