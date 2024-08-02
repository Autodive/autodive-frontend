<template>
  <el-dialog :title="$t('上传文献')" class="upload-resource" v-model="dialogVisible" @close="dialogClose" width="500px">
    <section class="update-container">
      <div v-if="!successTip" class="upload-resource-nav">
        <el-tag v-for="item in navBars" :key="item.label" size="medium" @click="clickNavBar(item.type)" :type="type == item.type ? '' : 'info'" effect="dark">
          {{ item.label }}
        </el-tag>
      </div>
      <div v-if="!successTip" style="text-align: center">
        {{ $t('请填写资源信息并上传资源文件') }}
      </div>
      <el-form v-if="!successTip" ref="form" :rules="rules" :model="form" label-width="140px" style="margin-top: 15px">
        <el-form-item v-if="type != 'multiple'" :label="$t('标题')" prop="title">
          <div style="display: flex; width:100%;">
            <el-input :placeholder="$t('请输入')" v-model="form.title" />
              <el-button style="margin-left: 10px" v-if="form.type === 'paper'" @click="openBibtex" :title="$t('bibtex导入')" type="primary">
              <el-icon>
                <DocumentAdd />
              </el-icon>
            </el-button>
          </div>
        </el-form-item>
        <el-form-item :label="$t('类型')" prop="type" v-if="type != 'zip'">
          <el-radio-group v-model="form.type" @input="formTypeChange" class="el-radio-group">
            <el-radio :label="item.value" v-for="(item, index) in typeList" :key="index">{{ $t(item.label) }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.type == 'paper' && type == 'single'" :label="$t('doi')" prop="doi">
          <el-input :placeholder="$t('请输入')" v-model="form.doi"></el-input>
        </el-form-item>
        <el-form-item v-if="form.type == 'paper' && type == 'single'" :label="$t('作者')" prop="authors">
          <el-input :placeholder="$t('请输入')" v-model="form.authors"></el-input>
        </el-form-item>
        <el-form-item v-if="form.type == 'paper' && type == 'single'" :label="$t('关键字')" prop="keywords">
          <el-input :placeholder="$t('请输入')" v-model="form.keywords"></el-input>
        </el-form-item>

        <el-form-item v-if="form.type == 'txt' && type == 'single'" :label="$t('上传文本')" prop="txtUploadType">
          <el-radio-group v-model="txtUploadType">
            <el-radio label="input">{{ $t('直接录入') }}</el-radio>
            <el-radio label="upload">{{ $t('上传文件') }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="
          form.type == 'txt' && type == 'single' && txtUploadType == 'input'
        " :label="$t('文本')" prop="txtContent">
          <el-input :placeholder="$t('请输入内容')" type="textarea" :autosize="{ minRows: 3, maxRows: 4 }" v-model="form.txtContent"></el-input>
        </el-form-item>

        <el-form-item :label="$t('文件')" prop="url" v-if="type == 'single' && txtUploadType != 'input'">
          <el-upload :file-list="fileList" :action="uploadPath" :headers="uploadHeaders" :multiple="true" :before-upload="beforeUpload" :on-remove="fileRemove" :on-change="fileHandleChange">
            <el-button type="primary" size="small">{{
            $t('选择文件')
          }}</el-button>
          </el-upload>
        </el-form-item>

        <el-form-item :label="$t('文件')" prop="url" v-if="type == 'multiple'">
          <el-upload :file-list="fileList" :action="uploadPath" :headers="uploadHeaders" :multiple="true" :before-upload="beforeUpload" :show-file-list="false" :on-change="fileHandleChange">
            <el-button type="primary" size="small">{{
            $t('选择文件')
          }}</el-button>
          </el-upload>
        </el-form-item>

        <el-form-item v-if="type == 'multiple'">
          <el-row :gutter="20" v-if="fileList.length > 0">
            <el-col :span="10">
              <span class="file-name">{{$t('资源名')}}</span>
            </el-col>
            <el-col :span="10">
              <span class="file-name">{{$t('文件名')}}</span>
            </el-col>
            <el-col :span="4"> </el-col>
          </el-row>
          <div style="padding: 10px 0px" v-for="(file, index) in fileList" :key="index">
            <el-row :gutter="20">
              <el-col :span="10">
                <el-input :class="file.msg?.length > 0 ? 'is-error' : ''" :placeholder="$t('请输入')" @input="multipleFileTitleChange(file, index)" v-model="file.title" />
              </el-col>
              <el-col :span="10">
                <span class="file-name">{{ file.name }}</span>
              </el-col>
              <el-col :span="4">
                <el-button @click="deleteMultipleFile(index)">
                  <el-icon>
                    <Delete />
                  </el-icon>
                </el-button>
              </el-col>
            </el-row>
            <div :class="[file.msg==`${file.name},上传成功`?'form-success':'form-error']" v-if="file.msg?.length > 0">
              {{ file.msg }}
            </div>
          </div>
        </el-form-item>

        <el-form-item :label="$t('文件')" prop="url" v-if="type == 'zip'">
          <el-upload class="upload-demo" ref="upload" :file-list="fileList" :action="zipUploadUrl" :headers="uploadHeaders" :auto-upload="false" :data="form" :on-remove="fileRemove" :on-change="zipUploadOnChange" :http-request="requsetFile" accept=".zip,.tar,.gz">
            <el-button type="primary" size="small">{{
            $t('选择文件')
          }}</el-button>
          </el-upload>
        </el-form-item>

          <el-form-item :label="$t('元数据') + ' :'">
            <el-row style="margin:10px 0px 0px 0px" :gutter="20" class="meta" v-for="(item, index) in form.metadata" :key="index">
              <el-col :span="10">
                <el-input :placeholder="$t('请输入key')" v-model="item.key"></el-input>
              </el-col>
              <el-col :span="10">
                <el-input :placeholder="$t('请输入value')" v-model="item.value"></el-input>
              </el-col>
              <el-col :span="4">
                <el-button @click="deleteMeta(index)">
                  <el-icon>
                    <Minus />
                  </el-icon>
                </el-button>
              </el-col>
            </el-row>

            <el-button style="width:100%;margin:10px 0px 0px 0px" @click="addMeta">
              <el-icon>
                <Plus />
              </el-icon>
            </el-button>

          </el-form-item>
      </el-form>
    </section>

    <template #footer>
      <span v-if="!successTip" class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ $t('取消') }}</el-button>
        <el-button :type="unableSubmit ? 'info' : 'primary'" @click="send" :disabled="unableSubmit">{{ $t('确认') }}</el-button>
      </span>

      <span v-else class="dialog-footer">
        <el-button @click="dialogVisible = false" type="primary">{{
          $t('确认')
        }}</el-button>
      </span>
    </template>

    <div v-if="successTip">
      <el-table :data="successData" style="width: 100%">
        <el-table-column prop="name" :label="$t('成功列表')"> </el-table-column>
      </el-table>
      <el-table :data="faileData" style="width: 100%">
        <el-table-column prop="name" :label="$t('忽略的文件列表')"> </el-table-column>
      </el-table>
    </div>
  </el-dialog>

  <el-dialog :title="$t('bibtex导入')" v-model="bibtexVisible" @close="bibtexVisible = false" width="500px" class="bibtex-dialog" style="margin-left: calc(100%/2 + 250px) !important">
    <div style="margin: 20px 0 0">
      <el-input v-model="textarea" :rows="12" type="textarea" placeholder="" ref="bibtexInput" />
    </div>

    <template #footer>
      <el-button @click="bibtexVisible = false">{{ $t('取消') }}</el-button>
      <el-button type="primary" @click="bibtexSubmit" :disabled="textarea === ''">{{ $t('确认') }}</el-button>
    </template>
  </el-dialog>
