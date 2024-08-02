<template>
  <el-dialog :title="isEdit ? $t('编辑GAP日志') : $t('新增GAP日志')" class="upload-resource" v-model="dialogVisible" @close="dialogClose" width="800px">
    <section class="update-container">
      <el-form ref="form" :rules="rules" :model="form" label-width="150px" style="margin-top: 15px">
        <el-form-item :label="$t('内容')">
          <el-input :placeholder="$t('请输入')" v-model="form.content" rows="10" type="textarea" />
        </el-form-item>
      </el-form>
    </section>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ $t('取消') }}</el-button>
        <el-button type="primary" @click="onSubmit" :disabled="unableSubmit">{{ $t('确认') }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { createGAPLog, editGAPLog } from '../api/GAPLog'
import useAuthStore from 'autodive-store-auth'

export default {
  name: 'UploadResource',
  components: {},
  computed: {
    accessToken() {
      return this.store.accessToken
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
      dialogVisible: false,
      rules: {
        content: [
          {
            required: true,
            message: this.$t('请输入内容'),
            trigger: 'blur'
          }
        ]
      },
      form: {
        content: '',
      },
      id: '',
      unableSubmit: false
    }
  },
  computed: {
    projectId() {
      return this.$route.query.id
    },
    isEdit() {
      return !!this.id
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
    edit(data) {
      this.show()

      this.id = data.id

      Object.keys(this.form).forEach((key) => {
        this.form[key] = data[key] || ''
      })
    },
    show() {
      this.initFormData()
      this.dialogVisible = true
    },
    dialogClose() {
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
        content: '',
      }
      this.id = ''
      this.unableSubmit = false
    },

    async onSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.isEdit) {
            editGAPLog(this.form, this.id).then((res) => {
              this.$message({
                message: this.$t('修改GAP日志成功'),
                type: 'success'
              })
              this.dialogVisible = false
              this.$emit('didUpload')
            })
          } else {
            createGAPLog(this.form).then((res) => {
              this.$message({
                message: this.$t('新增GAP日志成功'),
                type: 'success'
              })
              this.dialogVisible = false
              this.$emit('didUpload')
            })
          }
        }
      })
    }
  }
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
</style>
