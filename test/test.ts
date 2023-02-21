import { PoolTemplate, PoolFactory, TestERC20 } from '@app/typechain'
import { IParticipant, IParticipantResponse, IPool, IPoolResponse } from '@app/types'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/src/signers'
import { expect } from 'chai'
import { ethers } from 'hardhat'

import {
  ICreatePool,
  ICreatePoolTemplateContract,
  ICreateTestERC20Contract,
  IDeployPoolFactory,
  IDeployTestERC20,
} from './test.types'

const totalSupply = 1_000_000
const participantFirst = 0
const participantSize = 25

async function deployPoolFactory(): Promise<IDeployPoolFactory> {
  const [deployer1, deployer2, user1, user2, user3, user4, user5] =
    (await ethers.getSigners()) as unknown as SignerWithAddress[]

  const PoolFactoryC = await ethers.getContractFactory('PoolFactory', deployer1)
  const TestERC20C = await ethers.getContractFactory('TestERC20', deployer2)

  const poolFactoryContract: PoolFactory = await PoolFactoryC.deploy()
  const testERC20CContract: TestERC20 = await TestERC20C.deploy(totalSupply)

  await testERC20CContract.deployed()
  await poolFactoryContract.deployed()

  return {
    poolFactoryContract,
    testERC20CContract,
    deployer1,
    user1,
    user2,
    user3,
    user4,
    user5,
  }
}

async function deployTestERC20(): Promise<IDeployTestERC20> {
  const [deployer1, deployer2, user1, user2, user3, user4, user5] =
    (await ethers.getSigners()) as unknown as SignerWithAddress[]

  const TestERC20C = await ethers.getContractFactory('TestERC20', deployer2)

  const testERC20CContract: TestERC20 = await TestERC20C.deploy(totalSupply)

  await testERC20CContract.deployed()

  return {
    testERC20CContract,
    deployer2,
    user1,
    user2,
    user3,
    user4,
    user5,
  }
}

async function poolData(
  tokenAddress = ethers.constants.AddressZero,
  participantsCount = 5,
  nonce: string = '',
): Promise<Partial<IPool>> {
  const accounts = await ethers.getSigners()

  const participants: IParticipant[] = Array(participantsCount)
    .fill(null)
    .map((_, i) => {
      const account = i > 2 ? ethers.Wallet.createRandom().address : accounts[i].address

      return {
        account,
        share: 50_000 + i * 5_000,
        claimed: 0,
        accrued: 0,
        description: 'p' + i + nonce,
      }
    })

  return {
    name: 'VC' + nonce,
    tokenName: 'BTC' + nonce,
    tokenAddress,
    participants,
    tokenAmount: participants.reduce((acc, p) => acc + p.share, 0),
  }
}

async function createPoolTemplateContract(
  participantsCount: number,
): Promise<ICreatePoolTemplateContract> {
  const { poolFactoryContract, deployer1 } = await deployPoolFactory()
  const { name, tokenName, participants, tokenAddress, tokenAmount } = await poolData(
    undefined,
    participantsCount,
  )

  await poolFactoryContract
    .connect(deployer1)
    .createPoolContract(name, tokenAddress, tokenName, participants)

  const poolAccounts: string[] = await poolFactoryContract.getContractAddressesByParticipant(
    participants[0].account,
  )

  const poolTemplateContract: PoolTemplate = await ethers.getContractAt(
    'PoolTemplate',
    poolAccounts[0],
  )

  return { poolTemplateContract, tokenAmount, participants, deployer1 }
}

async function createPool(participantsCount: number): Promise<ICreatePool> {
  const { poolTemplateContract, tokenAmount } = await createPoolTemplateContract(participantsCount)

  const poolResponse: IPoolResponse = await poolTemplateContract.getPoolData()
  const participantResponse: IParticipantResponse[] = await poolTemplateContract.getParticipants(
    participantFirst,
    participantSize,
  )
  return { poolResponse, participantResponse, tokenAmount }
}

async function createTestERC20(
  poolAccount: string,
  mintAmount?: number,
): Promise<ICreateTestERC20Contract> {
  const { testERC20CContract, deployer2 } = await deployTestERC20()

  if (mintAmount) {
    const tr = await testERC20CContract.connect(deployer2).mint(poolAccount, mintAmount)
    await tr.wait()
  }

  return { testERC20CContract, deployer2, mintAmount }
}

