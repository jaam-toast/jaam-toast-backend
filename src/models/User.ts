import mongoose from "mongoose";
import joi from "joi";
import joigoose from "joigoose";
import { User } from "../types";

const joiUserSchema = joi.object({
  username: joi.string().required(),
  userGithubUri: joi.string().required(),
  userImage: joi.string(),
  githubAccessToken: joi.string(),
  myRepos: joi.array().items(
    joi.string().meta({
      _mongoose: { type: "ObjectId", ref: "Repo" },
    }),
  ),
});

const Joigoose = joigoose(mongoose);
const userSchema = new mongoose.Schema(Joigoose.convert(joiUserSchema), {
  versionKey: false,
});
const User = mongoose.model<User>("User", userSchema);

export default User;
