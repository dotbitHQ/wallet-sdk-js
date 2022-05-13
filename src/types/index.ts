import { ChainId, CoinType, TronLinkRequestAccountsResponseCode, WalletProtocol } from '../const'

export interface IWalletsParams {
  provider: any
  coinType: CoinType
  walletProtocol: WalletProtocol
  chainId?: ChainId
}

export interface ISendTrxParams {
  to: string
  value: string
  data: string
}

export interface IConnectRes {
  coinType: CoinType
  chainId: ChainId | undefined
  address: string | undefined
}

// source: https://developers.tron.network/docs/introduction
export interface ITronLinkRequestAccountsResponse {
  code: TronLinkRequestAccountsResponseCode
  message: string
}
