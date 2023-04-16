import { injectable, inject } from "inversify";
import { Document } from "mongodb";

import { IUserRepository } from "../../repositories/userRepository";
import {
  getUserOrganizations,
  getUserOrganizationsRepos,
  getUserRepositories,
} from "./getUserRepositories";

import type { User } from "../@types/entity";

interface IUserService {
  login(userData: User): Promise<Document | null>;
  getUserProjects({ userId }: { userId: string }): Promise<Document | null>;
  getUserGithubRepos({ githubAccessToken }): Promise<
    {
      repoName: string;
      repoCloneUrl: string;
      repoUpdatedAt: string | null;
    }[]
  >;
  getUserGithubOrgs({ githubAccessToken }): Promise<
    {
      spaceName: string;
      spaceUrl: string;
      spaceImage: string;
    }[]
  >;
  getUserGithubOrgsRepos({ githubAccessToken, org }): Promise<
    {
      repoName: string;
      repoCloneUrl: string | undefined;
      repoUpdatedAt: string | null | undefined;
    }[]
  >;
  addProject({ userId, projectName }): Promise<void>;
  deleteUser(): void;
  deleteProject({ username, projectName }): void;
}

@injectable()
export class UserService implements IUserService {
  private userRepository: IUserRepository;

  public constructor(
    @inject("UserRepository") userRepository: IUserRepository,
  ) {
    this.userRepository = userRepository;
  }

  public async login({
    username,
    userGithubUri,
    userImage,
    githubAccessToken,
  }: User) {
    let userData = await this.userRepository.findOne({ userGithubUri });

    if (!userData) {
      userData = await this.userRepository.create({
        username,
        userGithubUri,
        userImage,
        githubAccessToken,
      });
    }

    return userData;
  }

  public async getUserProjects({ userId }) {
    const projects = await this.userRepository.findByIdAndGetProjects(userId);

    return projects;
  }

  public async getUserGithubRepos({ githubAccessToken }) {
    const repos = await getUserRepositories({ githubAccessToken });

    return repos;
  }

  public async getUserGithubOrgs({ githubAccessToken }) {
    const orgsData = await getUserOrganizations({ githubAccessToken });

    return orgsData;
  }

  public async getUserGithubOrgsRepos({ githubAccessToken, org }) {
    const orgsData = await getUserOrganizationsRepos({
      githubAccessToken,
      org,
    });

    return orgsData;
  }

  public async addProject({ userId, projectName }) {
    await this.userRepository.findByIdAndUpdateProject(userId, projectName);
  }

  public async deleteUser() {}

  public async deleteProject({ username, projectName }) {
    await this.userRepository.findOneAndDeleteProject(username, projectName);
  }
}
