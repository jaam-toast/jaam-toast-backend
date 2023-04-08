import mongoose from "mongoose";
import joi from "joi";
import joigoose from "joigoose";

const Joigoose = joigoose(mongoose);

const joiEventSchema = joi.object({
  name: joi.string(),
  aggregateId: joi.string().meta({
    _mongoose: { index: true },
  }),
  eventId: joi.string(),
  data: joi.object(),
});

const eventSchema = new mongoose.Schema(Joigoose.convert(joiEventSchema), {
  versionKey: false,
});
const Event = mongoose.model("Event", eventSchema);

export default Event;
