import { injectable, inject } from "inversify";

import { UnknownError } from "../../@utils/defineErrors";
import { BaseError } from "../../@types/baseError";

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
    try {
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

        if (!newUserData) {
          throw new UnknownError(
            "A new user was created because the user did not exist, but the creation process failed.",
          );
        }

        return newUserData;
      }

      return user;
    } catch (error) {
      if (error instanceof BaseError) {
        throw error;
      }

      throw new UnknownError("Login failed for an unknown reason.", error);
    }
  }

  public deleteUser({ userId }: { userId: string }) {
    return this.userRepository.deleteDocument({
      documentId: userId,
    });
  }

  public async getSpaces({ githubAccessToken }: { githubAccessToken: string }) {
    try {
      const { installations } = await this.githubClient.getUserInstallations({
        accessToken: githubAccessToken,
      });

      return installations
        ? installations.map(({ id, account }) => ({
            installId: id,
            spaceName: account.login,
            spaceUrl: account.repos_url,
            spaceImage: account.avatar_url,
          }))
        : [];
    } catch (error) {
      throw error;
    }
  }

  public async getSpaceRepos({
    githubAccessToken,
    spaceId,
  }: {
    githubAccessToken: string;
    spaceId: string;
  }) {
    try {
      const { repositories } = await this.githubClient.getInstallationRepos({
        accessToken: githubAccessToken,
        spaceId,
      });

      return repositories
        ? repositories.map(repo => ({
            repoName: repo.full_name,
            repoCloneUrl: repo.clone_url,
            repoUpdatedAt: repo.updated_at,
          }))
        : [];
    } catch (error) {
      throw error;
    }
  }
}
