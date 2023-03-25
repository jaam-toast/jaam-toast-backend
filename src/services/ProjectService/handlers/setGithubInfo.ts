import GithubClient from "@src/services/GithubClient";
import ProjectService from "@src/services/ProjectService";

const setGithubInfo = async (
  service: ProjectService,
  next: Function,
): Promise<void> => {
  const { githubAccessToken, space, repoName } = service;

  if (!githubAccessToken || !space || !repoName) {
    service.throw("Cannot find environment data before setting github info.");
  }

  try {
    const githubClient = new GithubClient(githubAccessToken as string);

    const commitList = await githubClient.getCommits(space, repoName);

    const lastCommitMessage = commitList[0].commit.message;
    const lastCommitHash = commitList[0].sha;

    service.lastCommitMessage = lastCommitMessage;
    service.lastCommitHash = lastCommitHash;
  } catch (error) {
    service.throw(
      "An unexpected error occurred during setting github infomations.",
    );
  }

  next();
};

export default setGithubInfo;
