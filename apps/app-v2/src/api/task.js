import request from 'axios'

export function getTaskNav(resourceId, params) {
  const url = "/resource/" + resourceId + "/nav"
  return request({
    url,
    method: 'get',
    params,
  })
}

export function getAnnotationListData(resourceId, userId) {
  const url = "/resource/" + resourceId + "/layer/" + userId + "/annotation"
  return request({
    url,
    method: 'get',
  })
}

export function saveAnnotationListData(resourceId, userId, data) {
  const url = "/resource/" + resourceId + "/layer/" + userId + "/annotation"
  return request({
    url,
    method: 'put',
    data: data,
  })
}

export function getAnnotationRelationListData(resourceId, userId) {
  const url = "/resource/" + resourceId + "/layer/" + userId + "/annotationRelation"
  return request({
    url,
    method: 'get',
  })
}

export function saveAnnotationRelationListData(resourceId, userId, data) {
  const url = "/resource/" + resourceId + "/layer/" + userId + "/annotationRelation"
  return request({
    url,
    method: 'put',
    data: data,
  })
}

export function completeTask(resourceId, userId) {
  const url = "/resource/" + resourceId + "/layer/" + userId + "/complete"
  return request({
    url,
    method: 'get',
  })
}
