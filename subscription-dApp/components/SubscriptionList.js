import Plan from "./Plan"
import useSWR from "swr"

import { useState, useEffect } from "react"

import { toast } from "react-toastify"
import { useRouter } from "next/router"

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function SubscriptionList({ plansData, account, setIsOpen }) {
  const router = useRouter()

  const [page, setPage] = useState(1)
  const [pageCount, setPageCount] = useState(0)

  const { data, error } = useSWR(
    `https://fautor.vercel.app/api/plans?page=${page}`,
    fetcher
  )

  useEffect(() => {
    if (data) {
      setPageCount(data.pageCount)

      router.push(`/plans?page=${page}`, undefined, { shallow: true })
    }
  }, [data])

  if (!data) {
    return (
      <div className="text-center">
        <div role="status">
          <svg
            className="inline mr-2 w-8 h-8  animate-spin text-gray-600 fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="">Loading...</span>
        </div>
      </div>
    )
  }

  const handlePrevious = () => {
    setPage((prevPage) => {
      if (prevPage === 1) return prevPage
      return prevPage - 1
    })
  }
  const handleNext = () => {
    setPage((prevPage) => {
      if (prevPage === pageCount) return prevPage
      return prevPage + 1
    })
  }

  return (
    <>
      <div>
        <section className="text-gray-600 body-font">
          <div className="container px-5 mt-9 mb-8  ml-0">
            <div className="flex flex-wrap -m-4">
              {data.plans.map((plan) => {
                return <Plan key={plan._id} plans={plan} />
              })}

              <div className="lg:w-1/4 md:w-1/2 mt-8 p-4 w-full  ">
                <div className="text-center">
                  <button
                    className="mt-6 tracking-wider py-2 px-4 bg-gradient-to-r from-pink-500 to-orange-400 hover:bg-gradient-to-bl  focus:outline-none text-white font-medium rounded-lg shadow-md hover:shadow-lg transition duration-300"
                    onClick={
                      account
                        ? () => setIsOpen((prevState) => !prevState)
                        : () =>
                            toast("Please connect your wallet", {
                              position: "top-center",
                              autoClose: 5000,
                              hideProgressBar: false,
                              closeOnClick: true,
                              pauseOnHover: true,
                              draggable: true,
                              progress: undefined,
                            })
                    }
                  >
                    Create Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <nav>
        <ul className="flex -mt-3 justify-center">
          {pageCount !== 0 && page !== 1 && (
            <a>
              <button
                disabled={page === 1}
                onClick={handlePrevious}
                className="inline-flex items-center py-2 px-4 text-sm font-medium text-gray-500  rounded-lg border    bg-gray-800 border-gray-700  hover:bg-gray-700 hover:text-white"
              >
                Previous
              </button>
            </a>
          )}

          {pageCount !== 0 && page !== pageCount && (
            <a>
              <button
                onClick={handleNext}
                className="inline-flex items-center py-2 px-4 ml-3 text-sm font-medium text-gray-500  rounded-lg border    bg-gray-800 border-gray-700  hover:bg-gray-700 hover:text-white"
              >
                Next
              </button>
            </a>
          )}
        </ul>
      </nav>
    </>
  )
}