describe('PoolFactory', () => {
  describe('Creating pools', () => {
    it('Should create pool with 100 participants', async () => {
      const participantsCount = 100
      const { poolResponse, tokenAmount, participantResponse } = await loadFixture<ICreatePool>(
        createPool.bind(this, participantsCount),
      )
      expect(poolResponse.tokenAmount).to.equal(tokenAmount)
      expect(participantResponse.length).to.equal(participantSize)
      expect(poolResponse.status).to.equal(0)
    })

    it('Should create pool with 10 participants', async () => {
      const participantsCount = 10
      const { poolResponse, tokenAmount, participantResponse } = await loadFixture<ICreatePool>(
        createPool.bind(this, participantsCount),
      )
      expect(poolResponse.tokenAmount).to.equal(tokenAmount)
      expect(participantResponse.length).to.equal(participantsCount)
      expect(poolResponse.status).to.equal(0)
    })

    it('Should create pool with 5 participants', async () => {
      const participantsCount = 5
      const { poolResponse, tokenAmount, participantResponse } = await loadFixture<ICreatePool>(
        createPool.bind(this, participantsCount),
      )
      expect(poolResponse.tokenAmount).to.equal(tokenAmount)
      expect(participantResponse.length).to.equal(participantsCount)
      expect(poolResponse.status).to.equal(0)
    })

    it('Should create pool with 3 participants', async () => {
      const participantsCount = 3
      const { poolResponse, tokenAmount, participantResponse } = await loadFixture<ICreatePool>(
        createPool.bind(this, participantsCount),
      )
      expect(poolResponse.tokenAmount).to.equal(tokenAmount)
      expect(participantResponse.length).to.equal(participantsCount)
      expect(poolResponse.status).to.equal(0)
    })

    it('Should revert if 0 participants', async () => {
      const participantsCount = 0
      const { poolFactoryContract, deployer1 } = await loadFixture<IDeployPoolFactory>(
        deployPoolFactory,
      )
      const { name, tokenName, participants, tokenAddress } = await poolData(
        undefined,
        participantsCount,
      )

      const creatingReq = poolFactoryContract
        .connect(deployer1)
        .createPoolContract(name, tokenAddress, tokenName, participants)

      await expect(creatingReq).to.revertedWith('Must have at least 1 participant')
    })
  })
})

