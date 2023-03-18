import GithubClient from "@src/services/GithubClient";

import ProjectService from "@src/services/ProjectService";

const setGithubInfo = async (
  service: ProjectService,
  next: Function,
): Promise<void> => {
  const { githubAccessToken, repoName, repoCloneUrl } = service;

  if (!repoCloneUrl || !repoName) {
    service.throw("Cannot find environment data before setting github info.");
  }

  try {
    const githubClient = new GithubClient(githubAccessToken as string);
    const repoOwner = repoCloneUrl
      .split("https://github.com/")[1]
      .split("/")[0];
    const commitList = await githubClient.getCommits(repoOwner, repoName);
    const lastCommitMessage = commitList[0].commit.message;

    service.repoOwner = repoOwner;
    service.lastCommitMessage = lastCommitMessage;
  } catch (error) {
    service.throw(
      "An unexpected error occurred during setting github infomations.",
    );
  }

  next();
};

export default setGithubInfo;
