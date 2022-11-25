import mongoose, { Types } from "mongoose";
import joi from "joi";
import joigoose from "joigoose";

export interface DBUser {
  _id: Types.ObjectId;
  username: string;
  userGithubUri: string;
  userImage?: string;
  githubAccessToken?: string;
  myRepos?: Types.ObjectId[];
}

const Joigoose = joigoose(mongoose);

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

const userSchema = new mongoose.Schema(Joigoose.convert(joiUserSchema), {
  versionKey: false,
});
const User = mongoose.model<DBUser>("User", userSchema);

export { User, joiUserSchema };
