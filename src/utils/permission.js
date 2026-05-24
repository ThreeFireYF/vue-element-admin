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

/**
 * @param {Array|Object} value
 * @returns {Boolean}
 * @example see @/views/permission/directive.vue
 */
export default function checkPermission(value) {
  const binding = resolvePermissionBinding(value)

  if (!binding) {
    console.error('need roles or permissionIds! Like v-permission="[1, 2]" or v-permission="{ permissionIds: [1] }"')
    return false
  }

  const roles = (store.getters && store.getters.roles) || []
  const permissionIds = (store.getters && store.getters.permissionIds) || []
  const hasRolePermission = binding.roles.length === 0 || roles.some(role => binding.roles.includes(role))
  const hasPermissionIdAccess = binding.permissionIds.length === 0 || hasAnyPermission(permissionIds, binding.permissionIds)

  return hasRolePermission && hasPermissionIdAccess
}
