import mongoose from "mongoose";
import joi from "joi";
import joigoose from "joigoose";
import Deployment from "./Deployment";

import type { Project } from "@src/types/db";

const Joigoose = joigoose(mongoose);

const joiProjectSchema = joi.object({
  space: joi.string(),
  repoName: joi.string(),
  repoCloneUrl: joi.string(),
  projectUpdatedAt: joi.string(),
  projectName: joi.string(),
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
  deployedUrl: joi.string().allow(""),
  deployments: joi.array().items(
    joi.string().meta({
      _mongoose: { type: "ObjectId", ref: "Deployment" },
    }),
  ),
  lastCommitMessage: joi.string(),
  lastCommitHash: joi.string(),
  webhookId: joi.string(),
  publicIpAddress: joi.string(),
});

const projectSchema = new mongoose.Schema(Joigoose.convert(joiProjectSchema), {
  versionKey: false,
});

projectSchema.pre<Project>("save", async function (next) {
  const deployment = await Deployment.create({
    deployStatus: "pending",
    lastCommitMessage: this.lastCommitMessage,
    lastCommitHash: this.lastCommitHash,
  });

  if (!deployment) {
    const err = new Error("Creation failed.");
    return next(err);
  }

  this?.deployments?.push(deployment._id);

  return next();
});

const Project = mongoose.model<Project>("Project", projectSchema);

export default Project;
