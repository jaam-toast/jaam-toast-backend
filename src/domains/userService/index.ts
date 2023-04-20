import { injectable, inject } from "inversify";
import { Document } from "mongodb";

import { IUserRepository } from "../../repositories/userRepository";
import {
  getUserOrganizations,
  getUserOrganizationsRepos,
  getUserRepositories,
} from "./getUserRepositories";

import type { User } from "../../repositories/@types";

interface IUserService {
  login(userData: User): Promise<Document | null>;
  getUserProjects({ userId }: { userId: string }): Promise<Document | null>;
  getUserGithubRepos({
    githubAccessToken,
  }: {
    githubAccessToken: string;
  }): Promise<
    {
      repoName: string;
      repoCloneUrl: string;
      repoUpdatedAt: string | null;
    }[]
  >;
  getUserGithubOrgs({
    githubAccessToken,
  }: {
    githubAccessToken: string;
  }): Promise<
    {
      spaceName: string;
      spaceUrl: string;
      spaceImage: string;
    }[]
  >;
  getUserGithubOrgsRepos({
    githubAccessToken,
    org,
  }: {
    githubAccessToken: string;
    org: string;
  }): Promise<
    {
      repoName: string;
      repoCloneUrl: string | undefined;
      repoUpdatedAt: string | null | undefined;
    }[]
  >;
  addProject({
    userId,
    projectName,
  }: {
    userId: string;
    projectName: string;
  }): Promise<void>;
  deleteUser(): void;
  deleteProject({
    username,
    projectName,
  }: {
    username: string;
    projectName: string;
  }): void;
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

  public async getUserProjects({ userId }: { userId: string }) {
    const projects = await this.userRepository.findByIdAndGetProjects(userId);

    return projects;
  }

  public async getUserGithubRepos({
    githubAccessToken,
  }: {
    githubAccessToken: string;
  }) {
    const repos = await getUserRepositories({ githubAccessToken });

    return repos;
  }

  public async getUserGithubOrgs({
    githubAccessToken,
  }: {
    githubAccessToken: string;
  }) {
    const orgsData = await getUserOrganizations({ githubAccessToken });

    return orgsData;
  }

  public async getUserGithubOrgsRepos({
    githubAccessToken,
    org,
  }: {
    githubAccessToken: string;
    org: string;
  }) {
    const orgsData = await getUserOrganizationsRepos({
      githubAccessToken,
      org,
    });

    return orgsData;
  }

  public async addProject({
    userId,
    projectName,
  }: {
    userId: string;
    projectName: string;
  }) {
    await this.userRepository.findByIdAndUpdateProject(userId, projectName);
  }

  public async deleteUser() {}

  public async deleteProject({
    username,
    projectName,
  }: {
    username: string;
    projectName: string;
  }) {
    await this.userRepository.findOneAndDeleteProject(
      { username },
      projectName,
    );
  }
}
