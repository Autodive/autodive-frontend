<template>
  <div class="publish-data">
    <el-row>
      <el-col :span="16">
        <div class="title">
          <div class="titleicon"></div>
          <div class="content">{{ $t('数据下载') }}</div>
          <el-button type="primary" @click="downLoadAll"><el-icon>
              <Download />
            </el-icon>{{ $t('全部下载') }}</el-button>
        </div>
        <el-tree :data="resourceList" node-key="id" default-expand-all :expand-on-click-node="false">
          <template v-slot="{ node, data }">
            <div class="custom-tree-node">
              <div class="tree-item-name">{{ data.title }}</div>
              <div>{{ data.desc }}</div>
              <el-button v-if="data.userId" class="down-load" @click="exportLayerAnnotations(data)">
                <el-icon>
                  <Download />
                </el-icon>
              </el-button>
            </div>
          </template>
        </el-tree>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getzhiyuansearch } from '@/api/zhiyuan'
import { getUserOptToken } from '@/api/user'
import { exportAnnotation } from '@/api/export'
import { exportProject } from '@/api/export'
import {config} from '@/config'
import useAuthStore from 'autodive-store-auth'
export default {
  data() {
    return {
      resourceList: [],
      typeMap: {
        paper: '资料',
        txt: '关系',
        image: '图片',
      }
    }
  },
  computed: {
    projectId() {
      return this.$route.query.id
    }
  },
  setup() {
    const store = useAuthStore()
    return {
      store
    }
  },
  async mounted() {
    this.getResourceList()
  },

  methods: {
    getResourceList() {
      getzhiyuansearch({
        page: 0,
        size: 10000,
        projectId: this.$route.query.id,
        title: ''
      }).then((res) => {
        var resourceList = res.data.content
        var arr = []
        console.log(resourceList)
        for (var i = 0; i < resourceList.length; i++) {
          var resource = resourceList[i]
          console.log(resource)
          var children = []
          if (resource.userList && Array.isArray(resource.userList)) {
            for (var j = 0; j < resource.userList.length; j++) {
              var user = resource.userList[j]
              children.push({
                resourceId: user.resourceId,
                userId: user.userId,
                title: user.userName
              })
            }
          }
          var data = {
            resourceId: resource.id,
            title: '(' + this.$t(this.typeMap[resource.type]) + ') ' + resource.title,
            children: children
          }
          if (children.length == 0) {
            data.desc = this.$t('无标注数据')
          } else {
            data.desc = ''
          }
          arr.push(data)
        }
        this.resourceList = arr
      })
    },

    async downLoadAll() {
      var otpTokenResult = await getUserOptToken()
      var params = {
        projectId: this.projectId,
        otpToken: otpTokenResult.data
      }
      exportProject(params)
    },

    async exportLayerAnnotations(data) {
      var otpTokenResult = await getUserOptToken()
      var params = {
        resourceId: data.resourceId,
        layerId: data.userId,
        projectId: this.projectId,
        otpToken: otpTokenResult.data
      }
      exportAnnotation(params)
    }
  }
}
</script>

<style lang="scss" scoped>
.publish-data {
  padding: 20px;
  background: #f5f5f5;
  height: calc(100% - 40px);
  .el-row {
    height: 100%;
    background: white;
    .el-col:last-child {
      height: 100%;
      border-left: 20px solid #f5f5f5;
    }
  }
  .el-button {
    font-size: 14px;
    border-radius: 8px;
    padding: 6px;
  }
  .title {
    height: 40px;
    width: 650px;
    display: flex;
    margin: 30px 0px 0px 30px;
    align-items: center;
    .titleicon {
      float: left;
      width: 5px;
      height: 18px;
      background: #08979c;
    }
    .content {
      font-size: 16px;
      padding-left: 10px;
      flex: 1;
    }
    .download {
      float: right;
    }
  }

  ::v-deep .el-tree {
    padding: 10px 0px 0px 24px;
    width: 650px;
    height: calc(100% - 60px);
    overflow: auto;
    .el-tree-node {
      margin-bottom: 10px;
    }
    .el-tree-node__content {
      height: 38px;
      .custom-tree-node {
        display: flex;
        width: 100%;
        border-radius: 8px;
        padding-left: 20px;
        padding-right: 20px;
        height: 38px;
        align-items: center;
        margin-top: 1px;
        .tree-item-name {
          flex: 1;
        }
      }
    }
    .el-tree-node__children {
      margin-top: 10px;
      .el-tree-node:hover {
        background: white;
      }

      .el-tree-node {
        .el-tree-node__content:hover {
          background: white;
        }
        .el-tree-node__content {
          .custom-tree-node:hover {
            border: 1px solid #08979c;
          }
          .custom-tree-node {
            display: flex;
            width: 100%;
            border-radius: 8px;
            border-left: 7px solid #999;
            padding-left: 20px;
            padding-right: 20px;
            height: 30px;
            align-items: center;
            margin-top: 1px;
            background: #f9f9f9;
            .tree-item-name {
              flex: 1;
            }
          }
        }
      }
    }

    .down-load {
      border: none;
      font-size: 20px;
      padding: 5px;
    }
  }

  .publish-button {
    width: 250px;
    height: 36px;
    background: #08979c;
    display: block;
    margin-top: 40px;
    margin-left: 60px;
    font-size: 16px;
  }
}
</style>
