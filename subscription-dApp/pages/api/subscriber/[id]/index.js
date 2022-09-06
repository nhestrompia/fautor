import dbConnect from "../../../../utils/dbConnect"
import Plan from "../../../../models/Plan"
import EachPlan from "../../../../models/EachPlan"
import Subscriber from "../../../../models/Subscriber"
import mongoose, { Schema } from "mongoose"

export default async function handler(req, res) {
  const { method } = req

  const { id } = req.query.id

  await dbConnect()

  if (method === "GET") {
    try {
      const subscriber = await Subscriber.findById(req.query.id).populate({
        path: "subscriptions",
        populate: {
          path: "subscribedPlan",
        },
      })
      res.status(200).json(subscriber)
    } catch (err) {
      res.status(500).json(err)
    }
  }

  if (method === "DELETE") {
    try {
      const plan = await EachPlan.find()
        .where("subscriptionAddress")
        .equals(req.body.subbedAddress)
        .where("planId")
        .equals(req.body.planId)
        .select("_id")

      const planId = plan[0]._id

      const updatedPlan = await EachPlan.findByIdAndUpdate(planId, {
        $pull: {
          subscriberList: {
            subscribers: req.query.id,
          },
        },
      })

      const subscriberUpdate = await Subscriber.findById(req.query.id)
        .select("subscriptions")
        .where("subscribedPlan")
        .equals(planId)
        .updateOne({
          $pull: {
            subscriptions: {
              subscribedPlan: planId,
            },
          },
        })

      res.status(200).json(plan)
    } catch (err) {
      res.status(500).json(err)
    }
  }
}
