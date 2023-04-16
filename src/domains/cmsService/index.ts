import { injectable } from "inversify";

import { createDomain } from "./createDomain";
import { createToken } from "./createToken";
import { deleteDomain } from "./deleteDomain";
import { CMS_MESSAGE } from "src/config/constants";

export interface ICmsService {
  createApi({
    projectName,
  }: {
    projectName: string;
  }): Promise<{ cmsDomain: string; cmsToken: string }>;
  updateApi(): Promise<void>;
  deleteApi({ projectName }: { projectName: string }): Promise<void>;
}

@injectable()
export class CmsService implements ICmsService {
  async createApi({ projectName }: any) {
    try {
      if (!projectName) {
        throw Error(CMS_MESSAGE.CREATE_ERROR.ENVIRONMENT_DATA_NOT_FOUND);
      }

      const cmsDomain = await createDomain({ subdomain: `api-${projectName}` });

      const cmsToken = createToken({ payload: projectName });

      return { cmsDomain, cmsToken };
    } catch (error) {
      throw error;
    }
  }

  async updateApi() {}

  async deleteApi({ projectName }: { projectName: string }) {
    try {
      if (!projectName) {
        throw Error(CMS_MESSAGE.DELETE_ERROR.ENVIRONMENT_DATA_NOT_FOUND);
      }
      await deleteDomain({ subdomain: `api-${projectName}` });
    } catch (error) {
      throw error;
    }
  }
}
