import { addressExporter, ethers } from 'hardhat'

async function main(): Promise<void> {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying contracts with the account:', deployer.address)

  const PoolFactory = await ethers.getContractFactory('PoolFactory')
  const poolFactory = await PoolFactory.deploy()

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
