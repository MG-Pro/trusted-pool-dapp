import { PoolFactory, PoolTemplate, TestERC20 } from '@app/typechain'
import { IParticipant, IParticipantResponse, IPoolResponse } from '@app/types'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/src/signers'

export interface ICreatePool extends ITestSigners {
  poolResponse: IPoolResponse
  participantResponse: IParticipantResponse[]
  tokenAmount: number
  privatable: boolean
  poolTemplateContract: PoolTemplate
}

export interface ICreatePoolTemplateContract extends ITestSigners {
  poolTemplateContract: PoolTemplate
  poolFactoryContract: PoolFactory
  participants: IParticipant[]
  privatable: boolean
  tokenAmount: number
  poolAccounts: string[]
}

export interface ICreateTestERC20Contract extends ITestSigners {
  testERC20CContract: TestERC20
  mintAmount?: number
}

export interface IDeployPoolFactory extends ITestSigners {
  poolFactoryContract: PoolFactory
}

export interface IDeployTestERC20 extends ITestSigners {
  testERC20CContract: TestERC20
}

export interface IDeployUSDT extends ITestSigners {
  USDTContract: TestERC20
}

export interface ITestSigners<T = SignerWithAddress> {
  poolFactoryDeployer?: T
  testERC20Deployer?: T
  USDTDeployer?: T
  deployer4?: T
  approver1?: T
  approver2?: T
  creatorAndParticipant1?: T
  creator2?: T
  creator3?: T
  participant1?: T
  participant2?: T
  participant3?: T
  stranger1?: T
  stranger2?: T
}
