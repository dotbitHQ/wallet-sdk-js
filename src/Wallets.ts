import Web3 from 'web3'
import { chainIdHexToNumber } from './tools'
import { IWalletsParams, ISendTrxParams } from './types'
import { ChainId, WalletsName } from './const'

export class Wallets {
  provider: any
  walletName: WalletsName
  chainId: number | undefined
  addresses: string[] = []

  constructor ({
                 provider,
                 walletName,
                 chainId
               }: IWalletsParams) {
    this.provider = provider
    this.walletName = walletName
    this.chainId = chainId
  }

  async connect (): Promise<string[]>  {
    let res: string[] = []
    if (this.walletName === WalletsName.metaMask) {
      res = await this.metaMaskConnect()
    }
    else if (this.walletName === WalletsName.torus) {
      res = await this.torusConnect()
    }
    else if (this.walletName === WalletsName.tronLink) {
      res = await this.tronLinkConnect()
    }
    this.addresses = res
    return res
  }

  async signData (data: string | object, isEIP712?: boolean): Promise<string> {
    switch (this.walletName) {
      case WalletsName.metaMask:
        return await this.evmSignData(this.provider, data, isEIP712)
      case WalletsName.torus:
        return await this.evmSignData(this.provider.ethereum, data, isEIP712)
      case WalletsName.tronLink:
        return await this.tronLinkSign(data)
    }
  }

  async sendTrx (data: ISendTrxParams): Promise<string> {
    let txhash = ''
    switch (this.walletName) {
      case WalletsName.metaMask:
        txhash = await this.evmSendTrx(this.provider, data)
        break
      case WalletsName.torus:
        txhash = await this.evmSendTrx(this.provider.ethereum, data)
        break
      case WalletsName.tronLink:
        txhash = await this.tronLinkSendTrx(data)
        break
    }
    return txhash
  }

  async metaMaskConnect (): Promise<string[]> {
    try {
      const net_version = await this.provider.request({ method: 'net_version' })
      const eth_chainId = await this.provider.request({ method: 'eth_chainId' })
      const _chainId = chainIdHexToNumber(net_version || eth_chainId)
      if (this.chainId && this.chainId !== _chainId) {
        await this.metaMaskSwitchChain(this.chainId)
      }
      const res = await this.provider.request({ method: 'eth_requestAccounts' })
      return res
    }
    catch (err) {
      console.error(err)
      throw err
    }
  }

