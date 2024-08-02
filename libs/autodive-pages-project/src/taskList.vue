<template>
  <div id="task-list" class="task-list" style="height:100%">
    <div class="task-list-header">
      <el-checkbox-group v-model="checkedTypes" @change="handleCheckedTypeChange">
        <el-checkbox v-for="item in typeList" :label="item.value" :key="item.value">
          {{$t(item.name)}}
        </el-checkbox>
      </el-checkbox-group>
      <el-checkbox-group style="margin-left:50px" v-model="checkedStatuss" @change="handleCheckedStatusChange">
        <el-checkbox v-for="status in statusList" :label="status.value" :key="status.value">{{$t(status.name)}}</el-checkbox>
      </el-checkbox-group>
      <el-input size="small" prefix-icon="el-icon-search" v-model="keyword" style="margin-left:12px;margin-right:12px;width:400px" :placeholder="$t('搜索文献（模糊关键字）')"></el-input>
      <el-button size="small" type="primary" @click="search">{{ $t('搜索') }}</el-button>
    </div>
    <el-table border :data="tableData" style="width: 100%">
      <el-table-column :label="$t('资源名称')">
        <template #default="scope">
          <span>{{ scope.row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('资源类型')">
        <template #default="scope">
          <span>{{ $t(typeMap[scope.row.type])}}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('状态')">
        <template #default="scope">
          <span>{{ $t(statusMap[scope.row.status]) }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('操作')">
        <template #default="scope">
          <el-button size="mini" :disabled="scope.row.type!='text'?false:true" @click="handleBiaoZhu(scope.row)">{{ $t('去标注') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="page.pageNum" :page-sizes="[10, 20, 50, 100]" :page-size="page.pageSize" layout="total, sizes, prev, pager, next, jumper" :total="page.totalElements">
    </el-pagination>
  </div>
</template>
<script>
import { getzhiyuan } from '@/api/zhiyuan'
export default {
  data() {
    return {
      userId: 0,
      typeMap: { paper: '文献', txt: '文本', image: '图片' },
      checkedTypes: ['PAPER', 'TXT', 'IMAGE'],
      typeList: [
        { name: '文献', value: 'PAPER' },
        { name: '文本', value: 'TXT' },
        { name: '图片', value: 'IMAGE' }
      ],
      statusMap: { 1: '未完成', 2: '进行中', 3: '已完成' },
      checkedStatuss: ['UNFINSHED', 'SAVED', 'FINISHED'],
      statusList: [
        { name: '未完成', value: 'UNFINSHED' },
        { name: '进行中', value: 'SAVED' },
        { name: '已完成', value: 'FINISHED' }
      ],
      keyword: '',
      tableData: [],
      page: {
        pageSize: 10,
        pageNum: 1,
        totalPages: 0,
        totalElements: 0
      }
    }
  },

  mounted() {
    if (this.$route.query.userId) {
      this.userId = this.$route.query.userId
    } else {
      this.userId = JSON.parse(localStorage.getItem('user')).id
    }
    this.getTaskList()
  },
  methods: {
    getTaskList() {
      var filter = this.checkedTypes.concat(this.checkedStatuss).join(',')
      var params = {
        page: this.page.pageNum - 1,
        size: this.page.pageSize,
        projectId: this.$route.query.id,
        filter: filter,
        title: this.keyword
      }

      getzhiyuan(params).then((res) => {
        this.tableData = res.data.content
        this.page.totalPages = res.data.totalPages
        this.page.totalElements = res.data.totalElements
        this.page
        console.log(res.data)
      })
    },
    handleCheckedTypeChange(e) {
      this.getTaskList()
    },
    handleCheckedStatusChange(e) {
      this.getTaskList()
    },
    search() {
      this.getTaskList()
    },

    handleBiaoZhu(task) {
      this.$router.push({
        path: '/main/project/task/resourceAnnotation',
        query: {
          name: this.$route.query.name,
          id: this.$route.query.id,
          resourceId: task.id
        }
      })
    },

    handleSizeChange(value) {
      if (this.page.pageSize != value) {
        this.page.pageSize = value
        this.getTaskList()
      }
    },

    handleCurrentChange(value) {
      if (this.page.pageNum != value) {
        this.page.pageNum = value
        this.getTaskList()
      }
    }
  }
}
</script>

<style scoped lang="scss">
.task-list {
  padding: 20px;
  height: calc(100% - 40px);
  font-size: 14px;
  .task-list-header {
    display: flex;
    padding: 10px;
    .el-checkbox-group {
      display: flex;
      align-items: center;
    }
  }
}
</style>
