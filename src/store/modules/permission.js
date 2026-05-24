import { asyncRoutes, constantRoutes } from '@/router'
import { hasAnyPermission, normalizePermissionIds } from '@/constants/permissions'

function normalizeAccessContext(accessContext) {
  if (Array.isArray(accessContext)) {
    return {
      roles: accessContext,
      permissionIds: []
    }
  }

  return {
    roles: (accessContext && accessContext.roles) || [],
    permissionIds: normalizePermissionIds(accessContext && accessContext.permissionIds)
  }
}

/**
 * Use meta.roles and meta.permissionIds to determine if the current user has permission
 * @param accessContext
 * @param route
 */
function hasPermission(accessContext, route) {
  const { roles, permissionIds } = normalizeAccessContext(accessContext)
  const meta = route.meta || {}

  if (meta.roles && meta.roles.length > 0) {
    const hasRoleAccess = roles.some(role => meta.roles.includes(role))
    if (!hasRoleAccess) {
      return false
    }
  }

  if (meta.permissionIds && meta.permissionIds.length > 0) {
    return hasAnyPermission(permissionIds, meta.permissionIds)
  }

  return true
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param accessContext
 */
export function filterAsyncRoutes(routes, accessContext) {
  const res = []

  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(accessContext, tmp)) {
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, accessContext)
      }
      res.push(tmp)
    }
  })

  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  generateRoutes({ commit }, accessContext) {
    return new Promise(resolve => {
      const normalizedAccessContext = normalizeAccessContext(accessContext)
      let accessedRoutes

      if (normalizedAccessContext.roles.includes('dhx-admin') && normalizedAccessContext.permissionIds.length === 0) {
        accessedRoutes = asyncRoutes || []
      } else {
        accessedRoutes = filterAsyncRoutes(asyncRoutes, normalizedAccessContext)
      }

      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
