export const PERMISSION_DEFINITIONS = Object.freeze([
  { id: 1, code: 'user.read', label: '查看后台用户列表/详情', scope: 'GET /admin/users' },
  { id: 2, code: 'user.create', label: '新增后台用户', scope: 'POST /admin/users' },
  { id: 3, code: 'user.update', label: '编辑后台用户', scope: 'PATCH /admin/users/:id' },
  { id: 4, code: 'user.delete', label: '删除后台用户', scope: 'DELETE /admin/users/:id' },
  { id: 5, code: 'region.read', label: '查看区域列表/详情', scope: 'GET /admin/regions' },
  { id: 6, code: 'region.create', label: '新增区域', scope: 'POST /admin/regions' },
  { id: 7, code: 'region.update', label: '编辑区域', scope: 'PATCH /admin/regions/:id' },
  { id: 8, code: 'region.delete', label: '删除区域', scope: 'DELETE /admin/regions/:id' },
  { id: 9, code: 'store.read', label: '查看门店列表/详情', scope: 'GET /admin/stores' },
  { id: 10, code: 'store.create', label: '新增门店', scope: 'POST /admin/stores' },
  { id: 11, code: 'store.update', label: '编辑门店', scope: 'PATCH /admin/stores/:id' },
  { id: 12, code: 'store.delete', label: '删除门店', scope: 'DELETE /admin/stores/:id' },
  { id: 13, code: 'category.read', label: '查看营收分类', scope: 'GET /admin/categories' },
  { id: 14, code: 'category.create', label: '新增营收分类', scope: 'POST /admin/categories' },
  { id: 15, code: 'category.update', label: '编辑营收分类', scope: 'PATCH /admin/categories/:id' },
  { id: 16, code: 'category.delete', label: '删除营收分类', scope: 'DELETE /admin/categories/:id' },
  { id: 17, code: 'record.read', label: '查看营收填报记录', scope: 'GET /store/records' },
  { id: 18, code: 'record.create', label: '提交营收填报', scope: 'POST /store/records' },
  { id: 19, code: 'amend.read', label: '查看补报/修正申请', scope: 'GET /amend-requests' },
  { id: 20, code: 'amend.create', label: '提交补报或修正申请', scope: 'POST /amend-requests' },
  { id: 21, code: 'amend.approve', label: '审批补报申请', scope: 'PATCH /admin/amend-requests/:id' },
  { id: 22, code: 'brand.read', label: '查看品牌列表', scope: '品牌管理页' },
  { id: 23, code: 'target.read', label: '查看月度目标', scope: 'GET /targets' },
  { id: 24, code: 'target.update', label: '设置/修改月度目标', scope: 'PATCH /admin/targets/:id' },
  { id: 25, code: 'role.read', label: '查看角色定义', scope: 'GET /admin/roles' }
])

export const PERMISSION_ID_MAP = Object.freeze({
  USER_READ: 1,
  USER_CREATE: 2,
  USER_UPDATE: 3,
  USER_DELETE: 4,
  REGION_READ: 5,
  REGION_CREATE: 6,
  REGION_UPDATE: 7,
  REGION_DELETE: 8,
  STORE_READ: 9,
  STORE_CREATE: 10,
  STORE_UPDATE: 11,
  STORE_DELETE: 12,
  CATEGORY_READ: 13,
  CATEGORY_CREATE: 14,
  CATEGORY_UPDATE: 15,
  CATEGORY_DELETE: 16,
  RECORD_READ: 17,
  RECORD_CREATE: 18,
  AMEND_READ: 19,
  AMEND_CREATE: 20,
  AMEND_APPROVE: 21,
  BRAND_READ: 22,
  TARGET_READ: 23,
  TARGET_UPDATE: 24,
  ROLE_READ: 25
})

