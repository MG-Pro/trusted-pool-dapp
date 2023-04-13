import { addressExporter, ethers, upgrades } from 'hardhat'

async function main(): Promise<void> {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying contracts with the account:', deployer.address)

  const PoolFactoryC = await ethers.getContractFactory('PoolFactory', deployer)
  const poolFactory = await upgrades.deployProxy(PoolFactoryC, [])
  await poolFactory.deployed()
  console.log(`PoolFactory contract deployed to: ${poolFactory.address}`)

  await addressExporter.save({
    PoolFactory: poolFactory.address,
  })
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
