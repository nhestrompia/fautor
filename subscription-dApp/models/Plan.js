import mongoose from "mongoose"
import EachPlan from "./EachPlan"
import Subscriber from "./Subscriber"

const PlanSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 16,
  },
  description: {
    type: String,
    required: true,
    maxlength: 24,
  },

  owner: {
    type: String,
    required: true,
  },
  subscriptionContract: {
    type: String,
    required: true,
  },
  nftContract: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    immutable: true,
    default: () => Date.now(),
  },

  tiers: [
    {
      planList: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EachPlan",
      },
    },
  ],
})

export default mongoose.models.Plan || mongoose.model("Plan", PlanSchema)
