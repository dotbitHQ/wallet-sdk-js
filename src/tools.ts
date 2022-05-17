// @ts-ignore
import numberToBN from 'number-to-bn'
import BN from 'bn.js'
import utf8 from 'utf8'

/**
 * Check if string is HEX, requires a 0x in front
 *
 * @method isHexStrict
 * @param {String} hex to be checked
 * @returns {Boolean}
 */
export function isHexStrict(hex: string | number) {
  return (typeof hex === 'string' || typeof hex === 'number') && /^(-)?0x[0-9a-f]*$/i.test(String(hex))
}

/**
 * Takes an input and transforms it into an BN
 *
 * @method toBN
 * @param {Number|String|BN} number, string, HEX string or BN
 * @return {BN} BN
 */
export function toBN(number: number | string): BN {
  try {
    // eslint-disable-next-line
    return numberToBN.apply(null, arguments)
  } catch (e) {
    throw new Error(e + ' Given value: "' + number + '"')
  }
}

/**
 * Converts value to it's number representation
 *
 * @method hexToNumber
 * @param {String|Number|BN} value
 * @return {String}
 */
export function hexToNumber(value: string | number): string | number {
  if (!value) {
    return value
  }

  if (typeof value === 'string' && !isHexStrict(value)) {
    throw new Error('Given value "' + value + '" is not a valid hex string.')
  }

  return toBN(value).toNumber()
}

/**
 * Converts value to it's hex representation
 *
 * @method numberToHex
 * @param {String|Number|BN} value
 * @return {String}
 */
export function numberToHex(value: number | string): string {
  if (value === null || value === undefined) {
    return value
  }

  if (!isFinite(Number(value)) && !isHexStrict(value)) {
    throw new Error('Given input "' + value + '" is not a number.')
  }

  const number = toBN(value)
  const result = number.toString(16)

  return number.lt(new BN(0)) ? '-0x' + result.slice(1) : '0x' + result
}

/**
 * Should be called to get hex representation (prefixed by 0x) of utf8 string
 *
 * @method utf8ToHex
 * @param {String} str
 * @returns {String} hex representation of input string
 */
export function utf8ToHex(str: string): string {
  str = utf8.encode(str)
  let hex = ''

  // remove \u0000 padding from either side
  str = str.replace(/^(?:\u0000)*/, '')
  str = str.split('').reverse().join('')
  str = str.replace(/^(?:\u0000)*/, '')
  str = str.split('').reverse().join('')

  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i)
    // if (code !== 0) {
    const n = code.toString(16)
    hex += n.length < 2 ? '0' + n : n
    // }
  }

  return '0x' + hex
}

/**
 * Convert a hexadecimal chainId to decimal
 * @param chainId
 */
export function chainIdHexToNumber(chainId: string | number): number {
  const _chainId = isHexStrict(chainId) ? hexToNumber(chainId) : chainId
  return Number(_chainId)
}
