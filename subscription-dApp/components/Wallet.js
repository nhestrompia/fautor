import React, { useState, useEffect } from "react"
import Web3Modal from "web3modal"
import WalletConnect from "@walletconnect/web3-provider"
import truncateEthAddress from "truncate-eth-address"

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
import { useRouter } from "next/router"

const providerOptions = {
  walletconnect: {
    package: WalletConnect, // required
    options: {
      infuraId: process.env.NEXT_PUBLIC_INFURA_ID, // required
    },
  },
}

const network = {
  chainId: `0x${Number(5).toString(16)}`,
  chainName: "Goerli Test Network",
  nativeCurrency: {
    name: "Goerli Ether",
    symbol: "GoerliETH",
    decimals: 18,
  },
  rpcUrls: ["https://goerli.infura.io/v3/"],
  blockExplorerUrls: ["https://goerli.etherscan.io"],
}

export default function Wallet({
  account,
  setAccount,
  accBalance,
  setAccBalance,
  accTokenBalance,
  setAccTokenBalance,
  setProvider,
  setLibrary,
  provider,
  library,
}) {
  const router = useRouter()

  let web3Modal
  if (typeof window !== "undefined") {
    web3Modal = new Web3Modal({
      providerOptions, // required
      cacheProvider: true, // optional
    })
  }

  const changeNetwork = async () => {
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [
          {
            chainId: "0x5",
          },
        ],
      })
      router.reload("/")
    } catch (err) {
      console.error(err.message)
    }
  }

  const handleNetworkSwitch = async () => {
    await changeNetwork()
  }

  const refreshState = () => {
    setAccount()
  }

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet()
    }
  }, [])

  useEffect(() => {
    if (provider?.on) {
      const handleAccountsChanged = (accounts) => {
        if (accounts) {
          setAccount(accounts[0])

          connectWallet()
        }
      }

      const handleDisconnect = () => {
        disconnect()
      }

      provider.on("accountsChanged", handleAccountsChanged)

      provider.on("disconnect", handleDisconnect)

      provider.on("chainChanged", handleNetworkSwitch)

      return () => {
        if (provider.removeListener) {
          provider.removeListener("accountsChanged", handleAccountsChanged)

          provider.removeListener("disconnect", handleDisconnect)

          provider.removeListener("chainChanged", handleNetworkSwitch)
        }
      }
    }
  }, [provider])

  const disconnect = async () => {
    await web3Modal.clearCachedProvider()
    refreshState()
  }

  const connectWallet = async () => {
    try {
      const provider = await web3Modal.connect()

      const library = new ethers.providers.Web3Provider(provider)
      const accounts = await library.listAccounts()

      const { chainId } = await library.getNetwork()

      setProvider(provider)
      setLibrary(library)

      const signer = library.getSigner()

      const tokenContract = new Contract(
        TOKEN_CONTRACT_ADDRESS,
        TOKEN_CONTRACT_ABI,
        signer
      )

      if (accounts) {
        setAccount(accounts[0])

        if (chainId !== 5) {
          await changeNetwork()
        }

        const readBalance = await library.getBalance(accounts[0])
        const accountBalance = ethers.utils.formatEther(readBalance)

        const remainder = Math.round(accountBalance * 1e4) / 1e4

        setAccBalance(remainder)

        const tokenBalance = await tokenContract.balanceOf(accounts[0])
        const accountTokenBalance = ethers.utils.formatEther(tokenBalance)
        const remainderToken = Math.round(accountTokenBalance * 1e4) / 1e4
        setAccTokenBalance(remainderToken)
      }
    } catch (err) {
      console.error(err)
    }
  }
  return (
    <div className="container flex flex-wrap justify-between  mx-auto">
      <h1>
        {account ? (
          <div className="container flex flex-wrap justify-between items-center text-white">
            <div className="">
              <button
                onClick={disconnect}
                className=" focus:outline-none  font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0 bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
              >
                {truncateEthAddress(account)}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={connectWallet}
            className="text-white  focus:outline-none  font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-3 md:mr-0 bg-blue-600 hover:bg-blue-700 focus:ring-blue-800"
          >
            Connect Wallet
          </button>
        )}
      </h1>
    </div>
  )
}
