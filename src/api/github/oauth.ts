import axios, { AxiosInstance } from "axios";

import Config from "../../config";

type GithubToken = {
  access_token: string;
  scope: string;
  token_type: string;
};

const GithubOauth = axios.create({
  baseURL: "https://github.com",
  timeout: 2500,
  headers: {
    Accept: "application/json",
  },
});

export const getGithubToken = async (code: string) => {
  const { data } = await GithubOauth.post<GithubToken>(
    "/login/oauth/access_token?",
    null,
    {
      params: {
        client_id: Config.CLIENT_ID,
        client_secret: Config.CLIENT_SECRET,
        code,
      },
    },
  );

  return data.access_token;
};
