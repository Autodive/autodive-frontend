<template>
  <div class="projectlist">
    <div class="search-view">
      <el-button type="primary" @click="add">{{ $t("新建项目") }}</el-button>
      <el-button :disabled="disabled" @click="delmore">{{ $t("批量删除") }}</el-button>
      <el-input :suffix-icon="Search" style="margin-left: 12px; width: 400px" :placeholder="$t('请输入搜索内容')" v-model="keyword" @change="keyWordChange"></el-input>
    </div>
    <el-table :data="tableData" border @selection-change="handleSelectionChange" style="margin-top: 10px; width: 100%">
      <el-table-column type="selection" align="center" :selectable="selectTaleRow" width="55">
      </el-table-column>
      <el-table-column prop="name" align="center" :label="$t('项目名称')">
      </el-table-column>
      <el-table-column prop="desc" align="center" :label="$t('项目描述')">
      </el-table-column>
      <el-table-column prop="createDate" align="center" :label="$t('创建时间')">
        <template #default="scope">
          {{ formatTime(scope.row.createDate) }}
        </template>
      </el-table-column>

      <el-table-column :label="$t('操作')" align="center">
        <template #default="scope">
          <el-button @click="look(scope.row)" style="border-color:transparent;font-size:20px" :title="$t('进入项目')">
            <img src="@/assets/listenter.png" />
          </el-button>
          <el-button @click="edit(scope.row)" style="border-color:transparent;font-size:20px" :title="$t('编辑项目')">
            <el-icon :size="20">
              <Edit />
            </el-icon>
          </el-button>
          <el-button @click="del(scope.row.id)" style="border-color:transparent;font-size:20px" :disabled="scope.row.createBy==userId?false:true" :title="scope.row.createBy==userId ? $t('删除项目'): $t('无权限')">
            <el-icon :size="20">
              <Delete />
            </el-icon>
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination-view">
      <el-pagination background @current-change="handleCurrentChange" :current-page="page" :total="total" :page-sizes="[10, 20, 50, 100]" :page-size="size" @size-change="handleSizeChange" layout="total, prev, pager, next, jumper">
      </el-pagination>
    </div>

    <el-dialog :title="title" v-model="dialogVisible" width="40%">
      <el-form ref="form" :model="formitem" label-width="150px" class="add-project-from">
        <el-form-item :label="$t('项目名称') + ' :'">
          <el-input :placeholder="$t('请输入项目名')" v-model="formitem.name"></el-input>
        </el-form-item>
        <el-form-item :label="$t('项目描述') + ' :'">
          <el-input :placeholder="$t('请输入项目描述')" v-model="formitem.desc"></el-input>
        </el-form-item>
        <el-form-item :label="$t('元数据') + ' :'">
          <el-row style="margin:10px 0px 0px 0px" :gutter="20" class="meta" v-for="(item, index) in metadata" :key="index">
            <el-col :span="10">
              <el-input :placeholder="$t('请输入key')" v-model="item.key"></el-input>
            </el-col>
            <el-col :span="10">
              <el-input :placeholder="$t('请输入value')" v-model="item.value"></el-input>
            </el-col>
            <el-col :span="4">
              <el-button @click="deleteMeta(index)">
                <el-icon><Minus /></el-icon>
              </el-button>
            </el-col>
          </el-row>

          <el-button style="width:100%;margin:10px 0px 0px 0px" @click="addMeta">
            <el-icon><Plus /></el-icon>
          </el-button>

        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">{{ $t('取消') }}</el-button>
          <el-button type="primary" @click="send">{{ $t('确定') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { addproject, getproject, delproject, editproject } from '@/api/project'
import { getxmqx } from '@/api/quanxian'
import dayjs from 'dayjs'
import { ElMessageBox } from 'element-plus'
import useAuthStore from 'autodive-store-auth'
import { Search, Plus } from '@element-plus/icons-vue'
export default {
  props: {
    projectIntry: {
      type: String,
      default: '/main/project/home'
    }
  },
  components: {},
  data() {
    return {
      title: this.$t('新增项目'),
      tableData: [],
      keyword: '',
      dialogVisible: false,
      formitem: {
        name: '',
        desc: '',
        metadata: []
      },
      page: 1,
      size: 20,
      total: 0,
      disabled: true,
      checklist: [],
      modearry: [],
      metadata: []
    }
  },
  setup() {
    const store = useAuthStore()
    return {
      store,
    }
  },
  mounted() {
    if (this.$route.query.userId) {
      this.userId = this.$route.query.userId
    } else {
      this.userId = JSON.parse(localStorage.getItem('user')).id
    }
    this.getlist()
  },
  methods: {
    selectTaleRow(select, row) {
      if (select.createBy != this.userId) {
        return false
      }
      return true
    },

    addMeta() {
      this.metadata.push({ key: '', value: '' })
    },
    deleteMeta(index) {
      this.metadata.splice(index, 1)
    },

    formatTime(timestamp) {
      return dayjs(timestamp).format('LL LT')
    },
    handleSelectionChange(val) {
      this.checklist = val.map((item) => {
        return item.id
      })
      this.disabled = this.checklist.length > 0 ? false : true
    },
    handleCurrentChange(val) {
      this.page = val
      this.getlist()
    },
    handleSizeChange(value) {
      if (this.size != value) {
        this.size = value
        this.page = 0
        this.getlist()
      }
    },
    keyWordChange(value) {
      this.page = 0
      this.getlist()
    },
    getlist() {
      getproject({
        page: this.page - 1,
        size: this.size,
        keyword: this.keyword
      }).then((res) => {
        console.log(res)
        this.tableData = res.data.content
        this.total = res.data.totalElements
      })
    },
    look(row) {
      console.log(row, 'row---')
      getxmqx({ projectId: row.id }).then((res) => {
        if (res.data.status == 1) {
          this.$router.push({
            path: this.projectIntry,
            query: {
              name: row.name,
              id: row.id
            }
          })
        } else {
          this.$message({
            message: this.$t('你已经被禁用，请联系管理员'),
            type: 'error'
          })
        }
      })
    },
    add() {
      this.title = this.$t('新增项目')
      this.formitem = {
        name: '',
        desc: '',
        metadata: []
      }
      this.metadata = []
      this.dialogVisible = true
    },
    edit(row) {
      console.log('edit')
      console.log(row)
      getxmqx({ projectId: row.id }).then((res) => {
        if (res.data.status == 1) {
          this.formitem = JSON.parse(JSON.stringify(row))
          this.metadata = this.formitem.metadata ? this.formitem.metadata : []
          this.title = this.$t('编辑项目')
          this.dialogVisible = true
        } else {
          this.$message({
            message: this.$t('你已经被禁用，请联系管理员'),
            type: 'error'
          })
        }
      })
    },
    send() {
      if (!this.formitem.name) {
        this.$message({
          message: this.$t('请输入项目名'),
          type: 'error'
        })
        return;
      }
      if (this.formitem.id) {
        delete this.formitem.createDate
        this.formitem.metadata = this.metadata
        editproject(this.formitem).then((res) => {
          this.$message({
            message: this.$t('编辑成功'),
            type: 'success'
          })
          this.dialogVisible = false
          this.page = 1
          this.getlist()
        })
      } else {
        console.log(this.formitem)
        this.formitem.metadata = this.metadata
        addproject(this.formitem).then((res) => {
          this.$message({
            message: this.$t('新增成功'),
            type: 'success'
          })
          this.dialogVisible = false
          this.page = 1
          this.getlist()
        })
      }
    },
    del(id) {
      getxmqx({ projectId: id }).then((res) => {
        if (res.data.status == 0) {
          this.$message({
            message: this.$t('你已经被禁用，请联系管理员'),
            type: 'error'
          })
          return
        }
      })

      ElMessageBox.confirm(this.$t('确认删除') + '?', this.$t('提示'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消'),
        type: 'warning'
      })
        .then(() => {
          delproject(id).then((res) => {
            this.$message({
              message: this.$t('删除成功'),
              type: 'success'
            })
            this.page = 1
            this.getlist()
          })
        })
        .catch(() => {
        })
    },
    delmore() {
      if (this.checklist.length == 0) {
        this.$message({ message: this.$t('请最少勾选一条数据'), type: 'error' })
        return
      }

      ElMessageBox.confirm(this.$t('确认删除') + '?', this.$t('温馨提示'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消'),
        type: 'warning'
      })
        .then(() => {
          for (let i = 0; i < this.checklist.length; i++) {
            delproject(this.checklist[i]).then((res) => {
              if (i == this.checklist.length - 1) {
                this.$message({
                  message: this.$t('删除成功'),
                  type: 'success'
                })
                this.page = 1
                this.getlist()
              }
            })
          }
        })
        .catch(() => {
        })
    }
  }
}
</script>
<style lang="scss" scoped>
.projectlist {
  padding: 20px;
  .meta {
    margin: 10px 0px 0px 0px;
  }
}
.pagination-view {
  margin: 20px auto;
}
.add-project-from {
  margin: 20px 0 0;
}
</style>