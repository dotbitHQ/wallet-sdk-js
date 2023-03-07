import {
  ChainId,
  ChainIdToChainInfoMap,
  ChainIdToCoinTypeMap,
  CoinType,
  ErrorCode,
  TronLinkRequestAccountsResponseCode,
  WalletProtocol,
} from './const'
import { chainIdHexToNumber, isHexStrict, numberToHex, utf8ToHex, toChecksumAddress } from './tools'
import {
  IConnectRes,
  ISendTrxParams,
  ITronLinkRequestAccountsResponse,
  IWalletsParams,
} from './types'

declare const window: any

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
    } else if (this.walletProtocol === WalletProtocol.tokenPocketUTXO) {
      res = await this.tokenPocketDogeCoinConnect()
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
      case WalletProtocol.tokenPocketUTXO:
        res = await this.tokenPocketUTXOSign(data)
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
      case WalletProtocol.tokenPocketUTXO:
        txhash = await this.tokenPocketUTXOSendTrx(data)
        break
    }
    return txhash
  }

  async metaMaskConnect(): Promise<IConnectRes> {
    try {
      const net_version = this.provider.networkVersion
      const eth_chainId = this.provider.chainId
      const _chainId = chainIdHexToNumber(net_version || eth_chainId)
      const res = await this.provider.request({ method: 'eth_requestAccounts' })
      this.address = toChecksumAddress(res[0])
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
    try {
      const net_version = this.provider.networkVersion
      const eth_chainId = this.provider.chainId
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
        error.code = res.code
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

  async tokenPocketDogeCoinConnect(): Promise<IConnectRes> {
    try {
      const res = await this.provider.request({
        method: 'btc_accounts',
      })
      const _chainId = await this.provider.request({
        method: 'btc_chainId',
      })
      this.address = res[0]
      return {
        coinType: CoinType.doge,
        chainId: _chainId,
        address: this.address,
      }
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  async metaMaskSwitchChain(chainId: number) {
    const chainIdHex = numberToHex(chainId)
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
        let _data = data
        if (isHexStrict('0x' + data)) {
          _data = '0x' + data
        }
        res = await this.provider.request({
          method: 'personal_sign',
          params: [_data, this.address],
        })
      }
      debugger
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
      const res = await this.provider.trx.sign(data)
      return res
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  async tokenPocketUTXOSign(data: string | any): Promise<string> {
    try {
      const res = await this.provider.request({
        method: 'btc_signMessage',
        params: [data, this.address],
      })
      return res
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  async evmSendTrx({ to, value, data }: ISendTrxParams): Promise<string> {
    const _from = this.address
    const _data = utf8ToHex(data)
    const _value = numberToHex(value)
    try {
      return await this.provider.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: _from,
            to,
            value: _value,
            data: _data,
            gas: numberToHex('25000'),
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
      return res.txid
    } catch (err) {
      console.error(err)
      throw err
    }
  }
  // https://github.com/TP-Lab/tp-js-sdk/blob/master/src/tp.js#LL924C16-L924C16
  async tokenPocketUTXOSendTrx({ to, value }: ISendTrxParams): Promise<string> {
    const from = this.address
    const params = { from, to, amount: value }
    try {
      if (!params.from || !params.to || !params.amount) {
        throw new Error('missing params; "from", "to", "amount" is required ');
      }

      return new Promise(function (resolve, reject) {
        const random = parseInt(Math.random() * 100000 + '')
        const tpCallbackFun = 'tp_callback_' + new Date().getTime() + random

        window[tpCallbackFun] = function (result: any) {
          result = result.replace(/\r/gi, '').replace(/\n/gi, '')
          try {
            const res = JSON.parse(result)
            if (res.result) {
              resolve(res.data)
            } else {
              reject(res.message)
            }
          } catch (e) {
            reject(e)
          }
        }

        if (window.TPJSBrigeClient) {
          window.TPJSBrigeClient.callMessage('btcTokenTransfer', JSON.stringify(params), tpCallbackFun)
        }
        // ios
        if (window.webkit) {
          window.webkit.messageHandlers['btcTokenTransfer'].postMessage({
            body: {
              params: JSON.stringify(params),
              callback: tpCallbackFun,
            },
          })
        }
      })
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  async request({ method, params }: { method: string; params?: any }): Promise<any> {
    try {
      return await this.provider.request({
        method: method,
        params: params,
      })
    } catch (err) {
      console.error(err)
      throw err
    }
  }
}
