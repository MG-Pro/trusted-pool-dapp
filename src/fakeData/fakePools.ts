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
      account: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    },
    {
      share: 60_000,
      claimed: 0,
      account: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92264',
    },
    {
      share: 40_000,
      claimed: 0,
      account: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    },
    {
      share: 50_000,
      claimed: 0,
      account: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    },
    {
      share: 50_000,
      claimed: 0,
      account: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    },
  ],
  status: PoolStatuses.Active,
}

export const fakePoolData: IPool[] = [
  { ...newPool },
  {
    name: 'VC',
    contractAddress: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1191',
    tokenAddress: null,
    tokenName: 'ETH',
    tokenAmount: 100_000,
    creatorAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    participants: [
      {
        share: 50_000,
        claimed: 0,
        account: '0xa19Ad61447e5EA79bdDCeB037986944c41e198BC',
      },
      {
        share: 50_000,
        claimed: 0,
        account: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      },
    ],
    status: PoolStatuses.Active,
  },
]
