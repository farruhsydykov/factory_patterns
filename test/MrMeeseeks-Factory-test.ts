import { anyValue }from "@nomicfoundation/hardhat-chai-matchers/withArgs"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { Contract, ContractFactory } from "ethers"
import * as helpers from "@nomicfoundation/hardhat-network-helpers"
import { ethers } from "hardhat"
import { expect } from "chai"

let MrMeeseeksBox: ContractFactory
let mrMeeseeksBox: Contract
let MrMeeseeks_Implementation: ContractFactory
let mrMeeseeks_Implementation: Contract
let MrMeeseeksBox_CloneFactory: ContractFactory
let mrMeeseeksBox_CloneFactory: Contract

let deployer: SignerWithAddress
let user: SignerWithAddress
let allMeeseeks_upgradeable: any
let allMeeseeks: any

async function getMeeseeksInstance(address: string) {
    const MrMeeseeks = await ethers.getContractFactory("MrMeeseeks")
    return new ethers.Contract(
        address,
        MrMeeseeks.interface.format(ethers.utils.FormatTypes.json),
        deployer
    )
}

async function getMeeseeksImplementationInstance(address: string) {
    const MrMeeseeks = await ethers.getContractFactory("MrMeeseeks_Implementation")
    return new ethers.Contract(
        address,
        MrMeeseeks.interface.format(ethers.utils.FormatTypes.json),
        deployer
    )
}

before(async () => {
    [deployer, user] = await ethers.getSigners()
})

describe("MrMeeseeksBox", async () => {

    it("Should deploy MrMeeseeksBox factory", async () => {
        MrMeeseeksBox = await ethers.getContractFactory("MrMeeseeksBox")
        mrMeeseeksBox = await MrMeeseeksBox.deploy()
        await mrMeeseeksBox.deployed()
    })

    it("`summonMrMeeseeks()` should create new Mr.Meeseeks, values must be set and emit event", async () => {
        await expect(mrMeeseeksBox.summonMrMeeseeks("Be blue"))
        .to.emit(mrMeeseeksBox, "NewMrMeeseeks")
        .withArgs(deployer.address, "Be blue", anyValue, anyValue)

        let lastMeeseeks = await mrMeeseeksBox.getLastMeeseeks()
        expect(lastMeeseeks).to.be.properAddress

        await expect(mrMeeseeksBox.summonMrMeeseeks("Be yellow"))
        .to.emit(mrMeeseeksBox, "NewMrMeeseeks")
        .withArgs(deployer.address, "Be yellow", anyValue, anyValue)

        lastMeeseeks = await mrMeeseeksBox.getLastMeeseeks()
        expect(lastMeeseeks).to.be.properAddress
        
        await expect(mrMeeseeksBox.summonMrMeeseeks("Be green"))
        .to.emit(mrMeeseeksBox, "NewMrMeeseeks")
        .withArgs(deployer.address, "Be green", anyValue, anyValue)

        lastMeeseeks = await mrMeeseeksBox.getLastMeeseeks()
        expect(lastMeeseeks).to.be.properAddress
    })

    it("Calling `summonMrMeeseeks()` with an empty string should copy previous unfullfilled Meeseeks' purpose", async () => {
        await expect(mrMeeseeksBox.summonMrMeeseeks(""))
        .to.emit(mrMeeseeksBox, "NewMrMeeseeks")
        .withArgs(deployer.address, "Be green", anyValue, anyValue)
    })

    it("Should retrieve all user's Mr.Meeseeks addresses", async () => {
        // retrieveing event filters from contract object
        const filters = mrMeeseeksBox.filters.NewMrMeeseeks()
        // querying contract object for emited events
        allMeeseeks = await mrMeeseeksBox.queryFilter(filters)
        
        // mutating received array of objects with events
        // so only addresses are left
        allMeeseeks.map((item: any, index: any, array: any) => {
            array[index] = item.args[3]
        })
    })

    it("Only owner can call `fullfillPurpose()` of Meeseeks", async () => {
        let lastMeeseeks = await getMeeseeksInstance(allMeeseeks[allMeeseeks.length - 1])
        await expect(lastMeeseeks.connect(user).fullfillPurpose())
        .to.be.revertedWith("Only owner can fullfill my purpose")
    })

    it("Should fullfill the purpose of the last one", async () => { 
        let lastMeeseeksAddress = await mrMeeseeksBox.getLastMeeseeks()
        let lastMeeseeks = await getMeeseeksInstance(lastMeeseeksAddress)

        // checking emitted event on `fullfillPurpose` call
        await expect(lastMeeseeks.fullfillPurpose())
        .to.emit(lastMeeseeks, "Pfff")

        // retrieving bytecode of the contract
        const bytecode = await ethers.provider.getCode(lastMeeseeksAddress)

        // checking if the contract's bytecode was deleted
        expect(bytecode)
        .to.equal('0x')

    })

    it("Should revert when summoning new Meeseeks without a purpose and previous Meeseeks is fullfilled", async () => {
        await expect(mrMeeseeksBox.summonMrMeeseeks(""))
        .to.be.revertedWith("Provide a purpose")
    })

    it("Should revert when summoning the first Meeseeks without a purpose", async () => {
        await expect(mrMeeseeksBox.connect(user).summonMrMeeseeks(""))
        .to.be.revertedWith("Provide a purpose")
    })

    it("Should receive all created Meeseeks' addresses", async () => {
        let allMeeseekss = await mrMeeseeksBox.getAllMeeseeks()
        
        // retrieveing event filters from contract object
        const filters = mrMeeseeksBox.filters.NewMrMeeseeks()
        // querying contract object for emited events
        allMeeseeks = await mrMeeseeksBox.queryFilter(filters)
        // mutating received array of objects with events
        // so only addresses are left
        allMeeseeks.map((item: any, index: any, array: any) => {
            array[index] = item.args[3]
        })

        expect (allMeeseeks).to.be.eql(allMeeseekss)
    })

})

