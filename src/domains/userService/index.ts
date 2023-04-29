import { injectable, inject } from "inversify";

import {
  getUserOrganizations,
  getUserOrganizationsRepos,
  getUserRepositories,
} from "./getUserRepositories";
import Config from "../../config";

import type { User } from "../../types/user";
import type { DatabaseClient } from "../../config/di.config";

@injectable()
export class UserService {
  private databaseClient: DatabaseClient;

  public constructor(
    @inject("MongoDBDatabaseClient") mongodbDatabaseClient: DatabaseClient,
  ) {
    this.databaseClient = mongodbDatabaseClient;
  }

  private createUserData({ user }: { user: User }) {
    return this.databaseClient.create<User>({
      dbName: Config.APP_DB_NAME,
      collectionName: "users",
      document: user,
    });
  }

  private readUserData({
    userId,
    filter,
  }: {
    userId?: string;
    filter?: { [key: string]: string };
  }) {
    return this.databaseClient.read<User>({
      dbName: Config.APP_DB_NAME,
      collectionName: "users",
      ...(userId && { id: userId }),
      ...(filter && { filter }),
    });
  }

  private updateUserData({
    userId,
    user,
  }: {
    userId: string;
    user: Partial<User>;
  }) {
    return this.databaseClient.update<User>({
      dbName: Config.APP_DB_NAME,
      collectionName: "users",
      id: userId,
      document: user,
    });
  }

  private deleteUserData({ userId }: { userId: string }) {
    return this.databaseClient.delete({
      dbName: Config.APP_DB_NAME,
      collectionName: "users",
      id: userId,
    });
  }

  public async login({
    username,
    userGithubUri,
    userImage,
    githubAccessToken,
  }: User) {
    const [userData] = await this.readUserData({
      filter: { userGithubUri },
    });

    if (!userData) {
      const [userId] = await this.createUserData({
        user: {
          username,
          userGithubUri,
          userImage,
          githubAccessToken,
        },
      });
      const [newUserData] = await this.readUserData({ userId });

      return newUserData;
    }

    return userData;
  }

  public async getUserProjects({ userId }: { userId: string }) {
    const [user] = await this.readUserData({ userId });

    return user?.projects ?? [];
  }

  public getUserGithubRepos({
    githubAccessToken,
  }: {
    githubAccessToken: string;
  }) {
    return getUserRepositories({ githubAccessToken });
  }

  public getUserGithubOrgs({
    githubAccessToken,
  }: {
    githubAccessToken: string;
  }) {
    return getUserOrganizations({ githubAccessToken });
  }

  public getUserGithubOrgsRepos({
    githubAccessToken,
    org,
  }: {
    githubAccessToken: string;
    org: string;
  }) {
    return getUserOrganizationsRepos({
      githubAccessToken,
      org,
    });
  }

  public async addProject({
    userId,
    projectName,
  }: {
    userId: string;
    projectName: string;
  }) {
    const [user] = await this.readUserData({ userId });
    const existedProjects = user?.projects ?? [];

    return this.updateUserData({
      userId,
      user: { projects: [...existedProjects, projectName] },
    });
  }

  public deleteUser({ userId }: { userId: string }) {
    return this.deleteUserData({
      userId,
    });
  }

  public async deleteProject({
    username,
    projectName,
  }: {
    username: string;
    projectName: string;
  }) {
    const [user] = await this.readUserData({ filter: { username } });

    if (!user?._id) {
      return;
    }

    const existedProjects = user?.projects ?? [];
    const newProjects = existedProjects.filter(
      project => project !== projectName,
    );

    return this.updateUserData({
      userId: user._id.toString(),
      user: { projects: newProjects },
    });
  }
}
