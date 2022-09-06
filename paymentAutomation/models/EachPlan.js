const mongoose = require("mongoose")
const Subscriber = require("./Subscriber")

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

module.exports =
  mongoose.models.EachPlan || mongoose.model("EachPlan", EachPlanSchema)
