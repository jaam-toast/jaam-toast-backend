import mongoose from "mongoose";
import joi from "joi";
import joigoose from "joigoose";

import type { Project, User } from "@src/types/db";

const joiUserSchema = joi.object({
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
const userSchema = new mongoose.Schema(Joigoose.convert(joiUserSchema), {
  versionKey: false,
});

userSchema.pre<Project>("remove", function (next) {
  User.updateMany(
    { projects: this._id },
    { $pull: { projects: this._id } },
    next,
  );
});

const User = mongoose.model<User>("User", userSchema);

export default User;
