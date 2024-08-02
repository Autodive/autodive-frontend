import request from 'axios'

export function getRouterList(data) {
  return request({
    url: '/menu/navigate',
    method: 'post',
    data,
  })
}
