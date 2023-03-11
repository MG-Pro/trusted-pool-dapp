import * as path from 'path'

import { HardhatUserConfig } from 'hardhat/config'

import '@nomicfoundation/hardhat-toolbox'
import '@openzeppelin/hardhat-upgrades'
import 'hardhat-abi-exporter'
import 'hardhat-address-exporter'
import './tasks'

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.18',
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 200,
        // details: {
        //   yulDetails: {
        //     optimizerSteps: 'u',
        //   },
        // },
      },
    },
  },
  gasReporter: {
    enabled: true,
    excludeContracts: ['TestERC20.sol', 'TestPoolFactoryV2.sol'],
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
  },
  abiExporter: {
    path: path.resolve('./src/app/contracts/abi'),
    runOnCompile: true,
    spacing: 2,
    only: ['PoolFactory.sol', 'PoolTemplate.sol'],
    pretty: false,
    clear: true,
  },
  addressExporter: {
    outDir: path.resolve('./src/app/contracts/addresses'),
    runPrettier: true,
  },
  typechain: {
    target: 'ethers-v5',
  },
  mocha: {},
}

export default config
