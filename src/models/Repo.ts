import mongoose from "mongoose";
import joi from "joi";
import joigoose from "joigoose";
import { Repo } from "../types";

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
const Repo = mongoose.model<Repo>("Repo", repoSchema);

export default Repo;
