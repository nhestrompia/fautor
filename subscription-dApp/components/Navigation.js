import styles from "../styles/Home.module.css"
import Link from "next/link"
import Wallet from "./Wallet"
import { useState } from "react"

function Navigation(props) {
  const [isNavOpen, setIsNavOpen] = useState(false)

  return (
    <nav className="px-4 md:px-2  py-2.5 bg-gray-900 fixed w-full z-20 top-0 left-0  ">
      <div className="container  cursor-pointer flex flex-wrap justify-between items-center mx-auto">
        <Link href={"/"} className="flex items-center">
          <span className="self-center text-xl mx-2.5 font-semibold whitespace-nowrap text-white">
            Fautor
          </span>
        </Link>
        <div className="flex md:order-2">
          <Wallet
            account={props.account}
            setAccount={props.setAccount}
            accBalance={props.accBalance}
            accTokenBalance={props.accTokenBalance}
            setAccBalance={props.setAccBalance}
            setAccTokenBalance={props.setAccTokenBalance}
          />

          <button
            type="button"
            className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-400 hover:bg-gray-700 focus:ring-gray-600"
            onClick={() => setIsNavOpen((prevState) => !prevState)}
          >
            <svg
              className="w-6 h-6"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        </div>
        <div
          className={
            isNavOpen
              ? " justify-between items-center w-full md:flex md:w-auto md:order-1 -ml-8"
              : "justify-between items-center w-full md:flex md:w-auto md:order-1 hidden"
          }
          id="navbar-sticky"
        >
          <ul className="flex flex-col ml-20 mr-8 p-4 mt-4  rounded-lg border  md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium md:border-0 md:bg-white bg-gray-800 md:bg-gray-900 border-gray-700">
            <li>
              <Link href={"/"}>
                <a className="block py-2 pr-4 pl-3 text-gray-700 rounded  md:hover:bg-transparent  md:p-0 md:hover:text-white text-gray-400 hover:bg-gray-700 hover:text-white md:hover:bg-transparent border-gray-700">
                  Home
                </a>
              </Link>
            </li>

            <li>
              <Link href={"/plans"}>
                <a className="block py-2 pr-4 pl-3 text-gray-700 rounded  md:hover:bg-transparent  md:p-0 md:hover:text-white text-gray-400 hover:bg-gray-700 hover:text-white md:hover:bg-transparent border-gray-700">
                  Plans
                </a>
              </Link>
            </li>

            <li>
              <Link href={"/subscriber"}>
                <a className="block py-2 pr-4 pl-3 text-gray-700 rounded  md:hover:bg-transparent  md:p-0 md:hover:text-white text-gray-400 hover:bg-gray-700 hover:text-white md:hover:bg-transparent border-gray-700">
                  User
                </a>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
