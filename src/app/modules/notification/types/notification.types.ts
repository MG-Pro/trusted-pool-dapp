export interface MessageData {
  id: number
  message: string
  outId: string
  statusClass?: StatusClasses
}

export enum StatusClasses {
  success = 'text-success',
  danger = 'text-danger',
}
