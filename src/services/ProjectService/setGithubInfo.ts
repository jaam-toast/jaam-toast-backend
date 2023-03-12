import ProjectService from "./";
import { getCommits } from "../GithubService/client";

const setGithubInfo = async (service: ProjectService, next: Function) => {
  const {
    githubAccessToken,
    repoName,
    repoCloneUrl,
  } = service;

  if (
    !githubAccessToken
    || !repoName
    || !repoCloneUrl
  ) {
    // to Be
    return service.throwError({ code: "123", message: "123" });
  }

  try {
    const repoOwner = repoCloneUrl.split("https://github.com/")[1].split("/")[0];
    const commitList = await getCommits(
      githubAccessToken as string,
      repoOwner,
      repoName,
    );
    const lastCommitMessage = commitList[0].commit.message;

    service.repoOwner = repoOwner;
    service.lastCommitMessage = lastCommitMessage;
  } catch (error) {
    // to Be
  }

  next();
};

export default setGithubInfo;
