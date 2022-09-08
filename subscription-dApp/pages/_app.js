import "../styles/globals.css"
import Navigation from "../components/Navigation"
import styles from "../styles/Home.module.css"

import { useState } from "react"

function MyApp({ Component, pageProps }) {
  const [account, setAccount] = useState()
  const [accTokenBalance, setAccTokenBalance] = useState()
  const [accBalance, setAccBalance] = useState()
  const [provider, setProvider] = useState()
  const [library, setLibrary] = useState()

  console.log("app library", library)

  return (
    <>
      <Navigation
        account={account}
        setAccount={setAccount}
        accBalance={accBalance}
        accTokenBalance={accTokenBalance}
        setAccBalance={setAccBalance}
        setAccTokenBalance={setAccTokenBalance}
        provider={provider}
        library={library}
        setProvider={setProvider}
        setLibrary={setLibrary}
      />
      <Component
        account={account}
        accBalance={accBalance}
        accTokenBalance={accTokenBalance}
        provider={provider}
        library={library}
        {...pageProps}
      />
    </>
  )
}

export default MyApp
