export enum WalletProtocol {
  metaMask = 'metaMask',
  tronLink = 'tronLink',
  torus = 'torus',
  tokenPocketUTXO = 'tokenPocketUTXO',
  uniSign = 'uniSign',
  walletConnect = 'walletConnect',
}

export enum ErrorCode {
  metaMaskUserRejectedTheRequest = 4001,
}

// EVM-based Chains https://github.com/satoshilabs/slips/blob/master/slip-0044.md
export enum ChainId {
  eth = 1,
  ethHolesky = 17000,
  bsc = 56,
  bscTestnet = 97,
  polygon = 137,
  polygonMumbai = 80001,
}

// SLIP-0044 : Registered coin types for BIP-0044 https://github.com/ethereum-lists/chains
export enum CoinType {
  btc = '0',
  doge = '3',
  eth = '60',
  trx = '195',
  ckb = '309',
  bsc = '9006',
  matic = '966',
}

export const ChainIdToCoinTypeMap: { [key: string]: CoinType } = {
  [ChainId.eth]: CoinType.eth,
  [ChainId.ethHolesky]: CoinType.eth,
  [ChainId.bsc]: CoinType.bsc,
  [ChainId.bscTestnet]: CoinType.bsc,
  [ChainId.polygon]: CoinType.matic,
  [ChainId.polygonMumbai]: CoinType.matic,
}

export enum TronLinkRequestAccountsResponseCode {
  ok = 200,
  inQueue = 4000,
  userRejected = 4001,
}

export const ChainIdToChainInfoMap: { [key: string]: any } = {
  [ChainId.eth]: {
    networkName: 'Ethereum Mainnet',
    symbol: 'ETH',
    decimals: 18,
    rpcUrl: 'https://mainnet.infura.io/v3/',
    blockExplorerUrl: 'https://etherscan.io',
  },
  [ChainId.ethHolesky]: {
    networkName: 'Ethereum Holesky Testnet',
    symbol: 'ETH',
    decimals: 18,
    rpcUrl: 'https://rpc.ankr.com/eth_holesky/',
    blockExplorerUrl: 'https://holesky.etherscan.io',
  },
  [ChainId.bsc]: {
    networkName: 'Binance Smart Chain Mainnet',
    symbol: 'BNB',
    decimals: 18,
    rpcUrl: 'https://bsc-dataseed1.binance.org',
    blockExplorerUrl: 'https://bscscan.com',
  },
  [ChainId.bscTestnet]: {
    networkName: 'Binance Smart Chain Testnet',
    symbol: 'BNB',
    decimals: 18,
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    blockExplorerUrl: 'https://testnet.bscscan.com',
  },
  [ChainId.polygon]: {
    networkName: 'Polygon Mainnet',
    symbol: 'MATIC',
    decimals: 18,
    rpcUrl: 'https://polygon-rpc.com/',
    blockExplorerUrl: 'https://polygonscan.com',
  },
  [ChainId.polygonMumbai]: {
    networkName: 'Polygon Testnet Mumbai',
    symbol: 'MATIC',
    decimals: 18,
    rpcUrl: 'https://matic-mumbai.chainstacklabs.com',
    blockExplorerUrl: 'https://mumbai.polygonscan.com',
  },
}