export const MODULE_PERMISSION_IDS = Object.freeze({
  users: {
    read: PERMISSION_ID_MAP.USER_READ,
    create: PERMISSION_ID_MAP.USER_CREATE,
    update: PERMISSION_ID_MAP.USER_UPDATE,
    delete: PERMISSION_ID_MAP.USER_DELETE
  },
  regions: {
    read: PERMISSION_ID_MAP.REGION_READ,
    create: PERMISSION_ID_MAP.REGION_CREATE,
    update: PERMISSION_ID_MAP.REGION_UPDATE,
    delete: PERMISSION_ID_MAP.REGION_DELETE
  },
  stores: {
    read: PERMISSION_ID_MAP.STORE_READ,
    create: PERMISSION_ID_MAP.STORE_CREATE,
    update: PERMISSION_ID_MAP.STORE_UPDATE,
    delete: PERMISSION_ID_MAP.STORE_DELETE
  },
  categories: {
    read: PERMISSION_ID_MAP.CATEGORY_READ,
    create: PERMISSION_ID_MAP.CATEGORY_CREATE,
    update: PERMISSION_ID_MAP.CATEGORY_UPDATE,
    delete: PERMISSION_ID_MAP.CATEGORY_DELETE
  },
  amendRequests: {
    read: PERMISSION_ID_MAP.AMEND_READ,
    approve: PERMISSION_ID_MAP.AMEND_APPROVE
  }
})

export const ROUTE_PERMISSION_IDS = Object.freeze({
  systemSettings: [PERMISSION_ID_MAP.USER_READ, PERMISSION_ID_MAP.BRAND_READ, PERMISSION_ID_MAP.ROLE_READ],
  permissionSettings: [PERMISSION_ID_MAP.USER_READ, PERMISSION_ID_MAP.BRAND_READ, PERMISSION_ID_MAP.ROLE_READ],
  users: [PERMISSION_ID_MAP.USER_READ],
  roles: [PERMISSION_ID_MAP.ROLE_READ],
  brands: [PERMISSION_ID_MAP.BRAND_READ],
  organization: [PERMISSION_ID_MAP.REGION_READ, PERMISSION_ID_MAP.STORE_READ],
  regions: [PERMISSION_ID_MAP.REGION_READ],
  stores: [PERMISSION_ID_MAP.STORE_READ],
  revenue: [PERMISSION_ID_MAP.CATEGORY_READ],
  categories: [PERMISSION_ID_MAP.CATEGORY_READ],
  approval: [PERMISSION_ID_MAP.AMEND_READ],
  amendRequests: [PERMISSION_ID_MAP.AMEND_READ]
})

export const PERMISSION_LABEL_BY_CODE = Object.freeze(
  PERMISSION_DEFINITIONS.reduce((result, item) => {
    result[item.code] = item.label
    return result
  }, {})
)

export const PERMISSION_SCOPE_BY_CODE = Object.freeze(
  PERMISSION_DEFINITIONS.reduce((result, item) => {
    result[item.code] = item.scope
    return result
  }, {})
)

export const PERMISSION_BY_ID = Object.freeze(
  PERMISSION_DEFINITIONS.reduce((result, item) => {
    result[item.id] = item
    return result
  }, {})
)

export function normalizePermissionIds(permissionIds) {
  if (!Array.isArray(permissionIds)) {
    return []
  }

  return Array.from(
    new Set(
      permissionIds
        .map(id => Number(id))
        .filter(id => Number.isInteger(id) && id > 0)
    )
  )
}

export function hasAnyPermission(permissionIds, requiredPermissionIds) {
  const currentPermissionIds = normalizePermissionIds(permissionIds)
  const targetPermissionIds = normalizePermissionIds(requiredPermissionIds)

  if (targetPermissionIds.length === 0) {
    return true
  }

  if (currentPermissionIds.length === 0) {
    return false
  }

  const permissionIdSet = new Set(currentPermissionIds)
  return targetPermissionIds.some(id => permissionIdSet.has(id))
}

export function hasPermissionAccess(permissionIds, requiredPermissionIds, roles = []) {
  const normalizedRoles = Array.isArray(roles) ? roles : []
  const normalizedPermissionIds = normalizePermissionIds(permissionIds)

  if (normalizedRoles.includes('dhx-admin') && normalizedPermissionIds.length === 0) {
    return true
  }

  return hasAnyPermission(normalizedPermissionIds, requiredPermissionIds)
}
