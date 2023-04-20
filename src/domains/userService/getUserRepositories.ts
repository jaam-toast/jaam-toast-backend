import { Github } from "../../infrastructure/github";

export async function getUserRepositories({
  githubAccessToken,
}: {
  githubAccessToken: string;
}) {
  try {
    const githubClient = new Github(githubAccessToken as string);
    const publicRepos = await githubClient.getRepos("public");
    const privateRepos = await githubClient.getRepos("private");

    const repositories = [...publicRepos, ...privateRepos];

    const userReposList = repositories.map(repo => {
      const repoData = {
        repoName: repo.full_name,
        repoCloneUrl: repo.clone_url,
        repoUpdatedAt: repo.updated_at,
      };

      return repoData;
    });

    return userReposList.sort(
      (a, b) =>
        new Date(`${b.repoUpdatedAt}`).valueOf() -
        new Date(`${a.repoUpdatedAt}`).valueOf(),
    );
  } catch (error) {
    throw error;
  }
}

export async function getUserOrganizations({
  githubAccessToken,
}: {
  githubAccessToken: string;
}) {
  const githubClient = new Github(githubAccessToken as string);
  const organizations = await githubClient.getOrgs();

  return organizations.map(org => ({
    spaceName: org.login,
    spaceUrl: org.repos_url,
    spaceImage: org.avatar_url,
  }));
}

export async function getUserOrganizationsRepos({
  githubAccessToken,
  org,
}: {
  githubAccessToken: string;
  org: string;
}) {
  const githubClient = new Github(githubAccessToken as string);
  const organizationRepos = await githubClient.getOrgRepos(org);

  return organizationRepos.map(repo => ({
    repoName: repo.full_name,
    repoCloneUrl: repo.clone_url,
    repoUpdatedAt: repo.updated_at,
  }));
}
