import { Provider } from '@ethersproject/providers'
import * as dotenv from 'dotenv'
import { ContractFactory, Signer } from 'ethers'
import { task, types } from 'hardhat/config'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

dotenv.config()
const { API_URL, PRIVATE_KEY, API_KEY } = process.env

/* example:
npx hardhat --network localhost upgradeFactory --factory-account 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 --upgrade-name TestPoolFactoryV2
 */

task('upgradeFactory', 'Upgrade Factory contract')
  .addParam('factoryAccount', 'Factory account', null, types.string)
  .addParam('upgradeName', '', null, types.string)
  .addParam('privateKey', '', PRIVATE_KEY, types.string)
  .setAction(
    async ({ factoryAccount, privateKey, upgradeName }, hre: HardhatRuntimeEnvironment) => {
      const provider: Provider = hre.ethers.getDefaultProvider(API_URL, API_KEY)
      const signer: Signer = new hre.ethers.Wallet(privateKey, provider)

      const PoolFactoryC = (await hre.ethers.getContractFactory(
        upgradeName,
        signer,
      )) as ContractFactory
      const upgradedContract = await hre.upgrades.upgradeProxy(factoryAccount, PoolFactoryC)
      await upgradedContract.deployed()
      console.log(`PoolFactory contract upgraded to: ${upgradeName} ${upgradedContract.address}`)
    },
  )
