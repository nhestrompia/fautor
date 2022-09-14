const { expect } = require("chai")
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers")
const { ethers } = require("hardhat")

describe("Subscription contract", function () {
  async function deployContractFixture() {
    const Subscription = await ethers.getContractFactory("Subscription")
    const TierBadges = await ethers.getContractFactory("TierBadges")
    const Token = await ethers.getContractFactory("Token")

    const [owner, addr1, addr2] = await ethers.getSigners()

    const subscription = await Subscription.deploy()
    const tierBadges = await TierBadges.deploy()
    const token = await Token.deploy()

    await subscription.deployed()
    await tierBadges.deployed()
    await token.deployed()

    return {
      Subscription,
      subscription,
      tierBadges,
      token,
      owner,
      addr1,
      addr2,
    }
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { subscription, owner } = await loadFixture(deployContractFixture)

      expect(await subscription.ownerAddress()).to.equal(owner.address)
    })
    it("Should change addresses for masterAddress and token option", async function () {
      const { subscription, owner, token, tierBadges, addr1 } =
        await loadFixture(deployContractFixture)
      const addressChange = await subscription.changeParams(
        addr1.address,
        token.address
      )
      const masterAddress = await subscription.masterAddress()
      const tokenOption = await subscription.tokenOption1()

      expect(masterAddress).to.equal(addr1.address)
      expect(tokenOption).to.equal(token.address)
    })
  })

  describe("Sending and getting donations", function () {
    it("Should receive ETH donations and splits it between masterAddress and owner", async function () {
      const { subscription, owner, token, tierBadges, addr1, addr2 } =
        await loadFixture(deployContractFixture)

      const addressChange = await subscription
        .connect(owner)
        .changeParams(addr2.address, token.address)

      const balanceBefore = await owner.getBalance()
      const accountBalanceBefore = ethers.utils.formatEther(balanceBefore)
      const remainderBefore = Math.round(accountBalanceBefore * 1e4) / 1e4

      const masterAddressBefore = await addr2.getBalance()
      const masterAddressBalanceBefore =
        ethers.utils.formatEther(masterAddressBefore)
      const masterAddressBeforeRemainder =
        Math.round(masterAddressBalanceBefore * 1e4) / 1e4

      const data = {
        from: addr1.address,
        to: subscription.address,
        value: ethers.utils.parseEther("1.0"),
      }
      const donateETH = await addr1.sendTransaction(data)

      const balanceAfter = await owner.getBalance()
      const accountBalanceAfter = ethers.utils.formatEther(balanceAfter)
      const remainderAfter = Math.round(accountBalanceAfter * 1e4) / 1e4

      const masterAddressAfter = await addr2.getBalance()
      const masterAddressBalanceAfter =
        ethers.utils.formatEther(masterAddressAfter)
      const masterAddressAfterRemainder =
        Math.round(masterAddressBalanceAfter * 1e4) / 1e4

      // tax is 4%
      expect(remainderAfter).to.equal(remainderBefore + 0.96)
      expect(masterAddressAfterRemainder).to.equal(
        masterAddressBeforeRemainder + 0.04
      )
    })

    it("Should receive token donations and when withdrawn payment should be split between masterAddress and owner", async function () {
      const { subscription, owner, token, tierBadges, addr1, addr2 } =
        await loadFixture(deployContractFixture)

      const addressChange = await subscription
        .connect(owner)
        .changeParams(addr2.address, token.address)

      const mintToken = await token.mint(addr1.address, 100)
      const donateToken = await token
        .connect(addr1)
        .transfer(subscription.address, 100)

      expect(await token.balanceOf(subscription.address)).to.equal(100)

      const withdrawDonation = await subscription
        .connect(owner)
        .withdrawERC20Donations(token.address, 100)

      expect(await token.balanceOf(owner.address)).to.equal(
        1000000000000000000096n
      )
      expect(await token.balanceOf(addr2.address)).to.equal(4)
    })
  })

  describe("Creating a plan and subscribing", function () {
    it("Should create a subscription plan with right parameters", async function () {
      const { subscription, owner, token, tierBadges, addr1, addr2 } =
        await loadFixture(deployContractFixture)
      const setAddress = await tierBadges
        .connect(owner)
        .setMinterAddress(subscription.address)
      const createPlan = await subscription
        .connect(owner)
        .createPlan("Example", "URI", 1, tierBadges.address)
      const planId = await subscription.selectedId()
      const plan = await subscription.plans(planId)
      expect(plan.name).to.equal("Example")
      expect(plan.uri).to.equal("URI")
      expect(parseInt(plan.price, 16)).to.equal(1)
    })
    it("Should remove created tier", async function () {
      const { subscription, owner, token, tierBadges, addr1, addr2 } =
        await loadFixture(deployContractFixture)
      const setAddress = await tierBadges
        .connect(owner)
        .setMinterAddress(subscription.address)
      const createPlan = await subscription
        .connect(owner)
        .createPlan("Example", "URI", 1, tierBadges.address)
      const planId = await subscription.selectedId()

      const removePlan = await subscription
        .connect(owner)
        .removePlan(planId, tierBadges.address)
      const plan = await subscription.plans(planId)
      expect(plan.isPlanActive).to.equal(false)
    })
    it("Should let subscribing to created plan", async function () {
      const { subscription, owner, token, tierBadges, addr1, addr2 } =
        await loadFixture(deployContractFixture)
      const addressChange = await subscription
        .connect(owner)
        .changeParams(addr2.address, token.address)
      const setAddress = await tierBadges
        .connect(owner)
        .setMinterAddress(subscription.address)
      const createPlan = await subscription
        .connect(owner)
        .createPlan("Example", "URI", 1, tierBadges.address)
      const planId = await subscription.selectedId()

      const mintToken = await token.mint(addr1.address, 100)
      const approveContract = await token
        .connect(addr1)
        .approve(subscription.address, "12")

      const subscribe = await subscription
        .connect(addr1)
        .subscribe(token.address, planId, tierBadges.address)
      const plan = await subscription.plans(planId)
      const subscriberMapping = await subscription.subscribers(addr1.address)

      expect(parseInt(plan.subscribers, 16)).to.equal(1)
      expect(parseInt(subscriberMapping.plan, 16)).to.equal(0)
    })
    it("Should let subscriber cancel the subscription", async function () {
      const { subscription, owner, token, tierBadges, addr1, addr2 } =
        await loadFixture(deployContractFixture)

      const addressChange = await subscription
        .connect(owner)
        .changeParams(addr2.address, token.address)
      const setAddress = await tierBadges
        .connect(owner)
        .setMinterAddress(subscription.address)
      const createPlan = await subscription
        .connect(owner)
        .createPlan("Example", "URI", 1, tierBadges.address)
      const planId = await subscription.selectedId()

      const mintToken = await token.mint(addr1.address, 100)
      const approveContract = await token
        .connect(addr1)
        .approve(subscription.address, "12")

      const subscribe = await subscription
        .connect(addr1)
        .subscribe(token.address, planId, tierBadges.address)

      const cancelSubscription = await subscription
        .connect(addr1)
        .cancelSubscription(addr1.address, planId, token.address)
      const plan = await subscription.plans(planId)

      expect(parseInt(plan.subscribers, 16)).to.equal(0)
    })

    it("Should not let other addresses than owner and subscriber cancel the subscription", async function () {
      const { subscription, owner, token, tierBadges, addr1, addr2 } =
        await loadFixture(deployContractFixture)

      const addressChange = await subscription
        .connect(owner)
        .changeParams(addr2.address, token.address)
      const setAddress = await tierBadges
        .connect(owner)
        .setMinterAddress(subscription.address)
      const createPlan = await subscription
        .connect(owner)
        .createPlan("Example", "URI", 1, tierBadges.address)
      const planId = await subscription.selectedId()

      const mintToken = await token.mint(addr1.address, 100)
      const approveContract = await token
        .connect(addr1)
        .approve(subscription.address, "12")

      const subscribe = await subscription
        .connect(addr1)
        .subscribe(token.address, planId, tierBadges.address)

      const plan = await subscription.plans(planId)

      await expect(
        subscription
          .connect(addr2)
          .cancelSubscription(addr1.address, planId, token.address)
      ).to.be.revertedWith("You arent the subscriber or the owner!")
    })

    it("Should not let more than 4 active plans", async function () {
      const { subscription, owner, token, tierBadges, addr1, addr2 } =
        await loadFixture(deployContractFixture)
      const setAddress = await tierBadges
        .connect(owner)
        .setMinterAddress(subscription.address)

      for (let i = 0; i < 4; i++) {
        const createPlan = await subscription
          .connect(owner)
          .createPlan(`Example ${i}`, `URI ${i}`, 1, tierBadges.address)
      }
      const totalPlans = await subscription.totalPlans()

      expect(parseInt(totalPlans, 16)).to.equal(4)

      await expect(
        subscription
          .connect(owner)
          .createPlan(`Example 5`, `URI 5`, 1, tierBadges.address)
      ).to.be.revertedWith("You can't create subscription plans more than 4")
    })

    it("Should not withdraw before payment time comes", async function () {
      const { subscription, owner, token, tierBadges, addr1, addr2 } =
        await loadFixture(deployContractFixture)
      const addressChange = await subscription
        .connect(owner)
        .changeParams(addr2.address, token.address)
      const setAddress = await tierBadges
        .connect(owner)
        .setMinterAddress(subscription.address)
      const createPlan = await subscription
        .connect(owner)
        .createPlan("Example", "URI", 1, tierBadges.address)
      const planId = await subscription.selectedId()

      const mintToken = await token.mint(addr1.address, 100)
      const approveContract = await token
        .connect(addr1)
        .approve(subscription.address, "12")

      const subscribe = await subscription
        .connect(addr1)
        .subscribe(token.address, planId, tierBadges.address)
      await expect(
        subscription.withdrawSubscription([addr1.address], token.address)
      ).to.be.revertedWith("Subscription already paid for this period.")
    })
    it("Should withdraw the payment when time comes and split between master and owner address", async function () {
      const { subscription, owner, token, tierBadges, addr1, addr2 } =
        await loadFixture(deployContractFixture)
      const addressChange = await subscription
        .connect(owner)
        .changeParams(addr2.address, token.address)
      const setAddress = await tierBadges
        .connect(owner)
        .setMinterAddress(subscription.address)
      const createPlan = await subscription
        .connect(owner)
        .createPlan("Example", "URI", 100, tierBadges.address)
      const planId = await subscription.selectedId()

      const mintToken = await token.mint(addr1.address, 1200)
      const approveContract = await token
        .connect(addr1)
        .approve(subscription.address, "1200")

      const subscribe = await subscription
        .connect(addr1)
        .subscribe(token.address, planId, tierBadges.address)
      const time = await network.provider.send("evm_increaseTime", [86400])
      const time2 = await network.provider.send("evm_mine", [])

      const subscriberMappingBefore = await subscription.subscribers(
        addr1.address
      )

      const payedMonthBefore = await subscriberMappingBefore.payedMonthCounter

      const withdrawSubscription = await subscription.withdrawSubscription(
        [addr1.address],
        token.address
      )

      const subscriberMappingAfter = await subscription.subscribers(
        addr1.address
      )

      const payedMonthAfter = await subscriberMappingAfter.payedMonthCounter

      expect(payedMonthAfter).to.equal(parseInt(payedMonthBefore) + 1)

      expect(await token.balanceOf(addr2.address)).to.equal(16)

      const ownerBalance = await token.balanceOf(owner.address)

      expect(ethers.BigNumber.from(ownerBalance)).to.equal(
        1000000000000000000184n
      )
    })
    it("Should not withdraw payment from a subscriber when subscribed plan removed", async function () {
      const { subscription, owner, token, tierBadges, addr1, addr2 } =
        await loadFixture(deployContractFixture)
      const addressChange = await subscription
        .connect(owner)
        .changeParams(addr2.address, token.address)
      const setAddress = await tierBadges
        .connect(owner)
        .setMinterAddress(subscription.address)
      const createPlan = await subscription
        .connect(owner)
        .createPlan("Example", "URI", 100, tierBadges.address)
      const planId = await subscription.selectedId()

      const mintToken = await token.mint(addr1.address, 1200)
      const approveContract = await token
        .connect(addr1)
        .approve(subscription.address, "1200")

      const subscribe = await subscription
        .connect(addr1)
        .subscribe(token.address, planId, tierBadges.address)
      const time = await network.provider.send("evm_increaseTime", [86400])
      const time2 = await network.provider.send("evm_mine", [])

      const removePlan = await subscription
        .connect(owner)
        .removePlan(planId, tierBadges.address)
      await expect(
        subscription.withdrawSubscription([addr1.address], token.address)
      ).to.be.revertedWith("Subscription already inactive.")
    })
  })
})
