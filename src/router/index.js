import Vue from 'vue'
import Router from 'vue-router'
import { ROUTE_PERMISSION_IDS } from '@/constants/permissions'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

const RouteView = {
  render: h => h('router-view')
}

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['dhx-admin']         control the page roles (you can set multiple roles)
   permissionIds: [1, 2]        control the page permissions by backend permission_ids
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: '经营看板', icon: 'dashboard', affix: true }
      }
    ]
  },
  {
    path: '/profile',
    component: Layout,
    redirect: '/profile/index',
    hidden: true,
    children: [
      {
        path: 'index',
        component: () => import('@/views/profile/index'),
        name: 'Profile',
        meta: { title: '个人资料', icon: 'user', noCache: true }
      }
    ]
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  {
    path: '/system',
    component: Layout,
    redirect: '/system/permission/users',
    name: 'SystemSettings',
    alwaysShow: true,
    meta: {
      title: '系统设置',
      icon: 'el-icon-setting',
      permissionIds: ROUTE_PERMISSION_IDS.systemSettings
    },
    children: [
      {
        path: 'permission',
        component: RouteView,
        redirect: '/system/permission/users',
        name: 'PermissionSettings',
        alwaysShow: true,
        meta: {
          title: '权限设置',
          icon: 'el-icon-lock',
          permissionIds: ROUTE_PERMISSION_IDS.permissionSettings
        },
        children: [
          {
            path: 'users',
            component: () => import('@/views/business/list'),
            name: 'BusinessUsers',
            meta: {
              title: '用户管理',
              icon: 'el-icon-user-solid',
              permissionIds: ROUTE_PERMISSION_IDS.users,
              moduleKey: 'users',
              pageTitle: '后台用户管理',
              pageDescription: '维护后台账号信息，后续在这里接入用户列表、详情和编辑能力。',
              apiPaths: [
                'GET /admin/users',
                'POST /admin/users',
                'GET /admin/users/{id}',
                'PATCH /admin/users/{id}',
                'DELETE /admin/users/{id}'
              ]
            }
          },
          {
            path: 'roles',
            component: () => import('@/views/system/roles'),
            name: 'SystemRoles',
            meta: {
              title: '角色设置',
              icon: 'el-icon-postcard',
              permissionIds: ROUTE_PERMISSION_IDS.roles,
              pageTitle: '角色设置',
              pageDescription: '当前仅做只读展示，展示系统内已启用的三种角色定义。'
            }
          },
          {
            path: 'brands',
            component: () => import('@/views/system/brands'),
            name: 'SystemBrands',
            meta: {
              title: '品牌管理',
              icon: 'el-icon-collection',
              permissionIds: ROUTE_PERMISSION_IDS.brands,
              pageTitle: '品牌管理',
              pageDescription: '当前先做只读展示，品牌数据读取区域品牌列表接口。',
              apiPaths: [
                'GET /region/brands'
              ]
            }
          }
        ]
      }
    ]
  },

  {
    path: '/organization',
    component: Layout,
    redirect: '/organization/regions',
    name: 'Organization',
    meta: {
      title: '组织管理',
      icon: 'el-icon-s-operation',
      permissionIds: ROUTE_PERMISSION_IDS.organization
    },
    children: [
      {
        path: 'users',
        redirect: '/system/permission/users',
        hidden: true
      },
      {
        path: 'regions',
        component: () => import('@/views/business/list'),
        name: 'BusinessRegions',
        meta: {
          title: '区域管理',
          icon: 'el-icon-location-information',
          permissionIds: ROUTE_PERMISSION_IDS.regions,
          moduleKey: 'regions',
          pageTitle: '后台区域管理',
          pageDescription: '维护区域信息和负责人归属，作为门店与用户的上级组织。',
          apiPaths: [
            'GET /admin/regions',
            'POST /admin/regions',
            'GET /admin/regions/{id}',
            'PATCH /admin/regions/{id}',
            'DELETE /admin/regions/{id}'
          ]
        }
      },
      {
        path: 'stores',
        component: () => import('@/views/business/list'),
        name: 'BusinessStores',
        meta: {
          title: '门店管理',
          icon: 'el-icon-office-building',
          permissionIds: ROUTE_PERMISSION_IDS.stores,
          moduleKey: 'stores',
          pageTitle: '后台门店管理',
          pageDescription: '维护门店基础信息、所属区域与启停状态。',
          apiPaths: [
            'GET /admin/stores',
            'POST /admin/stores',
            'GET /admin/stores/{id}',
            'PATCH /admin/stores/{id}',
            'DELETE /admin/stores/{id}'
          ]
        }
      }
    ]
  },

  {
    path: '/revenue',
    component: Layout,
    redirect: '/revenue/categories',
    name: 'Revenue',
    meta: {
      title: '营收管理',
      icon: 'el-icon-data-analysis',
      permissionIds: ROUTE_PERMISSION_IDS.revenue
    },
    children: [
      {
        path: 'categories',
        component: () => import('@/views/business/list'),
        name: 'BusinessCategories',
        meta: {
          title: '营收分类',
          icon: 'el-icon-collection-tag',
          permissionIds: ROUTE_PERMISSION_IDS.categories,
          moduleKey: 'categories',
          pageTitle: '后台营收分类管理',
          pageDescription: '维护月度营收填报时可选的分类项和启停状态。',
          apiPaths: [
            'GET /admin/categories',
            'POST /admin/categories',
            'GET /admin/categories/{id}',
            'PATCH /admin/categories/{id}',
            'DELETE /admin/categories/{id}'
          ]
        }
      }
    ]
  },

  {
    path: '/approval',
    component: Layout,
    redirect: '/approval/amend-requests',
    name: 'Approval',
    meta: {
      title: '审批中心',
      icon: 'el-icon-s-check',
      permissionIds: ROUTE_PERMISSION_IDS.approval
    },
    children: [
      {
        path: 'amend-requests',
        component: () => import('@/views/business/amend-requests'),
        name: 'BusinessAmendRequests',
        meta: {
          title: '补报审批',
          icon: 'el-icon-document-checked',
          permissionIds: ROUTE_PERMISSION_IDS.amendRequests,
          pageTitle: '补报审批中心',
          pageDescription: '查看并处理门店补报申请，审核通过后会回写正式营收记录。',
          apiPaths: [
            'GET /admin/amend-requests',
            'POST /admin/amend-requests/{id}/approve',
            'POST /admin/amend-requests/{id}/reject'
          ]
        }
      }
    ]
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
