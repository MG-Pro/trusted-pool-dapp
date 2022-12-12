import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying contracts with the account:', deployer.address)

  const Contract = await ethers.getContractFactory('TrustedPool')
  const contract = await Contract.deploy()

  await contract.deployed();

  console.log(`Contract deployed to: ${contract.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
