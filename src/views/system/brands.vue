<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="module-header">
        <div>
          <div class="module-title">{{ pageTitle }}</div>
          <div class="module-desc">{{ pageDescription }}</div>
        </div>
        <div class="header-actions">
          <el-tag size="small" type="info">只读</el-tag>
          <el-button type="text" icon="el-icon-refresh" :loading="loading" @click="fetchBrands">
            刷新
          </el-button>
        </div>
      </div>

      <el-alert
        title="品牌管理当前仅做展示，后续再补充新增、编辑、删除等配置能力。"
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
        class="status-alert"
      />

      <div class="brand-meta">
        <div class="brand-meta__label">接口来源</div>
        <div class="brand-meta__value">GET /region/brands</div>
      </div>

      <div v-loading="loading" class="brand-content">
        <div v-if="!loading && !brands.length" class="brand-empty">
          <div class="brand-empty__title">暂无品牌数据</div>
          <div class="brand-empty__desc">{{ emptyText }}</div>
        </div>

        <div v-else class="brand-grid">
          <div v-for="brand in brands" :key="brand" class="brand-card">
            <div class="brand-card__title">{{ brand }}</div>
            <div class="brand-card__desc">当前为区域品牌列表接口返回的品牌名称，仅展示不支持维护。</div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { getRegionBrands } from '@/api/admin'

function getReadableErrorMessage(message) {
  if (message === 'Forbidden resource' || (typeof message === 'string' && message.includes('403'))) {
    return '当前账号暂无“区域品牌列表”接口访问权限，后端仅允许满足角色约束的账号读取该数据。'
  }

  return message || '品牌列表读取失败'
}

export default {
  name: 'SystemBrandsPage',
  data() {
    return {
      loading: false,
      brands: [],
      errorMessage: ''
    }
  },
  computed: {
    pageTitle() {
      return this.$route.meta.pageTitle || this.$route.meta.title
    },
    pageDescription() {
      return this.$route.meta.pageDescription || '模块信息待补充。'
    },
    emptyText() {
      if (this.errorMessage) {
        return '当前暂无可展示品牌数据'
      }

      return '当前接口未返回品牌数据'
    }
  },
  created() {
    this.fetchBrands()
  },
  methods: {
    async fetchBrands() {
      this.loading = true
      this.errorMessage = ''
      try {
        const response = await getRegionBrands()
        const data = response.data || {}
        this.brands = Array.isArray(data.list) ? data.list : []
      } catch (error) {
        this.brands = []
        const backendMessage = error.response && error.response.data && error.response.data.message
        this.errorMessage = getReadableErrorMessage(backendMessage || error.message)
      } finally {
        this.loading = false
      }
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

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-alert {
  margin-top: 16px;
}

.brand-meta {
  margin-top: 20px;
  padding: 16px 18px;
  border-radius: 12px;
  background: #f5f7fa;
}

.brand-meta__label {
  font-size: 13px;
  color: #909399;
}

.brand-meta__value {
  margin-top: 8px;
  font-size: 16px;
  color: #303133;
}

.brand-content {
  margin-top: 24px;
  min-height: 160px;
}

.brand-empty {
  padding: 36px 20px;
  border-radius: 14px;
  background: #fafbfd;
  border: 1px dashed #d8e3f0;
  text-align: center;
}

.brand-empty__title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.brand-empty__desc {
  margin-top: 10px;
  line-height: 1.7;
  color: #606266;
}

.brand-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.brand-card {
  padding: 18px;
  border-radius: 14px;
  background: #fbfcff;
  border: 1px solid #e7edf7;
}

.brand-card__title {
  font-size: 17px;
  font-weight: 600;
  color: #303133;
}

.brand-card__desc {
  margin-top: 10px;
  line-height: 1.7;
  color: #606266;
}

@media (max-width: 991px) {
  .brand-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .module-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
