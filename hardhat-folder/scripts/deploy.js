const { ethers } = require("hardhat")
require("dotenv").config({ path: ".env" })

async function main() {
  const TokenContract = await ethers.getContractFactory("Token")

  const deployedTokenContract = await TokenContract.deploy()

  console.log("Token Contract Address:", deployedTokenContract.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
