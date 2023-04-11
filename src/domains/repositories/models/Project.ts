import mongoose from "mongoose";
import joi from "joi";
import joigoose from "joigoose";

import type { Project } from "@src/types/db";

const Joigoose = joigoose(mongoose);

const joiProjectSchema = joi.object({
  space: joi.string(),
  repoName: joi.string(),
  repoCloneUrl: joi.string(),
  projectName: joi.string(),
  projectUpdatedAt: joi.string(),

  framework: joi.string(),
  installCommand: joi.string().allow("").default("npm install"),
  buildCommand: joi.string().allow("").default("npm run build"),
  envList: joi.array().items(
    joi.object({
      key: joi.string(),
      value: joi.string(),
    }),
  ),

  buildUrl: joi.string().allow(""),
  cmsUrl: joi.string().allow(""),
  // schemaList: joi.array().items(
  //   joi.string().meta({
  //     _mongoose: { type: "string" },
  //   }),
  // ),
  // contentList: joi.array().items(
  //   joi.string().meta({
  //     _mongoose: { type: "string" },
  //   }),
  // ),
  assetStorageUrl: joi.string(),

  webhookId: joi.string(),
  lastCommitMessage: joi.string(),
  lastCommitHash: joi.string(),

  status: joi.string().allow("").default("pending"),
});

const projectSchema = new mongoose.Schema(Joigoose.convert(joiProjectSchema), {
  versionKey: false,
});

const Project = mongoose.model<Project>("Project", projectSchema);

export default Project;
