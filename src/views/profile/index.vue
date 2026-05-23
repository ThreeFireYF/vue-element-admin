<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="7" :xs="24">
        <user-card :user="user" />
      </el-col>

      <el-col :span="17" :xs="24">
        <el-card>
          <div slot="header">
            <span>账号资料</span>
          </div>
          <account :user="user" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import UserCard from './components/UserCard'
import Account from './components/Account'

export default {
  name: 'Profile',
  components: { UserCard, Account },
  computed: {
    ...mapGetters([
      'name',
      'avatar',
      'introduction',
      'profile'
    ]),
    user() {
      return {
        id: this.profile.id || '',
        name: this.name,
        role: this.profile.role || '',
        permissionRole: this.profile.permissionRole || '',
        storeName: this.profile.store_name || '',
        regionName: this.profile.region_name || '',
        introduction: this.introduction,
        avatar: this.avatar
      }
    }
  }
}
</script>
