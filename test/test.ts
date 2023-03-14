import { PoolFactory, PoolTemplate } from '@app/typechain'
import { IParticipant, IParticipantResponse, IPoolResponse } from '@app/types'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { expect } from 'chai'
import { ContractTransaction } from 'ethers'
import { ethers } from 'hardhat'

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
      const { poolResponse, tokenAmount, participantResponse } = await loadFixture<ICreatePool>(
        createPoolAndReqData.bind(this, participantsCount),
      )
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
      const { name, tokenName, participants, tokenAddress, approverAddress, privatable } =
        await preparePoolData(undefined, participantsCount)

      const creatingReq = poolFactoryContract
        .connect(poolFactoryDeployer)
        .createPoolContract(
          name,
          tokenAddress,
          tokenName,
          participants,
          approverAddress,
          privatable,
          true,
        )

      await expect(creatingReq).to.emit(poolFactoryContract, 'PoolCreated')
    })

    it('Should revert if 0 participants', async () => {
      const participantsCount = 0
      const { poolFactoryContract, poolFactoryDeployer } = await loadFixture<IDeployPoolFactory>(
        deployPoolFactory,
      )
      const { name, tokenName, participants, tokenAddress, approverAddress, privatable } =
        await preparePoolData(undefined, participantsCount)

      const creatingReq = poolFactoryContract
        .connect(poolFactoryDeployer)
        .createPoolContract(
          name,
          tokenAddress,
          tokenName,
          participants,
          approverAddress,
          privatable,
          true,
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
      const { name, tokenName, participants, tokenAddress, approverAddress, privatable } =
        await preparePoolData(undefined, participantsCount)

      const creatingReq = poolFactoryContract
        .connect(poolFactoryDeployer)
        .createPoolContract(
          name,
          tokenAddress,
          tokenName,
          participants,
          approverAddress,
          privatable,
          true,
        )

      await expect(creatingReq).to.revertedWithCustomError(
        poolFactoryContract,
        'WrongParticipantCount',
      )
    })

    it('Should create pool with separated participants', async () => {
      const participantsCount1 = 10
      const participantsCount2 = 10
      const { poolFactoryContract, creator2, participant1 } = await loadFixture<IDeployPoolFactory>(
        deployPoolFactory,
      )
      const pData1 = await preparePoolData(undefined, participantsCount1)

      await poolFactoryContract
        .connect(creator2)
        .createPoolContract(
          pData1.name,
          pData1.tokenAddress,
          pData1.tokenName,
          pData1.participants,
          pData1.approverAddress,
          pData1.privatable,
          false,
        )

      const pData2 = await preparePoolData(undefined, participantsCount2)

      await poolFactoryContract.connect(creator2).addParticipants(pData2.participants)
      const poolAccounts: string[] = await poolFactoryContract
        .connect(creator2)
        .getContractAddressesByParticipant(pData2.participants[7].account)

      const poolTemplateContract: PoolTemplate = await ethers.getContractAt(
        'PoolTemplate',
        poolAccounts[0],
      )

      const poolResponse: IPoolResponse = await poolTemplateContract
        .connect(participant1)
        .getPoolData()

      console.log(poolResponse.participantsCount.toNumber())
      // expect(creatingReq).to.equal()
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
      await expect(participantsReq).to.revertedWith('Forbidden for private pool')

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

      const { name, tokenName, participants, tokenAddress, approverAddress, privatable } =
        await preparePoolData(undefined, participantsCount)

      const trReq = poolFactoryContract
        .connect(poolFactoryDeployer)
        .createPoolContract(
          name,
          tokenAddress,
          tokenName,
          participants,
          approverAddress,
          privatable,
          true,
        )

      await expect(trReq).to.revertedWith('Not enough fee value')
    })

    it('Should revert if not approved fee value', async () => {
      const participantsCount = 3
      const { poolFactoryContract, poolFactoryDeployer } = await loadFixture<IDeployPoolFactory>(
        deployPoolFactory,
      )
      const { USDTContract, USDTDeployer } = await loadFixture<IDeployUSDT>(deployUSDT)

      await USDTContract.connect(USDTDeployer).transfer(poolFactoryDeployer.address, 100)
      await poolFactoryContract.connect(poolFactoryDeployer).setStableContract(USDTContract.address)
      await poolFactoryContract.connect(poolFactoryDeployer).setFeeValue(valueFee)

      const { name, tokenName, participants, tokenAddress, approverAddress, privatable } =
        await preparePoolData(undefined, participantsCount)

      const trReq = poolFactoryContract
        .connect(poolFactoryDeployer)
        .createPoolContract(
          name,
          tokenAddress,
          tokenName,
          participants,
          approverAddress,
          privatable,
          true,
        )

      await expect(trReq).to.revertedWith('Not allowed amount to spend')
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

      const { name, tokenName, participants, tokenAddress, approverAddress, privatable } =
        await preparePoolData(undefined, participantsCount)

      await poolFactoryContract
        .connect(poolFactoryDeployer)
        .createPoolContract(
          name,
          tokenAddress,
          tokenName,
          participants,
          approverAddress,
          privatable,
          true,
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

      const { name, tokenName, participants, tokenAddress, approverAddress, privatable } =
        await preparePoolData(undefined, participantsCount)

      await poolFactoryContract
        .connect(participant1)
        .createPoolContract(
          name,
          tokenAddress,
          tokenName,
          participants,
          approverAddress,
          privatable,
          true,
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
          async (pfc: PoolFactory, pfcDeployer, creator) => {
            await pfc.connect(pfcDeployer).setStableContract(USDTContract.address)
            await pfc.connect(pfcDeployer).setFeeValue(valueFee)
            await pfc.connect(pfcDeployer).setApproverFeeValue(approverValueFee)
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
            async (pfc: PoolFactory, pfcDeployer, creator) => {
              await pfc.connect(pfcDeployer).setStableContract(USDTContract.address)
              await pfc.connect(pfcDeployer).setFeeValue(valueFee)
              await pfc.connect(pfcDeployer).setApproverFeeValue(approverValueFee)
              await USDTContract.connect(USDTDeployer).transfer(creator.address, 100)
              await USDTContract.connect(creator).approve(pfc.address, 100)
            },
          ),
        )

      await poolFactoryContract.connect(approver1).approvePool(poolTemplateContract.address)

      await expect(
        poolFactoryContract.connect(approver1).approvePool(poolTemplateContract.address),
      ).to.revertedWith('Pool already approved')
    })
  })

  describe('Upgradeable', () => {
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
        .getContractAddressesByParticipant(creatorAndParticipant1.address)

      const req = upgradedContract.connect(poolFactoryDeployer).getTestDataV2()

      expect(poolFactoryContract.address).to.equal(upgradedContract.address)
      expect(poolAccountsAfterUp[0]).to.equal(poolAccount)
      expect(await req).to.equal(poolFactoryDeployer.address)
    })
  })
})

