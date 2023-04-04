import type { PoolFactory, PoolTemplate } from '@app/typechain'
import type { IParticipantResponse, IPoolResponse } from '@app/types'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/src/signers'
import { expect } from 'chai'
import type { ContractTransaction } from 'ethers'
import { ethers } from 'hardhat'

import { Helpers } from '../src/app/helpers'

import {
  createPoolAndReqData,
  createPoolContract,
  createAndMintTestERC20,
  deployPoolFactory,
  deployUSDT,
  participantFirst,
  participantSize,
  preparePoolData,
  valueFee,
  approverValueFee,
  upgradePoolFactory,
  noAddressZeroInArray,
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
    it('Should create pool with 10 participants', async () => {
      const participantsCount = 10
      const { poolResponse, tokenAmount, participantResponse, poolTemplateContract } =
        await loadFixture<ICreatePool>(createPoolAndReqData.bind(this, participantsCount))

      expect(await poolTemplateContract.finalized()).to.equal(true)
      expect(poolResponse.tokenAmount).to.equal(tokenAmount)
      expect(poolResponse.approved).to.equal(true)
      expect(poolResponse.privatable).to.equal(false)
      expect(participantResponse.length).to.equal(participantsCount)
    })

    it('Should emit creating pool event', async () => {
      const participantsCount = 10
      const { poolFactoryContract, poolFactoryDeployer } = await loadFixture<IDeployPoolFactory>(
        deployPoolFactory,
      )
      const { name, tokenName, participants, shares, tokenAddress, approverAddress, privatable } =
        await preparePoolData(undefined, participantsCount)

      const creatingReq = poolFactoryContract.connect(poolFactoryDeployer).createPoolContract(
        {
          name,
          tokenAddress,
          tokenName,
          approver: approverAddress,
          privatable,
          finalized: true,
          stableApproverFee: 0,
        },
        participants,
        shares,
      )

      await expect(creatingReq).to.emit(poolFactoryContract, 'PoolCreated')
    })

    it('Should revert if 0 participants', async () => {
      const participantsCount = 0
      const { poolFactoryContract, poolFactoryDeployer } = await loadFixture<IDeployPoolFactory>(
        deployPoolFactory,
      )
      const { name, tokenName, participants, shares, tokenAddress, approverAddress, privatable } =
        await preparePoolData(undefined, participantsCount)

      const creatingReq = poolFactoryContract.connect(poolFactoryDeployer).createPoolContract(
        {
          name,
          tokenAddress,
          tokenName,
          approver: approverAddress,
          privatable,
          finalized: true,
          stableApproverFee: 0,
        },
        participants,
        shares,
      )

      await expect(creatingReq).to.revertedWithCustomError(
        poolFactoryContract,
        'WrongParticipantCount',
      )
    })

    it('Should revert if count of participants per ts exceeded', async () => {
      const participantsCount = 451
      const { poolFactoryContract, poolFactoryDeployer } = await loadFixture<IDeployPoolFactory>(
        deployPoolFactory,
      )
      const { name, tokenName, participants, shares, tokenAddress, approverAddress, privatable } =
        await preparePoolData(undefined, participantsCount)

      const creatingReq = poolFactoryContract.connect(poolFactoryDeployer).createPoolContract(
        {
          name,
          tokenAddress,
          tokenName,
          approver: approverAddress,
          privatable,
          finalized: true,
          stableApproverFee: 0,
        },
        participants,
        shares,
      )

      await expect(creatingReq).to.revertedWithCustomError(
        poolFactoryContract,
        'WrongParticipantCount',
      )
    })

    it('Should revert if participants not uniq', async () => {
      const participantsCount = 50
      const { poolFactoryContract, poolFactoryDeployer } = await loadFixture<IDeployPoolFactory>(
        deployPoolFactory,
      )
      const { poolTemplateContract } = await createPoolContract(3)
      const { name, tokenName, participants, shares, tokenAddress, approverAddress, privatable } =
        await preparePoolData(undefined, participantsCount)

      const poolData2 = await preparePoolData(undefined, participantsCount)

      const creatingReq = poolFactoryContract.connect(poolFactoryDeployer).createPoolContract(
        {
          name,
          tokenAddress,
          tokenName,
          approver: approverAddress,
          privatable,
          finalized: true,
          stableApproverFee: 0,
        },
        [...participants, ...poolData2.participants],
        [...shares, ...poolData2.shares],
      )

      await expect(creatingReq).to.revertedWithCustomError(poolTemplateContract, 'NotUniq')
    })
  })

  describe('Creating pool with separated participants', () => {
    it('Should create pool with separated participants', async () => {
      const participantsCount1 = 10
      const participantsCount2 = 10
      const fullCount = participantsCount1 + participantsCount2

      const { poolFactoryContract, creator2, participant1 } = await loadFixture<IDeployPoolFactory>(
        deployPoolFactory,
      )
      const pData1 = await preparePoolData(undefined, fullCount)

      const pChunks: string[][] = Helpers.splitParticipants(pData1.participants, participantsCount1)
      const sChunks: number[][] = Helpers.splitParticipants(pData1.shares, participantsCount1)

      await poolFactoryContract.connect(creator2).createPoolContract(
        {
          name: pData1.name,
          tokenAddress: pData1.tokenAddress,
          tokenName: pData1.tokenName,
          approver: pData1.approverAddress,
          privatable: pData1.privatable,
          finalized: false,
          stableApproverFee: 0,
        },
        pChunks[0],
        sChunks[0],
      )

      await poolFactoryContract.connect(creator2).addParticipants(pChunks[1], sChunks[1])
      const poolAccounts: string[] = await poolFactoryContract
        .connect(creator2)
        .findPoolsByParticipant(pData1.participants[7], 0, 100)

      const poolTemplateContract: PoolTemplate = await ethers.getContractAt(
        'PoolTemplate',
        poolAccounts[0],
      )

      const poolResponse: IPoolResponse = await poolTemplateContract
        .connect(participant1)
        .getPoolData()

      expect(poolResponse.participantsCount).to.equal(fullCount)
      expect(await poolTemplateContract.connect(participant1).finalized()).to.equal(false)
      await poolFactoryContract.connect(creator2).finalize()
      expect(await poolTemplateContract.connect(participant1).finalized()).to.equal(true)
    })

    it('Should revert if pool already finalized', async () => {
      const participantsCount = 10
      const { poolTemplateContract, poolFactoryContract, creatorAndParticipant1 } =
        await loadFixture<ICreatePoolTemplateContract>(
          createPoolContract.bind(this, participantsCount),
        )

      expect(await poolTemplateContract.finalized()).to.equal(true)

      const { participants, shares } = await preparePoolData(undefined, participantsCount)

      const req1 = poolFactoryContract
        .connect(creatorAndParticipant1)
        .addParticipants(participants, shares)
      await expect(req1).to.revertedWithCustomError(
        poolFactoryContract,
        'NoFinalizingPoolForSender',
      )
    })

    it('Should revert if creator already have finalizing pool', async () => {
      const participantsCount1 = 10
      const participantsCount2 = 10
      const fullCount = participantsCount1 + participantsCount2

      const participantsCount3 = 10
      const { poolFactoryContract, creator2 } = await loadFixture<IDeployPoolFactory>(
        deployPoolFactory,
      )
      const pData1 = await preparePoolData(undefined, fullCount)
      const [ps1, ps2]: string[][] = Helpers.splitParticipants(
        pData1.participants,
        participantsCount1,
      )

      const [ss1, ss2]: number[][] = Helpers.splitParticipants(pData1.shares, participantsCount1)

      await poolFactoryContract.connect(creator2).createPoolContract(
        {
          name: pData1.name,
          tokenAddress: pData1.tokenAddress,
          tokenName: pData1.tokenName,
          approver: pData1.approverAddress,
          privatable: pData1.privatable,
          finalized: false,
          stableApproverFee: 0,
        },
        ps1,
        ss1,
      )
      await poolFactoryContract.connect(creator2).addParticipants(ps2, ss2)

      const pData2 = await preparePoolData(undefined, participantsCount3)
      const req = poolFactoryContract.connect(creator2).createPoolContract(
        {
          name: pData2.name,
          tokenAddress: pData2.tokenAddress,
          tokenName: pData2.tokenName,
          approver: pData2.approverAddress,
          privatable: pData2.privatable,
          finalized: false,
          stableApproverFee: 0,
        },
        pData2.participants,
        pData2.shares,
      )

      await expect(req).to.revertedWithCustomError(poolFactoryContract, 'CreatorHaveFinalizingPool')
    })

    it('Should revert if finalization ts was not made by creator', async () => {
      const participantsCount1 = 10
      const participantsCount2 = 5
      const fullCount = participantsCount1 + participantsCount2
      const { poolFactoryContract, creator2, stranger1 } = await loadFixture<IDeployPoolFactory>(
        deployPoolFactory,
      )
      const pData1 = await preparePoolData(undefined, fullCount)

      const [ps1, ps2]: string[][] = Helpers.splitParticipants(
        pData1.participants,
        participantsCount2,
      )

      const [ss1, ss2]: number[][] = Helpers.splitParticipants(pData1.shares, participantsCount2)
      await poolFactoryContract.connect(creator2).createPoolContract(
        {
          name: pData1.name,
          tokenAddress: pData1.tokenAddress,
          tokenName: pData1.tokenName,
          approver: pData1.approverAddress,
          privatable: pData1.privatable,
          finalized: false,
          stableApproverFee: 0,
        },
        ps1,
        ss1,
      )
      const req = poolFactoryContract.connect(stranger1).addParticipants(ps2, ss2)
      const req2 = poolFactoryContract.connect(stranger1).finalize()

      await expect(req).to.revertedWithCustomError(poolFactoryContract, 'NoFinalizingPoolForSender')
      await expect(req2).to.revertedWithCustomError(
        poolFactoryContract,
        'NoFinalizingPoolForSender',
      )
    })

    it('Should revert if separated participants not uniq', async () => {
      const participantsCount1 = 10
      const participantsCount2 = 5
      const fullCount = participantsCount1 + participantsCount2
      const { poolFactoryContract, creator2 } = await loadFixture<IDeployPoolFactory>(
        deployPoolFactory,
      )
      const pData1 = await preparePoolData(undefined, fullCount)
      const pData2 = await preparePoolData(undefined, fullCount)

      await poolFactoryContract.connect(creator2).createPoolContract(
        {
          name: pData1.name,
          tokenAddress: pData1.tokenAddress,
          tokenName: pData1.tokenName,
          approver: pData1.approverAddress,
          privatable: pData1.privatable,
          finalized: false,
          stableApproverFee: 0,
        },
        pData1.participants,
        pData1.shares,
      )
      const req = poolFactoryContract
        .connect(creator2)
        .addParticipants(pData2.participants, pData2.shares)

      const poolAccounts: string[] = await poolFactoryContract.findPoolsByParticipant(
        pData1.participants[0],
        0,
        100,
      )

      const poolTemplateContract: PoolTemplate = await ethers.getContractAt(
        'PoolTemplate',
        poolAccounts[0],
      )

      await expect(req).to.revertedWithCustomError(poolTemplateContract, 'NotUniq')
    })
  })

  describe('Creating private pools', () => {
    it('Should create private pool', async () => {
      const participantsCount = 5
      const privatable = true
      const { poolTemplateContract, creatorAndParticipant1 } =
        await loadFixture<ICreatePoolTemplateContract>(
          createPoolContract.bind(this, participantsCount, privatable),
        )

      const participantsReq = poolTemplateContract
        .connect(creatorAndParticipant1)
        .getParticipants(participantFirst, participantSize)
      await expect(participantsReq).to.revertedWithCustomError(
        poolTemplateContract,
        'OnlyForPublicPool',
      )

      const pool: IPoolResponse = await poolTemplateContract
        .connect(creatorAndParticipant1)
        .getPoolData()
      expect(pool.privatable).to.equal(true)
    })
  })

  describe('Creating pools with platform fee', () => {
    it('Should revert if do not send fee', async () => {
      const participantsCount = 3
      const { poolFactoryContract, poolFactoryDeployer } = await loadFixture<IDeployPoolFactory>(
        deployPoolFactory,
      )
      const { USDTContract } = await loadFixture<IDeployUSDT>(deployUSDT)
      await poolFactoryContract.connect(poolFactoryDeployer).setStableContract(USDTContract.address)
      await poolFactoryContract.connect(poolFactoryDeployer).setFeeValue(valueFee)

      const { name, tokenName, participants, shares, tokenAddress, approverAddress, privatable } =
        await preparePoolData(undefined, participantsCount)

      const trReq = poolFactoryContract.connect(poolFactoryDeployer).createPoolContract(
        {
          name,
          tokenAddress,
          tokenName,
          approver: approverAddress,
          privatable,
          finalized: true,
          stableApproverFee: 0,
        },
        participants,
        shares,
      )

      await expect(trReq).to.revertedWithCustomError(poolFactoryContract, 'InsufficientFunds')
    })

    it('Should create pool with fee', async () => {
      const participantsCount = 3
      const { poolFactoryContract, poolFactoryDeployer } = await loadFixture<IDeployPoolFactory>(
        deployPoolFactory,
      )
      const { USDTContract, USDTDeployer } = await loadFixture<IDeployUSDT>(deployUSDT)

      await USDTContract.connect(USDTDeployer).transfer(poolFactoryDeployer.address, 100)
      await USDTContract.connect(poolFactoryDeployer).approve(poolFactoryContract.address, 1000)
      await poolFactoryContract.connect(poolFactoryDeployer).setStableContract(USDTContract.address)
      await poolFactoryContract.connect(poolFactoryDeployer).setFeeValue(valueFee)

      const { name, tokenName, participants, shares, tokenAddress, approverAddress, privatable } =
        await preparePoolData(undefined, participantsCount)

      await poolFactoryContract.connect(poolFactoryDeployer).createPoolContract(
        {
          name,
          tokenAddress,
          tokenName,
          approver: approverAddress,
          privatable,
          finalized: true,
          stableApproverFee: 0,
        },
        participants,
        shares,
      )

      expect(await USDTContract.balanceOf(poolFactoryContract.address)).to.equal(valueFee)
    })

    it('Should withdraw fee to owner', async () => {
      const participantsCount = 3
      const { poolFactoryContract, poolFactoryDeployer, participant1 } =
        await loadFixture<IDeployPoolFactory>(deployPoolFactory)
      const { USDTContract, USDTDeployer } = await loadFixture<IDeployUSDT>(deployUSDT)

      await USDTContract.connect(USDTDeployer).transfer(participant1.address, 100)
      await USDTContract.connect(participant1).approve(poolFactoryContract.address, 1000)
      await poolFactoryContract.connect(poolFactoryDeployer).setStableContract(USDTContract.address)
      await poolFactoryContract.connect(poolFactoryDeployer).setFeeValue(valueFee)

      const { name, tokenName, participants, shares, tokenAddress, approverAddress, privatable } =
        await preparePoolData(undefined, participantsCount)

      await poolFactoryContract.connect(participant1).createPoolContract(
        {
          name,
          tokenAddress,
          tokenName,
          approver: approverAddress,
          privatable,
          finalized: true,
          stableApproverFee: 0,
        },
        participants,
        shares,
      )

      await poolFactoryContract.connect(poolFactoryDeployer).withdraw()

      expect(await USDTContract.balanceOf(poolFactoryDeployer.address)).to.equal(valueFee)
    })
  })

  describe('Creating approvable pools', () => {
    it('Should create approvable pool', async () => {
      const participantsCount = 5
      const privatable = false
      const approvable = true
      const { poolTemplateContract, approver1, creatorAndParticipant1 } =
        await loadFixture<ICreatePoolTemplateContract>(
          createPoolContract.bind(this, participantsCount, privatable, approvable),
        )

      const pool: IPoolResponse = await poolTemplateContract
        .connect(creatorAndParticipant1)
        .getPoolData()
      expect(pool.approver).to.equal(approver1.address)
      expect(pool.approved).to.equal(false)
    })

    it('Should approved pool and take into account approver fee', async () => {
      const participantsCount = 5
      const privatable = false
      const approvable = true

      const { USDTContract, USDTDeployer } = await loadFixture<IDeployUSDT>(deployUSDT)

      const {
        poolTemplateContract,
        poolFactoryContract,
        poolFactoryDeployer,
        approver1,
        creatorAndParticipant1,
      } = await loadFixture<ICreatePoolTemplateContract>(
        createPoolContract.bind(
          this,
          participantsCount,
          privatable,
          approvable,
          approverValueFee,
          async (pfc: PoolFactory, pfcDeployer, creator) => {
            await pfc.connect(pfcDeployer).setStableContract(USDTContract.address)
            await pfc.connect(pfcDeployer).setFeeValue(valueFee)
            await USDTContract.connect(USDTDeployer).transfer(creator.address, 100)
            await USDTContract.connect(creator).approve(pfc.address, 100)
          },
        ),
      )

      expect(
        (await poolTemplateContract.connect(creatorAndParticipant1).getPoolData()).approver,
      ).to.equal(approver1.address)

      expect(
        await USDTContract.connect(poolFactoryDeployer).balanceOf(poolFactoryContract.address),
      ).to.equal(valueFee + approverValueFee)

      await poolFactoryContract.connect(approver1).approvePool(poolTemplateContract.address)

      // second call after approve and pay to approver fee
      expect(
        await USDTContract.connect(poolFactoryDeployer).balanceOf(poolFactoryContract.address),
      ).to.equal(valueFee)

      expect(await USDTContract.connect(poolFactoryDeployer).balanceOf(approver1.address)).to.equal(
        approverValueFee,
      )

      expect(
        (await poolTemplateContract.connect(creatorAndParticipant1).getPoolData()).approved,
      ).to.equal(true)

      expect(
        await poolFactoryContract.connect(poolFactoryDeployer).getWithdrawableBalance(),
      ).to.equal(valueFee)
    })

    it('Should revert if pool already approved', async () => {
      const participantsCount = 5
      const privatable = false
      const approvable = true

      const { USDTContract, USDTDeployer } = await loadFixture<IDeployUSDT>(deployUSDT)

      const { poolTemplateContract, poolFactoryContract, approver1 } =
        await loadFixture<ICreatePoolTemplateContract>(
          createPoolContract.bind(
            this,
            participantsCount,
            privatable,
            approvable,
            approverValueFee,
            async (pfc: PoolFactory, pfcDeployer, creator) => {
              await pfc.connect(pfcDeployer).setStableContract(USDTContract.address)
              await pfc.connect(pfcDeployer).setFeeValue(valueFee)
              await USDTContract.connect(USDTDeployer).transfer(creator.address, 100)
              await USDTContract.connect(creator).approve(pfc.address, 100)
            },
          ),
        )

      await poolFactoryContract.connect(approver1).approvePool(poolTemplateContract.address)

      await expect(
        poolFactoryContract.connect(approver1).approvePool(poolTemplateContract.address),
      ).to.revertedWithCustomError(poolFactoryContract, 'AlreadyApproved')
    })
  })

  describe('Upgradeable factory', () => {
    it('Should create pool with 3 participants and upgraded', async () => {
      const participantsCount = 10
      const { poolFactoryContract, poolAccounts, creatorAndParticipant1, poolFactoryDeployer } =
        await loadFixture<ICreatePoolTemplateContract>(
          createPoolContract.bind(this, participantsCount),
        )
      const poolAccount = poolAccounts[0]

      const { upgradedContract } = await upgradePoolFactory(
        poolFactoryContract.address,
        'TestPoolFactoryV2',
      )

      const poolAccountsAfterUp = await upgradedContract
        .connect(creatorAndParticipant1)
        .findPoolsByParticipant(creatorAndParticipant1.address, 0, 100)

      const req = upgradedContract.connect(poolFactoryDeployer).getTestDataV2()

      expect(poolFactoryContract.address).to.equal(upgradedContract.address)
      expect(poolAccountsAfterUp[0]).to.equal(poolAccount)
      expect(await req).to.equal(poolFactoryDeployer.address)
    })
  })

  describe('Pools pagination', () => {
    it('Should create pools and get addresses with pagination', async () => {
      const participantsCount = 3
      const poolCount1 = 50
      const poolCount2 = 25
      const size = 5
      let first = -size

      const { poolFactoryContract, participant1, creatorAndParticipant1, creator2 } =
        await loadFixture<IDeployPoolFactory>(deployPoolFactory)
      const { name, tokenName, participants, shares, tokenAddress, approverAddress, privatable } =
        await preparePoolData(undefined, participantsCount)

      async function poolPagination(
        poolCount: number,
        creator: SignerWithAddress,
        participant: SignerWithAddress,
      ): Promise<string[]> {
        await Promise.all(
          Array(poolCount)
            .fill(null)
            .map(() => {
              return poolFactoryContract.connect(creator).createPoolContract(
                {
                  name,
                  tokenAddress,
                  tokenName,
                  approver: approverAddress,
                  privatable,
                  finalized: true,
                  stableApproverFee: 0,
                },
                participants,
                shares,
              )
            }),
        )

        const poolAccountsAcc: string[] = []
        for (const _ of Array(Math.floor(poolCount / size)).fill(null)) {
          const poolAccounts: string[] = await poolFactoryContract.findPoolsByParticipant(
            participant.address,
            (first += size),
            size,
          )
          noAddressZeroInArray(poolAccounts)
          poolAccounts.forEach((addr) => {
            expect(poolAccountsAcc.includes(addr)).to.equal(false)
          })
          expect(poolAccounts.length).to.equal(size)

          poolAccountsAcc.push(...poolAccounts)
        }

        return poolAccountsAcc
      }

      const poolAccounts1 = await poolPagination(
        poolCount1,
        creatorAndParticipant1,
        creatorAndParticipant1,
      )
      const poolAccounts2 = await poolPagination(poolCount2, creator2, participant1)

      expect(poolAccounts1.length).to.equal(poolCount1)
      expect(poolAccounts2.length).to.equal(poolCount2)
    })
  })
})

