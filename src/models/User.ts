import mongoose from "mongoose";
import joi from "joi";
import joigoose from "joigoose";

import { Project, User } from "@src/types";

const joiNewUserSchema = joi.object({
  username: joi.string().required(),
  userGithubUri: joi.string().required(),
  userImage: joi.string(),
  githubAccessToken: joi.string(),
  projects: joi.array().items(
    joi.string().meta({
      _mongoose: { type: "ObjectId", ref: "Repo" },
    }),
  ),
});

const Joigoose = joigoose(mongoose);
const newUserSchema = new mongoose.Schema(Joigoose.convert(joiNewUserSchema), {
  versionKey: false,
});

newUserSchema.pre<Project>("remove", function (next) {
  NewUser.updateMany(
    { projects: this._id },
    { $pull: { projects: this._id } },
    next,
  );
});

const NewUser = mongoose.model<User>("NewUser", newUserSchema);

export default NewUser;
