import store from '@/store'
import { hasAnyPermission } from '@/constants/permissions'

function resolvePermissionBinding(value) {
  if (value && value instanceof Array) {
    if (value.length === 0) {
      return { roles: [], permissionIds: [] }
    }

    if (typeof value[0] === 'number') {
      return { roles: [], permissionIds: value }
    }

    return { roles: value, permissionIds: [] }
  }

  if (value && typeof value === 'object') {
    return {
      roles: Array.isArray(value.roles) ? value.roles : [],
      permissionIds: Array.isArray(value.permissionIds) ? value.permissionIds : []
    }
  }

  return null
}

function checkPermission(el, binding) {
  const { value } = binding
  const resolvedBinding = resolvePermissionBinding(value)
  const roles = (store.getters && store.getters.roles) || []
  const permissionIds = (store.getters && store.getters.permissionIds) || []

  if (resolvedBinding) {
    const hasRolePermission = resolvedBinding.roles.length === 0 || roles.some(role => resolvedBinding.roles.includes(role))
    const hasPermissionIdAccess = resolvedBinding.permissionIds.length === 0 || hasAnyPermission(permissionIds, resolvedBinding.permissionIds)

    if (!hasRolePermission || !hasPermissionIdAccess) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  } else {
    throw new Error('need roles or permissionIds! Like v-permission="[1, 2]" or v-permission="{ permissionIds: [1] }"')
  }
}

export default {
  inserted(el, binding) {
    checkPermission(el, binding)
  },
  update(el, binding) {
    checkPermission(el, binding)
  }
}
