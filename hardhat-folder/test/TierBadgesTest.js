const { expect } = require("chai")
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers")

describe("TierBadges contract", function () {
  async function deployContractFixture() {
    const TierBadges = await ethers.getContractFactory("TierBadges")
    const [owner, addr1, addr2] = await ethers.getSigners()

    const tierBadges = await TierBadges.deploy()

    await tierBadges.deployed()

    return { TierBadges, tierBadges, owner, addr1, addr2 }
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { tierBadges, owner } = await loadFixture(deployContractFixture)

      expect(await tierBadges.owner()).to.equal(owner.address)
    })

    it("Should assign the name,minterAddress and symbol to given parameter", async function () {
      const { tierBadges, owner } = await loadFixture(deployContractFixture)

      expect(await tierBadges.name()).to.equal("Member Badges")
      expect(await tierBadges.symbol()).to.equal("MB")
      expect(await tierBadges.minterContractAddress()).to.equal(owner.address)
    })
  })

  describe("Minter address setting", function () {
    it("Should set the address minter", async function () {
      const { tierBadges, owner, addr1 } = await loadFixture(
        deployContractFixture
      )
      const setAddress = await tierBadges
        .connect(owner)
        .setMinterAddress(addr1.address)
      expect(await tierBadges.minterContractAddress()).to.equal(addr1.address)
    })

    it("Should fail when trying to mint with other addresses than minter address", async function () {
      const { tierBadges, owner, addr1 } = await loadFixture(
        deployContractFixture
      )

      await expect(
        tierBadges.connect(addr1).mint(addr1.address, 0)
      ).to.be.revertedWith("You aren't allowed to mint")
    })
    it("Should minter address mint NFTs", async function () {
      const { tierBadges, owner, addr1 } = await loadFixture(
        deployContractFixture
      )
      const mintNFT = await tierBadges.connect(owner).mint(addr1.address, 0)
      const numberNFT = await tierBadges.balanceOf(addr1.address, 0)

      expect(parseInt(numberNFT, 16)).to.equal(1)
    })
  })

  describe("Minter address minting", function () {})

  describe("Set token uri function", function () {
    it("Should not let changing uri second time", async function () {
      const { tierBadges, owner, addr1 } = await loadFixture(
        deployContractFixture
      )
      const mintNFT = await tierBadges.connect(owner).mint(addr1.address, 0)
      const setUri = await tierBadges.connect(owner).setTokenUri(0, "new uri")
      await expect(
        tierBadges.connect(owner).setTokenUri(0, "new uri example 2")
      ).to.be.revertedWith("Cannot set uri twice")
    })

    it("Should change uri second time when canReset is true", async function () {
      const { tierBadges, owner, addr1 } = await loadFixture(
        deployContractFixture
      )
      const mintNFT = await tierBadges.connect(owner).mint(addr1.address, 0)
      const setUri = await tierBadges.connect(owner).setTokenUri(0, "new uri")
      const resetChange = await tierBadges.connect(owner).uriReset()
      expect(await tierBadges.canReset()).to.equal(true)

      const uriChange = await tierBadges
        .connect(owner)
        .setTokenUri(0, "new uri example 2")

      expect(await tierBadges.uri(0)).to.equal("new uri example 2")
    })
  })
})
