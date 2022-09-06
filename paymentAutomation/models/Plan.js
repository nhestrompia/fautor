const mongoose = require("mongoose")
const Subscriber = require("./Subscriber")
const EachPlan = require("./EachPlan")

const PlanSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 10,
  },
  description: {
    type: String,
    required: true,
    maxlength: 20,
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

module.exports = mongoose.model("Plan", PlanSchema)
