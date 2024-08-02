import request from 'axios'
import { encryptedData } from '@/utils/encrypt'
import { loginRSA, tokenName } from '@/config'

export async function login(data) {
  if (loginRSA) {
    data = await encryptedData(data)
  }
  return request({
    url: '/oauth/login',
    method: 'post',
    data,
  })
}

export function getUserInfo(accessToken) {
  return request({
    url: '/oauth',
    method: 'post',
    data: {
      [tokenName]: accessToken,
    },
  })
}

export function getUserOptToken() {
  return request({
    url: '/oauth/otpToken',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/logout',
    method: 'post',
  })
}

export function register(data) {
  return request({
    url: '/oauth/register',
    method: 'post',
    data
  })
}
export function forgotPwApply(data) {
  return request({
    url: '/oauth/forgotPwApply',
    method: 'post',
    data
  })
}
export function resetpw(data) {
  return request({
    url: '/oauth/resetpw',
    method: 'post',
    data
  })
}

export function resendVerification(userName) {
  return request({
    url: '/oauth/sendVerificationEmail?userName='+userName,
    method: 'get'
  })
}
