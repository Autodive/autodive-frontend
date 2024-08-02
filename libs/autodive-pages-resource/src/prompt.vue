<template>
  <div class="zhiyuan">
    <div>{{ $t('Prompt模板') }}</div>
    <div class="btntop" style="display: flex; align-items: center">
      <el-button type="default" @click="startUploadPrompt" size="small">
        {{ $t('新增Prompt模板') }}
      </el-button>
      <el-button type="default" @click="delmore" size="small">
        {{ $t('批量删除') }}
      </el-button>
    </div>
    <el-table :data="tableData" ref="multipleTable" @selection-change="handleSelectionChange" style="margin-top: 10px; width: 100%; overflow: scroll; margin-bottom: 20px" :header-cell-style="{ background: '#F9F9F9' }">
      <el-table-column align="center" type="selection" width="55">
      </el-table-column>

      <el-table-column prop="title" :label="$t('标题')" show-overflow-tooltip>
        <template v-slot="scope">
          {{scope.row.title}}
        </template>
      </el-table-column>
      <el-table-column prop="description" :label="$t('描述')" show-overflow-tooltip>
        <template v-slot="scope">
          {{scope.row.description}}
        </template>
      </el-table-column>
      <el-table-column prop="prompt" :label="$t('Prompt模板内容')" show-overflow-tooltip>
        <template v-slot="scope">
          {{scope.row.prompt}}
        </template>
      </el-table-column>

      <el-table-column :label="$t('操作')"  width="240">
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

    <UploadPrompt ref="uploadPrompt" :baseURL="baseURL" :tokenName="tokenName" @didUpload="didUpload" />
    <ImportResource ref="importResource" />
  </div>
</template>

<script>
import { defineComponent, onMounted, ref, inject, watch } from 'vue'
import {
  getzhiyuan,
  delzhiyuan,
  gettype,
  findListByUserName,
  resourcesAssign,
  getzhiyuansearch
} from '@/api/zhiyuan'
import { getqx } from '@/api/quanxian'
import { getPromptList, delPrompt } from '@/api/prompt'

import { getUserOptToken } from '@/api/user'
import { exportResource } from '@/api/export'
import UploadPrompt from './components/uploadPrompt.vue'
import ImportResource from './components/importResource.vue'
import axios from 'axios'
import useAuthStore from 'autodive-store-auth'
import { config } from '@/config'
export default {
  components: {
    UploadPrompt,
    ImportResource
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
      multipleSelection: [],
      title: '',
      total: 0,
      page: 1,
      size: 10,
      total: 0,
      checklist: [],
      checklistname: [],
      dialogVisible3: false,
      userName: '',
      checkpoeple: [],
      dialogyulan: false,
      uploadVisible: false,
      content: '',
      iframeurl: '',
      isImportResource: false,
      tableHeight: '200',
      typeMap: {
        paper: '资料',
        txt: '关系',
        image: '图片',
      },
      taskStatusList: [
        { text: '标注完成', value: '3' },
        { text: '进行中', value: '2' },
        { text: '未开始', value: '1' }
      ]
    }
  },
  setup() {
    const store = useAuthStore()
    const isImportResource = ref(config.isImportResource)

    return {
      store,
      isImportResource
    }
  },
  async mounted() {
    await this.getlist()
  },
  methods: {
    keywordevent(e) {
      if (e != '' && e != null && e != undefined) {
        let arr = e.split(';')
        if (arr.length > 1) {
          return arr[0] + ';' + arr[1]
        } else {
          return arr[0]
        }
      } else {
        return ''
      }
    },
    startUploadPrompt() {
      this.$refs.uploadPrompt.show()
    },
    importResource() {
      this.$refs.importResource.show()
    },
    didUpload() {
      this.page = 1
      this.getlist()
    },

    search() {
      this.page = 1
      this.getlist()
    },
    async openurl(data) {
      var otpTokenResult = await getUserOptToken()
      this.dialogyulan = true
      if (data.type == 'txt') {
        const resp = await axios({
          method: 'GET',
          url: data.previewUrl + '?otpToken=' + otpTokenResult.data
        })
        this.content = resp.data
        this.iframeurl = ''
      } else {
        this.content = ''

        this.iframeurl =
          this.baseURL + data.previewUrl + '?otpToken=' + otpTokenResult.data
      }
    },
    delpeo(resid, userList, id) {
      console.log(resid, userList, id, '----')
      this.checkpoeple = userList.map((item) => {
        return item.userId
      })
      let index = this.checkpoeple.indexOf(id)
      this.checkpoeple.splice(index, 1)
      resourcesAssign({
        resourcesIds: [resid],
        userIds: this.checkpoeple
      }).then((res) => {
        this.$message({
          message: this.$t('删除成功'),
          type: 'success'
        })
        this.page = 1
        this.getlist()
      })
    },
    send3() {
      var params = { userIds: this.checkpoeple }
      var successNum = 0
      var total = this.checklist.length
      for (var i = 0; i < this.checklist.length; i++) {
        params.resourcesId = this.checklist[i]
        resourcesAssign(params).then((res) => {
          successNum += 1
          if (successNum == total) {
            this.$message({
              message: this.$t('指派成功'),
              type: 'success'
            })
            this.getlist()
            this.dialogVisible3 = false
          }
        })
      }

      if (this.checklist.length == 1) {
        params.resourcesId = this.checklist[0]
      } else {
        params.resourcesIds = this.checklist
      }
    },
    add() {
      this.$router.push({
        path:
          '/project/zhiyuanAdd?name=' +
          this.$route.query.name +
          '&id=' +
          this.projectId
      })
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
      getPromptList(
        {
          page: this.page - 1,
          size: this.size,
          title: this.title
        },
        this.projectId
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
        delPrompt(id, this.projectId).then((res) => {
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
      this.$refs.uploadPrompt.edit(data)
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
          delPrompt(this.checklist[i], this.projectId).then((res) => {
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
.zhiyuan {
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
