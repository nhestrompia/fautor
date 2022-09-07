import axios from "axios"
import { useRouter } from "next/router"
import { Blob, NFTStorage } from "nft.storage"
import { useEffect, useState } from "react"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

import Donation from "../../../components/Donation"
import FormInput from "../../../components/FormInput"
import Image from "next/image"

import WalletConnect from "@walletconnect/web3-provider"
import { Contract, ethers } from "ethers"
import Web3Modal from "web3modal"
import {
  NFT_CONTRACT_ABI,
  SUBSCRIPTION_CONTRACT_ABI,
  TOKEN_CONTRACT_ABI,
  TOKEN_CONTRACT_ADDRESS,
} from "../../../constants"
import TierCard from "../../../components/TierCard"
import { useDropzone } from "react-dropzone"

const providerOptions = {
  walletconnect: {
    package: WalletConnect, // required
    options: {
      infuraId: process.env.NEXT_PUBLIC_INFURA_ID, // required
    },
  },
}

export default function PlanPage({
  plans,
  account,
  accBalance,
  accTokenBalance,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [approved, setApproved] = useState(false)
  const [subscriptionAddress, setSubscriptionAddress] = useState("")
  const [loading, setLoading] = useState(false)
  const [nftAddress, setNftAddress] = useState("")
  const [isOwner, setIsOwner] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [provider, setProvider] = useState()

  const [metaDataURL, setMetaDataURL] = useState()
  const [nftUrlIpfs, setNftUrlIpfs] = useState("")
  const [files, setFiles] = useState([])
  const [donationBalance, setDonationBalance] = useState(0)

  const router = useRouter()

  const [values, setValues] = useState({
    title: "",
    description: "",
    price: 0,
    tierBadge: "",
    selectedPlanId: 0,
  })

  let newPlan = {
    title: "",
    description: "",
    price: 0,
    tierBadge: "",
    selectedPlanId: 0,
    subscriptionAddress: "",
  }

  const inputs = [
    {
      id: 1,
      name: "title",
      type: "text",
      label: "Tier Name",
      errorMessage:
        "Tier Name should be 3-16 characters and shouldn't include any special character!",
      pattern: "^[a-zA-Z0-9_ ]{3,16}$",
      required: true,
    },
    {
      id: 2,
      name: "description",
      type: "text",
      label: "Description",
      errorMessage:
        "Tier Description should be 3-24 characters and shouldn't include any special character!",
      pattern: "^[a-zA-Z0-9_ ]{3,24}$",
      required: true,
    },

    {
      id: 3,
      name: "price",
      type: "text",
      pattern: "^[0-9]*[.,]?[0-9]*$",
      errorMessage: "Price should be more than 0!",
      label: "Price",
      step: "any",
      required: true,
    },
  ]

  // let web3Modal
  // if (typeof window !== "undefined") {
  //   const web3Modal = new Web3Modal({
  //     providerOptions, // required
  //     cacheProvider: true, // optional
  //   })
  // }

  const { getRootProps, getInputProps } = useDropzone({
    maxFiles: 1,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
    onDrop: (acceptedFiles) => {
      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        )
      )
    },
  })

  const setContracts = () => {
    setSubscriptionAddress(plans.subscriptionContract)
    setNftAddress(plans.nftContract)
  }

  const sendPlanData = async (id, sub) => {
    try {
      const customConfig = {
        headers: {
          "Content-Type": "application/json",
        },
      }

      const res = await axios.post(
        `https://fautor.vercel.app/api/plans/${plans._id}`,
        {
          ...newPlan,
          selectedPlanId: id,
          subscriptionAddress: sub,
        },
        customConfig
      )
      router.push(`/plans/${plans._id}`)
    } catch (err) {
      console.error(err)
    }
  }

  const sendSubscriberData = async (add, sub, id, price, ind) => {
    try {
      const customConfig = {
        headers: {
          "Content-Type": "application/json",
        },
      }

      const res = await axios.post(
        `https://fautor.vercel.app/api/plans/${plans._id}`,
        {
          address: add,
          index: ind,
          subscriptions: {
            subscribedAddress: sub,
            planNumber: id,
            price: price,
          },
        },
        customConfig
      )

      router.push(`/plans/${plans._id}`)
    } catch (err) {
      console.error(err)
    }
  }

  const deletePlanData = async (planIndex) => {
    try {
      const res = await axios.delete(
        `https://fautor.vercel.app/api/plans/${plans._id}`,
        {
          data: { plan: planIndex },
          headers: { "Content-Type": "application/json" },
        }
      )
      router.push(`/plans/${plans._id}`)
    } catch (err) {
      console.error(err)
    }
  }

  const deletePlan = async (planId, planIndex) => {
    try {
      const web3Modal = new Web3Modal({
        cacheProvider: true, // optional
        providerOptions, // required
      })
      const provider = await web3Modal.connect()
      const library = new ethers.providers.Web3Provider(provider)
      const signer = library.getSigner()
      const subscriptionContract = new Contract(
        subscriptionAddress,
        SUBSCRIPTION_CONTRACT_ABI,
        signer
      )

      const tx = await subscriptionContract.removePlan(planId, nftAddress)
      await tx.wait()

      await deletePlanData(planIndex)
    } catch (err) {
      console.error(err)
    }
  }

  const subscribe = async (planId, planIndex) => {
    try {
      const web3Modal = new Web3Modal({
        cacheProvider: true, // optional
        providerOptions, // required
      })
      const provider = await web3Modal.connect()

      const library = new ethers.providers.Web3Provider(provider)
      const signer = library.getSigner()

      const subscriptionContract = new Contract(
        subscriptionAddress,
        SUBSCRIPTION_CONTRACT_ABI,
        signer
      )
      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      )
      setApproved(false)
      setSubscribed(false)

      await getAllowance(signer, planId)

      if (!approved) {
        const currentPrice = plans.tiers[planIndex].planList.price

        const tx = await toast.promise(
          tokenContract.approve(
            subscriptionAddress,
            (currentPrice * 12 * 1000000000000000000).toString()
          ),
          {
            pending: "Approval pending...",
            success:
              "You have approved allowance for this smart contract, wait for subscription transaction",
            error: "Something went wrong 🤯",
          }
        )

        await tx.wait()

        tx = await toast.promise(
          subscriptionContract.subscribe(
            TOKEN_CONTRACT_ADDRESS,
            planId,
            nftAddress
          ),
          {
            pending: "Subscribing...",
            success: "You've subscribed 👌",
            error:
              "Not enough tokens for payment. Mint example tokens in user page",
          }
        )
        await tx.wait()

        await sendSubscriberData(
          account,
          subscriptionAddress,
          planId,
          currentPrice,
          planIndex
        )
        setApproved(true)
        setSubscribed(true)
      } else {
        if (approved) {
          const tx = await toast.promise(
            subscriptionContract.subscribe(
              TOKEN_CONTRACT_ADDRESS,
              planId,
              nftAddress
            ),
            {
              pending: "Subscribing...",
              success: "You've subscribed 👌",
              error: "Something went wrong 🤯",
            }
          )

          await tx.wait()
          const currentPrice = plans.tiers[planIndex].planList.price
          await sendSubscriberData(
            account,
            subscriptionAddress,
            planId,
            currentPrice,
            planIndex
          )

          setSubscribed(true)
        }
      }
    } catch (err) {
      console.log(err)
    }
  }

  const checkBalance = async () => {
    try {
      const web3Modal = new Web3Modal({
        cacheProvider: true, // optional
        providerOptions, // required
      })
      const provider = await web3Modal.connect()
      const library = new ethers.providers.Web3Provider(provider)

      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        library
      )

      const tx = await tokenContract.balanceOf(subscriptionAddress)
      const accountTokenBalance = ethers.utils.formatEther(tx)
      const remainderToken = Math.round(accountTokenBalance * 1e4) / 1e4
      setDonationBalance(remainderToken)
    } catch (err) {
      console.error(err)
    }
  }

  const withdrawDonation = async () => {
    try {
      const web3Modal = new Web3Modal({
        cacheProvider: true, // optional
        providerOptions, // required
      })
      const provider = await web3Modal.connect()
      const library = new ethers.providers.Web3Provider(provider)
      const signer = library.getSigner()
      const signerAddress = signer.getAddress()

      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      )

      const subscriptionContract = new Contract(
        subscriptionAddress,
        SUBSCRIPTION_CONTRACT_ABI,
        signer
      )

      const balance = await tokenContract.balanceOf(subscriptionAddress)

      const tx = await toast.promise(
        subscriptionContract.withdrawERC20Donations(
          TOKEN_CONTRACT_ADDRESS,
          balance
        ),

        {
          pending: "Withdrawing...",
          success: "Donations withdrew",
          error: "Something went wrong 🤯",
        }
      )

      await tx.wait()

      await checkBalance()
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    setContracts()
  }, [])

  const checkSubscription = async () => {
    try {
      const web3Modal = new Web3Modal({
        cacheProvider: true, // optional
        providerOptions, // required
      })
      const provider = await web3Modal.connect()
      const library = new ethers.providers.Web3Provider(provider)

      const subscriptionContract = new Contract(
        subscriptionAddress,
        SUBSCRIPTION_CONTRACT_ABI,
        library
      )

      const planIds = []

      plans.tiers.map((plan) => {
        planIds.push(plan.planList.planId)
      })

      for (let i = 0; i < planIds.length; i++) {
        const check = await subscriptionContract.currentPlan(
          account,
          planIds[i]
        )

        if (check) {
          setSubscribed(true)
          setApproved(true)
          break
        } else {
          setSubscribed(false)
          setApproved(false)
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  const getOwner = () => {
    if (plans.owner == account) {
      setIsOwner(true)
      checkBalance()
    } else {
      setIsOwner(false)
    }
  }

  const uploadNFT = async () => {
    const client = new NFTStorage({
      token: process.env.NEXT_PUBLIC_NFT_STORAGE_TOKEN,
    })

    console.log("api key", process.env.NEXT_PUBLIC_NFT_STORAGE_TOKEN)
    try {
      const metadata = await client.store({
        name: values.title,
        description: values.description,
        image: files[0],
      })

      console.log(metadata)

      setNftUrlIpfs(metadata.url)

      const urlArray = metadata.data.image.href.split("/")
      const ipfsImageLink = `https://ipfs.io/ipfs/${urlArray[2]}/${urlArray[3]}`

      newPlan = {
        ...newPlan,
        tierBadge: ipfsImageLink,
      }

      setFiles([])

      return metadata
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    setIsOwner(false)
    setApproved(false)
    setSubscribed(false)
    checkSubscription()
    getOwner(account)
  }, [account])

  const onChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value })
  }

  const createPlan = async (e) => {
    e.preventDefault()
    newPlan = {
      title: values.title,
      description: values.description,
      price: values.price,
      selectedPlanId: 1,
      tierBadge: "a",
    }

    try {
      const web3Modal = new Web3Modal({
        cacheProvider: true, // optional
        providerOptions, // required
      })
      const provider = await web3Modal.connect()
      const library = new ethers.providers.Web3Provider(provider)
      const signer = library.getSigner()

      const subscriptionContract = new Contract(
        subscriptionAddress,
        SUBSCRIPTION_CONTRACT_ABI,
        signer
      )
      setLoading(true)
      await uploadNFT()
      setLoading(false)

      const tx = await toast.promise(
        subscriptionContract.createPlan(
          values.title,
          nftUrlIpfs,
          (values.price * 1000000000000000000).toString(),
          nftAddress
        ),

        {
          pending: "Deploying...",
          success: "Subscription Plan created 👌",
          error: "Something went wrong 🤯",
        }
      )

      await tx.wait()

      setValues({
        title: "",
        description: "",
        price: 0,
        tierBadge: "",
        selectedPlanId: 0,
      })

      const selectedPlanNumber = await subscriptionContract.selectedId()
      const idNumber = String(selectedPlanNumber)

      await sendPlanData(parseInt(idNumber), subscriptionAddress)

      setIsOpen(false)
    } catch (err) {
      console.log(err)
    }
  }

  const getIPFSGatewayURL = (ipfsURL) => {
    const urlArray = ipfsURL.split("/")
    const ipfsGateWayURL = `https://ipfs.io/ipfs/${urlArray[2]}/${urlArray[3]}`
    console.log("ipfs url", ipfsGateWayURL)
    console.log("meteadata url state", metaDataURL)
    return ipfsGateWayURL
  }

  const getProvider = async () => {
    const web3Modal = new Web3Modal({
      cacheProvider: true, // optional
      providerOptions, // required
    })

    const provider = await web3Modal.connect()
    setProvider(provider)
  }

  const getAllowance = async (signer, planId) => {
    try {
      const web3Modal = new Web3Modal({
        cacheProvider: true, // optional
        providerOptions, // required
      })

      const provider = await web3Modal.connect()
      const library = new ethers.providers.Web3Provider(provider)

      const signerAcc = signer.getAddress()
      const signerAddress = await signerAcc

      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      )

      setApproved(false)

      const allowanceCheck = await tokenContract.allowance(
        signerAddress,
        subscriptionAddress
      )

      const checkValue = planId.price * 12 * 1000000000000000000

      if (allowanceCheck >= planId.price * 12) {
        setApproved(true)
      } else {
        setApproved(false)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleClose = (e) => {
    if (e.target.id === "container") {
      setIsOpen(false)
    }
  }

  return (
    <div className="mt-11 ">
      <div>
        {isOpen && account && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-25 backdrop-blur-sm flex items-center justify-center"
            id="container"
            onClick={handleClose}
          >
            <div id="form" className="bg-white px-12 py-4 z-50 rounded w-96">
              <h1 className="font-semibold tracking-wider text-center text-2xl text-gray-700 mb-8 p-2">
                Tier Creation
              </h1>
              <div className="flex flex-col-reverse ">
                <form onSubmit={createPlan}>
                  {inputs.map((input) => (
                    <FormInput
                      key={input.id}
                      {...input}
                      value={values[input.name]}
                      onChange={onChange}
                    />
                  ))}

                  <div {...getRootProps()}>
                    <input {...getInputProps()} />

                    <div className="flex justify-center items-center  w-42 mb-5">
                      <label className="flex flex-col justify-center items-center w-64 h-42  rounded-lg   cursor-pointer  bg-gray-200  border-gray-600 hover:border-gray-500 hover:bg-gray-600">
                        <div className="flex flex-col justify-center items-center pt-5 pb-6">
                          <svg
                            aria-hidden="true"
                            className="mb-3 w-10 h-10 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            ></path>
                          </svg>

                          <div className="hover:text-gray-100">
                            {!files[0] ? (
                              <div>
                                <p className="mb-2 text-sm text-gray-500 ">
                                  <span className="font-semibold">
                                    Click to upload {""}
                                  </span>
                                  or drag and drop
                                </p>
                                <p className="text-xs text-gray-500 ">
                                  PNG or JPG
                                </p>
                              </div>
                            ) : (
                              <div className="text-center ">
                                <p className="text-md text-gray-400">
                                  {files[0].name}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                        <input type="file" className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div className=" text-center -mt-4 mx-auto p-4 w-full  ">
                    <div className="text-center">
                      <button className="mt-6 py-4 px-4 bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl  focus:outline-none text-white font-medium rounded-lg shadow-md hover:shadow-lg transition duration-300">
                        {loading ? "Uploading NFT" : "Create Tier"}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {account ? (
          <div className="antialiased w-full h-full   font-inter p-6 ">
            <div className="container  mx-auto">
              <div>
                <div id="title" className="text-center mt-12">
                  <h1 className="font-bold text-4xl text-black ">Tiers</h1>
                  <p className="text-light text-gray-500 text-xl my-2">
                    Available monthly subscription tiers
                  </p>
                </div>
                <div
                  className={` px-8 mx-8 ${
                    plans.tiers.length == 0
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 mt-20 md:mt-28 lg:mt-16 gap-10  "
                      : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5  gap-6 pt-10"
                  } `}
                >
                  {plans.tiers.map((plan, index) => {
                    if (!plan.planList) {
                      return null
                    }
                    return (
                      <TierCard
                        key={plan.planList._id}
                        index={index}
                        name={plan.planList.title}
                        description={plan.planList.description}
                        price={plan.planList.price}
                        count={plan.planList.subscriberList.length}
                        image={plan.planList.tierBadge}
                        isOwner={isOwner}
                        subscribed={subscribed}
                        planId={plan.planList.planId}
                        indexId={index}
                        nft={nftAddress}
                        deletePlan={deletePlan}
                        subscribe={subscribe}
                      />
                    )
                  })}
                  {plans.tiers.length < 4 && isOwner && (
                    <div
                      className={`flex flex-row ${
                        plans.tiers.length == 0 && "col-start-2 mt-16"
                      } justify-center items-center `}
                    >
                      <button
                        onClick={() => setIsOpen((prevState) => !prevState)}
                        className={` mt-6 py-2 px-4  tracking-wider bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl text-white font-bold rounded-lg shadow-md hover:shadow-lg transition duration-300`}
                      >
                        New Tier
                      </button>
                    </div>
                  )}
                  {!isOwner ? (
                    <div
                      className={`${
                        plans.tiers.length == 0 &&
                        " md:mx-40 lg:mx-0 md:mt-20 lg:-mt-12"
                      }  -mx-8 lg:-mx-1 mr-10  pr-6 lg:col-start-5`}
                    >
                      <Donation
                        accBalance={accBalance}
                        accTokenBalance={accTokenBalance}
                        subscription={subscriptionAddress}
                        pageId={plans._id}
                      />
                    </div>
                  ) : (
                    <div
                      className={`flex flex-col ${
                        plans.tiers.length == 4 && "mb-20 col-start-5"
                      } ${
                        plans.tiers.length == 0 ? "col-start-4 mt-16" : ""
                      }  justify-center items-center`}
                    >
                      <div
                        className="inline-flex cursor-pointer lg:mx-10 relative items-center   px-8 md:mr-10 lg:mr-0 py-3 bg-gradient-to-br from-purple-600 to-blue-500 hover:bg-gradient-to-bl tracking-wide text-indigo-600 border rounded-lg  group hover:bg-transparent hover:text-blue-600 active:text-blue-500 focus:outline-none"
                        onClick={withdrawDonation}
                      >
                        <span className=" text-center tracking-wider font-bold transition-opacity text-white group-hover:opacity-0 ">
                          Withdraw Donations
                        </span>

                        <ul className="absolute inset-0 flex items-center justify-center opacity-0 space-x-3 transition-opacity group-hover:opacity-100">
                          <li>
                            <a className="block font-bold text-white rounded-full transition-opacity hover:opacity-90 focus:outline-none focus:opacity-75">
                              <span className="">
                                Balance : {donationBalance} USD
                              </span>
                            </a>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex mt-20 pt-20 justify-center items-center ">
            <h1 className="text-2xl p-4 ">Please connect your wallet</h1>
          </div>
        )}
      </div>
    </div>
  )
}

export const getServerSideProps = async ({ query: { id } }) => {
  const res = await axios.get(`https://fautor.vercel.app/api/plans/${id}`)
  return {
    props: {
      plans: res.data,
    },
  }
}
