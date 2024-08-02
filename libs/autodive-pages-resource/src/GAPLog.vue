<template>
  <div class="GAPLogCont">
    <div>{{ $t('GAP日志') }}</div>
    <div class="btntop" style="display: flex; align-items: center">
      <el-button type="default" @click="startUploadLog" size="small">
        {{ $t('新增GAP日志') }}
      </el-button>
      <el-button type="default" @click="delmore" size="small">
        {{ $t('批量删除') }}
      </el-button>
    </div>
    <el-table :data="tableData" ref="multipleTable" @selection-change="handleSelectionChange" style="margin-top: 10px; width: 100%; overflow: scroll; margin-bottom: 20px" :header-cell-style="{ background: '#F9F9F9' }">
      <el-table-column align="center" type="selection" width="55">
      </el-table-column>
      <el-table-column prop="id" :label="$t('id')" show-overflow-tooltip>
        <template v-slot="scope">
          {{scope.row.id}}
        </template>
      </el-table-column>
      <el-table-column prop="prompt" :label="$t('内容')" show-overflow-tooltip>
        <template v-slot="scope">
          {{scope.row.content}}
        </template>
      </el-table-column>
      <el-table-column prop="createDate" :label="$t('创建日期')" width="200" show-overflow-tooltip>
        <template v-slot="scope">
          {{scope.row.createDate}}
        </template>
      </el-table-column>
      <el-table-column :label="$t('操作')" width="240">
        <template v-slot="scope">
          <el-button @click="onDelete(scope.row)" style="border-color: transparent; font-size: 20px; padding: 0 10px" :title="$t('删除')">
            <el-icon :size="20">
              <Delete />
            </el-icon>
          </el-button>

          <el-button @click="oEdit(scope.row)" style="border-color: transparent; font-size: 20px; padding: 0 10px; margin: 0 5px" :title="$t('编辑')">
            <el-icon :size="20">
              <Edit />
            </el-icon>
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagediv">
      <el-pagination background @current-change="handleCurrentChange" @size-change="handleSizeChange" :page-sizes="[10, 20, 30, 40, 50]" :current-page="page" :total="total" layout="total,sizes,prev, pager, next, jumper">
      </el-pagination>
    </div>

    <UploadGAPLog ref="uploadGAPLog" :baseURL="baseURL" :tokenName="tokenName" @didUpload="didUpload" />
  </div>
</template>

<script>
import { defineComponent, onMounted, ref, inject, watch } from 'vue'
import { getGAPLogList, delGAPLog } from './api/GAPLog'
import UploadGAPLog from './components/uploadGAPLog.vue'
import useAuthStore from 'autodive-store-auth'
export default {
  components: {
    UploadGAPLog,
  },
  computed: {
    projectId() {
      return this.$route.query.id
    }
  },
  props: {
    baseURL: '',
    tokenName: ''
  },
  data() {
    return {
      tableData: [],
      title: '',
      total: 0,
      page: 1,
      size: 10,
      total: 0,
      checklist: [],
      checklistname: [],
    }
  },
  setup() {
    const store = useAuthStore()

    return {
      store,
    }
  },
  async mounted() {
    await this.getlist()
  },
  methods: {
    startUploadLog() {
      this.$refs.uploadGAPLog.show()
    },
    didUpload() {
      this.page = 1
      this.getlist()
    },

    search() {
      this.page = 1
      this.getlist()
    },
    handleSizeChange(val) {
      this.size = val
      this.page = 1
      this.getlist()
    },
    handleCurrentChange(val) {
      this.page = val
      this.getlist()
    },
    getlist() {
      getGAPLogList(
        {
          page: this.page - 1,
          size: this.size
        }
      ).then((res) => {
        this.tableData = res.data.content
        this.total = res.data.totalElements
      })
    },
    selectAllTableRow(selection) {
      var arr = selection.concat([])
      arr.forEach((element) => {
        console.log(element)
        if (element.userList.length > 0 || element.status == 3) {
          this.$refs.multipleTable.toggleRowSelection(element, false)
        }
      })
    },
    handleSelectionChange(val) {
      this.checklist = val.map((item) => {
        return item.id
      })
      this.checklistname = val.map((item) => {
        return item.title
      })
    },
    onDelete(data) {
      const id = data.id
      this.$confirm(this.$t('是否删除该数据') + '?', this.$t('提示'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消'),
        type: 'warning'
      }).then(() => {
        delGAPLog(id).then((res) => {
          this.$message({
            message: this.$t('删除成功'),
            type: 'success'
          })
          this.page = 0
          this.getlist()
        })
      })
    },

    oEdit(data) {
      this.$refs.uploadGAPLog.edit(data)
    },

    delmore() {
      if (this.checklist.length == 0) {
        this.$message({ message: this.$t('请最少勾选一条数据'), type: 'error' })
        return
      }
      this.$confirm(this.$t('确认删除') + '?', this.$t('提示'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消'),
        type: 'warning'
      }).then(() => {
        for (let i = 0; i < this.checklist.length; i++) {
          delGAPLog(this.checklist[i]).then((res) => {
            if (i == this.checklist.length - 1) {
              this.$message({
                message: this.$t('删除成功'),
                type: 'success'
              })
              this.page = 0
              this.getlist()
            }
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.GAPLogCont {
  padding: 20px 20px 20px 20px;
  height: calc(100% - 40px);
  .btntop {
    margin-top: 30px;
  }
  :deep(.el-table) {
    max-height: calc(100% - 140px);
    .el-table__body-wrapper {
      max-height: calc(100% - 40px);
    }
  }
  .wks,
  .jxz,
  .wc {
    min-width: 70px;
    height: 24px;
    line-height: 24px;
    margin: 0 auto;
    text-align: center;
    color: #d63c45;
    border: 1px solid #d63c45;
    border-radius: 8px;
  }
  .jxz {
    color: #4587e9;
    border: 1px solid #4587e9;
  }
  .wc {
    color: #42a414;
    border: 1px solid #42a414;
  }
  .bzz {
    display: flex;
    align-items: center;
    justify-content: center;
    .el-dropdown {
      z-index: 1;
    }
  }
  .cir {
    background: #ccc;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-left: -10px;
    font-size: 10px;
    text-align: center;
    line-height: 40px;
    overflow: hidden;
    color: #fff;
    cursor: pointer;
  }
  .cir:hover {
    margin-left: 10px;
    margin-right: 10px;
  }
  .cir1 {
    background: #d63c45;
  }
  .cir2 {
    background: #e96c45;
  }
  .cir3 {
    background: #ffa842;
  }
  .cir4 {
    background: #ffdc26;
  }
  .cir5 {
    background: #e6e945;
  }
  .cir6 {
    background: #bee945;
  }
  .cir7 {
    background: #9be8f3;
  }
  .cir8 {
    background: #4587e9;
  }
}
.lookicon {
  cursor: pointer;
  width: 20px;
  height: 20px;
}
</style>
