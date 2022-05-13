import Web3 from 'web3'
import {
  ChainId,
  ChainIdToChainInfoMap,
  ChainIdToCoinTypeMap,
  CoinType,
  ErrorCode,
  TronLinkRequestAccountsResponseCode,
  WalletProtocol,
} from './const'
import { chainIdHexToNumber } from './tools'
import { IConnectRes, ISendTrxParams, ITronLinkRequestAccountsResponse, IWalletsParams } from './types'

export class Wallets {
  provider: any
  chainId: ChainId | undefined
  address: string | undefined
  coinType: CoinType | undefined
  walletProtocol: WalletProtocol

  constructor({ provider, coinType, chainId, walletProtocol }: IWalletsParams) {
    this.provider = provider
    this.chainId = chainId
    this.coinType = coinType
    this.walletProtocol = walletProtocol
  }

  async connect(): Promise<IConnectRes | undefined> {
    let res = undefined
    if (this.walletProtocol === WalletProtocol.metaMask) {
      res = await this.metaMaskConnect()
    } else if (this.walletProtocol === WalletProtocol.torus) {
      res = await this.torusConnect()
    } else if (this.walletProtocol === WalletProtocol.tronLink) {
      res = await this.tronLinkConnect()
    }
    return res
  }

  async signData(data: string | any, isEIP712?: boolean): Promise<string> {
    let res = ''
    switch (this.walletProtocol) {
      case WalletProtocol.metaMask:
      case WalletProtocol.torus:
        res = await this.evmSignData(data, isEIP712)
        break
      case WalletProtocol.tronLink:
        res = await this.tronLinkSign(data)
        break
    }
    return res
  }

  async sendTrx(data: ISendTrxParams): Promise<string> {
    let txhash = ''
    switch (this.walletProtocol) {
      case WalletProtocol.metaMask:
      case WalletProtocol.torus:
        txhash = await this.evmSendTrx(data)
        break
      case WalletProtocol.tronLink:
        txhash = await this.tronLinkSendTrx(data)
        break
    }
    return txhash
  }

  async metaMaskConnect(): Promise<IConnectRes> {
    try {
      const net_version = await this.provider.request({ method: 'net_version' })
      const eth_chainId = await this.provider.request({ method: 'eth_chainId' })
      const _chainId = chainIdHexToNumber(net_version || eth_chainId)
      const res = await this.provider.request({ method: 'eth_requestAccounts' })
      this.address = res[0]
      return {
        coinType: ChainIdToCoinTypeMap[_chainId],
        chainId: _chainId,
        address: this.address,
      }
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  async torusConnect(): Promise<IConnectRes> {
    debugger
    try {
      const net_version = await this.provider.request({ method: 'net_version' })
      const eth_chainId = await this.provider.request({ method: 'eth_chainId' })
      const _chainId = chainIdHexToNumber(net_version || eth_chainId)
      const res = await this.provider.request({ method: 'eth_requestAccounts' })
      this.address = res[0]
      return {
        coinType: ChainIdToCoinTypeMap[_chainId],
        chainId: _chainId,
        address: this.address,
      }
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  async tronLinkConnect(): Promise<IConnectRes> {
    try {
      if (this.provider.request) {
        const res: ITronLinkRequestAccountsResponse = await this.provider.request({
          method: 'tron_requestAccounts',
        })

        if (res.code === TronLinkRequestAccountsResponseCode.ok) {
          this.address = this.provider.defaultAddress.base58
          return {
            coinType: CoinType.trx,
            chainId: undefined,
            address: this.address,
          }
        }
        const error: any = new Error(res.message)
        error.code = res.message
        throw error
      } else {
        this.address = this.provider.defaultAddress.base58
        return {
          coinType: CoinType.trx,
          chainId: undefined,
          address: this.address,
        }
      }
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  async metaMaskSwitchChain(chainId: number) {
    const chainIdHex = Web3.utils.numberToHex(chainId)
    const info = ChainIdToChainInfoMap[chainId]
    info.chainId = chainIdHex

    try {
      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [
          {
            chainId: chainIdHex,
          },
        ],
      })
    } catch (error: any) {
      console.error(error)
      if (error.code === ErrorCode.metaMaskUserRejectedTheRequest) {
        throw error
      } else {
        try {
          await this.provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: chainIdHex,
                chainName: info.networkName,
                nativeCurrency: {
                  name: info.symbol,
                  symbol: info.symbol,
                  decimals: info.decimals,
                },
                rpcUrls: [info.rpcUrl],
                blockExplorerUrls: [info.blockExplorerUrl],
              },
            ],
          })
        } catch (addError) {
          console.error(addError)
          throw addError
        }
      }
    }
  }

  async evmSignData(data: string | any, isEIP712?: boolean): Promise<string> {
    try {
      let res
      if (isEIP712) {
        res = await this.provider.request({
          method: 'eth_signTypedData_v4',
          params: [this.address, JSON.stringify(data)],
        })
      } else {
        res = await this.provider.request({
          method: 'personal_sign',
          params: [data, this.address],
        })
      }
      return res
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  async ethSign(data: string): Promise<string> {
    try {
      return await this.provider.request({
        method: 'eth_sign',
        params: [this.address, data],
      })
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  async tronLinkSign(data: string | any): Promise<string> {
    try {
      return await this.provider.trx.sign(data)
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  async evmSendTrx({ to, value, data }: ISendTrxParams): Promise<string> {
    const _from = this.address
    const _data = Web3.utils.utf8ToHex(data)
    const _value = Web3.utils.numberToHex(value)
    try {
      return await this.provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: _from,
            to,
            value: _value,
            data: _data,
            gas: Web3.utils.numberToHex('25000'),
          },
        ],
      })
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  async tronLinkSendTrx({ to, value, data }: ISendTrxParams): Promise<string> {
    const _from = this.address
    try {
      let res = await this.provider.transactionBuilder.sendTrx(to, value, _from)
      res = await this.provider.transactionBuilder.addUpdateData(res, data)
      res = await this.provider.trx.sign(res)
      res = await this.provider.trx.sendRawTransaction(res)
      return res
    } catch (err) {
      console.error(err)
      throw err
    }
  }
}
