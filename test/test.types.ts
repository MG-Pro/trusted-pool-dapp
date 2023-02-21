import { PoolFactory, PoolTemplate, TestERC20 } from '@app/typechain'
import { IParticipant, IParticipantResponse, IPoolResponse } from '@app/types'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/src/signers'

export interface ICreatePool {
  poolResponse: IPoolResponse
  participantResponse: IParticipantResponse[]
  tokenAmount: number
}

export interface ICreatePoolTemplateContract {
  poolTemplateContract: PoolTemplate
  participants: IParticipant[]
  deployer1: SignerWithAddress
  tokenAmount: number
}

export interface ICreateTestERC20Contract {
  testERC20CContract: TestERC20
  deployer2: SignerWithAddress
  mintAmount?: number
}

export interface IDeployPoolFactory {
  readonly [index: string]: SignerWithAddress | PoolFactory | TestERC20
  deployer1: SignerWithAddress
  poolFactoryContract: PoolFactory
}

export interface IDeployTestERC20 {
  readonly [index: string]: SignerWithAddress | PoolFactory | TestERC20
  deployer2: SignerWithAddress
  testERC20CContract: TestERC20
}
