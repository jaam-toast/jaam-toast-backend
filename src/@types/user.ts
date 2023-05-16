export type User = {
  _id: string;
  userName: string;
  userGithubUri: string;
  userImage?: string;
  githubAccessToken: string;
  projects: string[];
};
