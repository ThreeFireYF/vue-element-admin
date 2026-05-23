<template>
  <el-card style="margin-bottom:20px;">
    <div slot="header" class="clearfix">
      <span>账户概览</span>
    </div>

    <div class="user-profile">
      <div class="box-center">
        <pan-thumb v-if="user.avatar" :image="user.avatar" :height="'100px'" :width="'100px'">
          <div>{{ user.permissionRole || user.role || '-' }}</div>
          {{ user.name }}
        </pan-thumb>
        <div v-else class="avatar-placeholder">{{ avatarText }}</div>
      </div>
      <div class="box-center">
        <div class="user-name text-center">{{ user.name }}</div>
        <div class="user-role text-center text-muted">{{ user.permissionRole || user.role || '-' }}</div>
      </div>
    </div>

    <div class="user-bio">
      <div class="user-bio-section">
        <div class="user-bio-section-header"><i class="el-icon-user-solid" /><span>基本信息</span></div>
        <div class="user-bio-section-body">
          <div class="info-row"><span class="label">用户 ID</span><span>{{ user.id || '-' }}</span></div>
          <div class="info-row"><span class="label">后端角色</span><span>{{ user.role || '-' }}</span></div>
          <div class="info-row"><span class="label">权限角色</span><span>{{ user.permissionRole || '-' }}</span></div>
          <div class="info-row"><span class="label">所属区域</span><span>{{ user.regionName || '-' }}</span></div>
          <div class="info-row"><span class="label">所属门店</span><span>{{ user.storeName || '-' }}</span></div>
        </div>
      </div>

      <div class="user-bio-section">
        <div class="user-bio-section-header"><i class="el-icon-document" /><span>说明</span></div>
        <div class="user-bio-section-body">
          <div class="text-muted">{{ user.introduction || '后端暂未返回更多用户简介字段。' }}</div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script>
import PanThumb from '@/components/PanThumb'

export default {
  components: { PanThumb },
  props: {
    user: {
      type: Object,
      default: () => {
        return {
          id: '',
          name: '',
          avatar: '',
          role: '',
          permissionRole: '',
          storeName: '',
          regionName: '',
          introduction: ''
        }
      }
    }
  },
  computed: {
    avatarText() {
      return (this.user.name || '?').trim().slice(0, 1).toUpperCase() || '?'
    }
  }
}
</script>

<style lang="scss" scoped>
.box-center {
  margin: 0 auto;
  display: table;
}

.text-muted {
  color: #777;
}

.user-profile {
  .user-name {
    font-weight: bold;
  }

  .box-center {
    padding-top: 10px;
  }

  .user-role {
    padding-top: 10px;
    font-weight: 400;
    font-size: 14px;
  }

  .box-social {
    padding-top: 30px;

    .el-table {
      border-top: 1px solid #dfe6ec;
    }
  }

  .user-follow {
    padding-top: 20px;
  }
}

.avatar-placeholder {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #409eff;
  color: #fff;
  font-size: 32px;
  font-weight: 700;
}

.user-bio {
  margin-top: 20px;
  color: #606266;

  span {
    padding-left: 4px;
  }

  .user-bio-section {
    font-size: 14px;
    padding: 15px 0;

    .user-bio-section-header {
      border-bottom: 1px solid #dfe6ec;
      padding-bottom: 10px;
      margin-bottom: 10px;
      font-weight: bold;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px dashed #ebeef5;
      gap: 16px;
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .label {
      color: #909399;
    }
  }
}
</style>
