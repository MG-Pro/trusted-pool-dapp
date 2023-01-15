import { addressExporter, ethers } from 'hardhat'

async function main(): Promise<void> {
  const [, deployer] = await ethers.getSigners()
  console.log('Deploying contracts with the account:', deployer.address)

  const Contract = await ethers.getContractFactory('TrustedPool')
  const contract = await Contract.deploy()

  await contract.deployed()

  console.log(`Contract deployed to: ${contract.address}`)

  await addressExporter.save({
    TrustedPool: contract.address,
  })
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
