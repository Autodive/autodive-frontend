<template>
  <el-dialog :title="$t('从资源库导入')" class="outdivstyle" v-model="dialogVisible" width="30%">
    <div style="text-align: center">
      {{ $t('请填写文献信息并上传pdf文件') }}
    </div>
    <template v-slot:footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ $t('取消') }}</el-button>
        <el-button type="primary" @click="send">{{ $t('确认') }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
export default {
  name: 'ImportResource',
  components: {},
  data() {
    return {
      dialogVisible: false
    }
  },
  methods: {
    show() {
      this.dialogVisible = true
    },
    send() {
      this.dialogVisible = false
    }
  }
}
</script>