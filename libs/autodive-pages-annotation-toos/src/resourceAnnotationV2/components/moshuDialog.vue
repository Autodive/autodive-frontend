<template>
  <el-dialog
    :title="$t('魔术套索')"
    custom-class="outdivstyle"
    v-model="dialogVisible"
    width="30%"
  >
    <moshuViewer style="width: 600px; height: 700px" />
    <template v-slot:footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ $t('取消') }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import moshuViewer from './moshuViewer.vue'
export default {
  name: 'moshuDialog',
  components: {
    moshuViewer,
  },
  data() {
    return {
      dialogVisible: false,
    }
  },
  methods: {
    show() {
      this.dialogVisible = true
    },
  },
}
</script>

<style lang="scss"></style>
