import axios from "axios";

type GithubUserType = {
  login: string;
  url: string;
  avatar_url?: string;
};

const GithubClient = axios.create({
  baseURL: "https://api.GitHub.com",
  timeout: 2500,
  headers: {
    Accept: "application/vnd.GitHub.+json",
  },
});

export const getUserData = async (accessToken: string) => {
  const { data } = await GithubClient.get<GithubUserType>("/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return data;
};

export const getPublicRepos = async () => {};
