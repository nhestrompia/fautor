import React, { useEffect, useState } from "react"

import axios from "axios"
import WalletConnect from "@walletconnect/web3-provider"
import Web3Modal from "web3modal"
import {
  NFT_CONTRACT_ABI,
  SUBSCRIPTION_CONTRACT_ABI,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
} from "./../../constants"
import { Contract, ethers } from "ethers"
import Link from "next/link"
import { useRouter } from "next/router"

const providerOptions = {
  walletconnect: {
    package: WalletConnect, // required
    options: {
      infuraId: process.env.INFURA_ID, // required
    },
  },
}

export default function UserPage({ subscriptions, account }) {
  const router = useRouter()

  const [managePage, setManagePage] = useState("")
  const [isSubscriber, setIsSubscriber] = useState(true)

  const mintToken = async () => {
    try {
      const web3Modal = new Web3Modal({
        cacheProvider: true, // optional
        providerOptions, // required
      })
      const provider = await web3Modal.connect()

      const library = new ethers.providers.Web3Provider(provider)
      const signer = library.getSigner()

      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      )

      const tx = await tokenContract.mint(
        account,
        (100 * 1000000000000000000).toString()
      )
      await tx.wait()

      router.reload("/subscriber")
      console.log("sub router")
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    setIsSubscriber(false)
    setManagePage("")
    subscriptions.map((sub) => {
      if (sub.address == account) {
        if (sub.subscriptions.length !== 0) {
          setIsSubscriber(true)
          setManagePage(sub._id)
        }
      }
    })
  }, [account])

  // let web3Modal
  // if (typeof window !== "undefined") {
  //   const web3Modal = new Web3Modal({
  //     providerOptions, // required
  //     cacheProvider: true, // optional
  //   })
  // }

  return (
    <div className="pt-20 mt-20">
      {account ? (
        <section className="m-4 md:m-8  ">
          <div className="container p-4 mx-auto my-10 space-y-1 text-center">
            <h2 className="pb-3 text-3xl font-bold md:text-4xl ">
              Start supporting your favorite artists now!
            </h2>
          </div>
          <div
            className={`container grid justify-center p-4 gap-4 mx-auto lg:grid-cols-2 ${
              isSubscriber ? "xl:grid-cols-4" : "xl:grid-cols-3"
            } `}
          >
            <div className="flex flex-col px-8 py-6">
              <h2 className="mb-2 text-center text-lg font-semibold sm:text-xl ">
                Discover Plans
              </h2>
              <p className="flex-1 text-center text-gray-600 mb-4 text-base leading-relaxed ">
                Start browsing plans to support or create a new subscription
                plan for your fans. Earn NFT Tier badges with your support and
                give your loyal supporters a unique piece of art you made
              </p>
              <Link href={"/plans"}>
                <button className=" text-white tracking-widest bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl  focus:outline-none   font-medium rounded-lg text-md px-5 py-3 text-center -mr-2 mt-8">
                  Browse Plans
                </button>
              </Link>
            </div>
            <div className="flex flex-col px-8 py-6 lg:border-none xl:border-solid">
              <h2 className="mb-2 text-center text-lg font-semibold sm:text-xl ">
                Mint Token
              </h2>
              <p className="flex-1  text-gray-600 mb-4 text-base leading-relaxed text-center ">
                Mint example ERC20 token for payments now and start using it to
                support other creators/artists
              </p>
              <button
                className=" text-white tracking-widest bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl  focus:outline-none   font-medium rounded-lg text-md px-5 py-3 text-center -mr-2 mt-8"
                onClick={mintToken}
              >
                Mint Token
              </button>
            </div>
            <div className="flex flex-col px-8 py-6">
              <h2 className="mb-2 text-lg font-semibold sm:text-xl text-center">
                NFTs
              </h2>
              <p className="flex-1 text-center text-gray-600 mb-4 text-base leading-relaxed ">
                Instantly see the newly earned NFTs on Opensea.
              </p>
              <a
                className="text-white bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl  focus:outline-none   font-medium rounded-lg text-md px-5 py-3 text-center -mr-2 mt-8"
                href={`https://testnets.opensea.io/${account}`}
              >
                <button className=" tracking-widest ">Check on Opensea</button>
              </a>
            </div>
            {isSubscriber ? (
              <div className="flex flex-col px-8 py-6">
                <h2 className="mb-2 text-lg font-semibold text-center sm:text-xl ">
                  Manage Subscriptions
                </h2>
                <p className="flex-1 text-center text-gray-600 mb-4 text-base leading-relaxed ">
                  Check your current subscriptions and cancel anytime.
                </p>
                <Link href={`/subscriber/${managePage}`} passHref>
                  <button className=" text-white tracking-widest bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl  focus:outline-none   font-medium rounded-lg text-md px-5 py-3 text-center -mr-2 mt-8">
                    Manage Subscriptions
                  </button>
                </Link>
                <h1>{isSubscriber}</h1>
              </div>
            ) : (
              ""
            )}
          </div>
        </section>
      ) : (
        <div className="flex justify-center items-center ">
          <h1 className="text-2xl p-4 ">Please connect your wallet</h1>
        </div>
      )}
    </div>
  )
}

export const getServerSideProps = async ({ query: { id } }) => {
  const res = await fetch.get(`https://fautor.vercel.app/api/subscriber`)
  return {
    props: {
      subscriptions: res.data,
    },
  }
}
