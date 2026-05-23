import request from '@/utils/request'

const authBaseURL = process.env.VUE_APP_AUTH_BASE_API || process.env.VUE_APP_BASE_API

export function login(data) {
  return request({
    baseURL: authBaseURL,
    url: '/auth/login',
    method: 'post',
    skipLegacyToken: true,
    data: {
      code: data.username.trim()
    }
  })
}

export function getInfo() {
  return request({
    baseURL: authBaseURL,
    url: '/auth/me',
    skipLegacyToken: true,
    method: 'get'
  })
}

export function logout() {
  return Promise.resolve({ code: 0 })
}
