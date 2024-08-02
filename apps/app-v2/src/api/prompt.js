import request from 'axios'

export function createPrompt(data, projectId) {
  return request({
    url: `/project/${projectId}/prompt`,
    method: 'post',
    data,
  })
}
export function getPromptList(params, projectId) {
  return request({
    url: `/project/${projectId}/prompt`,
    method: 'get',
    params,
  })
}
export function delPrompt(id, projectId) {
  return request({
    url: `/project/${projectId}/prompt/${id}`,
    method: 'delete',
  })
}
export function editPrompt(data, projectId, id) {
  return request({
    url: `/project/${projectId}/prompt/${id}`,
    method: 'put',
    data
  })
}
