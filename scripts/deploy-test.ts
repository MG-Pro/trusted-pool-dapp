import { addressExporter, ethers } from 'hardhat'

async function main(): Promise<void> {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying contracts with the account:', deployer.address)

  const TrustedPool = await ethers.getContractFactory('TrustedPool')
  const trustedPool = await TrustedPool.deploy()

  const TestERC20 = await ethers.getContractFactory('TestERC20')
  const testERC20 = await TestERC20.deploy(1_000_000)

  await testERC20.deployed()

  console.log(`TrustedPool contract deployed to: ${trustedPool.address}`)
  console.log(`TestERC20 contract deployed to: ${testERC20.address}`)

  await addressExporter.save({
    TrustedPool: trustedPool.address,
  })
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
