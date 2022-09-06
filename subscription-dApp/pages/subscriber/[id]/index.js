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

const providerOptions = {
  walletconnect: {
    package: WalletConnect, // required
    options: {
      infuraId: process.env.INFURA_ID, // required
    },
  },
}

export default function SubscriberPage({ subscriptions, account }) {
  const router = useRouter()

  let web3Modal
  if (typeof window !== "undefined") {
    const web3Modal = new Web3Modal({
      providerOptions, // required
      cacheProvider: true, // optional
    })
  }

  const cancelSubscription = async (planId, subbedAddress) => {
    try {
      const web3Modal = new Web3Modal({
        cacheProvider: true, // optional
        providerOptions, // required
      })
      const provider = await web3Modal.connect()
      const library = new ethers.providers.Web3Provider(provider)
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
      const res = await axios.delete(`/api/subscriber/${subscriptions._id}`, {
        data: { subbedAddress: address, planId: plan },
        headers: { "Content-Type": "application/json" },
      })
      router.push(`/subscriber/${subscriptions._id}`)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <>
      <div>
        <section class="text-gray-600 body-font">
          <div class="container px-5 mt-9 mb-8  ml-0 ">
            <div class="flex flex-wrap justify-evenly -m-4 ">
              {subscriptions.subscriptions.map((subPlan) => {
                if (subPlan.subscribedPlan === null) {
                  return (
                    <div className="flex justify-center  items-center mt-20 text-3xl pt-80">
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
  const res = await axios.get(`/api/subscriber/${id}`)
  return {
    props: {
      subscriptions: res.data,
    },
  }
}
