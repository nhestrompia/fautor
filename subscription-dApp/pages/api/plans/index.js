import dbConnect from "../../../utils/dbConnect"
import Plan from "../../../models/Plan"
import EachPlan from "../../../models/EachPlan"
import Subscriber from "../../../models/Subscriber"
import mongoose, { Schema } from "mongoose"

export default async function handler(req, res) {
  const { method } = req

  await dbConnect()

  const PLANS_PER_PAGE = 7

  const page = req.query.page || 1

  if (method === "GET") {
    try {
      const skip = (page - 1) * PLANS_PER_PAGE

      const count = await Plan.estimatedDocumentCount({})

      const plans = await Plan.find().limit(PLANS_PER_PAGE).skip(skip)

      const pageCount = Math.ceil(count / PLANS_PER_PAGE)

      res.status(200).json({
        count,
        pageCount,
        plans,
      })
    } catch (err) {
      res.status(500).json(err)
    }
  }

  if (method === "POST") {
    try {
      const plan = await new Plan({
        ...req.body,
      }).save()

      res.status(200).json(plan)
    } catch (err) {
      res.status(500).json(err)
    }
  }
}
