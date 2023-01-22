import { ethers } from 'hardhat'

describe('TrustedPool', () => {
  const totalSupply = 1_000_000

  async function deploy(): Promise<any> {
    const [deployer1, deployer2, user1, user2] = await ethers.getSigners()
    const MGTokenERC20 = await ethers.getContractFactory('TrustedPool', deployer1)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const contractToken = await MGTokenERC20.deploy(totalSupply)

    await contractToken.deployed()

    return {
      contractToken,

      user1,
      user2,
      deployer1,
      deployer2,
    }
  }
})
