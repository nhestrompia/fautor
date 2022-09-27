import dbConnect from "../../../utils/dbConnect"
import Plan from "../../../components/Plan"
import EachPlan from "../../../models/EachPlan"
import Subscriber from "../../../models/Subscriber"
import mongoose, { Schema } from "mongoose"

export default async function handler(req, res) {
  const { method, id } = req

  await dbConnect()

  if (method === "GET") {
    try {
      const subscriber = await Subscriber.find().populate({
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
}
