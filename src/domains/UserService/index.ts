import { injectable, inject } from "inversify";

import type { User } from "../../@types/user";
import type { Repository } from "../../@config/di.config";
import type { GithubClient } from "../../infrastructure/GithubClient";

@injectable()
export class UserService {
  private userRepository: Repository<User>;
  private githubClient: GithubClient;

  constructor(
    @inject("UserRepository") userRepository: Repository<User>,
    @inject("GithubClient") githubClient: GithubClient,
  ) {
    this.userRepository = userRepository;
    this.githubClient = githubClient;
  }

  public async login({
    username,
    userGithubUri,
    userImage,
    githubAccessToken,
  }: {
    username: string;
    userGithubUri: string;
    userImage: string;
    githubAccessToken: string;
  }) {
    const [user] = await this.userRepository.readDocument({
      filter: { userGithubUri },
    });

    if (!user) {
      const [userId] = await this.userRepository.createDocument({
        document: {
          username,
          userGithubUri,
          userImage,
          githubAccessToken,
          projects: [],
        },
      });
      const [newUserData] = await this.userRepository.readDocument({
        documentId: userId,
      });

      return newUserData;
    }

    return user;
  }

  public deleteUser({ userId }: { userId: string }) {
    return this.userRepository.deleteDocument({
      documentId: userId,
    });
  }

  public async getUserRepositories({
    githubAccessToken,
  }: {
    githubAccessToken: string;
  }) {
    try {
      const repositories = await this.githubClient.getRepos({
        accessToken: githubAccessToken,
      });

      return repositories.map(repo => ({
        repoName: repo.full_name,
        repoCloneUrl: repo.clone_url,
        repoUpdatedAt: repo.updated_at,
      }));
    } catch (error) {
      throw error;
    }
  }

  public async getUserOrganizations({
    githubAccessToken,
  }: {
    githubAccessToken: string;
  }) {
    const orgs = await this.githubClient.getOrgs({
      accessToken: githubAccessToken,
    });

    return orgs.map(org => ({
      spaceName: org.login,
      spaceUrl: org.repos_url,
      spaceImage: org.avatar_url,
    }));
  }

  public async getUserOrganizationsRepos({
    githubAccessToken,
    org,
  }: {
    githubAccessToken: string;
    org: string;
  }) {
    const repositories = await this.githubClient.getOrgRepos({
      org,
      accessToken: githubAccessToken,
    });

    return repositories.map(repo => ({
      repoName: repo.full_name,
      repoCloneUrl: repo.clone_url,
      repoUpdatedAt: repo.updated_at,
    }));
  }
}