  async metaMaskSwitchChain (chainId: number) {
    let info: any = {}
    const chainIdHex = Web3.utils.numberToHex(chainId)
    switch (chainId) {
      case ChainId.eth:
        info = {
          chainId: chainIdHex,
          networkName: 'Ethereum Mainnet',
          symbol: 'ETH',
          decimals: 18,
          rpcUrl: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
          blockExplorerUrl: 'https://etherscan.io'
        }
        break
      case ChainId.ethGoerli:
        info = {
          chainId: chainIdHex,
          networkName: 'Ethereum Goerli Testnet',
          symbol: 'ETH',
          decimals: 18,
          rpcUrl: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
          blockExplorerUrl: 'https://goerli.etherscan.io'
        }
        break
      case ChainId.bsc:
        info = {
          chainId: chainIdHex,
          networkName: 'Binance Smart Chain Mainnet',
          symbol: 'BNB',
          decimals: 18,
          rpcUrl: 'https://bsc-dataseed3.binance.org',
          blockExplorerUrl: 'https://bscscan.com'
        }
        break
      case ChainId.bscTestnet:
        info = {
          chainId: chainIdHex,
          networkName: 'Binance Smart Chain Testnet',
          symbol: 'BNB',
          decimals: 18,
          rpcUrl: 'https://data-seed-prebsc-1-s2.binance.org:8545',
          blockExplorerUrl: 'https://testnet.bscscan.com'
        }
        break
      case ChainId.polygon:
        info = {
          chainId: chainIdHex,
          networkName: 'Polygon Mainnet',
          symbol: 'MATIC',
          decimals: 18,
          rpcUrl: 'https://matic-mainnet-full-rpc.bwarelabs.com',
          blockExplorerUrl: 'https://polygonscan.com'
        }
        break
      case ChainId.polygonMumbai:
        info = {
          chainId: chainIdHex,
          networkName: 'Polygon Testnet Mumbai',
          symbol: 'MATIC',
          decimals: 18,
          rpcUrl: 'https://matic-mumbai.chainstacklabs.com',
          blockExplorerUrl: 'https://mumbai.polygonscan.com'
        }
        break
    }

    try {
      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{
          chainId: chainIdHex
        }]
      })
    }
    catch (error: any) {
      console.error(error)
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
                decimals: info.decimals
              },
              rpcUrls: [info.rpcUrl],
              blockExplorerUrls: [info.blockExplorerUrl]
            }
          ]
        })
      }
      catch (addError) {
        console.error(addError)
        throw addError
      }
    }
  }

  async torusConnect () {
    let host = 'mainnet'
    switch (this.chainId) {
      case ChainId.eth:
        host = 'mainnet'
        break
      case ChainId.ethGoerli:
        host = 'goerli'
        break
      case ChainId.bsc:
        host = 'bsc_mainnet'
        break
      case ChainId.bscTestnet:
        host = 'bsc_testnet'
        break
      case ChainId.polygon:
        host = 'matic'
        break
      case ChainId.polygonMumbai:
        host = 'mumbai'
        break
    }

    try {
      if (!this.provider) {
        await this.provider.init({
          showTorusButton: true,
          useLocalStorage: true,
          network: {
            host: host
          }
        })
        await this.provider.login()
      }
      const net_version = await this.provider.ethereum.request({ method: 'net_version' })
      const eth_chainId = await this.provider.ethereum.request({ method: 'eth_chainId' })
      const _chainId = chainIdHexToNumber(net_version || eth_chainId)
      if (this.chainId && this.chainId !== _chainId) {
        await this.provider.setProvider({
          host: host
        })
      }
      const res = await this.provider.ethereum.request({ method: 'eth_requestAccounts' })
      return res
    }
    catch (err) {
      console.error(err)
      throw err
    }
  }

  async tronLinkConnect (): Promise<string[]> {
    const account = this.provider.defaultAddress.base58
    return [account]
  }

  async evmSignData (provider: any, data: string | object, isEIP712?: boolean): Promise<string> {
    try {
      const address = this.addresses[0]
      let res = ''
      if (isEIP712) {
        res = await provider.request({
          method: 'eth_signTypedData_v4',
          params: [address, JSON.stringify(data)]
        })
      }
      else {
        res = await provider.request({
          method: 'personal_sign',
          params: [data, address]
        })
      }
      return res
    }
    catch (err) {
      console.error(err)
      throw err
    }
  }

  async ethSign (provider: any, data: string): Promise<string> {
    try {
      const res = await provider.request({
        method: 'eth_sign',
        params: [this.addresses[0], data]
      })
      return res
    }
    catch (err) {
      console.error(err)
      throw err
    }
  }

  async tronLinkSign (data: string | object): Promise<string> {
    try {
      const res = await this.provider.trx.sign(data)
      return res
    }
    catch (err) {
      console.error(err)
      throw err
    }
  }

  async evmSendTrx (provider: any, { to, value, data }: ISendTrxParams): Promise<string> {
    const _from = this.addresses[0]
    const _data = Web3.utils.utf8ToHex(data)
    const _value = Web3.utils.numberToHex(value)
    try {
      const res = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: _from,
          to,
          value: _value,
          data: _data,
          gas: Web3.utils.numberToHex('25000')
        }]
      })
      return res
    }
    catch (err) {
      console.error(err)
      throw err
    }
  }

  async tronLinkSendTrx ({ to, value, data }: ISendTrxParams): Promise<string> {
    const _from = this.addresses[0]
    try {
      let res = await this.provider.transactionBuilder.sendTrx(to, value, _from)
      res = await this.provider.transactionBuilder.addUpdateData(res, data)
      res = await this.provider.trx.sign(res)
      res = await this.provider.trx.sendRawTransaction(res)
      return res
    }
    catch (err) {
      console.error(err)
      throw err
    }
  }
}
