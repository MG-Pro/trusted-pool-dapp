import { IParticipant, IParticipantResponse, IPoolResponse } from '@app/types'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { expect } from 'chai'

import {
  createPool,
  createPoolTemplateContract,
  createTestERC20,
  deployPoolFactory,
  deployUSDT,
  participantFirst,
  participantSize,
  poolData,
  valueFee,
} from './test.helpers'
import {
  ICreatePool,
  ICreatePoolTemplateContract,
  ICreateTestERC20Contract,
  IDeployPoolFactory,
  IDeployUSDT,
} from './test.types'

describe('PoolFactory', () => {
  describe('Creating pools', () => {
    it('Should create pool with 100 participants', async () => {
      const participantsCount = 100
      const { poolResponse, tokenAmount, participantResponse } = await loadFixture<ICreatePool>(
        createPool.bind(this, participantsCount),
      )
      expect(poolResponse.tokenAmount).to.equal(tokenAmount)
      expect(participantResponse.length).to.equal(participantSize)
    })

    it('Should create pool with 10 participants', async () => {
      const participantsCount = 10
      const { poolResponse, tokenAmount, participantResponse } = await loadFixture<ICreatePool>(
        createPool.bind(this, participantsCount),
      )
      expect(poolResponse.tokenAmount).to.equal(tokenAmount)
      expect(participantResponse.length).to.equal(participantsCount)
    })

    it('Should create pool with 3 participants', async () => {
      const participantsCount = 3
      const { poolResponse, tokenAmount, participantResponse } = await loadFixture<ICreatePool>(
        createPool.bind(this, participantsCount),
      )
      expect(poolResponse.tokenAmount).to.equal(tokenAmount)
      expect(participantResponse.length).to.equal(participantsCount)
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

  describe('Creating pools with platform fee', () => {
    it('Should revert if do not send fee', async () => {
      const participantsCount = 3
      const { poolFactoryContract, deployer1 } = await loadFixture<IDeployPoolFactory>(
        deployPoolFactory,
      )
      const { USDTContract } = await loadFixture<IDeployUSDT>(deployUSDT)
      await poolFactoryContract.connect(deployer1).setStableContract(USDTContract.address)
      await poolFactoryContract.connect(deployer1).setFeeValue(valueFee)

      const { name, tokenName, participants, tokenAddress } = await poolData(
        undefined,
        participantsCount,
      )

      const trReq = poolFactoryContract
        .connect(deployer1)
        .createPoolContract(name, tokenAddress, tokenName, participants)

      await expect(trReq).to.revertedWith('Not enough fee value')
    })

    it('Should revert if not approved fee value', async () => {
      const participantsCount = 3
      const { poolFactoryContract, deployer1 } = await loadFixture<IDeployPoolFactory>(
        deployPoolFactory,
      )
      const { USDTContract, deployer3 } = await loadFixture<IDeployUSDT>(deployUSDT)

      await USDTContract.connect(deployer3).transfer(deployer1.address, 100)
      await poolFactoryContract.connect(deployer1).setStableContract(USDTContract.address)
      await poolFactoryContract.connect(deployer1).setFeeValue(valueFee)

      const { name, tokenName, participants, tokenAddress } = await poolData(
        undefined,
        participantsCount,
      )

      const trReq = poolFactoryContract
        .connect(deployer1)
        .createPoolContract(name, tokenAddress, tokenName, participants)

      await expect(trReq).to.revertedWith('Not allowed amount to spend')
    })

    it('Should create pool with fee', async () => {
      const participantsCount = 3
      const { poolFactoryContract, deployer1 } = await loadFixture<IDeployPoolFactory>(
        deployPoolFactory,
      )
      const { USDTContract, deployer3 } = await loadFixture<IDeployUSDT>(deployUSDT)

      await USDTContract.connect(deployer3).transfer(deployer1.address, 100)
      await USDTContract.connect(deployer1).approve(poolFactoryContract.address, 1000)
      await poolFactoryContract.connect(deployer1).setStableContract(USDTContract.address)
      await poolFactoryContract.connect(deployer1).setFeeValue(valueFee)

      const { name, tokenName, participants, tokenAddress } = await poolData(
        undefined,
        participantsCount,
      )

      await poolFactoryContract
        .connect(deployer1)
        .createPoolContract(name, tokenAddress, tokenName, participants)

      expect(await USDTContract.balanceOf(poolFactoryContract.address)).to.equal(valueFee)
    })

    it('Should withdraw fee to owner', async () => {
      const participantsCount = 3
      const { poolFactoryContract, deployer1, user5 } = await loadFixture<IDeployPoolFactory>(
        deployPoolFactory,
      )
      const { USDTContract, deployer3 } = await loadFixture<IDeployUSDT>(deployUSDT)

      await USDTContract.connect(deployer3).transfer(user5.address, 100)
      await USDTContract.connect(user5).approve(poolFactoryContract.address, 1000)
      await poolFactoryContract.connect(deployer1).setStableContract(USDTContract.address)
      await poolFactoryContract.connect(deployer1).setFeeValue(valueFee)

      const { name, tokenName, participants, tokenAddress } = await poolData(
        undefined,
        participantsCount,
      )

      await poolFactoryContract
        .connect(user5)
        .createPoolContract(name, tokenAddress, tokenName, participants)

      await poolFactoryContract.connect(deployer1).withdraw()

      expect(await USDTContract.balanceOf(deployer1.address)).to.equal(valueFee)
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
      const participantsCount = 5
      const { poolTemplateContract, notUser } = await loadFixture<ICreatePoolTemplateContract>(
        createPoolTemplateContract.bind(this, participantsCount),
      )

      const poolReq = poolTemplateContract.connect(notUser).getPoolData()
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
      expect((await poolTemplateContract.getPoolData()).filledAmount).to.equal(mintAmount)
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
      expect((await poolTemplateContract.getPoolData()).filledAmount).to.equal(minted)

      await testERC20CContract.connect(deployer2).mint(poolTemplateContract.address, mintAmount)
      minted += mintAmount

      await poolTemplateContract.connect(deployer1).claimTokens()
      const accrued2 = Math.floor((minted * participant.share) / tokenAmount)
      expect(await testERC20CContract.balanceOf(deployer1.address)).to.equal(accrued2)
      expect((await poolTemplateContract.getPoolData()).filledAmount).to.equal(minted)
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
