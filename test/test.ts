import { PooledTemplate, TestERC20, TrustedPool } from '@app/contracts/typechain-types'
import { IParticipant, IParticipantResponse, IPool, IPoolResponse } from '@app/types'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'

const totalSupply = 1_000_000
const participantFirst = 0
const participantSize = 25

async function deploy(): Promise<Record<string, any>> {
  const [deployer1, deployer2, user1, user2, user3, user4, user5] = await ethers.getSigners()

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

async function createPooledTemplateContract(
  participantsCount: number,
): Promise<Record<string, any>> {
  const { trustedPoolContract, deployer1 } = await deploy()
  const { name, tokenName, participants, tokenAddress, tokenAmount } = await poolData(
    undefined,
    participantsCount,
  )

  await (trustedPoolContract as TrustedPool)
    .connect(deployer1)
    .createPooledContract(name, tokenAddress, tokenName, participants)

  const poolAccounts: string[] = await trustedPoolContract.getContractAddressesByParticipant(
    participants[0].account,
  )

  const pooledTemplateContract: PooledTemplate = await ethers.getContractAt(
    'PooledTemplate',
    poolAccounts[0],
  )

  return { pooledTemplateContract, tokenAmount, participants }
}

async function createPool(participantsCount: number): Promise<Record<string, any>> {
  const { pooledTemplateContract, tokenAmount } = await createPooledTemplateContract(
    participantsCount,
  )

  const poolResponse: IPoolResponse = await pooledTemplateContract.getPoolData(
    participantFirst,
    participantSize,
  )
  return { poolResponse, tokenAmount }
}

describe('TrustedPool', () => {
  describe('Creating pools', () => {
    it('Should create pool with 100 participants', async () => {
      const participantsCount = 100
      const { poolResponse, tokenAmount } = await loadFixture<Record<string, any>>(
        createPool.bind(this, participantsCount),
      )
      expect(poolResponse.tokenAmount).to.equal(tokenAmount)
      expect(poolResponse.participants.length).to.equal(participantSize)
      expect(poolResponse.status).to.equal(0)
    })

    it('Should create pool with 10 participants', async () => {
      const participantsCount = 10
      const { poolResponse, tokenAmount } = await loadFixture<Record<string, any>>(
        createPool.bind(this, participantsCount),
      )
      expect(poolResponse.tokenAmount).to.equal(tokenAmount)
      expect(poolResponse.participants.length).to.equal(participantsCount)
      expect(poolResponse.status).to.equal(0)
    })

    it('Should create pool with 5 participants', async () => {
      const participantsCount = 5
      const { poolResponse, tokenAmount } = await loadFixture<Record<string, any>>(
        createPool.bind(this, participantsCount),
      )
      expect(poolResponse.tokenAmount).to.equal(tokenAmount)
      expect(poolResponse.participants.length).to.equal(participantsCount)
      expect(poolResponse.status).to.equal(0)
    })

    it('Should create pool with 3 participants', async () => {
      const participantsCount = 3
      const { poolResponse, tokenAmount } = await loadFixture<Record<string, any>>(
        createPool.bind(this, participantsCount),
      )
      expect(poolResponse.tokenAmount).to.equal(tokenAmount)
      expect(poolResponse.participants.length).to.equal(participantsCount)
      expect(poolResponse.status).to.equal(0)
    })

    it('Should revert if 0 participants', async () => {
      const participantsCount = 0
      const { trustedPoolContract, deployer1 } = await loadFixture(deploy)
      const { name, tokenName, participants, tokenAddress } = await poolData(
        undefined,
        participantsCount,
      )

      const creatingReq = (trustedPoolContract as TrustedPool)
        .connect(deployer1)
        .createPooledContract(name, tokenAddress, tokenName, participants)

      await expect(creatingReq).to.revertedWith('Must have at least 1 participant')
    })
  })
})

describe('PooledTemplate', () => {
  describe('Getting pools', () => {
    it('Should return pool participants with pagination', async () => {
      const participantsCount = 100
      const first25 = 25
      const first99 = 99

      const size50 = 50
      const { pooledTemplateContract, participants } = await loadFixture<Record<string, any>>(
        createPooledTemplateContract.bind(this, participantsCount),
      )

      const poolResponse0_25: IPoolResponse = await pooledTemplateContract.getPoolData(
        participantFirst,
        participantSize,
      )
      const poolResponse25_25: IPoolResponse = await pooledTemplateContract.getPoolData(
        first25,
        participantSize,
      )
      const poolResponse99_50: IPoolResponse = await pooledTemplateContract.getPoolData(
        first99,
        size50,
      )

      // 0-25
      participants
        .slice(participantFirst, participantFirst + participantSize)
        .forEach((p: IParticipant, i: number) => {
          expect(p.account.toLowerCase()).to.equal(
            poolResponse0_25.participants[i]?.account.toLowerCase(),
          )
        })
      expect(poolResponse0_25.participants.length).to.equal(participantSize)

      // 25-25
      participants
        .slice(first25, first25 + participantSize)
        .forEach((p: IParticipant, i: number) => {
          expect(p.account.toLowerCase()).to.equal(
            poolResponse25_25.participants[i]?.account.toLowerCase(),
          )
        })
      expect(poolResponse25_25.participants.length).to.equal(participantSize)

      // 99-25
      participants.slice(first99, first99 + size50).forEach((p: IParticipant, i: number) => {
        expect(p.account.toLowerCase()).to.equal(
          poolResponse99_50.participants[i]?.account.toLowerCase(),
        )
      })
      expect(poolResponse99_50.participants.length).to.equal(1)
    })

    it('Should revert if is not participant', async () => {
      const { trustedPoolContract, deployer1, user5 } = await loadFixture(deploy)
      const { name, tokenName, participants, tokenAddress } = await poolData()

      await (trustedPoolContract as TrustedPool)
        .connect(deployer1)
        .createPooledContract(name, tokenAddress, tokenName, participants)

      const poolAccounts: string[] = await trustedPoolContract.getContractAddressesByParticipant(
        participants[0].account,
      )

      const pooledTemplateContract: PooledTemplate = await ethers.getContractAt(
        'PooledTemplate',
        poolAccounts[0],
      )
      const poolReq = pooledTemplateContract
        .connect(user5)
        .getPoolData(participantFirst, participantSize)

      await expect(poolReq).to.revertedWith('Only for participant')
    })

    it('Should revert if start pagination index was wrong', async () => {
      const participantsCount = 10

      const { pooledTemplateContract } = await loadFixture<Record<string, any>>(
        createPooledTemplateContract.bind(this, participantsCount),
      )

      const poolReq: IPoolResponse = pooledTemplateContract.getPoolData(11, participantSize)

      await expect(poolReq).to.revertedWith('Start index greater than count of participants')
    })
  })

  describe('Tokens distribution', () => {
    it('Should receive tokens', async () => {
      const mintAmount = 70_000
      const { trustedPoolContract, testERC20CContract, deployer2, deployer1 } = await loadFixture(
        deploy,
      )

      const { name, tokenName, participants, tokenAddress } = await poolData(
        testERC20CContract.address,
      )

      await (trustedPoolContract as TrustedPool)
        .connect(deployer1)
        .createPooledContract(name, tokenAddress, tokenName, participants)

      const poolAccounts: string[] = await trustedPoolContract.getContractAddressesByParticipant(
        participants[0].account,
      )
      await (testERC20CContract as TestERC20).connect(deployer2).mint(poolAccounts[0], mintAmount)
      const pooledTemplateContract: PooledTemplate = await ethers.getContractAt(
        'PooledTemplate',
        poolAccounts[0],
      )

      expect(await pooledTemplateContract.tokenBalance()).to.equal(mintAmount)
    })

    it('Should distribute tokens', async () => {
      const mintAmount = 25_000
      const { trustedPoolContract, testERC20CContract, deployer2, deployer1 } = await loadFixture(
        deploy,
      )

      const { name, tokenName, participants, tokenAddress, tokenAmount } = await poolData(
        testERC20CContract.address,
      )

      await (trustedPoolContract as TrustedPool)
        .connect(deployer1)
        .createPooledContract(name, tokenAddress, tokenName, participants)

      const poolAccounts: string[] = await trustedPoolContract.getContractAddressesByParticipant(
        participants[0].account,
      )

      await (testERC20CContract as TestERC20).connect(deployer2).mint(poolAccounts[0], mintAmount)

      const pooledTemplateContract: PooledTemplate = await ethers.getContractAt(
        'PooledTemplate',
        poolAccounts[0],
      )

      const pool: IPoolResponse = await pooledTemplateContract.getPoolData(
        participantFirst,
        participantSize,
      )

      participants.forEach((p, i) => {
        const accrued = Math.floor((mintAmount * p.share) / tokenAmount)
        const cP: IParticipantResponse = pool.participants[i]
        expect(cP.accrued).to.equal(accrued)
      })
    })

    it('Should add token address', async () => {
      const mintAmount = 25_000
      const { trustedPoolContract, testERC20CContract, deployer2, deployer1 } = await loadFixture(
        deploy,
      )

      const { name, tokenName, participants, tokenAddress } = await poolData()

      await (trustedPoolContract as TrustedPool)
        .connect(deployer1)
        .createPooledContract(name, tokenAddress, tokenName, participants)

      const poolAccounts: string[] = await trustedPoolContract.getContractAddressesByParticipant(
        participants[0].account,
      )

      await (testERC20CContract as TestERC20).connect(deployer2).mint(poolAccounts[0], mintAmount)

      const pooledTemplateContract: PooledTemplate = await ethers.getContractAt(
        'PooledTemplate',
        poolAccounts[0],
      )

      await pooledTemplateContract.setTokenAddress(testERC20CContract.address)
      const pool: IPoolResponse = await pooledTemplateContract.getPoolData(
        participantFirst,
        participantSize,
      )

      expect(pool.tokenAddress).to.equal(testERC20CContract.address)
    })
  })
})
