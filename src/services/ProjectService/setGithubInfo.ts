import { getCommits } from "../GithubService/client";
import { DeploymentError } from "../../utils/errors";
import { createDeploymentDebug } from "../../utils/createDebug";
import Config from "../../config";

import ProjectService from "./";

const setGithubInfo = async (service: ProjectService, next: Function) => {
  const debug = createDeploymentDebug(Config.CLIENT_OPTIONS.debug);
  const { githubAccessToken, repoName, repoCloneUrl } = service;

  try {
    const repoOwner = repoCloneUrl
      .split("https://github.com/")[1]
      .split("/")[0];
    const commitList = await getCommits(
      githubAccessToken as string,
      repoOwner,
      repoName,
    );
    const lastCommitMessage = commitList[0].commit.message;

    service.repoOwner = repoOwner;
    service.lastCommitMessage = lastCommitMessage;
  } catch (error) {
    debug(
      `Error: An unexpected error occurred during setting github infomations - ${error}.`,
    );

    throw new DeploymentError({
      code: "Projectservice_setGithubInfo",
      message: "setGithubInfo didn't work as expected",
    });
  }

  next();
};

export default setGithubInfo;
