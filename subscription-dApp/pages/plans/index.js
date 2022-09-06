import React, { useEffect, useState } from "react"
import { useRouter } from "next/router"
import SubscriptionList from "../../components/SubscriptionList"

import axios from "axios"

import WalletConnect from "@walletconnect/web3-provider"
import FormInput from "../../components/FormInput"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Web3Modal from "web3modal"
import {
  BigNumber,
  Contract,
  ethers,
  providers,
  utils,
  ContractFactory,
} from "ethers"
import {
  subscriptionAddress,
  SUBSCRIPTION_CONTRACT_ABI,
  SUBSCRIPTION_CONTRACT_BYTECODE,
  TOKEN_CONTRACT_ADDRESS,
  TOKEN_CONTRACT_ABI,
  NFT_CONTRACT_ABI,
  NFT_CONTRACT_BYTECODE,
} from "../../constants"
import useSWR, { SWRConfig } from "swr"

const providerOptions = {
  walletconnect: {
    package: WalletConnect, // required
    options: {
      infuraId: process.env.INFURA_ID, // required
    },
  },
}

const FETCH_PAGE = "https://fautor.vercel.app/api/plans"

const fetcher = (url) => fetch.get(url).then((res) => res.data)

export default function PlanHome({ plansData, fallback, account }) {
  const [buttonText, setButtonText] = useState("Create Plan")

  const [isOpen, setIsOpen] = useState(false)
  const [nftAddress, setNftAddress] = useState("")

  const [deployValues, setDeployValues] = useState({
    title: "",
    description: "",
    owner: "",
    subscriptionContract: "",
    nftContract: "",
    tiers: {
      planList: {},
    },
  })

  const router = useRouter()
  const { id } = router.query

  const inputs = [
    {
      id: 1,
      name: "title",
      type: "text",
      errorMessage:
        "Plan Name should be 3-16 characters and shouldn't include any special character!",
      label: "Name",
      pattern: "^[a-zA-Z0-9_ ]{3,16}$",
      required: true,
    },
    {
      id: 2,
      name: "description",
      type: "text",
      errorMessage:
        "Description should be 3-24 characters and shouldn't include any special character!",
      pattern: "^[a-zA-Z0-9_ ]{3,24}$",
      required: true,

      label: "Description",
    },
  ]

  let web3Modal
  if (typeof window !== "undefined") {
    const web3Modal = new Web3Modal({
      providerOptions, // required
      cacheProvider: true, // optional
    })
  }

  const sendPlan = async (acc, sub, nft) => {
    try {
      router.push(`/plans`)
      const res = await axios.post("/api/plans", {
        title: deployValues.title,
        description: deployValues.description,
        owner: acc,
        subscriptionContract: sub,
        nftContract: nft,
      })

      setDeployValues({
        title: "",
        description: "",
        owner: "",
        subscriptionContract: "",
        nftContract: "",
        tiers: {
          planList: {},
        },
      })
    } catch (err) {
      console.error(err.res.data)
    }
  }

  const deployContracts = async (e) => {
    e.preventDefault()
    try {
      const web3Modal = new Web3Modal({
        cacheProvider: true, // optional
        providerOptions, // required
      })
      const provider = await web3Modal.connect()
      const library = new ethers.providers.Web3Provider(provider)
      const signer = library.getSigner()

      const accounts = await library.listAccounts()

      const contractFactory = new ethers.ContractFactory(
        SUBSCRIPTION_CONTRACT_ABI,
        SUBSCRIPTION_CONTRACT_BYTECODE,
        signer
      )

      const contractFactoryNFT = new ethers.ContractFactory(
        NFT_CONTRACT_ABI,
        NFT_CONTRACT_BYTECODE,
        signer
      )

      const deployedSubscriptionAddress = await toast.promise(
        contractFactory.deploy(),
        {
          pending: "Deploying...",
          success: "Subscription Contract Deployed 👌",
          error: "Something went wrong 🤯",
        }
      )

      setButtonText("Deploying Contracts...")

      const tx = await toast.promise(contractFactoryNFT.deploy(), {
        pending: "Deploying...",
        success: "NFT Contract Deployment Started",
        error: "Something went wrong 🤯",
      })

      const receipt = await tx.deployTransaction.wait()

      await deployedSubscriptionAddress.deployTransaction.wait()

      setButtonText("Wait for NFT Mint Setup...")

      const NFTContract = new Contract(tx.address, NFT_CONTRACT_ABI, signer)
      const mintAddress = await toast.promise(
        NFTContract.setMinterAddress(deployedSubscriptionAddress.address),
        {
          pending: "Deploying...",
          success: "Minter address has been set 👌",
          error: "Something went wrong 🤯",
        }
      )
      setButtonText("NFT Mint setup is in process...")

      await mintAddress.wait()

      await sendPlan(
        accounts[0],
        deployedSubscriptionAddress.address,
        tx.address
      )

      setButtonText("Create Plan")
      setIsOpen(false)
    } catch (err) {
      setButtonText("Create Plan")

      console.error(err)
    }
  }

  const onChange = (e) => {
    setDeployValues({ ...deployValues, [e.target.name]: e.target.value })
  }

  const handleClose = (e) => {
    if (e.target.id === "container") {
      setIsOpen(false)
    }
  }

  return (
    <>
      <div className="pt-11 mt-16 md:mx-4 lg:mx-0">
        {isOpen && account && (
          <div
            className="fixed inset-0 z-50 bg-black bg-opacity-25 backdrop-blur-sm flex items-center justify-center"
            id="container"
            onClick={handleClose}
          >
            <div id="form" className="bg-white p-12 rounded w-96">
              <h1 className="font-semibold tracking-wider text-center text-2xl text-gray-700 mb-8 p-2">
                Create Plan
              </h1>
              <div className="flex flex-col-reverse ">
                <form onSubmit={deployContracts}>
                  {inputs.map((input) => (
                    <FormInput
                      key={input.id}
                      {...input}
                      value={deployValues[input.name]}
                      onChange={onChange}
                    />
                  ))}

                  <div className=" text-center -mt-4 mx-auto p-4 w-full  ">
                    <div className="text-center">
                      <button className="mt-6 tracking-wider py-2 px-4 bg-gradient-to-r from-pink-500 to-blue-400 hover:bg-gradient-to-bl  focus:outline-none text-white font-medium rounded-lg shadow-md hover:shadow-lg transition duration-300">
                        {buttonText}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        <SWRConfig value={{ fallback }}>
          <SubscriptionList
            setIsOpen={setIsOpen}
            deploy={deployContracts}
            plansData={plansData}
            account={account}
          />
        </SWRConfig>
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
      />
    </>
  )
}

export const getServerSideProps = async () => {
  const plansData = await fetcher(FETCH_PAGE)

  return {
    props: {
      fallback: {
        "/api/plans": plansData,
      },
    },
  }
}
