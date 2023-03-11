import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/src/signers'
import { addressExporter, ethers, upgrades } from 'hardhat'

export async function upgradePoolFactory(
  prevAddress: string,
  newContractName: string,
  deployer: SignerWithAddress,
): Promise<void> {
  const PoolFactoryC = await ethers.getContractFactory(newContractName, deployer)
  const upgradedContract = await upgrades.upgradeProxy(prevAddress, PoolFactoryC)
  await upgradedContract.deployed()
  console.log(`PoolFactory contract upgraded to: ${newContractName} ${upgradedContract.address}`)
}

async function deployPoolFactory(deployer: SignerWithAddress): Promise<void> {
  const PoolFactoryC = await ethers.getContractFactory('PoolFactory', deployer)
  const poolFactory = await upgrades.deployProxy(PoolFactoryC, [])
  await poolFactory.deployed()
  console.log(`PoolFactory contract deployed to: ${poolFactory.address}`)

  await addressExporter.save({
    PoolFactory: poolFactory.address,
  })
}

async function deployTestERC20(deployer: SignerWithAddress): Promise<void> {
  const TestERC20 = await ethers.getContractFactory('TestERC20')
  const testERC20 = await TestERC20.connect(deployer).deploy(1_000_000)
  await testERC20.deployed()
  console.log(`TestERC20 contract deployed to: ${testERC20.address}`)
}

async function deployUSDT(deployer: SignerWithAddress): Promise<void> {
  const TestERC20 = await ethers.getContractFactory('TestERC20')
  const usdt = await TestERC20.connect(deployer).deploy(1_000_000)
  await usdt.deployed()
  console.log(`TestUSDT contract deployed to: ${usdt.address}`)
}

async function main(): Promise<void> {
  const [deployer] = (await ethers.getSigners()) as unknown as SignerWithAddress[]
  console.log('Deploying contracts with the account:', deployer.address)

  await deployPoolFactory(deployer)
  await deployTestERC20(deployer)
  await deployUSDT(deployer)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
