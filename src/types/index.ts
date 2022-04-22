export interface IWalletsParams {
  provider: any,
  walletName: any,
  chainId?: number
}

export interface ISendTrxParams {
  to: string,
  value: string,
  data: string,
}
