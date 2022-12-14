import React from "react"

import axios from "axios"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import WalletConnect from "@walletconnect/web3-provider"
import { Contract, ethers } from "ethers"
import Web3Modal from "web3modal"
import { useRouter } from "next/router"
import {
  NFT_CONTRACT_ABI,
  SUBSCRIPTION_CONTRACT_ABI,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
} from "../../../constants"
import SubscriptionCard from "../../../components/SubscriptionCard"

export default function SubscriberPage({ subscriptions, account, library }) {
  const router = useRouter()

  const cancelSubscription = async (planId, subbedAddress) => {
    try {
      const signer = library.getSigner()

      const subscriptionContract = new Contract(
        subbedAddress,
        SUBSCRIPTION_CONTRACT_ABI,
        signer
      )

      const tx = await toast.promise(
        subscriptionContract.cancelSubscription(
          account,
          planId,
          TOKEN_CONTRACT_ADDRESS
        ),

        {
          pending: "Deploying...",
          success: "Subscription Plan created 👌",
          error: "Something went wrong 🤯",
        }
      )

      await tx.wait()

      await deletePlanData(subbedAddress, planId)
    } catch (err) {
      console.error(err)
    }
  }

  const deletePlanData = async (address, plan) => {
    try {
      const res = await axios.delete(
        `https://fautor.vercel.app/api/subscriber/${subscriptions._id}`,
        {
          data: { subbedAddress: address, planId: plan },
          headers: { "Content-Type": "application/json" },
        }
      )
      router.push(`/subscriber/${subscriptions._id}`)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      <div>
        <section className="text-gray-600 body-font">
          <div className="container px-5 mt-9 mb-8  ml-0 ">
            <div className="flex flex-wrap justify-evenly -m-4 ">
              {subscriptions.subscriptions.map((subPlan) => {
                if (subPlan.subscribedPlan === null) {
                  return (
                    <div
                      key={subPlan._id}
                      className="flex justify-center  items-center mt-20 text-3xl pt-80"
                    >
                      No Subscription
                    </div>
                  )
                } else {
                  return (
                    <SubscriptionCard
                      key={subPlan._id}
                      name={subPlan.subscribedPlan.title}
                      description={subPlan.subscribedPlan.description}
                      price={subPlan.subscribedPlan.price}
                      nft={subPlan.subscribedPlan.tierBadge}
                      planId={subPlan.subscribedPlan.planId}
                      subAddress={subPlan.subscribedPlan.subscriptionAddress}
                      cancelSubscription={cancelSubscription}
                    />
                  )
                }
              })}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export const getServerSideProps = async ({ query: { id } }) => {
  const res = await axios.get(`https://fautor.vercel.app/api/subscriber/${id}`)
  return {
    props: {
      subscriptions: res.data,
    },
  }
}
