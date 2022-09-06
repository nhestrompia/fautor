import React from "react"
import Image from "next/image"

export default function SubscriptionCard(props) {
  return (
    <div
      className="lg:w-1/4 md:w-1/3 md:mx-4  lg:ml-8 h-80 w-full mt-20 bg-gradient-to-r from-[#F9DE70]/40 to-[#FFFBAB]/20 transform hover:shadow-2xl  transition duration-200 ease-in rounded-lg"
      key={props.key}
    >
      <a className="block relative   h-44 rounded overflow-hidden">
        <Image
          layout="fill"
          loading="lazy"
          objectFit="contain"
          className=" object-center "
          src={props.nft}
        />
      </a>
      <div className="px-4 pt-4 text-left bg-white rounded-lg">
        <h1 className="text-gray-500 pt-1 text-sm tracking-widest title-font ">
          Title : {props.name}
        </h1>

        <h1 className="text-gray-900 title-font text-sm font-medium">
          Description : {props.description}
        </h1>
        <h1 className="text-gray-900 title-font text-md font-medium">
          Price : {props.price} $
        </h1>
        <button
          className="mt-6 py-2 mb-3.5 px-4 tracking-wider bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl  focus:outline-none text-white font-medium rounded-lg shadow-md hover:shadow-lg transition duration-300"
          onClick={() =>
            props.cancelSubscription(props.planId, props.subAddress)
          }
        >
          Cancel Subscription
        </button>
      </div>
    </div>
  )
}
