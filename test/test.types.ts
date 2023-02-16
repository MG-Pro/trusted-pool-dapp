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
  tokenAmount: number
}

export interface IDeploy {
  readonly [index: string]: SignerWithAddress | PoolFactory | TestERC20
  deployer1: SignerWithAddress
  deployer2: SignerWithAddress
  poolFactoryContract: PoolFactory
  testERC20CContract: TestERC20
}
