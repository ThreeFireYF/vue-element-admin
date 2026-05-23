<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :lg="14">
        <el-card class="welcome-card">
          <div slot="header" class="card-header">
            <span>经营看板</span>
            <el-tag size="small" type="success">{{ permissionRole }}</el-tag>
          </div>
          <div class="welcome-title">欢迎回来，{{ name || '未命名用户' }}</div>
          <div class="welcome-desc">当前登录用户信息来自真实后端，菜单与页面权限由前端按 dhx-admin 控制。</div>
          <div class="meta-grid">
            <div class="meta-item">
              <div class="meta-label">后端角色</div>
              <div class="meta-value">{{ backendRole }}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">区域</div>
              <div class="meta-value">{{ regionName }}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">门店</div>
              <div class="meta-value">{{ storeName }}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">简介</div>
              <div class="meta-value">{{ introduction || '-' }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="24" :lg="10">
        <el-card class="shortcut-card">
          <div slot="header" class="card-header">
            <span>快捷入口</span>
          </div>
          <div class="shortcut-list">
            <router-link
              v-for="item in shortcuts"
              :key="item.path"
              :to="item.path"
              class="shortcut-item"
            >
              <i :class="item.icon" class="shortcut-icon" />
              <div>
                <div class="shortcut-title">{{ item.title }}</div>
                <div class="shortcut-desc">{{ item.desc }}</div>
              </div>
            </router-link>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card v-loading="statsLoading" class="overview-panel">
      <div slot="header" class="card-header">
        <span>经营概览</span>
        <div class="overview-actions">
          <span class="overview-note">统计基于当前后台真实数据</span>
          <el-button type="text" icon="el-icon-refresh" :loading="statsLoading" @click="fetchDashboardStats">
            刷新
          </el-button>
        </div>
      </div>

      <div class="overview-grid">
        <router-link
          v-for="item in overviewCards"
          :key="item.key"
          :to="item.path"
          class="overview-item"
          :class="item.themeClass"
        >
          <div class="overview-item__top">
            <div>
              <div class="overview-item__label">{{ item.label }}</div>
              <div class="overview-item__headline">{{ item.headline }}</div>
            </div>
            <i :class="item.icon" class="overview-item__icon" />
          </div>
          <div class="overview-item__meta">{{ item.meta }}</div>
          <div class="overview-item__footer">进入{{ item.label }}</div>
        </router-link>
      </div>
    </el-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  getAdminUsers,
  getAdminStores,
  getAdminCategories,
  getAdminAmendRequests
} from '@/api/admin'

const KNOWN_BACKEND_ROLE_COUNT = 3

function createDefaultStats() {
  return {
    storeTotal: null,
    disabledStoreTotal: null,
    categoryTotal: null,
    userTotal: null,
    roleTypeCount: null,
    pendingAmendTotal: null
  }
}

