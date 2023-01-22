import * as path from 'path'

import { HardhatUserConfig } from 'hardhat/config'

import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-abi-exporter'

import 'hardhat-address-exporter'

const config: HardhatUserConfig = {
  solidity: '0.8.17',
  networks: {
    hardhat: {
      chainId: 31337,
    },
  },
  abiExporter: {
    path: path.resolve('./src/app/contracts'),
    runOnCompile: true,
    spacing: 2,
    pretty: false,
    clear: true,
  },
  addressExporter: {
    outDir: path.resolve('./src/app/contracts/addresses'),
    runPrettier: true,
  },
}

export default config
