import Link from "next/link"
import Image from "next/image"

export default function Plan({ plans, key }) {
  return (
    <Link href={`/plans/${plans._id}`} passHref>
      <div
        className="lg:w-1/4 md:w-1/2 p-4 w-full   transform hover:shadow-2xl cursor-pointer transition duration-200 ease-in hover:rounded-lg"
        key={key}
      >
        <a className="block relative   h-48 rounded overflow-hidden">
          <Image
            layout="fill"
            loading="lazy"
            className="object-cover object-center w-full h-full block"
            src={"/filler.jpg"}
          />
        </a>
        <div className="mt-4">
          <h1 className="text-gray-500 text-sm tracking-widest title-font ">
            Title : {plans.title}
          </h1>

          <h1 className="text-gray-900 title-font text-xs font-medium">
            Description : {plans.description}
          </h1>
        </div>
      </div>
    </Link>
  )
}