</template>

<script>
import { insertResource, batchInsertResource } from '@/api/zhiyuan'
import { uploadTxtStr } from '@/api/upload'
import { typeListV2 } from '@/utils/constant'
import useAuthStore from 'autodive-store-auth'
import { BibtexParser } from 'bibtex-js-parser'
import request from 'axios'
import { setUploadUrl } from "@/utils/uploadUrl"

export default {
  name: 'UploadResource',
  components: {},
  computed: {
    accessToken() {
      return this.store.accessToken
    },
    typeList() {
      return typeListV2
    }
  },
  setup() {
    const store = useAuthStore()
    return {
      store
    }
  },
  data() {
    return {
      type: 'single',
      navBars: [
        { type: 'single', label: this.$t('普通上传') },
        { type: 'multiple', label: this.$t('批量上传') },
        { type: 'zip', label: this.$t('打包上传') }
      ],

      txtUploadType: '',
      dialogVisible: false,
      rules: {
        title: [
          {
            required: true,
            message: this.$t('请输入文献标题'),
            trigger: 'blur'
          }
        ],
        doi: [
          { required: false, message: this.$t('请输入doi'), trigger: 'blur' }
        ],
        url: [
          { required: true, message: this.$t('请上传文件'), trigger: 'change' }
        ],
        authors: [
          { required: false, message: this.$t('请填写作者'), trigger: 'blur' }
        ],
        type: [
          { required: true, message: this.$t('请选择类型'), trigger: 'blur' }
        ],
        txtContent: [
          {
            required: true,
            message: this.$t('请输入文本内容'),
            trigger: 'blur'
          }
        ]
      },
      form: {},
      fileList: [],
      uploadPath: setUploadUrl('/upload/') + this.$route.query.id,
      zipUploadUrl: '/resource/upload/' + this.$route.query.id,
      uploadHeaders: {},
      acceptTypeMap: {
        paper: ['pdf'],
        image: ['png', 'jpg', 'jpeg'],
        txt: ['txt'],
        zip: ['zip', 'tar', 'gz'],
        synergies: ['csv'],
        behavioralIntent: ['csv']
      },
      successTip: false,
      unableSubmit: false,
      bibtexVisible: false,
      textarea: ''
    }
  },
  props: {
    baseURL: '',
    tokenName: ''
  },
  mounted() {
    if (this.accessToken) {
      this.uploadHeaders[this.tokenName] = 'Bearer ' + this.accessToken
    }
  },
  methods: {
    show() {
      this.initFormData()
      this.dialogVisible = true
    },
    dialogClose() {
      this.type = 'single'
      this.successTip = false
      this.$refs['form']?.clearValidate()
      this.initFormData()
    },
    async clickNavBar(type) {
      if (this.type != type) {
        this.type = type
        this.$refs['form'].clearValidate()
        this.initFormData()
      }
    },
    initFormData() {
      this.form = {
        projectId: this.$route.query.id,
        title: '',
        type: 'paper',
        doi: '',
        keywords: '',
        url: '',
        authors: '',
        txtContent: '',
        txtUploadType: '',
        metadata: []
      }
      this.unableSubmit = false
      this.fileList = []
      this.faileData = []
      this.successData = []
    },
    formTypeChange(value) {
      this.form.txtContent = ''
      this.txtUploadType = ''
      if (value == 'txt') {
        this.txtUploadType = 'input'
      }
    },
    beforeUpload(file) {
      var type = file.name.substring(file.name.lastIndexOf('.') + 1)
      var acceptTypes = this.acceptTypeMap[this.form.type]

      if (!acceptTypes) {
        this.$message({ message: this.$t('请先选择文件类型')+'!', type: 'warning' })
        return false
      } else if (acceptTypes.indexOf(type) < 0) {
        this.$message({
          message: this.$t('只能上传') + acceptTypes + this.$t('类型文件')+'!',
          type: 'warning'
        })
        return false
      }
      return true
    },
    fileHandleChange(file, fileList) {
      console.log('fileHandleChange')
      if (this.type == 'single') {
        this.fileList = fileList.splice(-1, 1)
        var file = this.fileList[0]
        this.form.url = file.response ? file.response : ''
      } else {
        this.fileList = fileList
        var url = []
        this.fileList.forEach((item) => {
          if (item.response && item.response.length > 0) {
            url.push(item.response)
          }

          if (!item.title || item.title.length == 0) {
            item.title = item.name.split('.')[0]
          }
        })
        this.form.url = url
      }
      this.$refs['form'].validate()
      if (this.type == 'multiple') {
        this.verifyFileData()
      }
    },
    async requsetFile(options) {
      console.log(options, '----request file');
      this.form.file = options.file;
      request.post(this.zipUploadUrl, this.form, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': '*/*'
        },
      }).then(res=>{
        if (res.status == 200) {
          this.zipUploadSuccess(res.data);
          this.form.file = null;
        } else {
          this.$message({
            message: this.$t('请求失败'),
            type: 'error',
          })
        }
      }).catch(err=>{
        this.fileList[0].status = 'ready';
      })
    },
    fileRemove(file, fileList) {
      this.form.url = ''
      this.fileList = fileList
    },

    multipleFileTitleChange(value, index) {
      this.verifyFileData()
    },
    verifyFileData() {
      var unableSubmit = false
      for (var i = 0; i < this.fileList?.length; i++) {
        var file = this.fileList[i]
        if (file.title.length == 0) {
          unableSubmit = true
          file.msg = this.$t('资源名不能为空')
        } else {
          var ind = this.fileList.findIndex((item, j) => {
            return item.title == file.title && j != i
          })
          if (ind >= 0) {
            file.msg = this.$t('资源名重复')
            unableSubmit = true
          } else {
            file.msg = ''
          }
        }
      }
      this.unableSubmit = unableSubmit
      this.fileList = this.fileList.concat([])
    },

    deleteMultipleFile(index) {
      this.fileList.splice(index, 1)
      this.fileList = this.fileList
      if (this.fileList.length == 0) {
        this.form.url = ''
      }
      this.verifyFileData()
    },

    zipUploadOnChange(file, fileList) {
      console.log('zipUploadOnChange')
      if (fileList.length > 0) {
        this.fileList = fileList.splice(-1, 1)
      }
      this.form.url = file.name
      console.log(JSON.stringify(file))
      console.log(JSON.stringify(this.fileList))
      console.log(this.form.url)
    },
    zipUploadSuccess(value) {
      var successArr = value.successFiles
      var faileArr = value.skippedFiles
      var successData = []
      var faileData = []
      successArr.forEach((item) => {
        successData.push({ name: item })
      })
      faileArr.forEach((item) => {
        faileData.push({ name: item })
      })
      this.successData = successData
      this.faileData = faileData
      this.successTip = true
      this.dialogVisible = false
      this.$emit('didUpload')
    },

    async send() {
      if (
        this.type == 'single' &&
        this.form.type == 'txt' &&
        this.txtUploadType == 'input' &&
        this.form.txtContent.length > 0
      ) {
        var re = await uploadTxtStr(this.form.txtContent, '/upload/'+ this.$route.query.id)
        if (re.data) {
          this.form.url = re.data
        } else {
          this.$message({ message: this.$t(文本上传失败)+'!', type: 'error' })
          return
        }
      }

      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.type == 'single') {
            insertResource(this.form).then((res) => {
              this.dialogVisible = false
              this.$emit('didUpload')
            })
          } else if (this.type == 'multiple') {
            var data = []
            for (var i = 0; i < this.fileList.length; i++) {
              var file = this.fileList[i]
              var params = {
                url: file.response,
                title: file.title,
                type: this.form.type,
                projectId: this.form.projectId
              }
              data.push(params)
            }

            if (data.length > 0) {
              batchInsertResource(data).then((res) => {
                if (res.status != 200) {
                  console.log('batchInsertResource faile')
                  return
                }

                var arr = res.data
                var isSuccess = true
                arr.forEach((item) => {
                  if (!item.acceptable) {
                    isSuccess = false
                  }
                })

                if (isSuccess) {
                  this.dialogVisible = false
                  this.$emit('didUpload')
                } else {
                  for (var i = 0; i < this.fileList.length; i++) {
                    var file = this.fileList[i]
                    if (!arr[i]?.acceptable) {
                      file.msg = arr[i].rejectReason
                    } else {
                      file.msg = `${file.name},${this.$t('上传成功')}`;
                      this.$message({
                        message: `${file.name},${this.$t('上传成功')}`,
                        type: "success",
                        duration: 1800
                      })
                    }
                  }
                  this.fileList = this.fileList.concat([])
                }
              })
            }
          } else {
            this.$refs.upload.submit()
          }
        }
      })
    },

    async singleSubmit(file) {
      var res = await insertResource({
        url: file.response,
        title: file.title
      }).then((res) => {
        console.log(res)
        this.dialogVisible = false
        this.$emit('didUpload')
      })
    },
    openBibtex() {
      this.textarea = ''
      this.bibtexVisible = true

      setTimeout(() => {
        let eInput = this.$refs.bibtexInput
        eInput.focus()
        document.execCommand('paste')
      })
    },
    deleteMeta(index) {
      this.form.metadata.splice(index, 1)
    },
    addMeta() {
      this.form.metadata.push({ key: '', value: '' })
    },
    handleImport() {},
    bibtexSubmit() {
      const input = this.textarea
      const bibJSON = BibtexParser.parseToJSON(input)

      if (bibJSON && bibJSON.length > 0) {
        let firstBibtexObj = bibJSON[0]
        let list = ['title', 'doi', 'authors', 'keywords']
        list.forEach((key) => {
          if (firstBibtexObj[key]) {
            this.form[key] = firstBibtexObj[key]
            delete firstBibtexObj[key]
          }
        })

        Object.keys(firstBibtexObj).forEach((key) => {
          this.form.metadata.push({
            key: key,
            value: firstBibtexObj[key]
          })
        })
      }

      this.bibtexVisible = false
    }
  },
  emits: ['didUpload']
}
</script>

<style lang="scss" scoped>
.upload-resource {
  .update-container {
    padding: 15px;
  }
  .el-row + .el-row {
    padding: 3px 0px;
  }
  .upload-resource-nav {
    padding-bottom: 15px;
  }
  .file-name {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    width: 100%;
    display: block;
  }

  .form-error {
    color: #ff4d4f;
    font-size: 12px;
    line-height: 1;
    padding-top: 5px;
    padding-bottom: 5px;
  }
  .form-success {
    color: #52c41a;
    font-size: 12px;
    line-height: 1;
    padding-top: 5px;
    padding-bottom: 5px;
  }
  .is-error {
    .el-input__inner {
      border: 1px solid #ff4d4f;
    }
  }
}
.el-radio-group {
  line-height: inherit;
  font-size: 14px;
}
::v-deep .bibtex-dialog .el-dialog__footer {
  padding: 0 !important;
  border: none !important;
}
::v-deep .el-upload-list {
  width: 70%;
}
</style>
