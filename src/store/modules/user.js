import { login, logout, getInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import router, { resetRouter } from '@/router'
import { normalizePermissionIds } from '@/constants/permissions'

function normalizePermissionRole(role) {
  if (role === 'admin' || role === 'dhx-admin') {
    return 'dhx-admin'
  }

  return role
}

function buildIntroduction(user) {
  const storeName = user.store_name || (user.store && user.store.name)
  const regionName = user.region_name || (user.region && user.region.name)

  if (storeName) {
    return `${user.role} · ${storeName}`
  }

  if (regionName) {
    return `${user.role} · ${regionName}`
  }

  return user.role || ''
}

function resolveAvatar(user) {
  return user.avatar || user.avatar_url || user.avatarUrl || ''
}

function resolveAuthUser(payload) {
  if (!payload) {
    return null
  }

  return payload.user || payload
}

function buildUserSession(payload) {
  const user = resolveAuthUser(payload)

  if (!user) {
    return null
  }

  const permissionRole = normalizePermissionRole(user.role)
  const roles = permissionRole ? [permissionRole] : []
  const permissionIds = normalizePermissionIds(user.permission_ids || payload.permission_ids)
  const avatar = resolveAvatar(user)
  const profile = {
    ...user,
    permission_ids: permissionIds,
    permissionIds,
    permissionRole,
    avatar
  }

  return {
    token: payload && payload.token ? payload.token : '',
    roles,
    permissionIds,
    name: user.name || '',
    avatar,
    introduction: buildIntroduction(user),
    profile
  }
}

function commitUserSession(commit, session) {
  if (session.token) {
    commit('SET_TOKEN', session.token)
  }

  commit('SET_ROLES', session.roles)
  commit('SET_PERMISSION_IDS', session.permissionIds)
  commit('SET_NAME', session.name)
  commit('SET_AVATAR', session.avatar)
  commit('SET_INTRODUCTION', session.introduction)
  commit('SET_PROFILE', session.profile)
}

const state = {
  token: getToken(),
  name: '',
  avatar: '',
  introduction: '',
  roles: [],
  permissionIds: [],
  profile: {}
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_INTRODUCTION: (state, introduction) => {
    state.introduction = introduction
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_PERMISSION_IDS: (state, permissionIds) => {
    state.permissionIds = permissionIds
  },
  SET_PROFILE: (state, profile) => {
    state.profile = profile
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const { data } = response
        const session = buildUserSession(data)

        commit('SET_TOKEN', data.token)
        setToken(data.token)

        if (session) {
          commitUserSession(commit, session)
        }

        resolve(session)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response
        const session = buildUserSession(data)

        if (!session) {
          reject('Verification failed, please Login again.')
          return
        }

        // roles must be a non-empty array
        if (!session.roles || session.roles.length <= 0) {
          reject('getInfo: roles must be a non-null array!')
          return
        }

        commitUserSession(commit, session)
        resolve({
          ...session.profile,
          roles: session.roles,
          permissionIds: session.permissionIds,
          introduction: session.introduction
        })
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', [])
        commit('SET_PERMISSION_IDS', [])
        commit('SET_NAME', '')
        commit('SET_AVATAR', '')
        commit('SET_INTRODUCTION', '')
        commit('SET_PROFILE', {})
        removeToken()
        resetRouter()

        // reset visited views and cached views
        // to fixed https://github.com/PanJiaChen/vue-element-admin/issues/2485
        dispatch('tagsView/delAllViews', null, { root: true })

        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      commit('SET_PERMISSION_IDS', [])
      commit('SET_NAME', '')
      commit('SET_AVATAR', '')
      commit('SET_INTRODUCTION', '')
      commit('SET_PROFILE', {})
      removeToken()
      resolve()
    })
  },

  // dynamically modify permissions
  async changeRoles({ commit, dispatch }, role) {
    const token = role + '-token'

    commit('SET_TOKEN', token)
    setToken(token)

    const { roles } = await dispatch('getInfo')

    resetRouter()

    // generate accessible routes map based on roles
    const accessRoutes = await dispatch('permission/generateRoutes', roles, { root: true })
    // dynamically add accessible routes
    router.addRoutes(accessRoutes)

    // reset visited views and cached views
    dispatch('tagsView/delAllViews', null, { root: true })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
