<template>
  <el-form label-position="top">
    <el-row :gutter="16">
      <el-col :xs="24" :sm="12">
        <el-form-item label="姓名">
          <el-input :value="user.name || '-'" disabled />
        </el-form-item>
      </el-col>
      <el-col :xs="24" :sm="12">
        <el-form-item label="用户 ID">
          <el-input :value="user.id || '-'" disabled />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :xs="24" :sm="12">
        <el-form-item label="后端角色">
          <el-input :value="user.role || '-'" disabled />
        </el-form-item>
      </el-col>
      <el-col :xs="24" :sm="12">
        <el-form-item label="权限角色">
          <el-input :value="user.permissionRole || '-'" disabled />
        </el-form-item>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :xs="24" :sm="12">
        <el-form-item label="所属区域">
          <el-input :value="user.regionName || '-'" disabled />
        </el-form-item>
      </el-col>
      <el-col :xs="24" :sm="12">
        <el-form-item label="所属门店">
          <el-input :value="user.storeName || '-'" disabled />
        </el-form-item>
      </el-col>
    </el-row>

    <el-form-item label="资料说明">
      <el-input :value="user.introduction || '-'" type="textarea" :rows="3" disabled />
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  props: {
    user: {
      type: Object,
      default: () => {
        return {
          name: '',
          id: '',
          role: '',
          permissionRole: '',
          regionName: '',
          storeName: '',
          introduction: ''
        }
      }
    }
  }
}
</script>
