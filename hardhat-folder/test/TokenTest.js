const { expect } = require("chai")
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers")
const { ethers } = require("hardhat")

describe("Token contract", function () {
  async function deployTokenFixture() {
    const Token = await ethers.getContractFactory("Token")
    const [owner, addr1, addr2] = await ethers.getSigners()

    const token = await Token.deploy()

    await token.deployed()

    return { Token, token, owner, addr1, addr2 }
  }

  describe("Deployment", function () {
    it("Should assign the name and symbol to given parameter", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture)
      expect(await token.name()).to.equal("Example Stable Token")
      expect(await token.symbol()).to.equal("EST")
      const balance = await token.balanceOf(owner.address)
      expect(ethers.BigNumber.from(balance)).to.equal(1000000000000000000000n)
    })

    it("Should let everyone mint token", async function () {
      const { token, owner, addr1 } = await loadFixture(deployTokenFixture)
      const mintToken = await token.connect(addr1).mint(addr1.address, 100)
      const balance = await token.balanceOf(addr1.address)
      expect(ethers.BigNumber.from(balance)).to.equal(100)
    })
  })
})
