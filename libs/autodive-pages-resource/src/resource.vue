<template>
  <div class="zhiyuan">
    <div>{{ $t('已有资源列表') }}</div>
    <div class="btntop" style="display: flex; align-items: center">
      <el-button type="default" @click="startUploadResource" size="small">
        {{ $t('上传资源') }}
      </el-button>
      <el-button type="default" v-if="isImportResource" @click="importResource" size="small">{{ $t('从资源库导入') }}</el-button>
      <el-button type="default" @click="exportResource" size="small">
        {{ $t('资源下载') }}
      </el-button>
      <el-button type="default" @click="betchDelete" size="small" :disabled="this.checklist.length === 0">
        {{ $t('批量删除') }}
      </el-button>
      <el-button type="default" @click="betchAssign" size="small" :disabled="this.checklist.length === 0">
        {{ $t('批量指派') }}
      </el-button>
      <el-button type="default" @click="betchAnnoTool" size="small" :disabled="this.checklist.length === 0">
        {{ $t('批量标注') }}
      </el-button>
      <el-button type="default" @click="betchExtrTool" size="small" :disabled="this.checklist.length === 0">
        {{ $t('批量提取') }}
      </el-button>
      <el-input :suffix-icon="Search" v-model="title" style="margin-left: 12px; margin-right: 12px; width: 400px" :placeholder="$t('搜索文献（模糊关键字）')" size="small"></el-input>
      <el-button type="primary" @click="search" size="small">
        {{ $t('搜索') }}
      </el-button>
      <el-button @click="classify" size="small" v-if="showClassify" class="resClsBtn" :style="`color: #575bca !important;`">
        <img src="@/assets/res/res_cls.png" class="ybicon" />
        {{ $t('资源分类') }}
      </el-button>
    </div>
    <el-table :data="tableData" ref="multipleTable" @selection-change="handleSelectionChange" style="margin-top: 10px; width: 100%; overflow: scroll; margin-bottom: 20px" :header-cell-style="{ background: '#F9F9F9' }" @sort-change="sortChange" @filter-change="filterChange">
      <el-table-column align="center" type="selection" width="55" />
      <el-table-column prop="name" width="130" align="center" :label="$t('任务状态')" :filters="taskStatusList" sortable="custom" column-key="status">
        <template v-slot="scope">
          <div v-if="scope.row.status == 1" class="wks">{{ $t('未开始') }}</div>
          <div v-if="scope.row.status == 2" class="jxz">{{ $t('进行中') }}</div>
          <div v-if="scope.row.status == 3" class="wc">
            {{ $t('标注完成') }}
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="doi" align="center" label="DOI" show-overflow-tooltip></el-table-column>

      <el-table-column prop="type" width="130" align="center" :label="$t('类型')">
        <template v-slot="scope">
          {{ $t(typeMap[scope.row.type]) }}
        </template>
      </el-table-column>
      <el-table-column prop="title" :label="$t('文献标题')" show-overflow-tooltip>
        <template v-slot="scope">
          {{scope.row.title}}
        </template>
      </el-table-column>
      <el-table-column width="140" prop="title" :label="$t('评估类型')" show-overflow-tooltip v-if="showClassify">
        <template v-slot="scope" >
          <el-icon :size="18" color="#575bca" class="is-loading" v-if="clsStatus && clsStatus!='finished'">
            <Loading />
          </el-icon>
          <div v-else style="display:flex;align-items:center;">
            <template v-if="scope.row.assessmentType">
              <img src="@/assets/res/other.png" class="ybicon" v-if="scope.row.assessmentType=='other'" />
              <img src="@/assets/res/lq.png" class="ybicon" v-if="scope.row.assessmentType=='outliers'" />
              <img src="@/assets/res/dx.png" class="ybicon" v-if="scope.row.assessmentType=='typical'" />
            </template>
            {{scope.row.assessmentType?$t(classifyData[scope.row.assessmentType]):scope.row.assessmentType}}
          </div>
        </template>
      </el-table-column>
      <el-table-column width="110" prop="title" :label="$t('资源分类')" align="center" show-overflow-tooltip v-if="showClassify">
        <template v-slot="scope">
          <el-icon :size="18" color="#575bca" class="is-loading" v-if="clsStatus && clsStatus!='finished'">
            <Loading />
          </el-icon>
          <span v-else>
            {{scope.row.cluster}}
          </span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('资源预览')" width="100">
        <template v-slot="scope">
          <img src="@/assets/lookicon.png" @click="openurl(scope.row)" class="lookicon" v-if="!unRelationsLable(scope.row.type)" />
        </template>
      </el-table-column>
      <el-table-column prop="authors" :label="$t('作者')" width="100" align="center" show-overflow-tooltip></el-table-column>
      <el-table-column prop="keywords" align="center" :label="$t('关键词')" show-overflow-tooltip>
        <template v-slot="scope">
          {{scope.row.keywords}}
        </template>
      </el-table-column>

      <el-table-column :label="$t('标注者')" align="center" width="240">
        <template v-slot="scope">
          <div class="bzz">
            <el-dropdown v-for="(item, index) in scope.row.userList" :key="index" :style="{width:index<3?'40px':'0px',marginRight:index<3?'10px':''}">
              <div class="cir" :class="'cir' + (index + 1)" v-if="index<3">
                {{ item.userName }}
              </div>
              <template v-slot:dropdown>
                <el-dropdown-menu><el-dropdown-item>
                    <div @click="delpeo(scope.row.id, scope.row.userList, item.userId)">
                      {{ $t('删除') }}
                    </div>
                  </el-dropdown-item></el-dropdown-menu>
              </template>
            </el-dropdown>
            <span v-if="scope.row.userList.length>3">...</span>
            <el-icon class="assign-task-icon" style="color:#575bca;" @click="openAssignTask(scope.row.id, scope.row.title, scope.row.userList)">
              <CirclePlus />
            </el-icon>

          </div>
        </template>
      </el-table-column>
      
      <el-table-column :label="$t('操作')" width="80" align="center">
        <template v-slot="scope">
          <el-button @click="del(scope.row)" style="border-color: transparent; font-size: 20px" :disabled="
              scope.row.userList.length > 0 || scope.row.status == 3
                ? true
                : false
            " :title="
              scope.row.status == 3
                ? $t('标注完成不能删除')
                : scope.row.userList.length > 0
                ? $t('已分配不能删除')
                : ''
            ">
            <el-icon :size="20">
              <Delete />
            </el-icon>
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagediv">
      <el-pagination background @current-change="handleCurrentChange" @size-change="handleSizeChange" :page-sizes="[2, 10, 20, 30, 40, 50]" :current-page="page" :total="total" layout="total,sizes,prev, pager, next, jumper">
      </el-pagination>
    </div>

    <el-dialog :title="$t('指派任务')" class="outdivstyle" v-model="assignTaskVisible" center width="25%">
      <div>
        {{ $t('已选择') }}<br />
        <div v-for="(item, index) in checkListName" :key="index" style="word-break: break-word">
          {{ item }}
        </div>
      </div>
      <el-input v-model="userName" @input="getpeople" :suffix-icon="Search" style="margin-top: 20px" :placeholder="$t('搜索标注者名称')"></el-input>
      <el-checkbox-group style="margin-top: 20px" v-model="checkpoeple">
        <div class="renlist" v-for="(item, index) in peoplelist" :key="index">
          <el-checkbox :label="item.userId">{{ item.userName }}</el-checkbox>
        </div>
      </el-checkbox-group>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="assignTaskVisible = false">
            {{ $t('取消') }}
          </el-button>
          <el-button type="primary" @click="send3">
            {{ $t('确认指派') }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog v-if="iframeurl.length > 0" :title="$t('资源预览')" class="outdivstyle outdivstyle2" v-model="dialogyulan" center width="80%">
      <iframe :src="iframeurl"></iframe>
    </el-dialog>

    <el-dialog v-if="content && content.length > 0" :title="$t('资源预览')" class="outdivstyle outdivstyle2" v-model="dialogyulan" center width="80%">
      <pre :style="{
          lineHeight: '30px',
          margin: '20px',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
        }">
              {{ this.content }}
            </pre>
    </el-dialog>
    <UploadResource ref="uploadResource" :baseURL="baseURL" :tokenName="tokenName" @didUpload="didUpload" />
    <ImportResource ref="importResource" />
  </div>
