<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="module-header">
        <div>
          <div class="module-title">{{ pageTitle }}</div>
          <div class="module-desc">{{ pageDescription }}</div>
        </div>
        <el-tag size="small" type="info">只读</el-tag>
      </div>

      <el-alert
        title="当前阶段仅展示系统内已对齐的三种角色，不提供新增、编辑、删除操作。"
        type="info"
        :closable="false"
        show-icon
      />

      <el-row :gutter="16" class="role-grid">
        <el-col v-for="role in roles" :key="role.key" :xs="24" :sm="12" :lg="8">
          <div class="role-card">
            <div class="role-card__header">
              <div>
                <div class="role-name">{{ role.name }}</div>
                <div class="role-key">{{ role.key }}</div>
              </div>
              <el-tag size="mini" type="success">已启用</el-tag>
            </div>
            <div class="role-desc">{{ role.description }}</div>
            <div class="role-section-title">当前职责</div>
            <div v-for="item in role.permissions" :key="item" class="role-permission">
              {{ item }}
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'SystemRolesPage',
  data() {
    return {
      roles: [
        {
          key: 'admin',
          name: '管理员',
          description: '负责系统配置、账号管理和审批处理，拥有当前前端全量业务菜单访问能力。',
          permissions: [
            '查看并维护用户、区域、门店、营收分类',
            '查看并处理补报审批',
            '查看系统设置下的角色与品牌信息'
          ]
        },
        {
          key: 'region_manager',
          name: '区域负责人',
          description: '负责区域维度的经营查看与管理，后续扩展时以区域视角承接品牌和门店相关业务。',
          permissions: [
            '查看辖区门店与区域相关数据',
            '读取区域品牌列表接口',
            '查看区域补报申请列表'
          ]
        },
        {
          key: 'store_reporter',
          name: '门店填报员',
          description: '负责门店经营数据填报与补报申请，是面向具体门店的操作角色。',
          permissions: [
            '提交门店营收记录',
            '提交补报或修正申请',
            '查看门店维度历史填报数据'
          ]
        }
      ]
    }
  },
  computed: {
    pageTitle() {
      return this.$route.meta.pageTitle || this.$route.meta.title
    },
    pageDescription() {
      return this.$route.meta.pageDescription || '模块信息待补充。'
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

.role-desc {
  margin-top: 16px;
  min-height: 66px;
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
  position: relative;
  padding-left: 14px;
  line-height: 1.8;
  color: #606266;
}

.role-permission::before {
  content: '';
  position: absolute;
  left: 0;
  top: 11px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #409eff;
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
