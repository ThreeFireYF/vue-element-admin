import request from '@/utils/request'

const adminBaseURL = process.env.VUE_APP_AUTH_BASE_API || process.env.VUE_APP_BASE_API

function createAdminListRequest(url, params) {
  return request({
    baseURL: adminBaseURL,
    url,
    method: 'get',
    params,
    skipLegacyToken: true
  })
}

function createAdminDetailRequest(url) {
  return request({
    baseURL: adminBaseURL,
    url,
    method: 'get',
    skipLegacyToken: true
  })
}

function createAdminWriteRequest(url, method, data) {
  return request({
    baseURL: adminBaseURL,
    url,
    method,
    data,
    skipLegacyToken: true
  })
}

export function getAdminUsers(params) {
  return createAdminListRequest('/admin/users', params)
}

export function getAdminRegions(params) {
  return createAdminListRequest('/admin/regions', params)
}

export function getAdminStores(params) {
  return createAdminListRequest('/admin/stores', params)
}

export function getAdminCategories(params) {
  return createAdminListRequest('/admin/categories', params)
}

export function getAdminAmendRequests(params) {
  return createAdminListRequest('/admin/amend-requests', params)
}

export function getAdminPermissions() {
  return createAdminDetailRequest('/admin/permissions')
}

export function getAdminRoles() {
  return createAdminDetailRequest('/admin/roles')
}

export function getAdminUserDetail(id) {
  return createAdminDetailRequest(`/admin/users/${id}`)
}

export function getAdminRegionDetail(id) {
  return createAdminDetailRequest(`/admin/regions/${id}`)
}

export function getAdminStoreDetail(id) {
  return createAdminDetailRequest(`/admin/stores/${id}`)
}

export function getAdminCategoryDetail(id) {
  return createAdminDetailRequest(`/admin/categories/${id}`)
}

export function createAdminUser(data) {
  return createAdminWriteRequest('/admin/users', 'post', data)
}

export function updateAdminUser(id, data) {
  return createAdminWriteRequest(`/admin/users/${id}`, 'patch', data)
}

export function deleteAdminUser(id) {
  return createAdminWriteRequest(`/admin/users/${id}`, 'delete')
}

export function createAdminRegion(data) {
  return createAdminWriteRequest('/admin/regions', 'post', data)
}

export function updateAdminRegion(id, data) {
  return createAdminWriteRequest(`/admin/regions/${id}`, 'patch', data)
}

export function deleteAdminRegion(id) {
  return createAdminWriteRequest(`/admin/regions/${id}`, 'delete')
}

export function createAdminStore(data) {
  return createAdminWriteRequest('/admin/stores', 'post', data)
}

export function updateAdminStore(id, data) {
  return createAdminWriteRequest(`/admin/stores/${id}`, 'patch', data)
}

export function deleteAdminStore(id) {
  return createAdminWriteRequest(`/admin/stores/${id}`, 'delete')
}

export function createAdminCategory(data) {
  return createAdminWriteRequest('/admin/categories', 'post', data)
}

export function updateAdminCategory(id, data) {
  return createAdminWriteRequest(`/admin/categories/${id}`, 'patch', data)
}

export function deleteAdminCategory(id) {
  return createAdminWriteRequest(`/admin/categories/${id}`, 'delete')
}

export function approveAdminAmendRequest(id, data) {
  return createAdminWriteRequest(`/admin/amend-requests/${id}/approve`, 'post', data)
}

export function rejectAdminAmendRequest(id, data) {
  return createAdminWriteRequest(`/admin/amend-requests/${id}/reject`, 'post', data)
}

export function getRegionBrands() {
  return request({
    baseURL: adminBaseURL,
    url: '/region/brands',
    method: 'get',
    skipLegacyToken: true
  })
}
