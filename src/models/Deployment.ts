import mongoose from "mongoose";
import joi from "joi";
import joigoose from "joigoose";
import { Deployment } from "@src/types";

const Joigoose = joigoose(mongoose);

const joiDeploymentSchema = joi.object({
  buildingLog: joi.array().items(joi.string()),
  deployStatus: joi.string(),
  lastCommitHash: joi.string(),
  lastCommitMessage: joi.string(),
  repoUpdatedAt: joi.string(),
});

const deploymentSchema = new mongoose.Schema(
  Joigoose.convert(joiDeploymentSchema),
  {
    versionKey: false,
  },
);
const Deployment = mongoose.model<Deployment>("Deployment", deploymentSchema);

export default Deployment;