describe('PoolTemplate', () => {
  describe('Getting pools data', () => {
    it('Should return pool participants with pagination', async () => {
      const participantsCount = 100
      const first25 = 25
      const first99 = 99
      const size50 = 50

      const { poolTemplateContract, participants, creatorAndParticipant1 } =
        await loadFixture<ICreatePoolTemplateContract>(
          createPoolContract.bind(this, participantsCount),
        )

      const response0_25: IParticipantResponse[] = await poolTemplateContract
        .connect(creatorAndParticipant1)
        .getParticipants(participantFirst, participantSize)
      const response25_25: IParticipantResponse[] = await poolTemplateContract
        .connect(creatorAndParticipant1)
        .getParticipants(first25, participantSize)
      const response99_50: IParticipantResponse[] = await poolTemplateContract
        .connect(creatorAndParticipant1)
        .getParticipants(first99, size50)

      // 0-25
      participants
        .slice(participantFirst, participantFirst + participantSize)
        .forEach((p: string, i: number) => {
          expect(p.toLowerCase()).to.equal(response0_25[i]?.account.toLowerCase())
        })
      expect(response0_25.length).to.equal(participantSize)

      // 25-25
      participants.slice(first25, first25 + participantSize).forEach((p: string, i: number) => {
        expect(p.toLowerCase()).to.equal(response25_25[i]?.account.toLowerCase())
      })
      expect(response25_25.length).to.equal(participantSize)

      // 99-25
      participants.slice(first99, first99 + size50).forEach((p: string, i: number) => {
        expect(p.toLowerCase()).to.equal(response99_50[i]?.account.toLowerCase())
      })
      expect(response99_50.length).to.equal(1)
    })

    it('Should revert if is not participant', async () => {
      const participantsCount = 5
      const { poolTemplateContract, stranger1 } = await loadFixture<ICreatePoolTemplateContract>(
        createPoolContract.bind(this, participantsCount),
      )

      const poolReq = poolTemplateContract.connect(stranger1).getPoolData()
      await expect(poolReq).to.revertedWithCustomError(poolTemplateContract, 'OnlyParticipant')
    })

    it('Should revert if start pagination index was wrong', async () => {
      const participantsCount = 10

      const { poolTemplateContract, creatorAndParticipant1 } =
        await loadFixture<ICreatePoolTemplateContract>(
          createPoolContract.bind(this, participantsCount),
        )

      const pReq = poolTemplateContract
        .connect(creatorAndParticipant1)
        .getParticipants(11, participantSize)
      await expect(pReq).to.revertedWithCustomError(
        poolTemplateContract,
        'StartIndexGreaterThanItemsCount',
      )
    })

    it('Should revert if participant does not exist', async () => {
      const participantsCount = 5
      const privatable = true
      const { poolTemplateContract, stranger1 } = await loadFixture<ICreatePoolTemplateContract>(
        createPoolContract.bind(this, participantsCount, privatable),
      )

      await expect(
        poolTemplateContract.connect(stranger1).getParticipant(),
      ).to.revertedWithCustomError(poolTemplateContract, 'OnlyParticipant')
    })
  })

  describe('Tokens distribution', () => {
    it('Should receive tokens', async () => {
      const mintAmount = 100_000
      const participantsCount = 5

      const { poolTemplateContract, creatorAndParticipant1 } =
        await loadFixture<ICreatePoolTemplateContract>(
          createPoolContract.bind(this, participantsCount),
        )

      const { testERC20CContract } = await loadFixture<ICreateTestERC20Contract>(
        createAndMintTestERC20.bind(this, poolTemplateContract.address, mintAmount),
      )

      await poolTemplateContract
        .connect(creatorAndParticipant1)
        .setTokenAddress(testERC20CContract.address)

      expect(await poolTemplateContract.connect(creatorAndParticipant1).tokenBalance()).to.equal(
        mintAmount,
      )
      expect(
        (await poolTemplateContract.connect(creatorAndParticipant1).getPoolData()).filledAmount,
      ).to.equal(mintAmount)
    })

    it('Should distribute tokens', async () => {
      const mintAmount = 25_000
      const participantsCount = 5

      const { poolTemplateContract, creatorAndParticipant1, tokenAmount, shares } =
        await loadFixture<ICreatePoolTemplateContract>(
          createPoolContract.bind(this, participantsCount),
        )

      const { testERC20CContract } = await loadFixture<ICreateTestERC20Contract>(
        createAndMintTestERC20.bind(this, poolTemplateContract.address, mintAmount),
      )

      await poolTemplateContract
        .connect(creatorAndParticipant1)
        .setTokenAddress(testERC20CContract.address)

      const res: IParticipantResponse[] = await poolTemplateContract
        .connect(creatorAndParticipant1)
        .getParticipants(participantFirst, participantSize)

      shares.forEach((share, i) => {
        const accrued = Math.floor((mintAmount * share) / tokenAmount)
        const cP: IParticipantResponse = res[i]
        expect(cP.accrued).to.equal(accrued)
      })
    })

    it('Should claim tokens', async () => {
      const mintAmount = 25_000
      const participantsCount = 5
      let minted = 0

      const { poolTemplateContract, creatorAndParticipant1, tokenAmount, participants, shares } =
        await loadFixture<ICreatePoolTemplateContract>(
          createPoolContract.bind(this, participantsCount),
        )
      const { testERC20CContract, testERC20Deployer } = await loadFixture<ICreateTestERC20Contract>(
        createAndMintTestERC20.bind(this, poolTemplateContract.address, mintAmount),
      )
      minted += mintAmount
      await poolTemplateContract
        .connect(creatorAndParticipant1)
        .setTokenAddress(testERC20CContract.address)

      const participantIdx: number = participants.findIndex(
        (account) => account.toLowerCase() === creatorAndParticipant1.address.toLowerCase(),
      )

      await poolTemplateContract.connect(creatorAndParticipant1).claimTokens()
      const accrued1 = Math.floor((minted * shares[participantIdx]) / tokenAmount)
      expect(await testERC20CContract.balanceOf(creatorAndParticipant1.address)).to.equal(accrued1)
      expect(
        (await poolTemplateContract.connect(creatorAndParticipant1).getPoolData()).filledAmount,
      ).to.equal(minted)

      await testERC20CContract
        .connect(testERC20Deployer)
        .mint(poolTemplateContract.address, mintAmount)
      minted += mintAmount

      await poolTemplateContract.connect(creatorAndParticipant1).claimTokens()
      const accrued2 = Math.floor((minted * shares[participantIdx]) / tokenAmount)
      expect(await testERC20CContract.balanceOf(creatorAndParticipant1.address)).to.equal(accrued2)
      expect(
        (await poolTemplateContract.connect(creatorAndParticipant1).getPoolData()).filledAmount,
      ).to.equal(minted)
    })

    it('Should add token address', async () => {
      const mintAmount = 25_000
      const participantsCount = 5

      const { poolTemplateContract, creatorAndParticipant1 } =
        await loadFixture<ICreatePoolTemplateContract>(
          createPoolContract.bind(this, participantsCount),
        )

      const { testERC20CContract } = await loadFixture<ICreateTestERC20Contract>(
        createAndMintTestERC20.bind(this, poolTemplateContract.address, mintAmount),
      )

      await poolTemplateContract
        .connect(creatorAndParticipant1)
        .setTokenAddress(testERC20CContract.address)
      const pool: IPoolResponse = await poolTemplateContract
        .connect(creatorAndParticipant1)
        .getPoolData()

      expect(pool.tokenAddress).to.equal(testERC20CContract.address)
    })

    it('Should revert if does not approved', async () => {
      const participantsCount = 5
      const privatable = false
      const approvable = true
      const mintAmount = 100_000
      const { poolTemplateContract, creatorAndParticipant1 } =
        await loadFixture<ICreatePoolTemplateContract>(
          createPoolContract.bind(this, participantsCount, privatable, approvable),
        )

      const { testERC20CContract } = await loadFixture<ICreateTestERC20Contract>(
        createAndMintTestERC20.bind(this, poolTemplateContract.address, mintAmount),
      )

      await expect(
        poolTemplateContract.connect(creatorAndParticipant1).claimTokens(),
      ).to.revertedWithCustomError(poolTemplateContract, 'NoTokenContract')

      await expect(
        poolTemplateContract
          .connect(creatorAndParticipant1)
          .setTokenAddress(testERC20CContract.address),
      ).to.revertedWithCustomError(poolTemplateContract, 'OnlyApproved')
    })
  })

  describe('Approval', () => {
    it('Should revert if call approve directly', async () => {
      const participantsCount = 5
      const privatable = false
      const approvable = true

      const { USDTContract, USDTDeployer } = await loadFixture<IDeployUSDT>(deployUSDT)

      const { poolTemplateContract, poolFactoryContract, approver1 } =
        await loadFixture<ICreatePoolTemplateContract>(
          createPoolContract.bind(
            this,
            participantsCount,
            privatable,
            approvable,
            approverValueFee,
            async (pfc: PoolFactory, pfcDeployer, creator) => {
              await pfc.connect(pfcDeployer).setStableContract(USDTContract.address)
              await pfc.connect(pfcDeployer).setFeeValue(valueFee)
              await USDTContract.connect(USDTDeployer).transfer(creator.address, 100)
              await USDTContract.connect(creator).approve(pfc.address, 100)
            },
          ),
        )

      await expect(
        poolTemplateContract.connect(approver1).approvePool(),
      ).to.revertedWithCustomError(poolTemplateContract, 'OnlyFactory')

      await poolFactoryContract.connect(approver1).approvePool(poolTemplateContract.address)

      await expect(
        poolTemplateContract.connect(approver1).approvePool(),
      ).to.revertedWithCustomError(poolTemplateContract, 'OnlyFactory')
    })
  })
})

