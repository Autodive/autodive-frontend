import request from '@/init/request'

export function getPublicKey() {
  return request({
    url: '/publicKey',
    method: 'post',
  })
}
