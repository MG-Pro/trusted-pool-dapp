import { expect } from 'chai'
import { ethers } from 'hardhat'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'

describe('TrustedPool', () => {
  const totalSupply = 1_000_000

  async function deploy() {
    const [deployer1, deployer2, user1, user2] = await ethers.getSigners()
    const MGTokenERC20 = await ethers.getContractFactory('TrustedPool', deployer1)


    const contractToken = await MGTokenERC20.deploy(totalSupply)

    await contractToken.deployed()


    return {
      contractToken,

      user1,
      user2,
      deployer1,
      deployer2,
    }
  }


})
