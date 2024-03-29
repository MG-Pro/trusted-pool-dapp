import { PoolFactory, PoolTemplate, TestERC20 } from '@app/typechain'
import { ICreatePoolRequestParams, IParticipantResponse, IPoolResponse } from '@app/types'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/src/signers'
import { expect } from 'chai'
import { Contract } from 'ethers'
import { ethers, upgrades } from 'hardhat'

import {
  ICreatePool,
  ICreatePoolTemplateContract,
  ICreateTestERC20Contract,
  IDeployPoolFactory,
  IDeployTestERC20,
  IDeployUSDT,
  ITestSigners,
} from './test.types'

export const totalSupply = 1_000_000
export const participantFirst = 0
export const participantSize = 25
export const valueFee = 10
export const approverValueFee = 5

export async function getTestSigners(): Promise<ITestSigners> {
  const s = (await ethers.getSigners()) as unknown as SignerWithAddress[]
  return {
    poolFactoryDeployer: s[0],
    testERC20Deployer: s[1],
    USDTDeployer: s[2],
    deployer4: s[3],
    approver1: s[4],
    approver2: s[5],
    creatorAndParticipant1: s[6],
    creator2: s[7],
    creator3: s[8],
    participant1: s[9],
    participant2: s[10],
    participant3: s[11],
    stranger1: s[12],
    stranger2: s[13],
  }
}

export async function upgradePoolFactory(
  prevAddress: string,
  name: string,
): Promise<{ upgradedContract: Contract } & ITestSigners> {
  const signers: ITestSigners = await getTestSigners()
  const PoolFactoryC = await ethers.getContractFactory(name, signers.poolFactoryDeployer)
  const upgradedContract = await upgrades.upgradeProxy(prevAddress, PoolFactoryC)
  await upgradedContract.deployed()

  return {
    ...signers,
    upgradedContract,
  }
}

export async function deployPoolFactory(): Promise<IDeployPoolFactory> {
  const signers: ITestSigners = await getTestSigners()
  const PoolFactoryC = await ethers.getContractFactory('PoolFactory', signers.poolFactoryDeployer)
  const poolFactoryContract = (await upgrades.deployProxy(PoolFactoryC, [])) as PoolFactory

  await poolFactoryContract.deployed()

  return {
    ...signers,
    poolFactoryContract,
  }
}

export async function deployTestERC20(): Promise<IDeployTestERC20> {
  const signers: ITestSigners = await getTestSigners()
  const TestERC20C = await ethers.getContractFactory('TestERC20', signers.testERC20Deployer)
  const testERC20CContract: TestERC20 = await TestERC20C.deploy(totalSupply)
  await testERC20CContract.deployed()

  return {
    ...signers,
    testERC20CContract,
  }
}

export async function deployUSDT(): Promise<IDeployUSDT> {
  const signers: ITestSigners = await getTestSigners()
  const TestERC20C = await ethers.getContractFactory('TestERC20', signers.USDTDeployer)
  const USDTContract: TestERC20 = await TestERC20C.deploy(1_000_000_000)
  await USDTContract.deployed()

  return {
    ...signers,
    USDTContract,
  }
}

export async function preparePoolData(
  tokenAddress = ethers.constants.AddressZero,
  participantsCount = 5,
  nonce: string = '',
  approverAddress: string = ethers.constants.AddressZero,
  privatable: boolean = false,
): Promise<Partial<ICreatePoolRequestParams> & { participants: string[]; shares: number[] }> {
  const { participant1, participant2, participant3, creatorAndParticipant1 }: ITestSigners =
    await getTestSigners()
  const accounts = [creatorAndParticipant1, participant1, participant2, participant3]

  const participants: [string[], number[]] = Array(participantsCount)
    .fill(null)
    .reduce(
      (acc: [string[], number[]], _, i) => {
        acc[0].push(i > 3 ? ethers.Wallet.createRandom().address : accounts[i].address)
        acc[1].push(50_000 + i * 5_000)
        return acc
      },
      [[], []],
    )

  return {
    name: ethers.utils.formatBytes32String('VC' + nonce),
    tokenName: ethers.utils.formatBytes32String('BTC' + nonce),
    tokenAddress,
    participants: participants[0],
    shares: participants[1],
    approverAddress,
    privatable,
  }
}

export async function createPoolContract(
  participantsCount: number,
  privatableArg: boolean = false,
  approvable: boolean = false,
  approverFee: number = 0,
  deployedHook?: (
    pfc: PoolFactory,
    pfcDeployer: SignerWithAddress,
    creator: SignerWithAddress,
  ) => Promise<void>,
): Promise<ICreatePoolTemplateContract> {
  const {
    poolFactoryContract,
    poolFactoryDeployer,
    stranger1,
    participant1,
    approver1,
    creatorAndParticipant1,
  } = await deployPoolFactory()

  if (deployedHook) {
    await deployedHook(poolFactoryContract, poolFactoryDeployer, creatorAndParticipant1)
  }

  const { name, tokenName, participants, shares, tokenAddress, privatable } = await preparePoolData(
    undefined,
    participantsCount,
    '',
    approver1.address,
    privatableArg,
  )

  const approverAddress = approvable ? approver1.address : ethers.constants.AddressZero

  await poolFactoryContract.connect(creatorAndParticipant1).createPoolContract(
    {
      name,
      tokenAddress,
      tokenName,
      approver: approverAddress,
      privatable,
      finalized: true,
      stableApproverFee: approverFee,
    },
    participants,
    shares,
  )

  const poolAccounts: string[] = await poolFactoryContract.findPoolsByParticipant(
    participants[0],
    0,
    100,
  )

  const poolTemplateContract: PoolTemplate = await ethers.getContractAt(
    'PoolTemplate',
    poolAccounts[0],
  )

  return {
    poolTemplateContract,
    poolFactoryContract,
    participants,
    shares,
    poolFactoryDeployer,
    approver1,
    participant1,
    stranger1,
    privatable,
    creatorAndParticipant1,
    poolAccounts,
    tokenAmount: shares.reduce((acc, item) => {
      acc += item
      return acc
    }, 0),
  }
}

export async function createPoolAndReqData(
  participantsCount: number,
  privatableArg: boolean = false,
  approvable: boolean = false,
): Promise<ICreatePool> {
  const { poolTemplateContract, tokenAmount, approver1, privatable, creatorAndParticipant1 } =
    await createPoolContract(participantsCount, privatableArg, approvable)

  const poolResponse: IPoolResponse = await poolTemplateContract
    .connect(creatorAndParticipant1)
    .getPoolData()
  const participantResponse: IParticipantResponse[] = await poolTemplateContract
    .connect(creatorAndParticipant1)
    .getParticipants(participantFirst, participantSize)
  return {
    poolResponse,
    participantResponse,
    tokenAmount,
    approver1,
    privatable,
    poolTemplateContract,
  }
}

export async function createAndMintTestERC20(
  poolAccount: string,
  mintAmount?: number,
): Promise<ICreateTestERC20Contract> {
  const { testERC20CContract, testERC20Deployer } = await deployTestERC20()

  if (mintAmount) {
    const tr = await testERC20CContract.connect(testERC20Deployer).mint(poolAccount, mintAmount)
    await tr.wait()
  }

  return { testERC20CContract, testERC20Deployer, mintAmount }
}

export function noAddressZeroInArray(arr: string[]): void {
  arr.forEach((a) => {
    expect(a).to.not.equal(ethers.constants.AddressZero)
  })
}
