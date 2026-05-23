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
        <el-date-picker
          v-model="listQuery.month"
          type="month"
          value-format="yyyy-MM"
          format="yyyy-MM"
          clearable
          placeholder="选择补报月份"
          class="filter-item"
        />

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

        <el-button type="primary" icon="el-icon-search" class="filter-item action-button" @click="handleFilter">
          查询
        </el-button>
        <el-button icon="el-icon-refresh" class="filter-item action-button" @click="handleReset">
          重置
        </el-button>
      </div>

      <div class="table-summary">
        <span>当前共 {{ list.length }} 条申请</span>
      </div>

      <el-table
        v-loading="listLoading"
        :data="list"
        border
        fit
        highlight-current-row
        empty-text="暂无补报申请"
      >
        <el-table-column label="ID" prop="id" width="90" align="center" />
        <el-table-column label="门店" prop="store_name" min-width="160" align="center" show-overflow-tooltip />
        <el-table-column label="补报月份" prop="report_month" width="120" align="center" />
        <el-table-column label="原记录 ID" min-width="100" align="center">
          <template slot-scope="scope">
            {{ scope.row.record_id || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110" align="center">
          <template slot-scope="scope">
            <el-tag :type="statusTagType(scope.row.status)">
              {{ statusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="申请原因" prop="reason" min-width="220" align="center" show-overflow-tooltip />
        <el-table-column label="申请时间" min-width="160" align="center">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.applied_at) }}
          </template>
        </el-table-column>
        <el-table-column label="审核时间" min-width="160" align="center">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.reviewed_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" @click="handleView(scope.row)">
              详情
            </el-button>
            <el-button
              v-if="scope.row.status === 'pending'"
              type="success"
              size="mini"
              @click="openReviewDialog('approve', scope.row)"
            >
              通过
            </el-button>
            <el-button
              v-if="scope.row.status === 'pending'"
              type="danger"
              size="mini"
              @click="openReviewDialog('reject', scope.row)"
            >
              驳回
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-dialog
        :title="reviewDialogTitle"
        :visible.sync="reviewDialogVisible"
        width="520px"
        :close-on-click-modal="false"
      >
        <el-alert
          v-if="reviewAction === 'reject'"
          title="驳回后申请状态会变为已驳回；若关联原始营收记录，原记录状态也会被标记为 amend_rejected。"
          type="warning"
          :closable="false"
          show-icon
          class="dialog-alert"
        />

        <el-form ref="reviewForm" :model="reviewForm" label-width="88px">
          <el-form-item label="审核意见">
            <el-input
              v-model.trim="reviewForm.review_comment"
              type="textarea"
              :rows="4"
              maxlength="500"
              show-word-limit
              placeholder="可选，填写审核意见或说明"
            />
          </el-form-item>
        </el-form>

        <div slot="footer" class="dialog-footer">
          <el-button @click="reviewDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="reviewSubmitting" @click="submitReview">
            确定
          </el-button>
        </div>
      </el-dialog>

      <el-drawer
        title="补报申请详情"
        :visible.sync="detailVisible"
        size="560px"
        destroy-on-close
      >
        <div v-loading="detailLoading" class="detail-drawer">
          <el-empty v-if="!detailData && !detailLoading" description="暂无详情数据" />

          <template v-else>
            <div class="detail-list">
              <div class="detail-item">
                <div class="detail-item__label">申请 ID</div>
                <div class="detail-item__content">{{ detailData.id }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-item__label">门店</div>
                <div class="detail-item__content">{{ detailData.store_name || '-' }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-item__label">补报月份</div>
                <div class="detail-item__content">{{ detailData.report_month || '-' }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-item__label">原记录 ID</div>
                <div class="detail-item__content">{{ detailData.record_id || '-' }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-item__label">状态</div>
                <div class="detail-item__content">
                  <el-tag :type="statusTagType(detailData.status)" size="small">
                    {{ statusLabel(detailData.status) }}
                  </el-tag>
                </div>
              </div>
              <div class="detail-item">
                <div class="detail-item__label">申请原因</div>
                <div class="detail-item__content">{{ detailData.reason || '-' }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-item__label">申请时间</div>
                <div class="detail-item__content">{{ formatDateTime(detailData.applied_at) }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-item__label">审核时间</div>
                <div class="detail-item__content">{{ formatDateTime(detailData.reviewed_at) }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-item__label">审核意见</div>
                <div class="detail-item__content">{{ detailData.review_comment || '-' }}</div>
              </div>
            </div>

            <div class="section-title">拟变更数据</div>
            <div class="detail-list compact-list">
              <div
                v-for="item in buildNewDataItems(detailData.new_data)"
                :key="item.label"
                class="detail-item"
              >
                <div class="detail-item__label">{{ item.label }}</div>
                <div class="detail-item__content">{{ item.value }}</div>
              </div>
            </div>
          </template>
        </div>
      </el-drawer>
    </el-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { parseTime } from '@/utils'
import {
  getAdminAmendRequests,
  approveAdminAmendRequest,
  rejectAdminAmendRequest
} from '@/api/admin'

const STATUS_LABELS = {
  pending: '待审批',
  approved: '已通过',
  rejected: '已驳回'
}

const STATUS_OPTIONS = [
  { label: '待审批', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已驳回', value: 'rejected' }
]

const NEW_DATA_FIELDS = [
  { key: 'report_month', label: '拟填报月份' },
  { key: 'category_id', label: '营收分类 ID' },
  { key: 'cash', label: '现金' },
  { key: 'wechat_pay', label: '微信支付' },
  { key: 'alipay', label: '支付宝' },
  { key: 'card_pay', label: '银行卡' },
  { key: 'other_pay', label: '其他支付' },
  { key: 'traffic', label: '客流量' },
  { key: 'remark', label: '备注' }
]

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

  return value
}

function trimString(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function formatNumericValue(value) {
  if (value === undefined || value === null || value === '') {
    return '-'
  }

  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) {
    return value
  }

  return numericValue.toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })
}

export default {
  name: 'BusinessAmendRequestsPage',
  data() {
    return {
      listLoading: false,
      list: [],
      detailVisible: false,
      detailLoading: false,
      detailData: null,
      reviewDialogVisible: false,
      reviewSubmitting: false,
      reviewAction: 'approve',
      currentRow: null,
      reviewForm: {
        review_comment: ''
      },
      listQuery: {
        month: '',
        status: undefined
      },
      statusOptions: STATUS_OPTIONS
    }
  },
  computed: {
    ...mapGetters([
      'profile'
    ]),
    pageTitle() {
      return this.$route.meta.pageTitle || this.$route.meta.title
    },
    pageDescription() {
      return this.$route.meta.pageDescription || '模块信息待补充。'
    },
    permissionRole() {
      return this.profile.permissionRole || '-'
    },
    reviewDialogTitle() {
      return this.reviewAction === 'approve' ? '通过补报申请' : '驳回补报申请'
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      this.listLoading = true
      try {
        const response = await getAdminAmendRequests(this.buildQueryParams())
        this.list = (response.data && response.data.list) || []
      } finally {
        this.listLoading = false
      }
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
    handleFilter() {
      this.getList()
    },
    handleReset() {
      this.listQuery = {
        month: '',
        status: undefined
      }
      this.getList()
    },
    handleView(row) {
      this.detailVisible = true
      this.detailLoading = true
      this.detailData = row
      this.$nextTick(() => {
        this.detailLoading = false
      })
    },
    openReviewDialog(action, row) {
      this.reviewAction = action
      this.currentRow = row
      this.reviewDialogVisible = true
      this.reviewForm = {
        review_comment: ''
      }
    },
    async submitReview() {
      if (!this.currentRow) {
        return
      }

      const payload = {}
      const reviewComment = trimString(this.reviewForm.review_comment)
      if (reviewComment) {
        payload.review_comment = reviewComment
      }

      this.reviewSubmitting = true
      try {
        const request = this.reviewAction === 'approve' ? approveAdminAmendRequest : rejectAdminAmendRequest
        const response = await request(this.currentRow.id, payload)
        const updatedRow = response.data || null

        this.reviewDialogVisible = false
        this.$message.success(this.reviewAction === 'approve' ? '审批通过成功' : '审批驳回成功')

        if (updatedRow && this.detailData && this.detailData.id === updatedRow.id) {
          this.detailData = updatedRow
        }

        await this.getList()
      } finally {
        this.reviewSubmitting = false
      }
    },
    buildNewDataItems(newData = {}) {
      const items = NEW_DATA_FIELDS.map(field => ({
        label: field.label,
        value: this.formatNewDataValue(field.key, newData[field.key])
      }))

      const payTotal = ['cash', 'wechat_pay', 'alipay', 'card_pay', 'other_pay']
        .map(key => Number(newData[key]) || 0)
        .reduce((total, value) => total + value, 0)

      items.splice(7, 0, {
        label: '五项支付合计',
        value: payTotal > 0 ? formatNumericValue(payTotal) : '-'
      })

      return items
    },
    formatNewDataValue(key, value) {
      if (['cash', 'wechat_pay', 'alipay', 'card_pay', 'other_pay', 'traffic', 'category_id'].includes(key)) {
        return formatNumericValue(value)
      }

      return value || '-'
    },
    statusLabel(status) {
      return STATUS_LABELS[status] || status || '-'
    },
    statusTagType(status) {
      if (status === 'approved') {
        return 'success'
      }

      if (status === 'rejected') {
        return 'danger'
      }

      return 'warning'
    },
    formatDateTime
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
  width: 180px;
}

.action-button {
  width: auto;
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

.compact-list {
  margin-top: 12px;
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
  color: #303133;
  line-height: 1.6;
  word-break: break-word;
}

.section-title {
  margin: 24px 0 12px;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

@media (max-width: 767px) {
  .module-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-item {
    width: 100%;
  }

  .action-button {
    width: 100%;
  }

  .detail-item {
    flex-direction: column;
  }

  .detail-item__label {
    width: 100%;
  }
}
</style>
