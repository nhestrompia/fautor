import dbConnect from "../../../../utils/dbConnect"
import Plan from "../../../../models/Plan"
import EachPlan from "../../../../models/EachPlan"
import Subscriber from "../../../../models/Subscriber"

export default async function handler(req, res) {
  const {
    method,
    body,
    query: { id },
  } = req

  await dbConnect()

  if (method === "GET") {
    try {
      const plans = await Plan.findById(id).populate({
        path: "tiers",
        populate: {
          path: "planList",
        },
      })

      res.status(200).json(plans)
    } catch (err) {
      res.status(500).json(err)
    }
  }

  if (method === "DELETE") {
    try {
      console.log("delete req", id)

      const plans = await Plan.findById(id).populate({
        path: "tiers",
        populate: {
          path: "planList",
        },
      })

      const plan = plans.tiers[req.body.plan]
      const arrayId = plan._id
      const planId = plan.planList._id
      console.log("planId", planId)

      const subscriberUpdate = await Subscriber.find()
        .select("subscriptions")
        .where("subscribedPlan")
        .equals(planId)
        .updateMany({
          $pull: {
            subscriptions: {
              subscribedPlan: planId,
            },
          },
        })

      console.log("sub upda", subscriberUpdate)

      const removePlan = await EachPlan.deleteOne({ _id: planId })

      const updateArray = await Plan.findByIdAndUpdate(id, {
        $pull: {
          tiers: {
            planList: planId,
            _id: arrayId,
          },
        },
      })

      res.status(200).json(plan)
    } catch (err) {
      res.status(500).json(err)
    }
  }

  if (method === "POST") {
    try {
      console.log("add", req.body.address)

      if ("subscriptions" in body || "address" in body) {
        console.log("sub")

        const plans = await Plan.findById(id).populate({
          path: "tiers",
          populate: {
            path: "planList",
          },
        })

        const planId = await plans.tiers[body.index].planList._id

        const updateTier = await EachPlan.findById(planId)

        const checkSubscriber = await Subscriber.find()
          .where("address")
          .equals(req.body.address)
          .limit(1)
          .select("_id")

        if (checkSubscriber[0] !== undefined) {
          const subId = await Subscriber.find()
            .where("address")
            .equals(req.body.address)
            .limit(1)
            .select("_id")

          const oldSubscriber = await Subscriber.find()
            .where("address")
            .equals(req.body.address)
            .limit(1)
            .updateOne({ $push: { subscriptions: { subscribedPlan: planId } } })

          await updateTier.updateOne({
            $push: { subscriberList: { subscribers: subId[0]._id } },
          })
        } else {
          const subscriber = await new Subscriber({
            ...req.body,

            subscriptions: {
              subscribedPlan: planId,
            },
          }).save()

          await updateTier.updateOne({
            $push: { subscriberList: { subscribers: subscriber._id } },
          })
        }

        res.status(200).json(plans)
      } else {
        const plan = await new EachPlan({
          title: req.body.title,
          description: req.body.description,
          price: req.body.price,
          tierBadge: req.body.tierBadge,
          subscriptionAddress: req.body.subscriptionAddress,
          planId: req.body.selectedPlanId,
        }).save()
        const plans = await Plan.findById(id).select("tiers")

        plans.tiers.push({ planList: plan._id })

        await plans.save()

        res.status(200).json(plan)
      }
    } catch (err) {
      console.error(err)
      res.status(500).json(err)
    }
  }
}
