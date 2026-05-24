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

      <div class="filter-container">
        <el-input
          v-model.trim="listQuery.keyword"
          placeholder="请输入关键词"
          clearable
          class="filter-item keyword-input"
          @keyup.enter.native="handleFilter"
        />

        <el-select
          v-if="hasRoleFilter"
          v-model="listQuery.role"
          clearable
          placeholder="全部角色"
          class="filter-item"
        >
          <el-option
            v-for="item in roleOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>

        <el-select
          v-if="hasRegionFilter"
          v-model="listQuery.region_id"
          clearable
          placeholder="全部区域"
          class="filter-item"
        >
          <el-option
            v-for="item in regionOptions"
            :key="item.id"
            :label="item.name"
            :value="Number(item.id)"
          />
        </el-select>

        <el-select
          v-model="listQuery.status"
          clearable
          placeholder="全部状态"
          class="filter-item"
        >
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>

        <el-button type="primary" icon="el-icon-search" class="filter-item" @click="handleFilter">
          查询
        </el-button>
        <el-button icon="el-icon-refresh" class="filter-item" @click="handleReset">
          重置
        </el-button>
        <el-button v-if="canCreate" type="success" icon="el-icon-plus" class="filter-item" @click="handleCreate">
          新增{{ currentModuleLabel }}
        </el-button>
      </div>

      <div class="table-summary">
        <span>当前共 {{ total }} 条记录</span>
      </div>

      <el-table
        v-loading="listLoading"
        :data="list"
        border
        fit
        highlight-current-row
        :empty-text="activeConfig.emptyText"
      >
        <el-table-column label="序号" width="70" align="center">
          <template slot-scope="scope">
            {{ (listQuery.page - 1) * listQuery.page_size + scope.$index + 1 }}
          </template>
        </el-table-column>

        <el-table-column
          v-for="column in columns"
          :key="column.prop"
          :prop="column.prop"
          :label="column.label"
          :width="column.width"
          :min-width="column.minWidth"
          align="center"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <el-tag v-if="column.type === 'status'" :type="statusTagType(scope.row[column.prop])">
              {{ statusLabel(scope.row[column.prop]) }}
            </el-tag>
            <span v-else>{{ formatCell(scope.row, column) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" :width="operationColumnWidth" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" @click="handleView(scope.row)">
              详情
            </el-button>
            <el-button v-if="canUpdate" type="primary" size="mini" @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button v-if="canDelete" type="danger" size="mini" @click="handleDelete(scope.row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.page_size"
        @pagination="getList"
      />

      <el-dialog
        :title="dialogTitle"
        :visible.sync="dialogVisible"
        width="620px"
        :close-on-click-modal="false"
        destroy-on-close
      >
        <el-alert
          v-if="moduleKey === 'users' && isEditMode"
          title="当前后端在用户角色切换时不会自动清理旧绑定，编辑用户暂仅开放现有角色下的资料与状态维护。"
          type="warning"
          :closable="false"
          show-icon
          class="dialog-alert"
        />

        <el-form ref="dataForm" :model="formModel" :rules="formRules" label-width="100px">
          <template v-if="moduleKey === 'users'">
            <el-form-item label="OpenID" prop="openid">
              <el-input v-model.trim="formModel.openid" placeholder="请输入 OpenID" />
            </el-form-item>
            <el-form-item label="姓名" prop="name">
              <el-input v-model.trim="formModel.name" placeholder="请输入姓名" />
            </el-form-item>
            <el-form-item label="角色" prop="role">
              <el-select
                v-model="formModel.role"
                placeholder="请选择角色"
                style="width: 100%;"
                :disabled="isEditMode"
                @change="handleUserRoleChange"
              >
                <el-option
                  v-for="item in roleOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item v-if="showUserRegionField" label="所属区域" prop="region_id">
              <el-select v-model="formModel.region_id" placeholder="请选择区域" style="width: 100%;">
                <el-option
                  v-for="item in regionOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="normalizeId(item.id)"
                />
              </el-select>
            </el-form-item>
            <el-form-item v-if="showUserStoreField" label="所属门店" prop="store_id">
              <el-select v-model="formModel.store_id" placeholder="请选择门店" style="width: 100%;">
                <el-option
                  v-for="item in storeOptions"
                  :key="item.id"
                  :label="storeOptionLabel(item)"
                  :value="normalizeId(item.id)"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="formModel.status" placeholder="请选择状态" style="width: 100%;">
                <el-option
                  v-for="item in statusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </template>

          <template v-else-if="moduleKey === 'regions'">
            <el-form-item label="区域名称" prop="name">
              <el-input v-model.trim="formModel.name" placeholder="请输入区域名称" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="formModel.status" placeholder="请选择状态" style="width: 100%;">
                <el-option
                  v-for="item in statusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </template>

          <template v-else-if="moduleKey === 'stores'">
            <el-form-item label="门店名称" prop="name">
              <el-input v-model.trim="formModel.name" placeholder="请输入门店名称" />
            </el-form-item>
            <el-form-item label="品牌" prop="brand">
              <el-input v-model.trim="formModel.brand" placeholder="请输入品牌名称" />
            </el-form-item>
            <el-form-item label="所属区域" prop="region_id">
              <el-select v-model="formModel.region_id" placeholder="请选择区域" style="width: 100%;">
                <el-option
                  v-for="item in regionOptions"
                  :key="item.id"
                  :label="item.name"
                  :value="normalizeId(item.id)"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="formModel.status" placeholder="请选择状态" style="width: 100%;">
                <el-option
                  v-for="item in statusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </template>

          <template v-else-if="moduleKey === 'categories'">
            <el-form-item label="分类名称" prop="name">
              <el-input v-model.trim="formModel.name" placeholder="请输入分类名称" maxlength="50" />
            </el-form-item>
            <el-form-item label="排序值" prop="sort_order">
              <el-input-number v-model="formModel.sort_order" :min="0" :step="1" controls-position="right" style="width: 100%;" />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="formModel.status" placeholder="请选择状态" style="width: 100%;">
                <el-option
                  v-for="item in statusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </template>
        </el-form>

        <div slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="dialogSubmitting" @click="submitDialog">
            确定
          </el-button>
        </div>
      </el-dialog>

      <el-drawer
        :title="detailTitle"
        :visible.sync="detailVisible"
        size="520px"
        destroy-on-close
      >
        <div v-loading="detailLoading" class="detail-drawer">
          <el-empty v-if="!detailData && !detailLoading" description="暂无详情数据" />

          <div v-else class="detail-list">
            <div
              v-for="field in detailFields"
              :key="field.label"
              class="detail-item"
            >
              <div class="detail-item__label">{{ field.label }}</div>
              <div class="detail-item__content">
                <el-tag
                  v-if="field.type === 'status'"
                  :type="statusTagType(resolveFieldValue(detailData, field))"
                  size="small"
                >
                  {{ displayFieldValue(detailData, field) }}
                </el-tag>
                <span v-else class="detail-value">{{ displayFieldValue(detailData, field) }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-drawer>
    </el-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Pagination from '@/components/Pagination'
import { parseTime } from '@/utils'
import { MODULE_PERMISSION_IDS, hasPermissionAccess } from '@/constants/permissions'
import {
  getAdminUsers,
  getAdminRegions,
  getAdminStores,
  getAdminCategories,
  getAdminUserDetail,
  getAdminRegionDetail,
  getAdminStoreDetail,
  getAdminCategoryDetail,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  createAdminRegion,
  updateAdminRegion,
  deleteAdminRegion,
  createAdminStore,
  updateAdminStore,
  deleteAdminStore,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory
} from '@/api/admin'

const STATUS_LABELS = {
  active: '启用',
  disabled: '停用'
}

const ROLE_LABELS = {
  admin: '管理员',
  region_manager: '区域负责人',
  store_reporter: '门店填报员'
}

function formatDateTime(value) {
  if (!value) {
    return '-'
  }

  if (typeof value === 'string' && value.includes('T')) {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) {
      return parseTime(date) || '-'
    }
  }

  return parseTime(value) || '-'
}

function normalizeId(value) {
  const id = Number(value)
  return Number.isFinite(id) && id > 0 ? id : undefined
}

function trimString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function getNestedValue(source, prop) {
  if (!source || !prop) {
    return undefined
  }

  return prop.split('.').reduce((result, key) => {
    if (result === undefined || result === null) {
      return undefined
    }
    return result[key]
  }, source)
}

const MODULE_CONFIGS = {
  users: {
    entityName: '用户',
    fetcher: getAdminUsers,
    detailRequest: getAdminUserDetail,
    createRequest: createAdminUser,
    updateRequest: updateAdminUser,
    deleteRequest: deleteAdminUser,
    emptyText: '暂无用户数据',
    filters: {
      role: true,
      region: false
    },
    columns: [
      { prop: 'id', label: 'ID', width: 90 },
      { prop: 'name', label: '姓名', minWidth: 120 },
      { prop: 'openid', label: 'OpenID', minWidth: 180 },
      { prop: 'role', label: '后端角色', minWidth: 120, formatter: row => ROLE_LABELS[row.role] || row.role || '-' },
      { prop: 'roleId', label: '角色ID', minWidth: 100, formatter: row => row.roleId || '-' },
      { prop: 'region', label: '所属区域', minWidth: 120, formatter: row => (row.region && row.region.name) || '-' },
      { prop: 'store', label: '所属门店', minWidth: 120, formatter: row => (row.store && row.store.name) || '-' },
      { prop: 'status', label: '状态', width: 100, type: 'status' },
      { prop: 'createdAt', label: '创建时间', minWidth: 180, formatter: row => formatDateTime(row.createdAt) }
    ],
    detailFields: [
      { prop: 'id', label: 'ID' },
      { prop: 'name', label: '姓名' },
      { prop: 'openid', label: 'OpenID' },
      { prop: 'role', label: '后端角色', formatter: row => ROLE_LABELS[row.role] || row.role || '-' },
      { prop: 'roleId', label: '角色ID' },
      { prop: 'region.name', label: '所属区域' },
      { prop: 'store.name', label: '所属门店' },
      { prop: 'status', label: '状态', type: 'status' },
      { prop: 'createdAt', label: '创建时间', type: 'datetime' },
      { prop: 'updatedAt', label: '更新时间', type: 'datetime' }
    ],
    createDefaultForm() {
      return {
        id: undefined,
        openid: '',
        name: '',
        role: 'admin',
        region_id: undefined,
        store_id: undefined,
        status: 'active'
      }
    },
    mapRowToForm(row) {
      return {
        id: row.id,
        openid: row.openid || '',
        name: row.name || '',
        role: row.role || 'admin',
        region_id: normalizeId(row.regionId),
        store_id: normalizeId(row.storeId),
        status: row.status || 'active'
      }
    },
    buildPayload(formModel) {
      const payload = {
        openid: trimString(formModel.openid),
        name: trimString(formModel.name),
        role: formModel.role,
        status: formModel.status
      }

      if (formModel.role === 'region_manager' && formModel.region_id) {
        payload.region_id = Number(formModel.region_id)
      }

      if (formModel.role === 'store_reporter' && formModel.store_id) {
        payload.store_id = Number(formModel.store_id)
      }

      return payload
    }
  },
  regions: {
    entityName: '区域',
    fetcher: getAdminRegions,
    detailRequest: getAdminRegionDetail,
    createRequest: createAdminRegion,
    updateRequest: updateAdminRegion,
    deleteRequest: deleteAdminRegion,
    emptyText: '暂无区域数据',
    filters: {
      role: false,
      region: false
    },
    columns: [
      { prop: 'id', label: 'ID', width: 90 },
      { prop: 'name', label: '区域名称', minWidth: 160 },
      { prop: 'status', label: '状态', width: 100, type: 'status' },
      { prop: 'createdAt', label: '创建时间', minWidth: 180, formatter: row => formatDateTime(row.createdAt) },
      { prop: 'updatedAt', label: '更新时间', minWidth: 180, formatter: row => formatDateTime(row.updatedAt) }
    ],
    detailFields: [
      { prop: 'id', label: 'ID' },
      { prop: 'name', label: '区域名称' },
      { prop: 'status', label: '状态', type: 'status' },
      { prop: 'createdAt', label: '创建时间', type: 'datetime' },
      { prop: 'updatedAt', label: '更新时间', type: 'datetime' }
    ],
    createDefaultForm() {
      return {
        id: undefined,
        name: '',
        status: 'active'
      }
    },
    mapRowToForm(row) {
      return {
        id: row.id,
        name: row.name || '',
        status: row.status || 'active'
      }
    },
    buildPayload(formModel) {
      return {
        name: trimString(formModel.name),
        status: formModel.status
      }
    }
  },
  stores: {
    entityName: '门店',
    fetcher: getAdminStores,
    detailRequest: getAdminStoreDetail,
    createRequest: createAdminStore,
    updateRequest: updateAdminStore,
    deleteRequest: deleteAdminStore,
    emptyText: '暂无门店数据',
    filters: {
      role: false,
      region: true
    },
    columns: [
      { prop: 'id', label: 'ID', width: 90 },
      { prop: 'name', label: '门店名称', minWidth: 150 },
      { prop: 'brand', label: '品牌', minWidth: 140 },
      { prop: 'region', label: '所属区域', minWidth: 140, formatter: row => (row.region && row.region.name) || '-' },
      { prop: 'status', label: '状态', width: 100, type: 'status' },
      { prop: 'createdAt', label: '创建时间', minWidth: 180, formatter: row => formatDateTime(row.createdAt) },
      { prop: 'updatedAt', label: '更新时间', minWidth: 180, formatter: row => formatDateTime(row.updatedAt) }
    ],
    detailFields: [
      { prop: 'id', label: 'ID' },
      { prop: 'name', label: '门店名称' },
      { prop: 'brand', label: '品牌' },
      { prop: 'region.name', label: '所属区域' },
      { prop: 'status', label: '状态', type: 'status' },
      { prop: 'createdAt', label: '创建时间', type: 'datetime' },
      { prop: 'updatedAt', label: '更新时间', type: 'datetime' }
    ],
    createDefaultForm() {
      return {
        id: undefined,
        name: '',
        brand: '',
        region_id: undefined,
        status: 'active'
      }
    },
    mapRowToForm(row) {
      return {
        id: row.id,
        name: row.name || '',
        brand: row.brand || '',
        region_id: normalizeId(row.regionId),
        status: row.status || 'active'
      }
    },
    buildPayload(formModel) {
      const payload = {
        name: trimString(formModel.name),
        region_id: Number(formModel.region_id),
        status: formModel.status
      }

      const brand = trimString(formModel.brand)
      if (brand) {
        payload.brand = brand
      }

      return payload
    }
  },
  categories: {
    entityName: '营收分类',
    fetcher: getAdminCategories,
    detailRequest: getAdminCategoryDetail,
    createRequest: createAdminCategory,
    updateRequest: updateAdminCategory,
    deleteRequest: deleteAdminCategory,
    emptyText: '暂无营收分类数据',
    filters: {
      role: false,
      region: false
    },
    columns: [
      { prop: 'id', label: 'ID', width: 90 },
      { prop: 'name', label: '分类名称', minWidth: 160 },
      { prop: 'sortOrder', label: '排序值', width: 100 },
      { prop: 'status', label: '状态', width: 100, type: 'status' },
      { prop: 'createdAt', label: '创建时间', minWidth: 180, formatter: row => formatDateTime(row.createdAt) },
      { prop: 'updatedAt', label: '更新时间', minWidth: 180, formatter: row => formatDateTime(row.updatedAt) }
    ],
    detailFields: [
      { prop: 'id', label: 'ID' },
      { prop: 'name', label: '分类名称' },
      { prop: 'sortOrder', label: '排序值' },
      { prop: 'status', label: '状态', type: 'status' },
      { prop: 'createdAt', label: '创建时间', type: 'datetime' },
      { prop: 'updatedAt', label: '更新时间', type: 'datetime' }
    ],
    createDefaultForm() {
      return {
        id: undefined,
        name: '',
        sort_order: 0,
        status: 'active'
      }
    },
    mapRowToForm(row) {
      return {
        id: row.id,
        name: row.name || '',
        sort_order: Number(row.sortOrder) || 0,
        status: row.status || 'active'
      }
    },
    buildPayload(formModel) {
      const sortOrder = Number(formModel.sort_order)
      return {
        name: trimString(formModel.name),
        sort_order: Number.isFinite(sortOrder) && sortOrder >= 0 ? sortOrder : 0,
        status: formModel.status
      }
    }
  }
}

export default {
  name: 'BusinessListPage',
  components: { Pagination },
  data() {
    return {
      listLoading: false,
      list: [],
      total: 0,
      dialogVisible: false,
      dialogType: 'create',
      dialogSubmitting: false,
      detailVisible: false,
      detailLoading: false,
      detailData: null,
      formModel: {},
      listQuery: {
        page: 1,
        page_size: 20,
        keyword: '',
        status: undefined
      },
      regionOptions: [],
      storeOptions: [],
      statusOptions: [
        { label: '启用', value: 'active' },
        { label: '停用', value: 'disabled' }
      ],
      roleOptions: [
        { label: '管理员', value: 'admin' },
        { label: '区域负责人', value: 'region_manager' },
        { label: '门店填报员', value: 'store_reporter' }
      ]
    }
  },
  computed: {
    ...mapGetters([
      'profile',
      'permissionIds',
      'roles'
    ]),
    moduleKey() {
      return this.$route.meta.moduleKey
    },
    activeConfig() {
      return MODULE_CONFIGS[this.moduleKey]
    },
    columns() {
      return this.activeConfig ? this.activeConfig.columns : []
    },
    pageTitle() {
      return this.$route.meta.pageTitle || this.$route.meta.title
    },
    pageDescription() {
      return this.$route.meta.pageDescription || '模块信息待补充。'
    },
    permissionRole() {
      return this.profile.permissionRole || '-'
    },
    currentModuleLabel() {
      return this.activeConfig ? this.activeConfig.entityName : ''
    },
    modulePermissionConfig() {
      return MODULE_PERMISSION_IDS[this.moduleKey] || {}
    },
    dialogTitle() {
      return `${this.isEditMode ? '编辑' : '新增'}${this.currentModuleLabel}`
    },
    detailTitle() {
      return `${this.currentModuleLabel}详情`
    },
    isEditMode() {
      return this.dialogType === 'edit'
    },
    hasRoleFilter() {
      return this.activeConfig ? this.activeConfig.filters.role : false
    },
    hasRegionFilter() {
      return this.activeConfig ? this.activeConfig.filters.region : false
    },
    showUserRegionField() {
      return this.moduleKey === 'users' && this.formModel.role === 'region_manager'
    },
    showUserStoreField() {
      return this.moduleKey === 'users' && this.formModel.role === 'store_reporter'
    },
    detailFields() {
      return this.activeConfig ? (this.activeConfig.detailFields || []) : []
    },
    canCreate() {
      return this.hasModulePermission('create')
    },
    canUpdate() {
      return this.hasModulePermission('update')
    },
    canDelete() {
      return this.hasModulePermission('delete')
    },
    operationColumnWidth() {
      const visibleActionCount = 1 + Number(this.canUpdate) + Number(this.canDelete)

      if (visibleActionCount <= 1) {
        return 100
      }

      if (visibleActionCount === 2) {
        return 170
      }

      return 240
    },
    formRules() {
      if (this.moduleKey === 'users') {
        return {
          openid: [{ required: true, message: '请输入 OpenID', trigger: 'blur' }],
          name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
          role: [{ required: true, message: '请选择角色', trigger: 'change' }],
          status: [{ required: true, message: '请选择状态', trigger: 'change' }]
        }
      }

      if (this.moduleKey === 'regions') {
        return {
          name: [{ required: true, message: '请输入区域名称', trigger: 'blur' }],
          status: [{ required: true, message: '请选择状态', trigger: 'change' }]
        }
      }

      if (this.moduleKey === 'categories') {
        return {
          name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
          status: [{ required: true, message: '请选择状态', trigger: 'change' }]
        }
      }

      return {
        name: [{ required: true, message: '请输入门店名称', trigger: 'blur' }],
        region_id: [{ required: true, message: '请选择所属区域', trigger: 'change' }],
        status: [{ required: true, message: '请选择状态', trigger: 'change' }]
      }
    }
  },
  watch: {
    moduleKey: {
      immediate: true,
      handler() {
        if (!this.activeConfig) {
          return
        }

        this.initializePage()
      }
    }
  },
  methods: {
    hasModulePermission(action) {
      const permissionId = this.modulePermissionConfig[action]

      if (!permissionId) {
        return false
      }

      return hasPermissionAccess(this.permissionIds, [permissionId], this.roles)
    },
    createDefaultQuery() {
      const query = {
        page: 1,
        page_size: 20,
        keyword: '',
        status: undefined
      }

      if (this.hasRoleFilter) {
        query.role = undefined
      }

      if (this.hasRegionFilter) {
        query.region_id = undefined
      }

      return query
    },
    async initializePage() {
      if (!this.activeConfig) {
        return
      }

      this.listQuery = this.createDefaultQuery()
      this.list = []
      this.total = 0
      this.dialogVisible = false
      this.detailVisible = false
      this.detailLoading = false
      this.detailData = null
      this.formModel = this.activeConfig.createDefaultForm()

      await this.loadFormOptions(true)
      await this.getList()
    },
    async fetchRegionOptions(force = false) {
      if (!force && this.regionOptions.length > 0) {
        return
      }

      const response = await getAdminRegions({ page: 1, page_size: 100 })
      const data = response.data || {}
      this.regionOptions = data.items || []
    },
    async fetchStoreOptions(force = false) {
      if (!force && this.storeOptions.length > 0) {
        return
      }

      const response = await getAdminStores({ page: 1, page_size: 100 })
      const data = response.data || {}
      this.storeOptions = data.items || []
    },
    async loadFormOptions(force = false) {
      const tasks = []

      if (this.moduleKey === 'users' || this.moduleKey === 'stores' || this.hasRegionFilter) {
        tasks.push(this.fetchRegionOptions(force))
      }

      if (this.moduleKey === 'users') {
        tasks.push(this.fetchStoreOptions(force))
      }

      await Promise.all(tasks)
    },
    buildQueryParams() {
      const params = {}

      Object.keys(this.listQuery).forEach(key => {
        const value = this.listQuery[key]
        if (value !== undefined && value !== null && value !== '') {
          params[key] = value
        }
      })

      return params
    },
    async getList() {
      if (!this.activeConfig || !this.activeConfig.fetcher) {
        return
      }

      this.listLoading = true
      try {
        const response = await this.activeConfig.fetcher(this.buildQueryParams())
        const data = response.data || {}
        this.list = data.items || []
        this.total = data.total || 0
        this.listQuery.page = data.page || this.listQuery.page
        this.listQuery.page_size = data.page_size || this.listQuery.page_size
      } finally {
        this.listLoading = false
      }
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleReset() {
      this.listQuery = this.createDefaultQuery()
      this.getList()
    },
    handleCreate() {
      this.openDialog('create', this.activeConfig.createDefaultForm())
    },
    handleEdit(row) {
      this.openDialog('edit', this.activeConfig.mapRowToForm(row))
    },
    async handleView(row) {
      this.detailVisible = true
      this.detailLoading = true
      this.detailData = row

      try {
        const response = await this.activeConfig.detailRequest(row.id)
        this.detailData = response.data || row
      } finally {
        this.detailLoading = false
      }
    },
    async openDialog(type, formModel) {
      await this.loadFormOptions(true)
      this.dialogType = type
      this.formModel = formModel
      this.dialogVisible = true
      this.$nextTick(() => {
        if (this.$refs.dataForm) {
          this.$refs.dataForm.clearValidate()
        }
      })
    },
    handleUserRoleChange(role) {
      if (role === 'store_reporter') {
        this.formModel.region_id = undefined
      } else if (role === 'region_manager') {
        this.formModel.store_id = undefined
      } else {
        this.formModel.region_id = undefined
        this.formModel.store_id = undefined
      }
    },
    validateBusinessBinding() {
      if (this.moduleKey === 'users') {
        if (this.formModel.role === 'region_manager' && !this.formModel.region_id) {
          this.$message.error('请选择所属区域')
          return false
        }

        if (this.formModel.role === 'store_reporter' && !this.formModel.store_id) {
          this.$message.error('请选择所属门店')
          return false
        }
      }

      if (this.moduleKey === 'stores' && !this.formModel.region_id) {
        this.$message.error('请选择所属区域')
        return false
      }

      return true
    },
    submitFormValidation() {
      return new Promise((resolve, reject) => {
        this.$refs.dataForm.validate(valid => {
          if (valid) {
            resolve()
          } else {
            reject(new Error('form invalid'))
          }
        })
      })
    },
    async submitDialog() {
      try {
        await this.submitFormValidation()
      } catch (error) {
        return
      }

      if (!this.validateBusinessBinding()) {
        return
      }

      this.dialogSubmitting = true
      try {
        const payload = this.activeConfig.buildPayload(this.formModel)

        if (this.isEditMode) {
          await this.activeConfig.updateRequest(this.formModel.id, payload)
        } else {
          this.listQuery.page = 1
          await this.activeConfig.createRequest(payload)
        }

        this.dialogVisible = false
        this.$message.success(`${this.dialogTitle}成功`)
        await this.loadFormOptions(true)
        await this.getList()
      } finally {
        this.dialogSubmitting = false
      }
    },
    async handleDelete(row) {
      const label = row.name || row.openid || row.id
      await this.$confirm(`确认删除“${label}”吗？`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      })

      await this.activeConfig.deleteRequest(row.id)
      if (this.list.length === 1 && this.listQuery.page > 1) {
        this.listQuery.page -= 1
      }
      this.$message.success('删除成功')
      await this.loadFormOptions(true)
      await this.getList()
    },
    formatCell(row, column) {
      if (column.formatter) {
        return column.formatter(row)
      }

      const value = getNestedValue(row, column.prop)
      if (value === undefined || value === null || value === '') {
        return '-'
      }

      return value
    },
    resolveFieldValue(source, field) {
      if (!source) {
        return undefined
      }

      if (field.formatter) {
        return field.formatter(source)
      }

      return getNestedValue(source, field.prop)
    },
    displayFieldValue(source, field) {
      const value = this.resolveFieldValue(source, field)

      if (field.type === 'status') {
        return this.statusLabel(value)
      }

      if (field.type === 'datetime') {
        return formatDateTime(value)
      }

      if (value === undefined || value === null || value === '') {
        return '-'
      }

      return value
    },
    statusLabel(status) {
      return STATUS_LABELS[status] || status || '-'
    },
    statusTagType(status) {
      if (status === 'active') {
        return 'success'
      }

      return 'info'
    },
    normalizeId,
    storeOptionLabel(store) {
      const regionName = store.region && store.region.name ? ` / ${store.region.name}` : ''
      return `${store.name}${regionName}`
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

.filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.filter-item {
  width: 160px;
}

.keyword-input {
  width: 260px;
}

.table-summary {
  margin-bottom: 12px;
  color: #909399;
  font-size: 13px;
}

.dialog-alert {
  margin-bottom: 16px;
}

.dialog-footer {
  text-align: right;
}

.detail-drawer {
  padding: 0 20px 20px;
}

.detail-list {
  margin-top: 4px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  overflow: hidden;
}

.detail-item {
  display: flex;
  border-bottom: 1px solid #ebeef5;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item__label {
  width: 120px;
  padding: 14px 16px;
  background: #fafafa;
  color: #909399;
  flex-shrink: 0;
}

.detail-item__content {
  flex: 1;
  padding: 14px 16px;
}

.detail-value {
  color: #303133;
  line-height: 1.6;
  word-break: break-word;
}

@media (max-width: 767px) {
  .module-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .detail-item {
    flex-direction: column;
  }

  .detail-item__label {
    width: 100%;
  }

  .filter-item,
  .keyword-input {
    width: 100%;
  }
}
</style>
