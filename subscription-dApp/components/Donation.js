import React, { useState, useEffect } from "react"
import Web3Modal from "web3modal"
import WalletConnect from "@walletconnect/web3-provider"

import { ToastContainer, toast } from "react-toastify"
import WalletConnect from "@walletconnect/web3-provider"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEthereum } from "@fortawesome/free-brands-svg-icons"
import { faDollarSign } from "@fortawesome/free-solid-svg-icons"

import {
  subscriptionAddress,
  SUBSCRIPTION_CONTRACT_ABI,
  SUBSCRIPTION_CONTRACT_BYTECODE,
  TOKEN_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  NFT_CONTRACT_ABI,
  NFT_CONTRACT_BYTECODE,
} from "../constants"
import {
  BigNumber,
  Contract,
  ethers,
  providers,
  utils,
  ContractFactory,
} from "ethers"

import FormInput from "./FormInput"
import { useRouter } from "next/router"

export default function Donation(props, account) {
  const router = useRouter()

  const [buttonId, setButtonId] = useState("ETH")

  const [donationValues, setDonationValues] = useState({
    note: "",
    amount: 0,
  })

  const onChange = (e) => {
    console.log("target id", buttonId)

    setDonationValues({
      ...donationValues,
      ["note"]: e.target.value,
    })
  }

  const onChangeValue = (e) => {
    setDonationValues({
      ...donationValues,
      ["amount"]: e.target.value,
    })
  }

  const donate = async (e) => {
    e.preventDefault()
    try {
      const signer = props.library.getSigner()

      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      )

      const signerAdd = await signer.getAddress()

      if (buttonId === "ERC") {
        const tx = await toast.promise(
          tokenContract.transfer(
            props.subscription,
            (donationValues.amount * 1000000000000000000).toString()
          ),
          {
            pending: "Sending donation...",
            success: "Donated",
            error: "Something went wrong 🤯",
          }
        )
        await tx.wait()
      }
      if (buttonId === "ETH") {
        const data = {
          from: signerAdd,
          to: props.subscription,
          value: ethers.utils.parseEther(donationValues.amount, "ether"),
        }
        const tx = await toast.promise(signer.sendTransaction(data), {
          pending: "Sending donation...",
          success: "Donated ",
          error: "Something went wrong 🤯",
        })

        await tx.wait()
      }
      router.reload(`/plans/${props.pageId}`)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="mt-2 mr-20">
      <div className="rounded-lg bg-gradient-to-r from-[#f9d07d]/70 to-[#FFFAA7]/90 w-80 container flex   lg:mr-0">
        <div className="max-w-sm my-12 ">
          <div className="relative   rounded-lg">
            <form className="" onSubmit={donate}>
              <div>
                <div className="container  flex justify-center items-center  px-12 mt-10  ">
                  <div className="relative">
                    <input
                      type="text"
                      className="bg-gray-100  text-2xl  text-gray-500 focus:text-gray-700  rounded-lg   block w-full mt-0.5  px-5 py-8   "
                      placeholder="5"
                      pattern="^[0-9]*[.,]?[0-9]*$"
                      required
                      onChange={onChangeValue}
                    />
                    <div className="absolute top-9 right-1">
                      <div className="text-xl mr-2 ">
                        <FontAwesomeIcon
                          icon={faDollarSign}
                          className={`${
                            buttonId === "ERC"
                              ? "text-[#5f6781] scale-125"
                              : "text-gray-400"
                          } focus:ring-2 pr-2.5 `}
                          onClick={() => setButtonId("ERC")}
                        />
                        <FontAwesomeIcon
                          icon={faEthereum}
                          className={`${
                            buttonId === "ETH"
                              ? "text-[#5f6781] scale-125"
                              : "text-gray-400"
                          } focus:ring-2 ml-0.5`}
                          onClick={() => setButtonId("ETH")}
                        />
                      </div>
                      <span className="absolute text-[#919abb] text-xs w-28 top-8  -right-6">
                        Balance :{" "}
                        {buttonId === "ERC"
                          ? props.accTokenBalance
                          : props.accBalance}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 px-12">
                <input
                  type="text"
                  className="bg-gray-50 border focus:border-white text-gray-900 text-sm rounded-lg   block w-full p-4   "
                  placeholder="Note"
                  onChange={onChange}
                />
                <div className="flex justify-center  px-2">
                  <div className="">
                    <button
                      type="submit"
                      className=" text-white cursor-pointer bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl  focus:outline-none    font-medium rounded-lg text-md px-5 py-3 text-center mt-8"
                    >
                      Donate {buttonId === "ETH" ? "ETH" : "USD"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  )
}
