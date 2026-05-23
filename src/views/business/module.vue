<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="module-header">
        <div>
          <div class="module-title">{{ pageTitle }}</div>
          <div class="module-desc">{{ pageDescription }}</div>
        </div>
        <el-tag size="small" type="info">{{ permissionRole }}</el-tag>
      </div>

      <el-alert
        title="当前页先完成了菜单、角色和联调入口，业务表格与操作面板可以在这个骨架上继续补。"
        type="info"
        :closable="false"
        show-icon
      />

      <el-row :gutter="16" class="module-meta">
        <el-col :xs="24" :sm="12" :lg="6">
          <div class="meta-card">
            <div class="meta-label">当前用户</div>
            <div class="meta-value">{{ name || '-' }}</div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="6">
          <div class="meta-card">
            <div class="meta-label">后端角色</div>
            <div class="meta-value">{{ backendRole }}</div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="6">
          <div class="meta-card">
            <div class="meta-label">区域</div>
            <div class="meta-value">{{ regionName }}</div>
          </div>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="6">
          <div class="meta-card">
            <div class="meta-label">门店</div>
            <div class="meta-value">{{ storeName }}</div>
          </div>
        </el-col>
      </el-row>

      <div class="api-section">
        <div class="section-title">已对齐的后端接口</div>
        <div v-for="apiPath in apiPaths" :key="apiPath" class="api-item">{{ apiPath }}</div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'BusinessModulePage',
  computed: {
    ...mapGetters([
      'name',
      'profile'
    ]),
    pageTitle() {
      return this.$route.meta.pageTitle || this.$route.meta.title
    },
    pageDescription() {
      return this.$route.meta.pageDescription || '模块信息待补充。'
    },
    apiPaths() {
      return this.$route.meta.apiPaths || []
    },
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

.module-meta {
  margin-top: 24px;
}

.meta-card {
  height: 100%;
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

.api-section {
  margin-top: 24px;
}

.section-title {
  margin-bottom: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.api-item {
  padding: 12px 14px;
  border-radius: 10px;
  background: #fafafa;
  color: #606266;
}

.api-item + .api-item {
  margin-top: 10px;
}
</style>
