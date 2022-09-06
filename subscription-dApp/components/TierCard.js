import Image from "next/image"
import Link from "next/link"
import React from "react"

export default function TierCard(props) {
  return (
    <div key={props.keyId} id={props.id} className="">
      <div className="container  flex hover:scale-105 transition duration-300 ">
        <div className="max-w-sm my-3">
          <div className="bg-gradient-to-r from-[#f9d07d]/60 to-[#FFFAA7]/80 relative  shadow-lg hover:shadow-xl transition duration-500 rounded-lg">
            <div className=" block  bg-transparent  w-64 relative h-48 rounded-t-lg overflow-hidden">
              <a
                href={`https://testnets.opensea.io/assets/goerli/${props.nft}/${props.planId}`}
              >
                <Image
                  src={props.image}
                  loading="lazy"
                  layout="fill"
                  objectFit="contain"
                  width={256}
                  height={192}
                  className="object-cover  object-center w-full h-full block"
                />
              </a>
            </div>
            <div className="py-6 px-8 rounded-lg bg-white ">
              <h1 className="text-gray-700 font-bold text-2xl mb-3 text-center hover:text-gray-900 ">
                {props.name}
              </h1>
              <p className="text-gray-700 text-center text-lg tracking-wide mb-3">
                {props.description}
              </p>

              {props.isOwner ? (
                <div className="text-center">
                  <button
                    className="mt-6 py-2 px-4  bg-gradient-to-r from-pink-500 to-orange-400 hover:bg-gradient-to-bl  focus:outline-none text-white font-medium  rounded-lg shadow-md hover:shadow-lg transition duration-300"
                    onClick={() =>
                      props.deletePlan(props.planId, props.indexId)
                    }
                  >
                    Delete Tier
                  </button>
                </div>
              ) : props.subscribed ? (
                <div className="text-center">
                  <button className="mt-6 py-2 px-4  bg-gradient-to-r from-pink-500 to-orange-400 hover:bg-gradient-to-bl  focus:outline-none  text-white font-medium  rounded-lg shadow-md hover:shadow-lg transition duration-300">
                    You have subscribed
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <button
                    className="mt-6 py-2 px-4 bg-gradient-to-r from-pink-500 to-orange-400 hover:bg-gradient-to-bl  focus:outline-none text-white font-medium rounded-lg shadow-md hover:shadow-lg transition duration-300"
                    onClick={() => props.subscribe(props.planId, props.indexId)}
                  >
                    Subscribe
                  </button>
                </div>
              )}
            </div>
            <div className="absolute top-2 right-2 py-2 px-3.5 bg-white rounded-lg">
              <span className="text-md"> ${props.price}/month</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
