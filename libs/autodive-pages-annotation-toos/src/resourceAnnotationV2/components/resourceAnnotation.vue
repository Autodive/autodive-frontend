<template>
  <div id="resourceAnnotation" class="resource-annotation" style="height: 100%">
    <div class="content">
      <div
        :style="{ display: showMarkList ? 'none' : 'flex' }"
        class="pop-btn"
        @click="setMarkListDisplay(true)"
      >
        <img src="@/assets/jtright.png" />
        <p class="rotate_text">{{ $t('查看标签') }}</p>
      </div>
      <div
        class="resource-annotation-left"
        :style="{ display: showMarkList ? 'block' : 'none' }"
      >
        <mark-list
          ref="markListViewer"
          @clickDictBiaoZhu="clickDictBiaoZhu"
          @clickRegBiaoZhu="clickRegBiaoZhu"
          @deleteBiaozhu="delBiaoZhuFromMark"
          @deleteRelation="delRelationFromMark"
          @setAnnotationDisplay="setAnnotationDisplay"
          @setResourceZoneAnnotationActive="setResourceZoneAnnotationActive"
          @didGetNewBentiMarkListData="didGetNewBentiMarkListData"
          @didGetNewRelationMarkListData="didGetNewRelationMarkListData"
        />
      </div>

      <div
        v-if="showMarkList"
        class="pop-btn"
        @click="setMarkListDisplay(false)"
      >
        <img src="@/assets/jtleft.png" />
        <p class="rotate_text">{{ $t('收起标签') }}</p>
      </div>

      <div
        class="resource-annotation-preview"
        :style="{
          width: showMarkList ? 'calc(100% - 423px)' : 'calc(100% - 35px)',
        }"
      >
        <pdf-zone
          v-if="resource.type == 'paper'"
          ref="pdfzone"
          :resource="resource"
          :bentiMarkList="bentiMarkListData"
          :relationMarkList="relationMarkListData"
          @finishedLoad="finishedLoad"
          @finishedSearch="finishedSearch"
          @getbz="getAnnotationFromPdf"
          @addRelationCaptionOfAnnotation="addRelationCaptionOfAnnotation"
          @getdelbq="getDelAnnotationFromOperationZone"
          @getgx="getRelationFromOperationZone"
          @editorAnnotation="editorAnnotation"
          @showbq="showbq"
          @getok="completeAction"
          @getzc="stagData"
          @setResourceMarkListAnnotationActive="
            setResourceMarkListAnnotationActive
          "
        />

        <image-zone
          v-if="resource.type == 'image'"
          ref="imagezone"
          :resource="resource"
          :bentiMarkList="bentiMarkListData"
          :relationMarkList="relationMarkListData"
          @finishedLoad="finishedLoad"
          @getbz="getAnnotationFromPdf"
          @addRelationCaptionOfAnnotation="addRelationCaptionOfAnnotation"
          @getdelbq="getDelAnnotationFromOperationZone"
          @getgx="getRelationFromOperationZone"
          @editorAnnotation="editorAnnotation"
          @showbq="showbq"
          @getok="completeAction"
          @getzc="stagData"
          @setResourceMarkListAnnotationActive="
            setResourceMarkListAnnotationActive
          "
        />

        <txt-zone
          v-if="resource.type == 'txt'"
          ref="txtzone"
          :resource="resource"
          :bentiMarkList="bentiMarkListData"
          :relationMarkList="relationMarkListData"
          @getbz="getAnnotationFromPdf"
          @addRelationCaptionOfAnnotation="addRelationCaptionOfAnnotation"
          @getdelbq="getDelAnnotationFromOperationZone"
          @getgx="getRelationFromOperationZone"
          @editorAnnotation="editorAnnotation"
          @showbq="showbq"
          @getok="completeAction"
          @getzc="stagData"
          @setResourceMarkListAnnotationActive="
            setResourceMarkListAnnotationActive
          "
        />
      </div>
    </div>

    <el-dialog
      class="annotation-editor"
      :title="annotationEditor.heard"
      v-model="annotationEditor.isShow"
      width="40%"
      minWidth="500px"
    >
      <template v-slot:title>
        <div class="dialog-title">
          <span style="font-weight: bold"
            ><i
              :class="annotationEditor.typeIconClass"
              style="padding-right: 10px"
            ></i
            >{{ annotationEditor.heard }}</span
          >
        </div>
      </template>
      <el-form>
        <el-form-item :label="$t('标题') + ' :'">
          <el-input
            :placeholder="$t('请输入标题')"
            v-model="annotationEditor.title"
          ></el-input>
        </el-form-item>

        <el-form-item
          v-if="annotationEditor.annotation.annotationType == 'textBlock'"
          :label="$t('内容') + ' :'"
        >
          <el-input
            :placeholder="$t('请输入内容')"
            :disabled="true"
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 4 }"
            v-model="annotationEditor.annotation.content"
          ></el-input>
        </el-form-item>

        <el-form-item :label="$t('实体标签') + ' :'">
          <el-input
            :placeholder="$t('请输入内容')"
            :disabled="true"
            v-model="annotationEditor.definName"
          ></el-input>
        </el-form-item>

        <el-form-item
          v-if="annotationEditor.relatedUrl.length > 0"
          :label="
            $t(
              annotationEditor.annotation.annotationType == 'image'
                ? '图注'
                : '表注'
            ) + ' :'
          "
        >
          <img
            id="annotationEditorImg"
            :src="annotationEditor.relatedUrl + '?otpToken=' + otpToken"
          />
        </el-form-item>

        <el-form-item
          v-if="
            annotationEditor.annotation.relatedCaptionPresentation &&
            annotationEditor.annotation.relatedCaptionPresentation.type == 'txt'
          "
          :label="
            $t(
              annotationEditor.annotation.annotationType == 'image'
                ? '图注'
                : '表注'
            ) + ' :'
          "
        >
          <el-input
            :placeholder="$t('请输入内容')"
            :disabled="true"
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 4 }"
            v-model="
              annotationEditor.annotation.relatedCaptionPresentation.content
            "
          ></el-input>
        </el-form-item>

        <el-form-item
          :label="$t('图片') + ' :'"
          v-if="annotationEditor.annotation.annotationType != 'textBlock'"
        >
          <div class="editor-image">
            <el-image
              :src="annotationEditor.url"
              :preview-src-list="annotationEditor.previewList"
            >
            </el-image>
          </div>
          <div
            class="images"
            v-if="
              annotationEditor.annotation.annotationType == 'image' &&
              annotationEditor.images &&
              annotationEditor.images.length > 0
            "
          >
            <div
              style="display: flex"
              v-for="(url, index) in annotationEditor.images"
              :key="url"
            >
              <img :src="`${baseURL}${url}?otpToken=${otpToken}`" />
              <i
                @click="deleteEditorImage(index)"
                style="margin-left: -10px"
                class="el-icon-close"
              ></i>
            </div>
          </div>
        </el-form-item>

        <el-form-item
          class="annotation-editor-table-content"
          v-if="annotationEditor.annotation.annotationType == 'table'"
          :label="$t('表格内容') + ' :'"
        >
          <el-button @click="addRow" icon="el-icon-plus">{{
            this.$t('行')
          }}</el-button>
          <el-button @click="addColumns" icon="el-icon-plus">{{
            this.$t('列')
          }}</el-button>
          <template>
            <vue-excel-editor
              @cell-click="cellFocus"
              ref="table"
              no-footer
              v-model="annotationEditor.tabledata.data"
            >
              <vue-excel-column
                v-for="(item, index) in annotationEditor.tabledata.cols"
                :key="index"
                :field="cn[index]"
                :label="cn[index]"
                type="string"
                width="80px"
              />
            </vue-excel-editor>
          </template>
        </el-form-item>

        <el-form-item :label="$t('元数据') + ' :'">
          <el-row
            style="margin: 10px 0px 0px 0px"
            :gutter="20"
            class="meta"
            v-for="(item, index) in annotationEditor.metadata"
            :key="index"
          >
            <el-col :span="10">
              <el-input
                :placeholder="$t('请输入')+'key'"
                v-model="item.key"
              ></el-input>
            </el-col>
            <el-col :span="10">
              <el-input
                :placeholder="$t('请输入')+'value'"
                v-model="item.value"
              ></el-input>
            </el-col>
            <el-col :span="4">
              <el-button
                @click="deleteMeta(index)"
                icon="el-icon-minus"
              ></el-button>
            </el-col>
          </el-row>
          <el-button
            style="width: 100%; margin: 10px 0px 0px 0px"
            @click="addMeta"
            icon="el-icon-plus"
          ></el-button>
        </el-form-item>
      </el-form>
      <template v-slot:footer>
        <span class="dialog-footer">
          <el-button @click="annotationEditor.isShow = false">{{
            $t('取消')
          }}</el-button>
          <el-button type="primary" @click="clickAnnotationEditorSure">{{
            $t('确定')
          }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import markList from './markList.vue'
import PdfZone from './pdfZone.vue'
import imageZone from './imageZone.vue'
import txtZone from './txtZone.vue'

import { baseURL } from '@/config'
import { getMattingBlob, uploadMattingBlob } from './matting.js'
import moshuViewer from './moshuViewer.vue'
import { getResourceDetail } from '@/api/zhiyuan'
import { Loading } from 'element-ui'
import { getUserOptToken } from '@/api/user'
import { getgl } from '@/api/benti'

import {
  getTaskNav,
  getAnnotationListData,
  saveAnnotationListData,
  saveAnnotationRelationListData,
  completeTask,
} from '@/api/task'

export default {
  components: { markList, PdfZone, moshuViewer, imageZone, txtZone },

  data() {
    return {
      cn: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      showMarkList: false,
      baseURL: baseURL,
      resource: {},
      annotationList: [],
      navData: {
        first: '',
        previous: '',
        next: '',
        last: '',
      },
      bentiMarkListData: [],
      relationMarkListData: [],
      relationList: [],
      annotationEditor: {
        title: '',
        isShow: false,
        annotation: {},
        tabledata: {
          data: [
            {},
            {},
            {},
          ],
          cols: ['A', 'B', 'C'],
        },
        tableHeadData: [],
        metadata: [],
        selectedUtilBar: '',
        presentationUrl: '',
        relatedUrl: '',
      },

      userId: '',
      loadingInstance: {},
      otpToken: '',
    }
  },
  computed: {
    isRefineSen() {
      return this.$route.query.isRefineSen == 'true'
    },
  },
  mounted() {
    if (this.$route.query.userId) {
      this.userId = this.$route.query.userId
    } else {
      this.userId = JSON.parse(localStorage.getItem('user')).id
    }
    this.requestResourceDetail()
  },

  beforeRouteLeave(to, from, next) {
    var is = false
    console.log('recordstr=')
    console.log(this.resource.recordstr)
    console.log(JSON.stringify(this.resource.annotationList))
    this.resource.annotationList.forEach((ele) => {
      var item = JSON.parse(JSON.stringify(ele))
      delete item.selected
      if (!item.id || (item.deleted && item.id)) {
        is = true
      }
      if (item.id) {
        var annotationRecords = this.resource.annotationRecords
        var str1 = annotationRecords[item.id]
        var str2 = JSON.stringify(item)
        console.log(str1)
        console.log(str2)
        if (str1 != str2) {
          is = true
        }
      }
    })

    this.relationList.forEach((element) => {
      if (!element.id) {
        is = true
      }
    })

    if (!is) {
      next()
      return
    }
    var title = this.$t('警告')
    var message = this.$t('正在离开本页面，本页面内所有未保存数据都会丢失')
    var content = {
      confirmButtonText: this.$t('确定'),
      cancelButtonText: this.$t('取消'),
      type: 'warning',
    }
    this.$confirm(message, title, content)
      .then(() => {
        next()
      })
      .catch(() => {
        window.history.go(1)
      })
  },

  beforeRouteUpdate(to, from, next) {
    next()
    this.resource.type = ''
    this.$forceUpdate()
    this.requestResourceDetail()
  },

  methods: {
    setMarkListDisplay(value) {
      this.showMarkList = value
    },
    async requestResourceDetail() {
      var resourceId = this.$route.query.resourceId

      var target = document.getElementById('resourceAnnotation')
      this.loadingInstance = Loading.service({ target: target })
      var re = await getResourceDetail(resourceId)
      this.requestAnnotationData(re.data)
      this.requestDefinRelation()

      if (re.data.type != 'paper') {
        this.$nextTick(() => {
          this.loadingInstance.close()
        })
      }
    },
    async requestAnnotationData(resource) {
      var resourceId = this.$route.query.resourceId
      var re = await getAnnotationListData(resourceId, this.userId)
      resource.annotationList = re.data
      this.resource = resource
      this.recordAnnotationList(resource)
      this.$refs.markListViewer.setResource(this.resource)
    },

    recordAnnotationList(resource) {
      var annotationRecords = {}
      var str1 = JSON.stringify(resource.annotationList)
      resource.recordstr = str1
      resource.annotationList.forEach((item) => {
        var str = JSON.stringify(item)
        annotationRecords[item.id] = str
      })
      resource.annotationRecords = annotationRecords
    },

    async requestDefinRelation() {
      let re = await getgl({ projectId: this.$route.query.id })
      console.log(re, 're')
      if (this.resource.type == 'paper') {
        this.$refs.pdfzone.setDefinRelation(re.data)
      } else if (this.resource.type == 'image') {
        this.$refs.imagezone.setDefinRelation(re.data)
      } else if (this.resource.type == 'txt') {
        this.$refs.txtzone.setDefinRelation(re.data)
      }
    },
    didGetNewBentiMarkListData(data) {
      if (data && Array.isArray(data)) {
        this.bentiMarkListData = data
      }
    },
    didGetNewRelationMarkListData(data) {
      if (data && Array.isArray(data)) {
        this.relationMarkListData = data

        var relationList = []
        data.forEach((relationMark) => {
          var relations = relationMark.resourcesDefinRelationDefinListList

          if (relations && Array.isArray(relations)) {
            relations.forEach((relation) => {
              relationList.push(relation)
            })
          }
        })
        this.relationList = relationList

        if (this.resource.type == 'paper') {
          this.$refs.pdfzone.setAnnotationRelationList(this.relationList)
        } else if (this.resource.type == 'image') {
          this.$refs.imagezone.setAnnotationRelationList(this.relationList)
        } else if (this.resource.type == 'txt') {
          this.$refs.txtzone.setAnnotationRelationList(this.relationList)
        }
      }
    },
    clickDictBiaoZhu(item) {
      if (this.resource.type == 'paper') {
        this.$refs.pdfzone.getDictData(item)
      }
    },
    clickRegBiaoZhu(item) {
      if (this.resource.type == 'paper') {
        this.$refs.pdfzone.getRegData(item)
      }
    },
    delBiaoZhuFromMark(id) {
      if (this.deleteAnnotation(id)) {
        if (this.resource.type == 'paper') {
          this.$refs.pdfzone.deleteAnnotation(id)
        } else if (this.resource.type == 'image') {
          this.$refs.imagezone.deleteAnnotation(id)
        } else if (this.resource.type == 'txt') {
          this.$refs.txtzone.deleteAnnotation(id)
        }
      }
    },

    delRelationFromMark(value) {
      let ind = this.relationList.findIndex(
        (item) =>
          !item.deleted &&
          item.relationId == value.relationId &&
          item.fromFid == value.fromFid &&
          item.toFId == value.toFId
      )
      if (ind >= 0) {
        var relation = this.relationList[ind]
        relation.deleted = true
        if (this.resource.type == 'paper') {
          this.$refs.pdfzone.setAnnotationRelationList(this.relationList)
        } else if (this.resource.type == 'image') {
          this.$refs.imagezone.setAnnotationRelationList(this.relationList)
        } else if (this.resource.type == 'txt') {
          this.$refs.txtzone.setAnnotationRelationList(this.relationList)
        }
      }
    },

    setAnnotationDisplay(annatation) {
      if (this.resource.type == 'paper') {
        this.$refs.pdfzone.setAnnotationDisplay(annatation)
      } else if (this.resource.type == 'image') {
        this.$refs.imagezone.setAnnotationDisplay(annatation)
      } else if (this.resource.type == 'txt') {
        this.$refs.txtzone.setAnnotationDisplay(annatation)
      }
    },

    setResourceZoneAnnotationActive(fId, isActive) {
      if (this.resource.type == 'paper') {
        this.$refs.pdfzone.setAnnotationActive(fId, isActive)
      } else if (this.resource.type == 'image') {
        this.$refs.imagezone.setAnnotationActive(fId, isActive)
      } else if (this.resource.type == 'txt') {
        this.$refs.txtzone.setAnnotationActive(fId, isActive)
      }
    },

    async finishedLoad() {
      this.$nextTick(() => {
        this.loadingInstance.close()
      })

      console.log(this.resource, 'resoucre--=-=-=')

      if (this.isRefineSen) {
        const loadingInstance = Loading.service({
          fullscreen: true,
          text: '开始同步sen数据',
          body: true,
        })

        let annotationList = this.$refs.pdfzone.refineSen()
        this.resource.annotationList = annotationList
        let stagDataFlag = await this.stagData(true)
        await this.completeAction(true)
        if (stagDataFlag) {
          this.$message({
            message: '同步sen数据成功',
            type: 'success',
          })
          loadingInstance.close()
        }
      }
    },
    finishedSearch() {
      this.$refs.markListViewer.finishedSearch()
    },

    getAnnotationFromPdf(annotation) {
      annotation.deleted = false
      var annotationList = this.resource.annotationList
      if (annotationList == null) {
        annotationList = []
      }
      annotationList.push(annotation)
      this.resource.annotationList = annotationList
      this.$refs.markListViewer.setNewAnnotation(annotation)
    },

    addRelationCaptionOfAnnotation(annatation) {
      let ind = this.resource.annotationList.findIndex(
        (item) => item.presentation.fId == annatation.presentation.fId
      )
      var oldAnnotation = this.resource.annotationList[ind]
      oldAnnotation.relatedCaptionPresentation =
        annatation.relatedCaptionPresentation
    },

    getDelAnnotationFromOperationZone(id) {
      if (this.deleteAnnotation(id)) {
        this.$refs.markListViewer.deleteAnnotation(id)
      }
    },

    deleteAnnotation(id) {
      let ind = this.resource.annotationList.findIndex(
        (item) => item.presentation.fId == id
      )
      if (ind != -1) {
        var annotation = this.resource.annotationList[ind]
        if (annotation.id) {
          annotation.deleted = true
        } else {
          this.resource.annotationList.splice(ind, 1)
        }
        this.saveAnnotationListToLocal()

        return true
      }
      return false
    },

    getRelationFromOperationZone(value) {
      this.relationList.push(value)
      this.$refs.markListViewer.setNewRelation(value)
      if (this.resource.type == 'paper') {
        this.$refs.pdfzone.setAnnotationRelationList(this.relationList)
      } else if (this.resource.type == 'image') {
        this.$refs.imagezone.setAnnotationRelationList(this.relationList)
      } else if (this.resource.type == 'txt') {
        this.$refs.txtzone.setAnnotationRelationList(this.relationList)
      }
    },
    showbq() {},
    async completeAction(noShowMessage) {
      var re = await this.stagData(true)
      if (!re) {
        return
      }

      if (this.isSave) {
        return
      }
      this.isSave = true
      var re = await completeTask(this.resource.id, this.userId)
      if (re.data) {
        if (!noShowMessage) {
          this.$message({
            message: this.$t('提交成功'),
            type: 'success',
          })
        }
        this.resource.status = 3
      }
      this.isSave = false
    },
    async stagData(notShowMessage) {
      if (this.isSave) {
        return
      }
      this.isSave = true

      var re = await saveAnnotationListData(
        this.resource.id,
        this.userId,
        this.resource.annotationList
      )
      if (re.status != 200) {
        this.$message({
          message: this.$t('标注保存失败'),
          type: 'error',
        })
        this.isSave = false
        return false
      }
      this.resource.annotationList = re.data
      this.recordAnnotationList(this.resource)

      var relations = []
      this.relationList.forEach((element1) => {
        var relation = {
          relationId: element1.relationId,
          deleted: element1.deleted,
        }
        if (element1.id) {
          relation.id = element1.id
        }
        re.data.forEach((element2) => {
          if (element2.presentation.fId == element1.fromFId) {
            relation.fromId = element2.id
            element1.fromId = element2.id
          }
          if (element2.presentation.fId == element1.toFId) {
            relation.toId = element2.id
            element1.toId = element2.id
          }
        })
        if (!(!relation.id && relation.deleted)) {
          relations.push(relation)
        }
      })

      if (relations.length > 0) {
        re = await saveAnnotationRelationListData(
          this.resource.id,
          this.userId,
          relations
        )
        if (re.status != 200) {
          this.$message({
            message: this.$t('标注关系保存失败'),
            type: 'error',
          })
          this.isSave = false
          return false
        }

        var arr = []
        this.relationList.forEach((element1) => {
          if (!element1.id && !element1.deleted) {
            let ind = re.data.findIndex(
              (element2) =>
                element1.deleted == element2.deleted &&
                element1.fromId == element2.fromId &&
                element1.toId == element2.toId &&
                element1.relationId == element2.relationId
            )
            element1.id = re.data[ind]?.id
          }
          if (!element1.deleted) {
            arr.push(element1)
          }
        })
        this.relationList = arr
      }

      if (!notShowMessage) {
        this.$message({
          message: this.$t('暂存成功'),
          type: 'success',
        })
        this.resource.status = 2
      }
      this.isSave = false
      return true
    },

    setResourceMarkListAnnotationActive(fId, isActive) {
      this.$refs.markListViewer.setAnnotationActive(fId, isActive)
    },

    async editorAnnotation(fId) {
      var otpTokenResult = await getUserOptToken()
      this.otpToken = otpTokenResult.data

      for (var i = 0; i < this.resource.annotationList.length; i++) {
        var annotation = this.resource.annotationList[i]
        if (annotation.presentation.fId == fId) {
          this.annotationEditor = {
            isShow: true,
            page: 100001,
            heard: annotation.name,
            title: annotation.name,
            annotation: annotation,
            url: baseURL + annotation.url + '?otpToken=' + this.otpToken,
            previewList: [
              baseURL + annotation.url + '?otpToken=' + this.otpToken,
            ],
            relatedUrl: '',
            images: annotation.presentation.images
              ? annotation.presentation.images.concat([])
              : [],
            metadata: annotation.metadata ? annotation.metadata.concat([]) : [],
          }
          if (
            annotation.relatedCaptionPresentation &&
            annotation.relatedCaptionPresentation.url &&
            annotation.relatedCaptionPresentation.url.length > 0
          ) {
            this.annotationEditor.relatedUrl =
              baseURL + annotation.relatedCaptionPresentation.url
          }

          if (annotation.annotationType == 'table') {
            if (!annotation.presentation.tabledata) {
              this.annotationEditor.tabledata = {
                data: [{}, {}, {}],
                cols: ['', '', ''],
              }
            } else {
              this.annotationEditor.tabledata = JSON.parse(
                JSON.stringify(annotation.presentation.tabledata)
              )
            }
            this.annotationEditor.tableHeadData = annotation.presentation
              .tableHeadData
              ? annotation.presentation.tableHeadData.concat([])
              : ['', '', '']
          }

          var typeIconClass = 'el-icon-picture-outline'
          if (annotation.annotationType == 'textBlock') {
            typeIconClass = 'el-icon-chat-line-round'
          } else if (annotation.annotationType == 'table') {
            typeIconClass = 'el-icon-s-grid'
          }
          this.annotationEditor.typeIconClass = typeIconClass

          this.bentiMarkListData.forEach((mark) => {
            if (mark.id == annotation.definitionId) {
              this.annotationEditor.definName = mark.definName
            }
          })
        }
      }
    },

    addRow() {
      const rec = {}
      this.annotationEditor.tabledata.cols.forEach((item) => {
        rec[item] = ''
      })
      this.$refs.table.newRecord(rec)
    },

    addColumns() {
      this.annotationEditor.tabledata.cols.push('')
      this.$forceUpdate()
    },

    cellFocus({ rowPos, colPos }) {
      this.annotationEditor.selectedCol = colPos
      this.annotationEditor.selecteRow = rowPos
    },

    deleteRow() {
      this.$refs.table.deleteRecord(this.annotationEditor.selecteRow)
    },
    deleteColumn() {
      this.annotationEditor.tabledata.cols.splice(
        this.annotationEditor.selectedCol,
        1
      )
      this.$forceUpdate()
    },

    async finishMoshuAnnotationOperation(value) {
      var annotation = this.annotationEditor.annotation
      var ele = document.getElementById('annotationEditorImg')
      getMattingBlob(value.points, ele, async (blob) => {
        var fileName = annotation.presentation.fId + '.png'
        var re = await uploadMattingBlob(
          blob,
          fileName,
          '/upload/' + this.$route.query.id + '/' + this.$route.query.resourceId
        )
        this.annotationEditor.images.push(re.data)
        var otpTokenResult = await getUserOptToken()
        this.otpToken = otpTokenResult.data
        this.$forceUpdate()
        this.$refs.moshu.clearAction(true)
      })
    },

    deleteEditorImage(index) {
      this.annotationEditor.images.splice(index, 1)
      this.$forceUpdate()
    },

    clickBZUtilBar(bar) {
      if (this.annotationEditor.selectedUtilBar == bar) {
        this.annotationEditor.selectedUtilBar = ''
        this.$forceUpdate()
        this.$refs.moshu.cancleDraw()
      } else {
        this.annotationEditor.selectedUtilBar = bar
        var imgEl = document.getElementById('annotationEditorImg')
        this.annotationEditor.imgWidth = imgEl.width
        this.annotationEditor.imgHeight = imgEl.height
        this.$forceUpdate()
        this.$nextTick(() => {
          var moshuEl = document.getElementById('moshuViewer')
          this.$refs.moshu.startDraw(bar)
        })
      }
    },
    addMeta() {
      this.annotationEditor.metadata.push({ key: '', value: '' })
      this.$forceUpdate()
    },
    deleteMeta(index) {
      this.annotationEditor.metadata.splice(index, 1)
      this.$forceUpdate()
    },
    clickAnnotationEditorSure() {
      this.annotationEditor.isShow = false
      this.annotationEditor.annotation.name = this.annotationEditor.title
      this.annotationEditor.annotation.metadata = this.annotationEditor.metadata
      this.annotationEditor.annotation.presentation.images =
        this.annotationEditor.images
      this.annotationEditor.annotation.presentation.tabledata =
        this.annotationEditor.tabledata
      this.annotationEditor.annotation.presentation.tableHeadData =
        this.annotationEditor.tableHeadData

      if (this.annotationEditor.images.length == 0) {
        delete this.annotationEditor.annotation.presentation.images
      }
      if (this.annotationEditor.tabledata.length == 0) {
        delete this.annotationEditor.annotation.presentation.tabledata
      }
      if (this.annotationEditor.tableHeadData.length == 0) {
        delete this.annotationEditor.annotation.presentation.tableHeadData
      }

      this.$forceUpdate()
      var annotationHeard = document.getElementById(
        'title' + this.annotationEditor.annotation.presentation.fId
      )
      annotationHeard.innerText = this.annotationEditor.title
    },

    saveAnnotationListToLocal() {
      try {
        localStorage.setItem(
          'annotationList',
          JSON.stringify(this.resource.annotationList)
        )
      } catch (e) {
        console.error(e)
      }
    },

    leaveWarning() {
      var title = this.$t('警告')
      var message = this.$t('正在离开本页面，本页面内所有未保存数据都会丢失')
      var content = {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消'),
        type: 'warning',
      }
      this.$confirm(message, title, content)
        .then(() => {
          next()
        })
        .catch(() => {
          window.history.go(1)
        })
    },
  },
}
</script>

<style lang="scss">
.resource-annotation {
  height: 100%;
  overflow-y: hidden;
  .navigation-bar {
    height: 50px;
    width: 100%;
    background: #e5e5e5;
    display: flex;
    .el-button {
      margin: auto;
    }
    .el-dropdown {
      margin: auto;
    }
  }
  .content {
    display: flex;
    overflow: scroll;
    width: 100%;
    height: 100%;
    .pop-btn {
      background: #f0f1fd;
      border-right: 1px solid #979797;
      border-radius: 8px;
      font-size: 16px;
      color: #575bca;
      display: flex;
      flex-direction: column;
      align-items: center;
      img {
        width: 23px;
        height: 23px;
        cursor: pointer;
        margin-top: auto;
      }
      p {
        cursor: pointer;
      }
      .rotate_text {
        font-size: 14px;
        width: 14px;
        padding: 0px 10px;
        white-space: normal;
        margin-bottom: auto;
        writing-mode: vertical-rl;
        padding-top: 10px;
      }
    }
    .resource-annotation-preview {
      margin-left: 0px;
    }
  }
  .meta {
    margin-top: 10px;
  }
  .annotation-editor {
    width: 100%;

    .bars {
      display: flex;
      line-height: 32px;
      flex-direction: row;
    }
    .editor-image {
      position: relative;
      overflow: auto;
      width: 100%;
      margin-top: 10px;
      img {
        border: solid 1px #e5e5e5;
      }
      .moshu {
        position: absolute;
        left: 0px;
        top: 0px;
      }
    }
    .images {
      display: flex;
      flex-direction: row;
      height: 40px;
      width: 100%;
      overflow: auto;
      img + img {
        margin-left: 10px;
      }
    }
    .annotation-editor-table-content {
      .annotation-editor-table-content-body {
        background: orange;
        width: 100%;
        max-height: 132px;

        .annotation-editor-table-content-body-main {
          .annotation-editor-table-content-body-main-inputs {
          }
          .annotation-editor-table-content-body-main-btns {
          }
        }
        .annotation-editor-table-content-body-botton-btns {
          height: 33px;
        }

        .el-button + .el-button {
          margin-left: 0px;
        }
      }

      .el-col {
        display: flex;
      }
      .annotation-editor-table-content-inputs {
        overflow: auto;

        input {
          width: 100px;
        }
        input + input {
          margin-left: 10px;
        }
      }

      .annotation-editor-table-content-inputs::-webkit-scrollbar {
        height: 0px;
        width: 0px;
      }
    }
  }
}
</style>
