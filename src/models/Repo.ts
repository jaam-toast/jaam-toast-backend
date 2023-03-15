import mongoose, { Types } from "mongoose";
import joi from "joi";
import joigoose from "joigoose";

import { Env } from "../types/custom";

export interface DBRepo {
  _id: Types.ObjectId;
  repoName: string;
  repoOwner: string;
  repoCloneUrl: string;
  repoUpdatedAt: string;
  nodeVersion: string;
  installCommand: string;
  buildCommand: string;
  buildType: string;
  envList?: Env[];
  instanceId: string;
  deployedUrl?: string;
  recordId?: string;
  buildingLog?: (string | undefined)[] | undefined;
  lastCommitMessage?: string;
  webhookId?: string;
  subdomain?: string;
  publicIpAddress?: string;
  userId?: string;
}

const Joigoose = joigoose(mongoose);

const joiRepoSchema = joi.object({
  repoName: joi.string(),
  repoOwner: joi.string(),
  repoCloneUrl: joi.string(),
  repoUpdatedAt: joi.string(),
  nodeVersion: joi.string(),
  installCommand: joi.string().allow("").default("npm install"),
  buildCommand: joi.string().allow("").default("npm run build"),
  buildType: joi.string().allow("").default("Next.js"),
  envList: joi.array().items(
    joi.object({
      key: joi.string(),
      value: joi.string(),
    }),
  ),
  instanceId: joi.string().allow(""),
  buildingLog: joi.array().items(joi.string()),
  deployedUrl: joi.string().allow(""),
  lastCommitMessage: joi.string(),
  webhookId: joi.string(),
});

const repoSchema = new mongoose.Schema(Joigoose.convert(joiRepoSchema), {
  versionKey: false,
});
const Repo = mongoose.model<DBRepo>("Repo", repoSchema);

export { Repo, joiRepoSchema };