export default {
  name: 'DhxAdminDashboard',
  data() {
    return {
      statsLoading: false,
      dashboardStats: createDefaultStats(),
      shortcuts: [
        {
          path: '/organization/users',
          title: '用户管理',
          desc: '维护后台账号与角色归属',
          icon: 'el-icon-user-solid'
        },
        {
          path: '/organization/regions',
          title: '区域管理',
          desc: '配置区域与负责人关系',
          icon: 'el-icon-location-information'
        },
        {
          path: '/organization/stores',
          title: '门店管理',
          desc: '维护门店与区域映射',
          icon: 'el-icon-office-building'
        },
        {
          path: '/revenue/categories',
          title: '营收分类',
          desc: '配置填报分类项',
          icon: 'el-icon-collection-tag'
        },
        {
          path: '/approval/amend-requests',
          title: '补报审批',
          desc: '处理门店补报申请',
          icon: 'el-icon-document-checked'
        }
      ]
    }
  },
  computed: {
    ...mapGetters([
      'name',
      'introduction',
      'profile'
    ]),
    permissionRole() {
      return this.profile.permissionRole || '-'
    },
    backendRole() {
      return this.profile.role || '-'
    },
    regionName() {
      return this.profile.region_name || '-'
    },
    storeName() {
      return this.profile.store_name || '-'
    },
    overviewCards() {
      return [
        {
          key: 'stores',
          path: '/organization/stores',
          label: '门店管理',
          headline: `当前${this.formatCount(this.dashboardStats.storeTotal, '家门店')}`,
          meta: `${this.formatCount(this.dashboardStats.disabledStoreTotal, '家已停用')}`,
          icon: 'el-icon-office-building',
          themeClass: 'overview-item--stores'
        },
        {
          key: 'categories',
          path: '/revenue/categories',
          label: '营收分类配置',
          headline: `当前${this.formatCount(this.dashboardStats.categoryTotal, '个分类')}`,
          meta: '用于门店月度营收填报',
          icon: 'el-icon-collection-tag',
          themeClass: 'overview-item--categories'
        },
        {
          key: 'accounts',
          path: '/organization/users',
          label: '账号与权限',
          headline: `共${this.formatCount(this.dashboardStats.userTotal, '个账号')}`,
          meta: `${this.formatCount(this.dashboardStats.roleTypeCount, '种角色')}`,
          icon: 'el-icon-user-solid',
          themeClass: 'overview-item--accounts'
        },
        {
          key: 'amends',
          path: '/approval/amend-requests',
          label: '补报审核',
          headline: `待审核${this.formatCount(this.dashboardStats.pendingAmendTotal, '条')}`,
          meta: '进入审批中心处理待审记录',
          icon: 'el-icon-document-checked',
          themeClass: 'overview-item--amends'
        }
      ]
    }
  },
  created() {
    this.fetchDashboardStats()
  },
  methods: {
    async fetchDashboardStats() {
      if (this.statsLoading) {
        return
      }

      this.statsLoading = true
      try {
        const [
          storeResponse,
          disabledStoreResponse,
          categoryResponse,
          userMetrics,
          amendResponse
        ] = await Promise.all([
          getAdminStores({ page: 1, page_size: 1 }),
          getAdminStores({ page: 1, page_size: 1, status: 'disabled' }),
          getAdminCategories({ page: 1, page_size: 1 }),
          this.fetchUserMetrics(),
          getAdminAmendRequests({ status: 'pending' })
        ])

        this.dashboardStats = {
          storeTotal: this.resolveTotal(storeResponse),
          disabledStoreTotal: this.resolveTotal(disabledStoreResponse),
          categoryTotal: this.resolveTotal(categoryResponse),
          userTotal: userMetrics.total,
          roleTypeCount: userMetrics.roleTypeCount,
          pendingAmendTotal: this.resolveListCount(amendResponse)
        }
      } finally {
        this.statsLoading = false
      }
    },
    async fetchUserMetrics() {
      const roleSet = new Set()
      const pageSize = 100
      let page = 1
      let total = 0
      let fetchedCount = 0
      let shouldContinue = true

      while (shouldContinue) {
        const response = await getAdminUsers({ page, page_size: pageSize })
        const data = response.data || {}
        const items = data.items || []

        total = Number(data.total) || items.length
        fetchedCount += items.length

        items.forEach(item => {
          if (item && item.role) {
            roleSet.add(item.role)
          }
        })

        shouldContinue = fetchedCount < total && items.length === pageSize && roleSet.size < KNOWN_BACKEND_ROLE_COUNT
        page += 1
      }

      return {
        total,
        roleTypeCount: roleSet.size
      }
    },
    resolveTotal(response) {
      const data = response.data || {}
      return Number(data.total) || 0
    },
    resolveListCount(response) {
      const data = response.data || {}
      return Array.isArray(data.list) ? data.list.length : 0
    },
    formatCount(value, suffix) {
      if (typeof value !== 'number') {
        return `--${suffix}`
      }

      return `${value}${suffix}`
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.welcome-card {
  min-height: 320px;
}

.shortcut-card {
  min-height: 320px;
}

.welcome-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.welcome-desc {
  margin-top: 12px;
  line-height: 1.7;
  color: #606266;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 24px;
}

.meta-item {
  padding: 16px;
  border-radius: 12px;
  background: #f5f7fa;
}

.meta-label {
  font-size: 13px;
  color: #909399;
}

.meta-value {
  margin-top: 8px;
  font-size: 16px;
  color: #303133;
  word-break: break-word;
}

.shortcut-list {
  display: grid;
  gap: 12px;
}

.overview-panel {
  margin-top: 20px;
}

.overview-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.overview-note {
  font-size: 13px;
  color: #909399;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.overview-item {
  display: block;
  padding: 20px;
  border-radius: 18px;
  color: #303133;
  border: 1px solid transparent;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.overview-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(48, 49, 51, 0.08);
}

.overview-item__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.overview-item__label {
  font-size: 13px;
  color: #606266;
}

.overview-item__headline {
  margin-top: 10px;
  font-size: 26px;
  font-weight: 600;
  line-height: 1.2;
  color: #303133;
}

.overview-item__meta {
  margin-top: 18px;
  font-size: 14px;
  color: #606266;
  line-height: 1.7;
}

.overview-item__footer {
  margin-top: 18px;
  font-size: 13px;
  font-weight: 600;
}

.overview-item__icon {
  font-size: 24px;
}

.overview-item--stores {
  background: linear-gradient(135deg, #fef7e8, #fffdf8);
  border-color: #f5d6a1;
}

.overview-item--stores .overview-item__icon,
.overview-item--stores .overview-item__footer {
  color: #c68b20;
}

.overview-item--categories {
  background: linear-gradient(135deg, #eef8f1, #fbfefc);
  border-color: #b9e0c1;
}

.overview-item--categories .overview-item__icon,
.overview-item--categories .overview-item__footer {
  color: #3b8c52;
}

.overview-item--accounts {
  background: linear-gradient(135deg, #edf6ff, #fbfdff);
  border-color: #bdd8f7;
}

.overview-item--accounts .overview-item__icon,
.overview-item--accounts .overview-item__footer {
  color: #2f6fb1;
}

.overview-item--amends {
  background: linear-gradient(135deg, #fff1ef, #fffafb);
  border-color: #f2c0b7;
}

.overview-item--amends .overview-item__icon,
.overview-item--amends .overview-item__footer {
  color: #c15a44;
}

.shortcut-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-radius: 12px;
  color: #303133;
  background: #f5f7fa;
}

.shortcut-item:hover {
  background: #ecf5ff;
}

.shortcut-icon {
  margin-right: 12px;
  font-size: 20px;
  color: #409eff;
}

.shortcut-title {
  font-size: 15px;
  font-weight: 600;
}

.shortcut-desc {
  margin-top: 4px;
  font-size: 13px;
  color: #909399;
}

@media (max-width: 991px) {
  .dashboard-container {
    padding: 16px;
  }

  .overview-grid {
    grid-template-columns: 1fr;
  }

  .meta-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .overview-actions {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
