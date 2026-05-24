<template>
  <div class="app-container">
    <el-card v-loading="loading">
      <div slot="header" class="module-header">
        <div>
          <div class="module-title">{{ pageTitle }}</div>
          <div class="module-desc">{{ pageDescription }}</div>
        </div>
        <el-tag size="small" type="info">只读</el-tag>
      </div>

      <el-alert
        title="角色固定为三种，页面展示的权限矩阵会对照后端返回的 permission_ids 与本地中文映射渲染。"
        type="info"
        :closable="false"
        show-icon
      />

      <el-alert
        v-if="errorMessage"
        :title="errorMessage"
        type="warning"
        :closable="false"
        show-icon
        class="page-alert"
      />

      <el-row :gutter="16" class="role-grid">
        <el-col v-for="role in displayRoles" :key="role.key" :xs="24" :sm="12" :lg="8">
          <div class="role-card">
            <div class="role-card__header">
              <div>
                <div class="role-name">{{ role.name }}</div>
                <div class="role-key">{{ role.key }}</div>
                <div class="role-meta">角色ID：{{ role.id }} · {{ role.permissionItems.length }} 项权限</div>
              </div>
              <el-tag size="mini" :type="statusTagType(role.status)">{{ statusLabel(role.status) }}</el-tag>
            </div>
            <div class="role-desc">{{ role.description }}</div>
            <div class="role-section-title">权限矩阵</div>
            <div v-if="role.permissionItems.length === 0" class="role-empty">当前暂无可展示的权限定义</div>
            <div v-for="item in role.permissionItems" :key="`${role.key}-${item.id}`" class="role-permission">
              <div class="role-permission__title">{{ item.label }}</div>
              <div class="role-permission__meta">{{ item.code }} · {{ item.scope }}</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import { getAdminPermissions, getAdminRoles } from '@/api/admin'
import {
  PERMISSION_BY_ID,
  PERMISSION_LABEL_BY_CODE,
  PERMISSION_SCOPE_BY_CODE,
  normalizePermissionIds
} from '@/constants/permissions'

const ROLE_CONTENT = Object.freeze({
  admin: {
    name: '管理员',
    description: '负责系统配置、账号管理和审批处理，可查看并维护当前后台的全量管理模块。'
  },
  region_manager: {
    name: '区域负责人',
    description: '负责区域维度的查看和管理，重点关注区域、门店、品牌及补报相关数据。'
  },
  store_reporter: {
    name: '门店填报员',
    description: '负责门店经营数据填报与补报申请，面向具体门店进行业务录入。'
  }
})

export default {
  name: 'SystemRolesPage',
  data() {
    return {
      loading: false,
      errorMessage: '',
      permissionItems: [],
      roleItems: []
    }
  },
  computed: {
    pageTitle() {
      return this.$route.meta.pageTitle || this.$route.meta.title
    },
    pageDescription() {
      return this.$route.meta.pageDescription || '模块信息待补充。'
    },
    displayRoles() {
      return Object.keys(ROLE_CONTENT).map(key => {
        const roleMeta = ROLE_CONTENT[key]
        const backendRole = this.roleItems.find(item => item.code === key) || {}

        return {
          key,
          id: backendRole.id || '-',
          name: roleMeta.name,
          description: roleMeta.description,
          status: backendRole.status || 'active',
          permissionItems: normalizePermissionIds(backendRole.permission_ids).map(id => this.resolvePermissionItem(id))
        }
      })
    }
  },
  created() {
    this.fetchPageData()
  },
  methods: {
    async fetchPageData() {
      this.loading = true
      this.errorMessage = ''

      try {
        const [permissionsResponse, rolesResponse] = await Promise.all([
          getAdminPermissions(),
          getAdminRoles()
        ])

        this.permissionItems = (permissionsResponse.data && permissionsResponse.data.items) || []
        this.roleItems = (rolesResponse.data && rolesResponse.data.items) || []
      } catch (error) {
        this.permissionItems = []
        this.roleItems = []
        this.errorMessage = this.getReadableErrorMessage(error)
      } finally {
        this.loading = false
      }
    },
    resolvePermissionItem(id) {
      const matchedItem = this.permissionItems.find(item => Number(item.id) === Number(id))

      if (matchedItem) {
        return {
          id: Number(matchedItem.id),
          code: matchedItem.code,
          label: PERMISSION_LABEL_BY_CODE[matchedItem.code] || matchedItem.code,
          scope: PERMISSION_SCOPE_BY_CODE[matchedItem.code] || '待补充'
        }
      }

      const fallbackItem = PERMISSION_BY_ID[id]
      if (fallbackItem) {
        return fallbackItem
      }

      return {
        id,
        code: `permission.${id}`,
        label: `权限 ID ${id}`,
        scope: '待补充'
      }
    },
    getReadableErrorMessage(error) {
      if (error && error.message) {
        return error.message
      }

      return '角色权限矩阵获取失败，请稍后重试。'
    },
    statusLabel(status) {
      return status === 'disabled' ? '已停用' : '已启用'
    },
    statusTagType(status) {
      return status === 'disabled' ? 'danger' : 'success'
    }
  }
}
</script>

<style lang="scss" scoped>
.module-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.module-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.module-desc {
  margin-top: 8px;
  color: #606266;
  line-height: 1.6;
}

.role-grid {
  margin-top: 24px;
}

.page-alert {
  margin-top: 16px;
}

.role-card {
  height: 100%;
  padding: 20px;
  border-radius: 14px;
  background: #f7f9fc;
  border: 1px solid #e6ebf5;
}

.role-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.role-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.role-key {
  margin-top: 6px;
  font-size: 13px;
  color: #909399;
}

.role-meta {
  margin-top: 6px;
  font-size: 12px;
  color: #909399;
}

.role-desc {
  margin-top: 16px;
  min-height: 88px;
  line-height: 1.7;
  color: #606266;
}

.role-section-title {
  margin-top: 18px;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.role-permission {
  padding: 12px 14px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid #e8edf5;
  line-height: 1.6;
  color: #606266;
}

.role-permission + .role-permission {
  margin-top: 10px;
}

.role-permission__title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.role-permission__meta {
  margin-top: 6px;
  font-size: 12px;
  color: #909399;
  word-break: break-word;
}

.role-empty {
  color: #909399;
  line-height: 1.8;
}

@media (max-width: 767px) {
  .module-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .role-desc {
    min-height: auto;
  }
}
</style>
