const mongoose = require("mongoose")
const { ethers } = require("ethers")
const Plan = require("./models/Plan")
const EachPlan = require("./models/EachPlan")
const Subscriber = require("./models/Subscriber")
const subscription = require("./constants/Subscription.json")
require("dotenv").config()

const provider = new ethers.providers.JsonRpcProvider(
  process.env.ALCHEMY_API_KEY_URL
)

const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider)

mongoose
  .connect(process.env.DBURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((res) => console.log("Connected to DB"))
  .catch((err) => console.error(err))

async function sendTx() {
  const allPlans = await Plan.find().populate({
    path: "tiers",
    populate: {
      path: "planList",
    },
  })

  for (let i = 0; i < allPlans.length; i++) {
    const contractAddress = allPlans[i].subscriptionContract
    let subList = []
    if (allPlans[i].tiers.length > 0) {
      const subscriptionContract = new ethers.Contract(
        contractAddress,
        subscription.abi,
        signer
      )

      for (let d = 0; d < allPlans[i].tiers.length; d++) {
        const tierId = allPlans[i].tiers[d].planList._id

        const selectedTier = await EachPlan.findById(tierId).populate({
          path: "subscriberList",
          populate: {
            path: "subscribers",
          },
        })

        if (selectedTier.subscriberList.length > 0) {
          for (let k = 0; k < selectedTier.subscriberList.length; k++) {
            const subscriber =
              selectedTier.subscriberList[k].subscribers.address

            const tx = await subscriptionContract.currentPlan(
              subscriber,
              selectedTier.planId
            )

            if (tx === true) {
              const tx2 = await subscriptionContract.subscriptionPaid(
                subscriber
              )

              if (tx2 === false) {
                subList.push(subscriber)
              }
            }
          }
        } else {
          continue
        }
      }

      if (subList.length > 0) {
        const tx = await subscriptionContract.withdrawSubscription(
          subList,
          "0xD512f610e0C9F4fA22f4c6f8856a0f01774B0a47"
        )

        await tx.wait()
      }

      subList = []
    } else {
      continue
    }
  }
}

sendTx()