describe("MrMeeseeksBox_CloneFactory:", async () => {
    it("Should deploy implementation and clone factory contracts", async () => {
        MrMeeseeks_Implementation = await ethers.getContractFactory("MrMeeseeks_Implementation")
        mrMeeseeks_Implementation = await MrMeeseeks_Implementation.deploy()
        await mrMeeseeks_Implementation.deployed()

        MrMeeseeksBox_CloneFactory = await ethers.getContractFactory("MrMeeseeksBox_CloneFactory")
        mrMeeseeksBox_CloneFactory = await MrMeeseeksBox_CloneFactory.deploy(mrMeeseeks_Implementation.address)
        await mrMeeseeksBox_CloneFactory.deployed()
    })

    it("CloneFactory should keep MrMeeseeks_Implementation address", async () => {
        expect(await mrMeeseeksBox_CloneFactory.implementation())
        .to.be.equal(mrMeeseeks_Implementation.address)
    })

    it("`summonMrMeeseeks()` should create new Mr.Meeseeks and emit event", async () => {
        await expect(mrMeeseeksBox_CloneFactory.summonMrMeeseeks("Be blue"))
        .to.emit(mrMeeseeksBox_CloneFactory, "NewMrMeeseeks")
        .withArgs(deployer.address, "Be blue", anyValue, anyValue)

        await expect(mrMeeseeksBox_CloneFactory.summonMrMeeseeks("Be yellow"))
        .to.emit(mrMeeseeksBox_CloneFactory, "NewMrMeeseeks")
        .withArgs(deployer.address, "Be yellow", anyValue, anyValue)
        
        await expect(mrMeeseeksBox_CloneFactory.summonMrMeeseeks("Be green"))
        .to.emit(mrMeeseeksBox_CloneFactory, "NewMrMeeseeks")
        .withArgs(deployer.address, "Be green", anyValue, anyValue)
    })

    it("Calling `summonMrMeeseeks()` with an empty string should copy previous unfullfilled Meeseeks' purpose", async () => {
        await expect(mrMeeseeksBox_CloneFactory.summonMrMeeseeks(""))
        .to.emit(mrMeeseeksBox_CloneFactory, "NewMrMeeseeks")
        .withArgs(deployer.address, "Be green", anyValue, anyValue)
    })

    it("Calling initializer results in transaction revert", async () => {
        let lastMeeseeks = await mrMeeseeksBox_CloneFactory.getLastMeeseeks()
        let meeseeks = await getMeeseeksImplementationInstance(lastMeeseeks)
        await expect(meeseeks.initialize("Purpose", deployer.address))
        .to.be.revertedWith("Already initialized")
    })

    it("Only owner can call `fullfillPurpose()` of Meeseeks", async () => {
        // allMeeseeks_upgradeable = await mrMeeseeksBox_CloneFactory.getAllMeeseeks()
        let lastMeeseeksAddress = await mrMeeseeksBox_CloneFactory.getLastMeeseeks()
        let lastMeeseeks = await getMeeseeksImplementationInstance(lastMeeseeksAddress)
        await expect(lastMeeseeks.connect(user).fullfillPurpose())
        .to.be.revertedWith("Only owner can fullfill my purpose")
    })

    it("Should fullfill the purpose of the last meeseeks", async () => {
        let lastMeeseeksAddress = await mrMeeseeksBox_CloneFactory.getLastMeeseeks()
        let lastMeeseeks = await getMeeseeksImplementationInstance(lastMeeseeksAddress)

        // checking emitted event on `fullfillPurpose` call
        await expect(lastMeeseeks.fullfillPurpose())
        .to.emit(lastMeeseeks, "Pfff")

        // retrieving bytecode of the contract
        const bytecode = await ethers.provider.getCode(lastMeeseeksAddress)

        // checking if the contract's bytecode was deleted
        expect(bytecode)
        .to.equal('0x')

    })

    it("Should revert when summoning new Meeseeks without a purpose and previous Meeseeks is fullfilled", async () => {
        await expect(mrMeeseeksBox_CloneFactory.summonMrMeeseeks(""))
        .to.be.revertedWith("Provide a purpose")
    })

    it("Should revert when summoning the first Meeseeks without a purpose", async () => {
        await expect(mrMeeseeksBox_CloneFactory.connect(user).summonMrMeeseeks(""))
        .to.be.revertedWith("Provide a purpose")
    })

    it("Should receive all created Meeseeks' addresses", async () => {
        let allMeeseekss = await mrMeeseeksBox_CloneFactory.getAllMeeseeks()
        
        // retrieveing event filters from contract object
        const filters = mrMeeseeksBox_CloneFactory.filters.NewMrMeeseeks()
        // querying contract object for emited events
        allMeeseeks = await mrMeeseeksBox_CloneFactory.queryFilter(filters)
        // mutating received array of objects with events
        // so only addresses are left
        allMeeseeks.map((item: any, index: any, array: any) => {
            array[index] = item.args[3]
        })

        expect (allMeeseeks).to.be.eql(allMeeseekss)
    })

    it("", async () => {

    })
})