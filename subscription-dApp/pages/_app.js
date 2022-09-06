import "../styles/globals.css"
import Navigation from "../components/Navigation"
import styles from "../styles/Home.module.css"

import { useState } from "react"

function MyApp({ Component, pageProps }) {
  const [account, setAccount] = useState()
  const [accTokenBalance, setAccTokenBalance] = useState()
  const [accBalance, setAccBalance] = useState()

  return (
    <>
      <Navigation
        account={account}
        setAccount={setAccount}
        accBalance={accBalance}
        accTokenBalance={accTokenBalance}
        setAccBalance={setAccBalance}
        setAccTokenBalance={setAccTokenBalance}
      />
      <Component
        account={account}
        accBalance={accBalance}
        accTokenBalance={accTokenBalance}
        {...pageProps}
      />
    </>
  )
}

export default MyApp
