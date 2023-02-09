import { addressExporter, ethers } from 'hardhat'

async function main(): Promise<void> {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying contracts with the account:', deployer.address)

  const TrustedPool = await ethers.getContractFactory('TrustedPool')
  const trustedPool = await TrustedPool.deploy()

  await trustedPool.deployed()

  console.log(`TrustedPool contract deployed to: ${trustedPool.address}`)

  await addressExporter.save({
    TrustedPool: trustedPool.address,
  })
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
