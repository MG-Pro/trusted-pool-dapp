import { addressExporter, ethers } from 'hardhat'

async function main(): Promise<void> {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying contracts with the account:', deployer.address)

  const PoolFactory = await ethers.getContractFactory('PoolFactory')
  const poolFactory = await PoolFactory.connect(deployer).deploy()

  const TestERC20 = await ethers.getContractFactory('TestERC20')
  const testERC20 = await TestERC20.connect(deployer).deploy(1_000_000)

  await testERC20.deployed()

  console.log(`PoolFactory contract deployed to: ${poolFactory.address}`)
  console.log(`TestERC20 contract deployed to: ${testERC20.address}`)

  await addressExporter.save({
    PoolFactory: poolFactory.address,
  })
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
