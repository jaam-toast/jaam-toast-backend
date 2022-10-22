import mongoose from "mongoose";
import joi from "joi";
import joigoose from "joigoose";

const Joigoose = joigoose(mongoose);

const joiUserSchema = joi.object({
  username: joi.string().required(),
  userGithubUri: joi.string().required(),
  userImage: joi.string(),
});

const userSchema = new mongoose.Schema(Joigoose.convert(joiUserSchema), {
  versionKey: false,
});
const User = mongoose.model("User", userSchema);

export { User, joiUserSchema };
