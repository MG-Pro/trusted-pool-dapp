import * as path from 'path'

import { HardhatUserConfig } from 'hardhat/config'

import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-abi-exporter'
import 'hardhat-address-exporter'

const config: HardhatUserConfig = {
  solidity: '0.8.17',
  networks: {
    hardhat: {
      chainId: 1337,
    },
  },
  abiExporter: {
    path: path.resolve('./src/app/contracts/abi'),
    runOnCompile: true,
    spacing: 2,
    only: ['TrustedPool.sol', 'PooledTemplate.sol'],
    pretty: false,
    clear: true,
  },
  addressExporter: {
    outDir: path.resolve('./src/app/contracts/addresses'),
    runPrettier: true,
  },
  typechain: {
    outDir: path.resolve('./src/app/contracts/typechain-types'),
    target: 'ethers-v5',
  },
}

export default config
