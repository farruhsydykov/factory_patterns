const { expect } = require("chai")
const helpers = require("@nomicfoundation/hardhat-network-helpers")
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");

describe("MrMeeseeksBox", async () => {
    let MrMeeseeksBox, mrMeeseeksBox
    let deployer

    it("Should deploy MrMeeseeksBox factory", async () => {
        [deployer] = await ethers.getSigners()

        MrMeeseeksBox = await ethers.getContractFactory("MrMeeseeksBox")
        mrMeeseeksBox = await MrMeeseeksBox.deploy()
        await mrMeeseeksBox.deployed()
    })

    it("`summonMrMeeseeks()` should create new Mr.Meeseeks and emit event", async () => {
        await expect(mrMeeseeksBox.summonMrMeeseeks("Be blue"))
        .to.emit(mrMeeseeksBox, "NewMrMeeseeks")
        .withArgs(deployer.address, "Be blue", anyValue, anyValue)

        await expect(mrMeeseeksBox.summonMrMeeseeks("Be yellow"))
        .to.emit(mrMeeseeksBox, "NewMrMeeseeks")
        .withArgs(deployer.address, "Be yellow", anyValue, anyValue)
        
        await expect(mrMeeseeksBox.summonMrMeeseeks("Be green"))
        .to.emit(mrMeeseeksBox, "NewMrMeeseeks")
        .withArgs(deployer.address, "Be green", anyValue, anyValue)
        
        await expect(mrMeeseeksBox.summonMrMeeseeks("Be brown"))
        .to.emit(mrMeeseeksBox, "NewMrMeeseeks")
        .withArgs(deployer.address, "Be brown", anyValue, anyValue)
        
        await expect(mrMeeseeksBox.summonMrMeeseeks("Be purple"))
        .to.emit(mrMeeseeksBox, "NewMrMeeseeks")
        .withArgs(deployer.address, "Be purple", anyValue, anyValue)
    })

    it("Should retrieve all user's Mr.Meeseeks addresses and fullfill the purpose of the last one", async () => {
        const events = await mrMeeseeksBox.queryFilter(mrMeeseeksBox.filters.NewMrMeeseeks())

        events.map((item, index, array) => {
            array[index] = item.args[3]
        })

        const MrMeeseeks = await ethers.getContractFactory("MrMeeseeks")

        const lastMeeseeks = new ethers.Contract(
            events[events.length - 1],
            MrMeeseeks.interface.format(ethers.utils.FormatTypes.json),
            deployer
        )

        await expect(lastMeeseeks.fullfillPurpose())
        .to.emit(lastMeeseeks, "Pfff")

        const bytecode = await ethers.provider.getCode(events[events.length - 1])

        expect(bytecode)
        .to.equal('0x')

    })



})