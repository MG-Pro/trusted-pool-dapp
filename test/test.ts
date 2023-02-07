import { PooledTemplate, TestERC20, TrustedPool } from '@app/typechain'
import { IPool, IPoolResponse } from '@app/types'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'

import { newPool } from '../src/fakeData/fakePools'

describe('TrustedPool', () => {
  const totalSupply = 1000_000

  async function deploy(): Promise<any> {
    const [deployer1, deployer2, user1, user2, user3, user4] = await ethers.getSigners()

    const TrustedPoolC = await ethers.getContractFactory('TrustedPool', deployer1)
    const TestERC20C = await ethers.getContractFactory('TestERC20', deployer2)

    const trustedPoolContract: TrustedPool = await TrustedPoolC.deploy()
    const testERC20CContract: TestERC20 = await TestERC20C.deploy(totalSupply)

    await testERC20CContract.deployed()
    await trustedPoolContract.deployed()

    return {
      trustedPoolContract,
      testERC20CContract,
      deployer1,
      deployer2,
      user1,
      user2,
      user3,
      user4,
    }
  }

  async function getPoolData(tokenAddress?: string): Promise<Partial<IPool>> {
    const [deployer1, deployer2, user1, user2, user3, user4] = await ethers.getSigners()
    const { name, tokenName, participants } = newPool

    participants[0].account = deployer1.address
    participants[1].account = user1.address
    participants[2].account = user2.address
    participants[3].account = user3.address
    participants[4].account = user4.address

    return {
      name,
      tokenName,
      tokenAddress: tokenAddress ? tokenAddress : ethers.constants.AddressZero,
      participants,
    }
  }

  xit('Should create pool', async () => {
    const { trustedPoolContract, deployer1, user2 } = await loadFixture(deploy)
    const { name, tokenName, participants, tokenAddress } = await getPoolData()

    await (trustedPoolContract as TrustedPool)
      .connect(deployer1)
      .createPooledContract(name, tokenAddress, tokenName, participants)

    const poolAccounts = await trustedPoolContract.getContractAddressesByParticipant(user2.address)

    const pooledTemplateContract: PooledTemplate = await ethers.getContractAt(
      'PooledTemplate',
      poolAccounts[0],
    )
    const pool: IPoolResponse = await pooledTemplateContract.getData()
    expect(pool.status).to.equal(0)
  })

  it('Should receive tokens', async () => {
    const { trustedPoolContract, testERC20CContract, deployer1, user2 } = await loadFixture(deploy)

    const { name, tokenName, participants, tokenAddress } = await getPoolData(
      testERC20CContract.address,
    )

    await (trustedPoolContract as TrustedPool)
      .connect(deployer1)
      .createPooledContract(name, tokenAddress, tokenName, participants)

    const poolAccounts = await trustedPoolContract.getContractAddressesByParticipant(user2.address)

    const pooledTemplateContract: PooledTemplate = await ethers.getContractAt(
      'PooledTemplate',
      poolAccounts[0],
    )
    const pool: IPoolResponse = await pooledTemplateContract.getData()
    expect(pool.status).to.equal(0)
  })
})
