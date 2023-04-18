import mongoose from "mongoose";
import joi from "joi";
import joigoose from "joigoose";

import type { User } from "../../types/db";

const joiUserSchema = joi.object({
  username: joi.string().required(),
  userGithubUri: joi.string().required(),
  userImage: joi.string(),
  githubAccessToken: joi.string(),
  projects: joi.array().items(
    joi.string().meta({
      _mongoose: { ref: "Project" },
    }),
  ),
});

const Joigoose = joigoose(mongoose);
const userSchema = new mongoose.Schema(Joigoose.convert(joiUserSchema), {
  versionKey: false,
});

const User = mongoose.model<User>("User", userSchema);

export default User;
