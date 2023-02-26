import { PoolFactory, PoolTemplate, TestERC20 } from '@app/typechain'
import { IParticipant, IParticipantResponse, IPool, IPoolResponse } from '@app/types'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/src/signers'
import { ethers } from 'hardhat'

import {
  ICreatePool,
  ICreatePoolTemplateContract,
  ICreateTestERC20Contract,
  IDeployPoolFactory,
  IDeployTestERC20,
  IDeployUSDT,
} from './test.types'

export const totalSupply = 1_000_000
export const participantFirst = 0
export const participantSize = 25
export const valueFee = 10
export const approverValueFee = 5

export async function deployPoolFactory(): Promise<IDeployPoolFactory> {
  const [deployer1, deployer2, deployer3, user2, user3, user4, user5] =
    (await ethers.getSigners()) as unknown as SignerWithAddress[]

  const PoolFactoryC = await ethers.getContractFactory('PoolFactory', deployer1)
  const poolFactoryContract: PoolFactory = await PoolFactoryC.deploy()
  await poolFactoryContract.deployed()

  return {
    poolFactoryContract,
    deployer1,
    user5,
    approver: user4,
    participant2: deployer2,
  }
}

export async function deployTestERC20(): Promise<IDeployTestERC20> {
  const [deployer1, deployer2, deployer3, user2, user3, user4, user5] =
    (await ethers.getSigners()) as unknown as SignerWithAddress[]

  const TestERC20C = await ethers.getContractFactory('TestERC20', deployer2)
  const testERC20CContract: TestERC20 = await TestERC20C.deploy(totalSupply)
  await testERC20CContract.deployed()

  return {
    testERC20CContract,
    deployer2,
    user5,
  }
}

export async function deployUSDT(): Promise<IDeployUSDT> {
  const [deployer1, deployer2, deployer3, user2, user3, user4, user5] =
    (await ethers.getSigners()) as unknown as SignerWithAddress[]

  const TestERC20C = await ethers.getContractFactory('TestERC20', deployer3)
  const USDTContract: TestERC20 = await TestERC20C.deploy(totalSupply)
  await USDTContract.deployed()

  return {
    USDTContract,
    deployer3,
    user5,
  }
}

export async function poolData(
  tokenAddress = ethers.constants.AddressZero,
  participantsCount = 5,
  nonce: string = '',
  approverAddress: string = ethers.constants.AddressZero,
  privatable: boolean = false,
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
    approver: approverAddress,
    privatable,
    tokenAmount: participants.reduce((acc, p) => acc + p.share, 0),
  }
}

export async function createPoolTemplateContract(
  participantsCount: number,
  privatableArg: boolean = false,
  approvable: boolean = false,
): Promise<ICreatePoolTemplateContract> {
  const { poolFactoryContract, deployer1, user5, participant2, approver } =
    await deployPoolFactory()
  const { name, tokenName, participants, tokenAddress, tokenAmount, privatable } = await poolData(
    undefined,
    participantsCount,
    '',
    approver.address,
    privatableArg,
  )

  const approverAddress = approvable ? approver.address : ethers.constants.AddressZero

  await poolFactoryContract
    .connect(deployer1)
    .createPoolContract(name, tokenAddress, tokenName, participants, approverAddress, privatable)

  const poolAccounts: string[] = await poolFactoryContract.getContractAddressesByParticipant(
    participants[0].account,
  )

  const poolTemplateContract: PoolTemplate = await ethers.getContractAt(
    'PoolTemplate',
    poolAccounts[0],
  )

  return {
    poolTemplateContract,
    poolFactoryContract,
    tokenAmount,
    participants,
    deployer1,
    approver,
    privatable,
    notUser: user5 as SignerWithAddress,
    participant2,
  }
}

export async function createPool(
  participantsCount: number,
  privatableArg: boolean = false,
  approvable: boolean = false,
): Promise<ICreatePool> {
  const { poolTemplateContract, tokenAmount, approver, privatable } =
    await createPoolTemplateContract(participantsCount, privatableArg, approvable)

  const poolResponse: IPoolResponse = await poolTemplateContract.getPoolData()
  const participantResponse: IParticipantResponse[] = await poolTemplateContract.getParticipants(
    participantFirst,
    participantSize,
  )
  return { poolResponse, participantResponse, tokenAmount, approver, privatable }
}

export async function createAndMintTestERC20(
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
