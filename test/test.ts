import { PooledTemplate, TrustedPool } from '@app/typechain'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'

import { newPool } from '../src/fakeData/fakePools'

describe('TrustedPool', () => {
  async function deploy(): Promise<any> {
    const [deployer1, deployer2, user1, user2, user3, user4] = await ethers.getSigners()
    const TrustedPoolC = await ethers.getContractFactory('TrustedPool', deployer1)
    const trustedPoolContract: TrustedPool = await TrustedPoolC.deploy()
    await trustedPoolContract.deployed()

    return {
      trustedPoolContract,
      deployer1,
      deployer2,
      user1,
      user2,
      user3,
      user4,
    }
  }

  it('Should create pool', async () => {
    const { trustedPoolContract, deployer1, deployer2, user1, user2, user3 } = await loadFixture(
      deploy,
    )

    const { name, tokenName, participants } = newPool
    participants[0].account = deployer1.address
    participants[1].account = deployer2.address
    participants[2].account = user1.address
    participants[3].account = user2.address
    participants[4].account = user3.address

    await (trustedPoolContract as TrustedPool)
      .connect(deployer1)
      .createPooledContract(name, ethers.constants.AddressZero, tokenName, participants)

    const pools = await trustedPoolContract.getContractAddressesByParticipant(user2.address)
    console.log(participants)

    const pooledTemplateContract: PooledTemplate = await ethers.getContractAt(
      'PooledTemplate',
      pools[0],
    )
    console.log(await pooledTemplateContract.getData())
    expect(pools.length).to.equal(1)
  })
})
