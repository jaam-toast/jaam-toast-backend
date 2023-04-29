export type User = {
  _id?: string;
  username: string;
  userGithubUri: string;
  userImage?: string;
  githubAccessToken: string;
  projects?: string[];
};