describe('Performance', () => {
  it('Should create pool with 100 participants and get data', async () => {
    const participantsCount = 100
    const { poolResponse, tokenAmount, participantResponse } = await loadFixture<ICreatePool>(
      createPoolAndReqData.bind(this, participantsCount),
    )
    expect(poolResponse.tokenAmount).to.equal(tokenAmount)
    expect(poolResponse.approved).to.equal(true)
    expect(poolResponse.privatable).to.equal(false)
    expect(participantResponse.length).to.equal(participantSize)
  })

  it('Should create 10 pools with 300 participants', async () => {
    const participantsCount = 300
    const poolCount = 10

    const { poolFactoryContract, participant1 } = await loadFixture<IDeployPoolFactory>(
      deployPoolFactory,
    )
    const { name, tokenName, participants, shares, tokenAddress, approverAddress, privatable } =
      await preparePoolData(undefined, participantsCount)
    const accs = await ethers.getSigners()
    const tokenAmount = shares.reduce((acc, item) => {
      acc += item
      return acc
    }, 0)

    const creatingReqs: Promise<ContractTransaction>[] = Array(poolCount)
      .fill(null)
      .map((_, i) => {
        const creator = accs[i] ? accs[i] : accs[0]
        return poolFactoryContract.connect(creator).createPoolContract(
          {
            name,
            tokenAddress,
            tokenName,
            approver: approverAddress,
            privatable,
            finalized: true,
            stableApproverFee: 0,
          },
          participants,
          shares,
        )
      })
    await Promise.all(creatingReqs)

    const poolAccounts: string[] = await poolFactoryContract.findPoolsByParticipant(
      participants[0],
      0,
      200,
    )

    const poolTemplateContract: PoolTemplate = await ethers.getContractAt(
      'PoolTemplate',
      poolAccounts[0],
    )

    const poolResponse: IPoolResponse = await poolTemplateContract
      .connect(participant1)
      .getPoolData()

    expect(poolAccounts.length).to.equal(poolCount)
    noAddressZeroInArray(poolAccounts)
    expect(poolResponse.tokenAmount).to.equal(tokenAmount)
  })

  xit('Should create 5 pool with separated participants 3*300', async () => {
    const participantsCount1 = 300
    const participantsCount2 = 300
    const participantsCount3 = 300
    const fullCount = participantsCount1 + participantsCount2 + participantsCount3

    const poolCount = 5

    const { poolFactoryContract, participant1, creatorAndParticipant1 } =
      await loadFixture<IDeployPoolFactory>(deployPoolFactory)

    for (const i of Array(poolCount)
      .fill(null)
      .map((_, j) => j)) {
      const pData1 = await preparePoolData(undefined, fullCount, 'pl1' + i)

      const pChunks: string[][] = Helpers.splitParticipants(pData1.participants, participantsCount3)

      const sChunks: number[][] = Helpers.splitParticipants(pData1.shares, participantsCount3)

      await poolFactoryContract.connect(creatorAndParticipant1).createPoolContract(
        {
          name: pData1.name,
          tokenAddress: pData1.tokenAddress,
          tokenName: pData1.tokenName,
          approver: pData1.approverAddress,
          privatable: pData1.privatable,
          finalized: false,
          stableApproverFee: 0,
        },
        pChunks[0],
        sChunks[0],
      )

      await poolFactoryContract
        .connect(creatorAndParticipant1)
        .addParticipants(pChunks[1], sChunks[1])
      await poolFactoryContract
        .connect(creatorAndParticipant1)
        .addParticipants(pChunks[2], sChunks[2])
      await poolFactoryContract.connect(creatorAndParticipant1).finalize()

      const poolAccounts: string[] = await poolFactoryContract
        .connect(creatorAndParticipant1)
        .findPoolsByParticipant(pChunks[1][7], 0, 100)

      const poolTemplateContract: PoolTemplate = await ethers.getContractAt(
        'PoolTemplate',
        poolAccounts[0],
      )

      const poolResponse: IPoolResponse = await poolTemplateContract
        .connect(participant1)
        .getPoolData()

      expect(poolResponse.participantsCount).to.equal(fullCount)
    }
  })
})
