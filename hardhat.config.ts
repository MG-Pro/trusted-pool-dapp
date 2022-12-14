import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-abi-exporter'
import 'hardhat-address-exporter'
import * as path from 'path'

const config: HardhatUserConfig = {
  solidity: '0.8.17',
  abiExporter: {
    path: './src/app/abi',
    runOnCompile: true,
    spacing: 2,
    pretty: false,
    clear: true,
  },
  addressExporter: {
    outDir: path.resolve('./src/app/addresses'),
    runPrettier: true,
  },
}

export default config
