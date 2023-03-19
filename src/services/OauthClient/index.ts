import axios from "axios";

import Config from "@src/config";

import { GithubToken } from "@src/types/github";

class OauthClient {
  client = axios.create({
    baseURL: "https://github.com",
    timeout: 2500,
    headers: {
      Accept: "application/json",
    },
  });

  async getToken(code: string) {
    const { data } = await this.client.post<GithubToken>(
      "/login/oauth/access_token?",
      {},
      {
        params: {
          client_id: Config.CLIENT_ID,
          client_secret: Config.CLIENT_SECRET,
          code,
        },
      },
    );

    return data.access_token;
  }
}

export default OauthClient;
