import { injectable } from "inversify";

import { createDomain } from "./createDomain";
import { createToken } from "./createToken";
import { deleteDomain } from "./deleteDomain";

export interface ICmsService {
  createApi({
    projectName,
  }: {
    projectName: string;
  }): Promise<{ cmsDomain: string; cmsToken: string }>;
  updateApi(): Promise<void>;
  deleteApi({ subdomain }: { subdomain: string }): Promise<void>;
}

@injectable()
export class CmsService implements ICmsService {
  async createApi({ projectName }: any) {
    try {
      const cmsDomain = await createDomain({ subdomain: `api-${projectName}` });

      const cmsToken = createToken({ payload: projectName });

      return { cmsDomain, cmsToken };
    } catch (error) {
      throw error;
    }
  }

  async updateApi() {}

  async deleteApi({ subdomain }: { subdomain: string }) {
    await deleteDomain({ subdomain });
  }
}