</template>

<script>
import { defineComponent, onMounted, ref, inject, watch,onBeforeUnmount } from 'vue'
import { Search } from '@element-plus/icons-vue'
import {
  getzhiyuan,
  delzhiyuan,
  gettype,
  findListByUserName,
  resourcesAssign,
  getzhiyuansearch,
  updateTool,
  ziyuanSetClassify
} from '@/api/zhiyuan'
import { getqx } from '@/api/quanxian'

import { getUserOptToken } from '@/api/user'
import { exportResource } from '@/api/export'
import { getprojectInfo } from '@/api/project'
import UploadResource from './components/uploadResource.vue'
import ImportResource from './components/importResource.vue'
import { ElNotification } from 'element-plus'
import axios from 'axios'
import useAuthStore from 'autodive-store-auth'
import { config } from '@/config'
let timer = null
export default {
  components: {
    UploadResource,
    Search,
    ImportResource
  },
  computed: {
    projectId() {
      return this.$route.query.id
    },
    checkListName() {
      if (this.checklist.length === 0) return []

      return this.tableData
        .filter((item) => {
          return this.checklist.indexOf(item.id) > -1
        })
        .map((item) => item.title)
    }
  },
  props: {
    baseURL: '',
    tokenName: '',
    showClassify: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      tableData: [],
      multipleSelection: [],
      title: '',
      total: 0,
      page: 1,
      size: 10,
      checklist: [],
      assignTaskVisible: false,
      peoplelist: [],
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
        { text: this.$t('标注完成'), value: '3' },
        { text: this.$t('进行中'), value: '2' },
        { text: this.$t('未开始'), value: '1' }
      ],

      searchForm: {
        status: '',
        sort: ''
      },
      classifyData: {
        "other": "其他样本",
        "outliers": "离群样本",
        "typical": "典型样本"
      },
      proList: [],
      clsStatus: ""
    }
  },
  setup() {
    const store = useAuthStore()
    const isImportResource = ref(config.isImportResource)

    function clearTimer() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    }
    
    onBeforeUnmount(() => {
      clearTimer();
    });

    return {
      store,
      isImportResource,
      timer,
      clearTimer
    }
  },
  async mounted() {
    this.clsStatus = "";
    await this.getlist()
    await this.getpeople()
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
    startUploadResource() {
      this.$refs.uploadResource.show()
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
            this.userName = "";
            this.checkpoeple = []
            this.getlist()
            this.assignTaskVisible = false
          }
        })
      }

      if (this.checklist.length == 1) {
        params.resourcesId = this.checklist[0]
      } else {
        params.resourcesIds = this.checklist
      }
    },
    getpeople() {
      getqx({
        page: 0,
        size: 9999,
        username: this.userName,
        projectId: this.projectId
      }).then((res) => {
        this.peoplelist = res.data.content
      })
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
      getzhiyuansearch({
        page: this.page - 1,
        size: this.size,
        projectId: this.projectId,
        title: this.title,
        ...this.searchForm
      }).then((res) => {
        console.log(res)
        this.tableData = res.data.content
        this.total = res.data.totalElements
      })
    },
    selectTaleRow(select, row) {
      if (select.userList.length > 0 || select.status == 3) {
        return false
      }
      return true
    },
    selectAllTableRow(selection) {
      console.log('selectAllTableRow')
      console.log(selection.toString())
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
    },
    del(data) {
      if (data.userList.length > 0 || data.status == 3) {
        return
      }

      var id = data.id
      this.$confirm(this.$t('是否删除该数据') + '?', this.$t('提示'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消'),
        type: 'warning'
      }).then(() => {
        delzhiyuan(id).then((res) => {
          this.$message({
            message: this.$t('删除成功'),
            type: 'success'
          })
          this.page = 0
          this.getlist()
        })
      })
    },

    async exportResource() {
      var otpTokenResult = await getUserOptToken()
      var params = {
        resourceId: this.projectId,
        otpToken: otpTokenResult.data
      }
      exportResource(params)
    },
    betchDelete() {
      if (this.checklist.length == 0) {
        this.$message({ message: this.$t('请最少勾选一条数据'), type: 'error' })
        return
      }

      this.$confirm(this.$t('是否删除该数据') + '?', this.$t('提示'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消'),
        type: 'warning'
      }).then(() => {
        for (let i = 0; i < this.checklist.length; i++) {
          delzhiyuan(this.checklist[i]).then((res) => {
            if (i == this.checklist.length - 1) {
              this.$message({
                message: this.$t('删除成功'),
                type: 'success'
              })
              this.page = 0
              this.getlist()
            }
          }).catch(err=>{
            if (i == this.checklist.length - 1) {
              this.page = 0
              this.getlist()
            }
          })
        }
      })
    },
    betchAssign() {
      if (this.checklist.length == 0) {
        this.$message({
          message: this.$t('请最少勾选一条数据'),
          type: 'error'
        })
        return
      }
      this.assignTaskVisible = true
    },
    openAssignTask(id, name, userList) {
      this.checklist = [id]
      this.checkpoeple = userList.map((item) => {
        return item.userId
      })
      this.assignTaskVisible = true
    },
    unRelationsLable(type) {
      return type === 'synergies' || type === 'behavioralIntent'
    },
    sortChange(data) {
      if (data.order === 'descending') {
        this.searchForm.sort = 'status,desc'
      } else if (data.order === 'ascending') {
        this.searchForm.sort = 'status,asc'
      } else {
        this.searchForm.sort = ''
      }

      this.getlist()
    },
    filterChange(newFilters) {
      let list = []
      newFilters['status'].forEach((item) => list.push(item))

      this.searchForm.status = list.join(',')

      this.getlist()
    },
    async changeAnyTool(row, type) {
      let params = [
        {
          id: row.id
        }
      ]

      params[0][type] = row[type]
      await updateTool(params)
      this.getlist()
    },
    async betchAnnoTool() {
      let includeClose = this.checklist.find(id => {
        let val = this.tableData.find(item => item.id === id)
        return val['annoTool'] === false
      })

      let params = this.checklist.map((id) => {
        return {
          id,
          annoTool: !!includeClose
        }
      })

      await updateTool(params)
      this.getlist()
    },
    async betchExtrTool() {
      let includeClose = this.checklist.find(id => {
        let val = this.tableData.find(item => item.id === id)
        return val['extrTool'] === false
      })

      let params = this.checklist.map((id) => {
        return {
          id,
          extrTool: !!includeClose
        }
      })

      await updateTool(params)
      this.getlist()
    },

    classify() {
      this.clearTimer();
      ziyuanSetClassify({projectId: this.projectId}).then(res=>{
        this.getProlist();
        if (res.data.message) {
          this.$message({
            message: this.$t(res.data.message),
            type: 'success'
          })
        }
      })
    },

    loopGetClaRes() {
      timer = setTimeout(()=>{
        this.getProlist();
      },5000)
    },

    getProlist() {
      getprojectInfo(this.projectId).then((res) => {
        this.clsStatus = res.data.resourceAnalysisStatus?res.data.resourceAnalysisStatus:"";
        if (res.data.resourceAnalysisStatus && res.data.resourceAnalysisStatus!='finished') {
          this.loopGetClaRes();
        } else {
          this.clearTimer();
          this.getlist();
        }

        if (res.data.resourceAnalysisStatus && res.data.resourceAnalysisStatus=='finished') {
          ElNotification({
            title: this.$t('成功通知'),
            message: this.$t('资源分类评估成功'),
            type: 'success',
            duration: "8000"
          })
        }
      })
    },
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
    font-size: 10px;
    text-align: center;
    line-height: 40px;
    overflow: hidden;
    color: #fff;
    cursor: pointer;
  }
  .cir:hover {
    filter: saturate(2);
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
.ybicon {
  width: 18px;
  height: 18px;
  margin-right: 5px;
}
::v-deep .resClsBtn {
  border: none !important;
}
.assign-task-icon {
  font-size: 42px;
  font-weight: bold;
  z-index: 0;
  cursor: pointer;
}
</style>