describe('PoolTemplate', () => {
  describe('Getting pools', () => {
    it('Should return pool participants with pagination', async () => {
      const participantsCount = 100
      const first25 = 25
      const first99 = 99

      const size50 = 50
      const { poolTemplateContract, participants } = await loadFixture<ICreatePoolTemplateContract>(
        createPoolTemplateContract.bind(this, participantsCount),
      )

      const response0_25: IParticipantResponse[] = await poolTemplateContract.getParticipants(
        participantFirst,
        participantSize,
      )
      const response25_25: IParticipantResponse[] = await poolTemplateContract.getParticipants(
        first25,
        participantSize,
      )
      const response99_50: IParticipantResponse[] = await poolTemplateContract.getParticipants(
        first99,
        size50,
      )

      // 0-25
      participants
        .slice(participantFirst, participantFirst + participantSize)
        .forEach((p: IParticipant, i: number) => {
          expect(p.account.toLowerCase()).to.equal(response0_25[i]?.account.toLowerCase())
        })
      expect(response0_25.length).to.equal(participantSize)

      // 25-25
      participants
        .slice(first25, first25 + participantSize)
        .forEach((p: IParticipant, i: number) => {
          expect(p.account.toLowerCase()).to.equal(response25_25[i]?.account.toLowerCase())
        })
      expect(response25_25.length).to.equal(participantSize)

      // 99-25
      participants.slice(first99, first99 + size50).forEach((p: IParticipant, i: number) => {
        expect(p.account.toLowerCase()).to.equal(response99_50[i]?.account.toLowerCase())
      })
      expect(response99_50.length).to.equal(1)
    })

    it('Should revert if is not participant', async () => {
      const { poolFactoryContract, deployer1, user5 } = await loadFixture<IDeployPoolFactory>(
        deployPoolFactory,
      )
      const { name, tokenName, participants, tokenAddress } = await poolData()

      await poolFactoryContract
        .connect(deployer1)
        .createPoolContract(name, tokenAddress, tokenName, participants)

      const poolAccounts: string[] = await poolFactoryContract.getContractAddressesByParticipant(
        participants[0].account,
      )

      const poolTemplateContract: PoolTemplate = await ethers.getContractAt(
        'PoolTemplate',
        poolAccounts[0],
      )
      const poolReq = poolTemplateContract.connect(user5 as SignerWithAddress).getPoolData()

      await expect(poolReq).to.revertedWith('Only for participant')
    })

    it('Should revert if start pagination index was wrong', async () => {
      const participantsCount = 10

      const { poolTemplateContract } = await loadFixture<ICreatePoolTemplateContract>(
        createPoolTemplateContract.bind(this, participantsCount),
      )

      const pReq = poolTemplateContract.getParticipants(11, participantSize)

      await expect(pReq).to.revertedWith('Start index greater than count of participants')
    })
  })

  describe('Tokens distribution', () => {
    it('Should receive tokens', async () => {
      const mintAmount = 100_000
      const participantsCount = 5

      const { poolTemplateContract, deployer1 } = await loadFixture<ICreatePoolTemplateContract>(
        createPoolTemplateContract.bind(this, participantsCount),
      )

      const { testERC20CContract } = await loadFixture<ICreateTestERC20Contract>(
        createTestERC20.bind(this, poolTemplateContract.address, mintAmount),
      )

      await poolTemplateContract.connect(deployer1).setTokenAddress(testERC20CContract.address)

      expect(await poolTemplateContract.tokenBalance()).to.equal(mintAmount)
    })

    it('Should distribute tokens', async () => {
      const mintAmount = 25_000
      const participantsCount = 5

      const { poolTemplateContract, deployer1, tokenAmount, participants } =
        await loadFixture<ICreatePoolTemplateContract>(
          createPoolTemplateContract.bind(this, participantsCount),
        )

      const { testERC20CContract } = await loadFixture<ICreateTestERC20Contract>(
        createTestERC20.bind(this, poolTemplateContract.address, mintAmount),
      )

      await poolTemplateContract.connect(deployer1).setTokenAddress(testERC20CContract.address)

      const res: IParticipantResponse[] = await poolTemplateContract.getParticipants(
        participantFirst,
        participantSize,
      )

      participants.forEach((p, i) => {
        const accrued = Math.floor((mintAmount * p.share) / tokenAmount)
        const cP: IParticipantResponse = res[i]
        expect(cP.accrued).to.equal(accrued)
      })
    })

    it('Should claim tokens', async () => {
      const mintAmount = 25_000
      const participantsCount = 5
      let minted = 0

      const { poolTemplateContract, deployer1, tokenAmount, participants } =
        await loadFixture<ICreatePoolTemplateContract>(
          createPoolTemplateContract.bind(this, participantsCount),
        )
      const { testERC20CContract, deployer2 } = await loadFixture<ICreateTestERC20Contract>(
        createTestERC20.bind(this, poolTemplateContract.address, mintAmount),
      )
      minted += mintAmount
      await poolTemplateContract.connect(deployer1).setTokenAddress(testERC20CContract.address)

      const participant = participants.find(
        ({ account }) => account.toLowerCase() === deployer1.address.toLowerCase(),
      )

      await poolTemplateContract.connect(deployer1).claimTokens()
      const accrued1 = Math.floor((minted * participant.share) / tokenAmount)
      expect(await testERC20CContract.balanceOf(deployer1.address)).to.equal(accrued1)

      await testERC20CContract.connect(deployer2).mint(poolTemplateContract.address, mintAmount)
      minted += mintAmount

      await poolTemplateContract.connect(deployer1).claimTokens()
      const accrued2 = Math.floor((minted * participant.share) / tokenAmount)
      expect(await testERC20CContract.balanceOf(deployer1.address)).to.equal(accrued2)
    })

    it('Should add token address', async () => {
      const mintAmount = 25_000
      const participantsCount = 5

      const { poolTemplateContract, deployer1 } = await loadFixture<ICreatePoolTemplateContract>(
        createPoolTemplateContract.bind(this, participantsCount),
      )

      const { testERC20CContract } = await loadFixture<ICreateTestERC20Contract>(
        createTestERC20.bind(this, poolTemplateContract.address, mintAmount),
      )

      await poolTemplateContract.connect(deployer1).setTokenAddress(testERC20CContract.address)
      const pool: IPoolResponse = await poolTemplateContract.getPoolData()

      expect(pool.tokenAddress).to.equal(testERC20CContract.address)
    })
  })
})
