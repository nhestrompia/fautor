import styles from "../styles/Home.module.css"

export default function FormInput(props) {
  const { label, errorMessage, onChange, id, ...inputProps } = props

  return (
    <div className=" z-0 mb-4 w-full ">
      <div className="relative z-0 ">
        <input
          type="text"
          className="block pt-4 outline-none border-transparent focus:border-transparent  appearance-none py-2.5 px-0 w-full text-md text-gray-900 bg-transparent border-0 border-b-2 border-gray-300   focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          {...inputProps}
          onChange={onChange}
        />
        <label className="absolute  text-lg appearance-none  text-gray-800  duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600  peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
          {label}
        </label>
        <span className=" invisible peer-focus:peer-invalid:visible text-pink-600 text-sm mb-2">
          {errorMessage}
        </span>
      </div>
    </div>
  )
}
