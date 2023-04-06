export interface ICreatingPoolProcessing {
  active: boolean
  pending: boolean
  currentTs: number
  countTS: number
  tsCalls: Promise<boolean>[]
}
