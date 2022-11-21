import mongoose from "mongoose";
import joi from "joi";
import joigoose from "joigoose";

import { DeploymentData } from "../types/custom";

const Joigoose = joigoose(mongoose);

const joiRepoSchema = joi.object({
  repoName: joi.string(),
  repoOwner: joi.string(),
  repoCloneUrl: joi.string(),
  repoUpdatedAt: joi.string(),
  nodeVersion: joi.string(),
  installCommand: joi.string().allow("").default(""),
  buildCommand: joi.string().allow("").default(""),
  buildType: joi.string().allow("").default(""),
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
});

const repoSchema = new mongoose.Schema(Joigoose.convert(joiRepoSchema), {
  versionKey: false,
});
const Repo = mongoose.model<DeploymentData>("Repo", repoSchema);

export { Repo, joiRepoSchema };
