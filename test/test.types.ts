import { PoolFactory, PoolTemplate, TestERC20 } from '@app/typechain'
import { IParticipant, IParticipantResponse, IPoolResponse } from '@app/types'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/src/signers'

export interface ICreatePool {
  poolResponse: IPoolResponse
  participantResponse: IParticipantResponse[]
  tokenAmount: number
  approver: SignerWithAddress
  privatable: boolean
}

export interface ICreatePoolTemplateContract {
  poolTemplateContract: PoolTemplate
  poolFactoryContract: PoolFactory
  participants: IParticipant[]
  deployer1: SignerWithAddress
  notUser: SignerWithAddress
  participant2: SignerWithAddress
  approver: SignerWithAddress
  privatable: boolean
  tokenAmount: number
}

export interface ICreateTestERC20Contract {
  testERC20CContract: TestERC20
  deployer2: SignerWithAddress
  mintAmount?: number
}

export interface IDeployPoolFactory {
  deployer1: SignerWithAddress
  user5: SignerWithAddress
  approver: SignerWithAddress
  participant2: SignerWithAddress
  poolFactoryContract: PoolFactory
}

export interface IDeployTestERC20 {
  deployer2: SignerWithAddress
  user5: SignerWithAddress
  testERC20CContract: TestERC20
}

export interface IDeployUSDT {
  deployer3: SignerWithAddress
  user5: SignerWithAddress
  USDTContract: TestERC20
}
