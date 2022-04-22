import Web3 from 'web3'

/**
 * Convert a hexadecimal chainId to decimal
 * @param chainId
 */
export function chainIdHexToNumber (chainId: string | number): number {
  const _chainId = Web3.utils.isHexStrict(chainId) ? Web3.utils.hexToNumber(chainId) : chainId
  return Number(_chainId)
}
