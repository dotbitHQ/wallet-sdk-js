import { ethers } from 'ethers'
import { ChainId, CoinType, WalletProtocol, Wallets } from '../src'

// const randomNumber = ethers.utils.randomBytes(32)
// const bigNumber = ethers.BigNumber.from(randomNumber)
// const privateKey = bigNumber.toHexString()
// console.log(privateKey) // 0xc5d522c829fd4c6b6f86d541b13ff53fdfb0b98d381f458a1f22dc1097408eae
const PrivateKey = '0xc5d522c829fd4c6b6f86d541b13ff53fdfb0b98d381f458a1f22dc1097408eae'
const Address = '0x553260D04A3aA8354f727935F63225FA48D928fD'

describe('#constructor', () => {
  it('a correct Wallet instance', () => {
    const etherWallet = new ethers.Wallet(PrivateKey, ethers.getDefaultProvider('holesky'))
    const wallet = new Wallets({
      provider: etherWallet.provider,
      coinType: CoinType.eth,
      chainId: ChainId.ethHolesky,
      walletProtocol: WalletProtocol.metaMask,
    })
    expect(etherWallet.address).toBe(Address)
    expect(wallet).toBeInstanceOf(Wallets)
  })
})
