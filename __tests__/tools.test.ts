// @ts-ignore
import numberToBN from 'number-to-bn'
import { chainIdHexToNumber, hexToNumber, isHexStrict, numberToHex, toBN, utf8ToHex } from '../src'

describe('isHexStrict', () => {
  it('0x1(string) is hex: true', () => {
    const res = isHexStrict('0x1')
    expect(res).toBeTruthy()
  })

  it('0x1(number) is hex: false', () => {
    const res = isHexStrict(0x1)
    expect(res).toBeFalsy()
  })

  it('1(string) is hex: false', () => {
    const res = isHexStrict('1')
    expect(res).toBeFalsy()
  })

  it('1(number) is hex: false', () => {
    const res = isHexStrict(1)
    expect(res).toBeFalsy()
  })
})

describe('toBN', () => {
  it('1(string) is BN', () => {
    const value = '1'
    const res = toBN(value)
    expect(res).toEqual(numberToBN(value))
  })

  it('0x1(string) is 1', () => {
    const value = '0x1'
    const res = toBN(value).toNumber()
    expect(res).toBe(numberToBN(value).toNumber())
  })

  it('test(string) throw error', () => {
    expect(() => {
      toBN('test')
    }).toThrow(/Given value/)
  })
})

describe('hexToNumber', () => {
  it('0x1(string) is 1', () => {
    const value = '0x1'
    const toBeValue = 1
    const res = hexToNumber(value)
    expect(res).toBe(toBeValue)
  })

  it('0x1(number) is 1', () => {
    const value = 0x1
    const toBeValue = 1
    const res = hexToNumber(value)
    expect(res).toBe(toBeValue)
  })

  it('1(string) throw error', () => {
    expect(() => {
      hexToNumber('1')
    }).toThrow(/Given value/)
  })
})

describe('numberToHex', () => {
  it('1(string) is 0x1', () => {
    const value = '1'
    const toBeValue = '0x1'
    const res = numberToHex(value)
    expect(res).toBe(toBeValue)
  })

  it('1(number) is 0x1', () => {
    const value = 1
    const toBeValue = '0x1'
    const res = numberToHex(value)
    expect(res).toBe(toBeValue)
  })

  it('NaN throw error', () => {
    expect(() => {
      numberToHex(NaN)
    }).toThrow(/Given input/)
  })
})

describe('utf8ToHex', () => {
  it('1(string) is 0x31', () => {
    const value = '1'
    const toBeValue = '0x31'
    const res = utf8ToHex(value)
    expect(res).toBe(toBeValue)
  })

  it('测 试(string) is 0xe6b58b20e8af95', () => {
    const value = '测 试'
    const toBeValue = '0xe6b58b20e8af95'
    const res = utf8ToHex(value)
    expect(res).toBe(toBeValue)
  })
})

describe('chainIdHexToNumber', () => {
  it('0x1(string) is 1', () => {
    const value = '0x1'
    const toBeValue = 1
    const res = chainIdHexToNumber(value)
    expect(res).toBe(toBeValue)
  })

  it('1(number) is 1', () => {
    const value = 1
    const toBeValue = 1
    const res = chainIdHexToNumber(value)
    expect(res).toBe(toBeValue)
  })
})
