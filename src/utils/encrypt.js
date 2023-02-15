import { JSEncrypt } from 'jsencrypt'
import { getPublicKey } from '@/api/publicKey'

const privateKey =
  'privateKey'

export async function encryptedData(data) {
  let publicKey = ''
  const res = await getPublicKey()
  publicKey = res.data.publicKey
  if (res.data.mockServer) {
    publicKey = ''
  }
  if (publicKey == '') {
    return data
  }
  const encrypt = new JSEncrypt()
  encrypt.setPublicKey(
    `-----BEGIN PUBLIC KEY-----${publicKey}-----END PUBLIC KEY-----`
  )
  data = encrypt.encrypt(JSON.stringify(data))
  return {
    param: data,
  }
}

export function decryptedData(data) {
  const decrypt = new JSEncrypt()
  decrypt.setPrivateKey(
    `-----BEGIN RSA PRIVATE KEY-----${privateKey}-----END RSA PRIVATE KEY-----`
  )
  data = decrypt.decrypt(JSON.stringify(data))
  return data
}
