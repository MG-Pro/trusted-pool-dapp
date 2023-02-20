import { TransactionResponse } from '@ethersproject/abstract-provider/src.ts'
import { Provider } from '@ethersproject/providers'
import * as dotenv from 'dotenv'
import { Contract, Signer } from 'ethers'
import { task, types } from 'hardhat/config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

dotenv.config()
const { API_URL, PRIVATE_KEY, API_KEY, TOKEN_CONTRACT } = process.env

// example:
// npx hardhat mintTestToken --pool-account 0xa16e02e87b7454126e5e10d957a927a7f5b5d2be

task('mintTestToken', 'Mint token to pool contract')
  .addParam('poolAccount', 'Pool Account', null, types.string)
  .addParam('mintAmount', 'Amount of mint', 100_000, types.int)
  .addParam('privateKey', '', PRIVATE_KEY, types.string)
  .addParam('contract', '', TOKEN_CONTRACT, types.string)
  .setAction(
    async ({ contract, privateKey, poolAccount, mintAmount }, hre: HardhatRuntimeEnvironment) => {
      const provider: Provider = hre.ethers.getDefaultProvider(API_URL, API_KEY)
      const signer: Signer = new hre.ethers.Wallet(privateKey, provider)
      const c: Contract = await hre.ethers.getContractAt('TestERC20', contract, signer)
      const tx: TransactionResponse = await c.mint(poolAccount, mintAmount)
      await tx.wait()
      console.log('mintTestToken completed')
    },
  )
