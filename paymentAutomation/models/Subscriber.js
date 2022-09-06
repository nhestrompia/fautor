const mongoose = require("mongoose")

const SubscriberSchema = new mongoose.Schema({
  address: {
    type: String,
  },

  subscriptions: [
    {
      subscribedAt: {
        type: Date,
        immutable: true,
        default: () => Date.now(),
      },
      subscribedAddress: {
        type: String,
      },
      planNumber: {
        type: Number,
      },
      subscribedPlan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "EachPlan",
      },

      price: {
        type: Number,
      },
    },
  ],
})

module.exports =
  mongoose.models.Subscriber || mongoose.model("Subscriber", SubscriberSchema)
