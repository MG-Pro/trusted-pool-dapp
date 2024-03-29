import { IPool, PoolStatuses } from '@app/types'

export const newPool: IPool = {
  name: 'VC',
  contractAddress: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
  tokenAddress: null,
  tokenName: 'BTC',
  tokenAmount: 250_000,
  creatorAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  participants: [
    {
      share: 50_000,
      claimed: 0,
      accrued: 0,
      account: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      description: '',
    },
    {
      share: 60_000,
      claimed: 0,
      accrued: 0,
      account: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92264',
      description: '',
    },
    {
      share: 40_000,
      claimed: 0,
      accrued: 0,
      account: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      description: '',
    },
    {
      share: 50_000,
      claimed: 0,
      accrued: 0,
      account: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      description: '',
    },
    {
      share: 50_000,
      claimed: 0,
      accrued: 0,
      account: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      description: '',
    },
  ],
  status: PoolStatuses.Active,
}
