import MainNavigation from "./MainNavigation"
import styles from "../styles/Home.module.css"

function Layout(props) {
  return (
    <div>
      <MainNavigation />
      <main className="">{props.children}</main>
    </div>
  )
}

export default Layout
