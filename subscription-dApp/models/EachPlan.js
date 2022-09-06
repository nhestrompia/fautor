import mongoose from "mongoose"
import { stringifyQuery } from "next/dist/server/server-route-utils"
import Subscriber from "./Subscriber"

const EachPlanSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
  },
  planId: {
    type: Number,
  },
  tierBadge: {
    type: String,
  },
  subscriptionAddress: {
    type: String,
  },
  subscriberList: [
    {
      subscribers: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subscriber",
      },
    },
  ],
})

export default mongoose.models.EachPlan ||
  mongoose.model("EachPlan", EachPlanSchema)