xdescribe('PoolTemplate', () => {
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
      await expect(pReq).to.revertedWith('Start index greater than count of participants')
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

      const { poolTemplateContract, creatorAndParticipant1, tokenAmount, participants } =
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

      const { poolTemplateContract, creatorAndParticipant1, tokenAmount, participants } =
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

      const participant = participants.find(
        ({ account }) => account.toLowerCase() === creatorAndParticipant1.address.toLowerCase(),
      )

      await poolTemplateContract.connect(creatorAndParticipant1).claimTokens()
      const accrued1 = Math.floor((minted * participant.share) / tokenAmount)
      expect(await testERC20CContract.balanceOf(creatorAndParticipant1.address)).to.equal(accrued1)
      expect(
        (await poolTemplateContract.connect(creatorAndParticipant1).getPoolData()).filledAmount,
      ).to.equal(minted)

      await testERC20CContract
        .connect(testERC20Deployer)
        .mint(poolTemplateContract.address, mintAmount)
      minted += mintAmount

      await poolTemplateContract.connect(creatorAndParticipant1).claimTokens()
      const accrued2 = Math.floor((minted * participant.share) / tokenAmount)
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
      ).to.revertedWith('Token contract address no set')

      await expect(
        poolTemplateContract
          .connect(creatorAndParticipant1)
          .setTokenAddress(testERC20CContract.address),
      ).to.revertedWith('Pool is not approved')
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
            async (pfc: PoolFactory, pfcDeployer, creator) => {
              await pfc.connect(pfcDeployer).setStableContract(USDTContract.address)
              await pfc.connect(pfcDeployer).setFeeValue(valueFee)
              await pfc.connect(pfcDeployer).setApproverFeeValue(approverValueFee)
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

xdescribe('Performance', () => {
  xit('Should create pool with 100 participants and get data', async () => {
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
    const {
      name,
      tokenName,
      participants,
      tokenAddress,
      approverAddress,
      privatable,
      tokenAmount,
    } = await preparePoolData(undefined, participantsCount)
    const accs = await ethers.getSigners()

    const creatingReqs: Promise<ContractTransaction>[] = Array(poolCount)
      .fill(null)
      .map((_, i) => {
        const creator = accs[i] ? accs[i] : accs[0]
        return poolFactoryContract
          .connect(creator)
          .createPoolContract(
            name,
            tokenAddress,
            tokenName,
            participants,
            approverAddress,
            privatable,
            true,
          )
      })
    await Promise.all(creatingReqs)

    const poolAccounts: string[] = await poolFactoryContract.getContractAddressesByParticipant(
      participants[0].account,
    )

    const poolTemplateContract: PoolTemplate = await ethers.getContractAt(
      'PoolTemplate',
      poolAccounts[0],
    )

    const poolResponse: IPoolResponse = await poolTemplateContract
      .connect(participant1)
      .getPoolData()

    expect(poolAccounts.length).to.equal(poolCount)
    poolAccounts.forEach((a) => {
      expect(a).to.not.equal(ethers.constants.AddressZero)
    })
    expect(poolResponse.tokenAmount).to.equal(tokenAmount)
  })
})
