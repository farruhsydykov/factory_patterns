const { expect } = require("chai")
const helpers = require("@nomicfoundation/hardhat-network-helpers")
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs")

let MrMeeseeksBox, mrMeeseeksBox
let deployer, user
let events

async function getMeeseeksInstance(address) {
    const MrMeeseeks = await ethers.getContractFactory("MrMeeseeks")
    return new ethers.Contract(
        address,
        MrMeeseeks.interface.format(ethers.utils.FormatTypes.json),
        deployer
    )
}

describe("MrMeeseeksBox", async () => {
    it("Should deploy MrMeeseeksBox factory", async () => {
        [deployer, user] = await ethers.getSigners()

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
    })

    it("Calling `summonMrMeeseeks()` with an empty string should copy previous unfullfilled Meeseeks' purpose", async () => {
        await expect(mrMeeseeksBox.summonMrMeeseeks(""))
        .to.emit(mrMeeseeksBox, "NewMrMeeseeks")
        .withArgs(deployer.address, "Be green", anyValue, anyValue)
    })

    it("Should retrieve all user's Mr.Meeseeks addresses", async() => {
        // retrieveing event filters from contract object
        const filters = mrMeeseeksBox.filters.NewMrMeeseeks()
        // querying contract object for emited events
        events = await mrMeeseeksBox.queryFilter(filters)
        
        // mutating received array of objects with events
        // so only addresses are left
        events.map((item, index, array) => {
            array[index] = item.args[3]
        })
    })

    it("Only owner can call `fullfillPurpose()` of Meeseeks", async() => {
        let lastMeeseeks = await getMeeseeksInstance(events[events.length - 1])
        await expect(lastMeeseeks.connect(user).fullfillPurpose())
        .to.be.revertedWith("Only owner can fullfill my purpose")
    })

    it("Should fullfill the purpose of the last one", async () => {
        let lastMeeseeks = await getMeeseeksInstance(events[events.length - 1])

        // checking emitted event on `fullfillPurpose` call
        await expect(lastMeeseeks.fullfillPurpose())
        .to.emit(lastMeeseeks, "Pfff")

        // retrieving bytecode of the contract
        const bytecode = await ethers.provider.getCode(events[events.length - 1])

        // checking if the contract's bytecode was deleted
        expect(bytecode)
        .to.equal('0x')

    })

    it("Should revert when summoning new Meeseeks without a purpose and previous Meeseeks is fullfilled", async () =>{
        await expect(mrMeeseeksBox.summonMrMeeseeks(""))
        .to.be.revertedWith("Provide a purpose")
    })

    it("Should revert when summoning the first Meeseeks without a purpose", async () =>{
        await expect(mrMeeseeksBox.connect(user).summonMrMeeseeks(""))
        .to.be.revertedWith("Provide a purpose")
    })

})