<template>
  <div class="benti">
    <div class="content">
      <div class="bentileft">
        <ul class="tab" :class="{ tab2: act == 2 }">
          <li :class="{ hov: act == 1 }" @click="tabclick(1)">
            <span>{{ $t('实体标签') }}</span>
          </li>
          <li :class="{ hov: act == 2, disabled: unRelationsLable }" @click="tabclick(2)">
            <span class="ml-10">{{ $t('关系标签') }}</span>
          </li>
        </ul>
        <div v-if="act == 1" class="borbox">
          <el-tree :data="lefttreelist" node-key="id" default-expand-all :expand-on-click-node="false">
            <template v-slot="{ data }">
              <div class="custom-tree-node" :style="{ 'border-color': data.color }">
                <div class="tree-item-name">{{ data.definName }}</div>
                <div @click="sc(data)" class="tree-item-collect" :class="{ 'tree-item-collected': data.collected }"></div>
                <div v-if="data.shortcutKey" class="tree-item-key">
                  {{
                    data.shortcutKey
                      ? $t('快捷键') + ' :' + data.shortcutKey
                      : ''
                  }}
                </div>
                <el-button class="btnaddChild" v-if="role != 3 && isEdit" icon="el-icon-plus" @click="add1(data.id)">
                  <el-icon>
                    <Plus />
                  </el-icon>
                </el-button>
                <el-dropdown v-if="role != 3 && isEdit">
                  <el-icon class="el-icon-more">
                    <MoreFilled />
                  </el-icon>

                  <template v-slot:dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item><span @click="edit(data, index)">{{
                          $t('编辑标签')
                        }}</span></el-dropdown-item>
                      <el-dropdown-item><span @click="remove(data.id)">{{
                          $t('删除标签')
                        }}</span></el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
          </el-tree>
          <el-button class="btnadd" v-if="role != 3 && isEdit" type="primary" @click="add1('0')">
            <el-icon>
              <Plus />
            </el-icon>
          </el-button>
        </div>
        <div v-else-if="act == 2" class="borbox">
          <ul class="leftlist2" v-if="leftlist2.length > 0">
            <li v-for="(item, index) in leftlist2" :key="index">
              <div :style="{ background: item.color }" class="circolor"></div>
              <div class="listname">{{ item.name }}</div>
              <div @click="sc2(item)" class="liststart" :class="{ liststart2: item.collected }"></div>
              <div class="listkey">
                {{
                  item.shortcutKey ? $t('快捷键') + ' :' + item.shortcutKey : ''
                }}
              </div>
              <el-dropdown v-if="role != 3 && isEdit">
                <img class="listmore" src="@/assets/more.png" />
                <template v-slot:dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item><span @click="edit2(item, index)">{{
                        $t('编辑标签')
                      }}</span></el-dropdown-item>
                    <el-dropdown-item><span @click="remove2(item.id)">{{
                        $t('删除标签')
                      }}</span></el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </li>
          </ul>
          <el-button class="btnadd" v-if="role != 3 && isEdit" type="primary" @click="add2">
            <el-icon>
              <Plus />
            </el-icon>
          </el-button>
        </div>
      </div>
      <div class="bentiright">
        <div class="rightmain" id="hbdiv" :style="{ pointerEvents: role == 3 ? 'none' : '' }">
          <div id="canvasPanel" ref="canvasPanel" @dragover.prevent />
          <div v-if="tooltip && !isMouseDown" class="g6-tooltip" :style="`top: ${top}px; left: ${left}px;`">
            id: {{ tooltip }}
          </div>
        </div>
      </div>
    </div>

    <el-dialog :title="$t(definDialogTitle)" class="outdivstyle" v-model="definDialogVisible" width="35%">
      <el-form ref="form" :rules="rules" :model="form" label-width="140px">
        <el-form-item :label="$t('名称')" prop="definName">
          <el-input v-model="form.definName"></el-input>
        </el-form-item>
        <el-form-item :label="$t('描述')" prop="description">
          <el-input v-model="form.description"></el-input>
        </el-form-item>
        <el-form-item :label="$t('正则')" prop="regex">
          <el-input v-model="form.regex"></el-input>
        </el-form-item>
        <el-form-item :label="$t('字典')" prop="dict">
          <div style="position: relative">
            <el-input v-model="form.dict" disabled></el-input>
            <el-upload style="position: absolute; right: 10px; top: 8px" :action="uploadPath" :show-file-list="false" :headers="uploadHeaders" :on-success="handleAvatarSuccess">
              <img src="@/assets/sc.png" />
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item :label="$t('快捷键')" prop="shortcutKey">
          <el-input v-model="form.shortcutKey" @input="dxx" :maxlength="1"></el-input>
        </el-form-item>
        <el-form-item :label="$t('颜色')">
          <ul class="ysli">
            <li @click="colorclick('#E9458F')" :class="{ colorhov: form.color == '#E9458F' }">
              <el-icon class="el-icon-success" style="color: #e9458f">
                <SuccessFilled />
              </el-icon>
              <div class="colordiv" style="background: #e9458f"></div>
            </li>
            <li @click="colorclick('#08979c')" :class="{ colorhov: form.color == '#08979c' }">
              <el-icon class="el-icon-success" style="color: #08979c">
                <SuccessFilled />
              </el-icon>
              <div class="colordiv" style="background: #08979c"></div>
            </li>
            <li @click="colorclick('#9BE8F3')" :class="{ colorhov: form.color == '#9BE8F3' }">
              <el-icon class="el-icon-success" style="color: #9be8f3">
                <SuccessFilled />
              </el-icon>
              <div class="colordiv" style="background: #9be8f3"></div>
            </li>
            <li @click="colorclick('#8345E9')" :class="{ colorhov: form.color == '#8345E9' }">
              <el-icon class="el-icon-success" style="color: #8345e9">
                <SuccessFilled />
              </el-icon>
              <div class="colordiv" style="background: #8345e9"></div>
            </li>
            <li @click="colorclick('#70E1CB')" :class="{ colorhov: form.color == '#70E1CB' }">
              <el-icon class="el-icon-success" style="color: #70e1cb">
                <SuccessFilled />
              </el-icon>
              <div class="colordiv" style="background: #70e1cb"></div>
            </li>
            <li @click="colorclick('#FFDC26')" :class="{ colorhov: form.color == '#FFDC26' }">
              <el-icon class="el-icon-success" style="color: #ffdc26">
                <SuccessFilled />
              </el-icon>
              <div class="colordiv" style="background: #ffdc26"></div>
            </li>
            <li class="ysdiv">
              <img style="position: absolute; top: 20px; z-index: 99" src="@/assets/more.png" />
              <el-tooltip effect="dark" :content="$t('更多颜色')" placement="top">
                <el-color-picker v-model="form.color"></el-color-picker>
              </el-tooltip>
            </li>
          </ul>
        </el-form-item>
        
        <template>
          <el-form-item :label="$t('可标注范式')" prop="annotatedType">
            <el-checkbox-group
              v-model="checkedAnnotatedTypes"
              @change="handleCheckedAnnotedTypeChange"
            >
              <el-checkbox label="图片标注" name="form.annotatedType.image">{{
                $t('图片标注')
              }}</el-checkbox>
              <el-checkbox label="文本标注" name="form.annotatedType.txt">{{
                $t('文本标注')
              }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </template>
      </el-form>

      <template v-slot:footer>
        <span class="dialog-footer">
          <el-button @click="definDialogVisible = false">
            {{ $t('取消') }}
          </el-button>
          <el-button type="primary" @click="send1" :loading="definSubmitLoading">
            {{ $t('确定') }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog :title="$t(relationDialogTitle)" class="outdivstyle" v-model="relationDialogVisible" width="35%">
      <el-form ref="form2" :rules="rules2" :model="form2" label-width="80px">
        <el-form-item :label="$t('名称')" prop="name">
          <el-input v-model="form2.name"></el-input>
        </el-form-item>
        <el-form-item :label="$t('快捷键')" prop="shortcutKey">
          <el-input v-model="form2.shortcutKey" @input="dxx2" :maxlength="1"></el-input>
        </el-form-item>
        <el-form-item :label="$t('颜色')">
          <ul class="ysli">
            <li @click="colorclick2('#E9458F')" :class="{ colorhov: form2.color == '#E9458F' }">
              <el-icon class="el-icon-success" style="color: #e9458f">
                <SuccessFilled />
              </el-icon>
              <div class="colordiv" style="background: #e9458f"></div>
            </li>
            <li @click="colorclick2('#08979c')" :class="{ colorhov: form2.color == '#08979c' }">
              <el-icon class="el-icon-success" style="color: #08979c">
                <SuccessFilled />
              </el-icon>
              <div class="colordiv" style="background: #08979c"></div>
            </li>
            <li @click="colorclick2('#9BE8F3')" :class="{ colorhov: form2.color == '#9BE8F3' }">
              <el-icon class="el-icon-success" style="color: #9be8f3">
                <SuccessFilled />
              </el-icon>
              <div class="colordiv" style="background: #9be8f3"></div>
            </li>
            <li @click="colorclick2('#8345E9')" :class="{ colorhov: form2.color == '#8345E9' }">
              <el-icon class="el-icon-success" style="color: #8345e9">
                <SuccessFilled />
              </el-icon>
              <div class="colordiv" style="background: #8345e9"></div>
            </li>
            <li @click="colorclick2('#70E1CB')" :class="{ colorhov: form2.color == '#70E1CB' }">
              <el-icon class="el-icon-success" style="color: #70e1cb">
                <SuccessFilled />
              </el-icon>
              <div class="colordiv" style="background: #70e1cb"></div>
            </li>
            <li @click="colorclick2('#FFDC26')" :class="{ colorhov: form2.color == '#FFDC26' }">
               <el-icon class="el-icon-success" style="color: #ffdc26">
                <SuccessFilled />
              </el-icon>
              <div class="colordiv" style="background: #ffdc26"></div>
            </li>
            <li class="ysdiv">
              <img style="position: absolute; top: 20px; z-index: 99" src="@/assets/more.png" />
              <el-tooltip effect="dark" :content="$t('更多颜色')" placement="top">
                <el-color-picker v-model="form2.color"></el-color-picker>
              </el-tooltip>
            </li>
          </ul>
        </el-form-item>
      </el-form>

      <template v-slot:footer>
        <span class="dialog-footer">
          <el-button @click="relationDialogVisible = false">{{
              $t('取消')
            }}</el-button>
          <el-button type="primary" @click="send2" :loading="relationshipSubmitLoading">{{
              $t('确定')
            }}</el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog :title="$t('关联关系')" class="outdivstyle" v-model="definRelationDialogVisible" width="30%" :before-close="cancelDefinRelationDialog" @close="relationDialogClose">
      <el-radio-group class="tabbutton" v-model="radio" size="medium">
        <el-radio-button :label="1">{{
            $t('选择已有关系标签')
          }}</el-radio-button>
        <el-radio-button :label="2">{{ $t('新建关系标签') }}</el-radio-button>
      </el-radio-group>
      <el-form ref="form2" v-if="radio == 1" :rules="rules3" :model="form3" label-width="80px">
        <el-form-item :label="$t('选择关系')" prop="relationId">
          <el-select style="width: 100%" v-model="form3.relationId" :placeholder="$t('请选择')">
            <el-option v-for="item in leftlist2" :key="item.id" :label="item.name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <el-form ref="form2" v-if="radio == 2" :rules="rules2" :model="form2" label-width="80px">
        <el-form-item :label="$t('名称')" prop="name">
          <el-input v-model="form2.name"></el-input>
        </el-form-item>
        <el-form-item :label="$t('快捷键')" prop="shortcutKey">
          <el-input v-model="form2.shortcutKey" @input="dxx2"></el-input>
        </el-form-item>
        <el-form-item :label="$t('颜色')">
          <ul class="ysli">
            <li @click="colorclick2('#E9458F')" :class="{ colorhov: form2.color == '#E9458F' }">
              <i style="color: #e9458f" class="el-icon-success"></i>
              <div class="colordiv" style="background: #e9458f"></div>
            </li>
            <li @click="colorclick2('#08979c')" :class="{ colorhov: form2.color == '#08979c' }">
              <i style="color: #08979c" class="el-icon-success"></i>
              <div class="colordiv" style="background: #08979c"></div>
            </li>
            <li @click="colorclick2('#9BE8F3')" :class="{ colorhov: form2.color == '#9BE8F3' }">
              <i style="color: #9be8f3" class="el-icon-success"></i>
              <div class="colordiv" style="background: #9be8f3"></div>
            </li>
            <li @click="colorclick2('#8345E9')" :class="{ colorhov: form2.color == '#8345E9' }">
              <i style="color: #8345e9" class="el-icon-success"></i>
              <div class="colordiv" style="background: #8345e9"></div>
            </li>
            <li @click="colorclick2('#70E1CB')" :class="{ colorhov: form2.color == '#70E1CB' }">
              <i style="color: #70e1cb" class="el-icon-success"></i>
              <div class="colordiv" style="background: #70e1cb"></div>
            </li>
            <li @click="colorclick2('#FFDC26')" :class="{ colorhov: form2.color == '#FFDC26' }">
              <i style="color: #ffdc26" class="el-icon-success"></i>
              <div class="colordiv" style="background: #ffdc26"></div>
            </li>
            <li class="ysdiv">
              <img style="position: absolute; top: 20px; z-index: 99" src="@/assets/more.png" />
              <el-tooltip effect="dark" :content="$t('更多颜色')" placement="top">
                <el-color-picker v-model="form.color"></el-color-picker>
              </el-tooltip>
            </li>
          </ul>
        </el-form-item>
      </el-form>

      <template #footer>
        <span v-if="radio == 1" class="dialog-footer">
          <el-button @click="cancelDefinRelationDialog">
            {{ $t('取消') }}
          </el-button>
          <el-button type="primary" @click="send3">
            {{$t('确定')}}
          </el-button>
          <el-button v-if="form3.id" type="danger" @click="del3">
            {{$t('删除')}}
          </el-button>
        </span>
        <span v-if="radio == 2" class="dialog-footer">
          <el-button @click="cancelDefinRelationDialog">
            {{ $t('取消') }}
          </el-button>
          <el-button type="primary" @click="send4" :loading="correlationSubmitLoading">
            {{$t('新增')}}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import G6 from '@antv/g6'
import insertCss from 'insert-css'
import registerFactory from './components/graph/graph'
import ItemPanel from './components/ItemPanel.vue'
import { getxmqx } from '@/api/quanxian'
import request from 'axios'
import {
  getshiti,
  addshiti,
  editshiti,
  delshiti,
  getguanxi,
  addguanxi,
  editguanxi,
  delguanxi,
  getgl,
  addgl,
  editgl,
  delgl,
  addstsc,
  delstsc,
  addgxsc,
  delgxsc
} from '@/api/benti'
import useAuthStore from 'autodive-store-auth'
import { useI18n } from 'vue-i18n'

import { getUserOptToken } from '@/api/user'
import { exportBenti } from '@/api/export'
import { setUploadUrl } from "@/utils/uploadUrl"

insertCss(`
  .g6-component-toolbar li {
    list-style-type: none !important;
  }
`)

export default {
  components: {
    ItemPanel
  },
  props: {
    baseURL: '',
    tokenName: '',
    isEdit: {
      type: Boolean,
      default: true
    }
  },
  setup() {
    const store = useAuthStore()
    const { t } = useI18n()
    return {
      store,
      t
    }
  },
  computed: {
    id() {
      return this.$route.query.id
    },
    unRelationsLable() {
      return (
        this.typeValue === 'synergies' || this.typeValue === 'behavioralIntent'
      )
    },
    uploadPath() {
      return setUploadUrl('/upload/') + this.id
    }
  },
  data() {
    return {
      typeValue: 'image',
      definDialogVisible: false,
      definDialogTitle: '新建实体标签',
      relationDialogVisible: false,
      definRelationDialogVisible: false,
      relationDialogTitle: '新建关系标签',
      act: 1,
      act2: 1,
      allDefine: [],
      leftlist: [],
      leftlist2: [],
      lefttreelist: [],
      autoHtml: false,
      configVisible: false,
      isMouseDown: false,
      config: '',
      tooltip: '',
      top: 0,
      left: 0,
      form: {
        projectId: this.id,
        definName: '',
        coodx: 200,
        coody: 100,
        color: '#E9458F',
        description: '',
        regex: '',
        dict: '',
        shortcutKey: '',
        annotatedType: {
          txt: true,
          image: true,
          synergies: true,
          behavioralIntent: true
        }
      },
      checkedAnnotatedTypes: [],
      form2: {
        projectId: this.id,
        name: '',
        color: '#E9458F',
        shortcutKey: ''
      },
      form3: {
        projectId: this.id,
        fromid: '',
        toid: '',
        relationId: ''
      },
      rules: {
        definName: [
          { required: true, message: this.t('请输入名称'), trigger: 'blur' }
        ]
      },
      index: 0,
      rules2: {
        name: [
          { required: true, message: this.t('请输入名称'), trigger: 'blur' }
        ]
      },
      rules3: {
        relationId: [
          { required: true, message: this.t('请选择关系'), trigger: 'change' }
        ]
      },
      index2: 0,
      gxlist: [],
      graph: null,
      radio: 1,
      role: 3,
      baseURL: '',
      uploadHeaders: {},
      definSubmitLoading: false,
      relationshipSubmitLoading: false,
      correlationSubmitLoading: false
    }
  },
  mounted() {
    if (this.store.accessToken) {
      this.uploadHeaders[this.tokenName] = 'Bearer ' + this.store.accessToken
    }
    this.$nextTick(() => {
      this.createGraphic()
      this.initGraphEvent()
    })
    getxmqx({ projectId: this.id }).then((res) => {
      this.role = res.data.role
    })

    var canvasPanel = document.getElementById('canvasPanel')
    canvasPanel.onselectstart = function () {
      console.log('canvasPanel onselectstart 禁止选中文字')
      return false
    }
    canvasPanel.onmousedown = function () {
      console.log('canvasPanel onmousedown 禁止选中文字')
      return false
    }
  },
  beforeUnmount() {
    this.graph.destroy()
  },
  created() {
    window.fruchterman = this.fruchterman
  },
  methods: {
    typeChange() {
      this.leftlist = this.filteDefineList()
      this.lefttreelist = this.getTreeData(this.leftlist)

      let data = this.getRightDataStructure()
      if (this.unRelationsLable) {
        data = {}
      }
      this.graph.read(data)
      this.graph.render()

      this.act = 1
    },

    relationDialogClose() {
      this.form2 = {
        projectId: this.id,
        name: '',
        color: '#E9458F',
        shortcutKey: ''
      }
    },

    sc(item) {
      if (item.collected) {
        delstsc({ ids: [item.id] }).then((res) => {
          this.getlist()
        })
      } else {
        addstsc({ ids: [item.id] }).then((res) => {
          this.getlist()
        })
      }
    },
    sc2(item) {
      if (item.collected) {
        delgxsc({ ids: [item.id] }).then((res) => {
          this.getlist()
        })
      } else {
        addgxsc({ ids: [item.id] }).then((res) => {
          this.getlist()
        })
      }
    },
    isChinese(temp) {
      var re = /[^\u4E00-\u9FA5]/
      if (re.test(temp)) return false
      return true
    },
    dxx(e) {
      if (this.isChinese(e)) {
        this.$message({
          message: this.t('不允许输入中文'),
          type: 'error'
        })
        this.form.shortcutKey = ''
        return
      }
      this.form.shortcutKey = e.toUpperCase()
    },
    dxx2(e) {
      if (this.isChinese(e)) {
        this.$message({
          message: this.t('不允许输入中文'),
          type: 'error'
        })
        this.form2.shortcutKey = ''
        return
      }
      this.form2.shortcutKey = e.toUpperCase()
    },
    handleAvatarSuccess(e) {
      this.form.dict = e
    },
    colorclick(e) {
      this.form.color = e
    },
    colorclick2(e) {
      this.form2.color = e
    },
    RndNum(n) {
      var rnd = ''
      for (var i = 0; i < n; i++) rnd += Math.floor(Math.random() * 10)
      return rnd
    },
    add1(pid) {
      this.definDialogVisible = true
      this.form = {
        projectId: this.id,
        definName: '',
        coodx: 200 + this.leftlist.length * 10,
        coody: 100 + this.leftlist.length * 10,
        color: '#E9458F',
        description: '',
        regex: '',
        dict: '',
        shortcutKey: '',
        annotatedType: {
          txt: true,
          image: true,
          synergies: true,
          behavioralIntent: true
        },
        parentId: pid
      }
      this.form.annotatedType[this.typeValue] = true
      this.definDialogTitle = '新建实体标签'

      this.checkedAnnotatedTypes = ['图片标注', '文本标注']
    },
    add2(pid) {
      this.relationDialogVisible = true
      this.form2 = {
        projectId: this.id,
        name: '',
        color: '#E9458F',
        shortcutKey: '',
        pid: pid
      }
      this.relationDialogTitle = '新建关系标签'
    },
    edit(row, index) {
      this.definDialogVisible = true
      this.definDialogTitle = '编辑实体标签'
      this.index = index
      this.form = JSON.parse(JSON.stringify(row))
      
      var checkedAnnotatedTypes = []
      if (this.form.annotatedType.image) {
        checkedAnnotatedTypes.push('图片标注')
      }
      if (this.form.annotatedType.txt) {
        checkedAnnotatedTypes.push('文本标注')
      }
      this.checkedAnnotatedTypes = checkedAnnotatedTypes
    },
    remove(id) {
      this.$confirm(this.t('是否删除该实体标签') + '?', this.t('提示'), {
        confirmButtonText: this.t('确定'),
        cancelButtonText: this.t('取消'),
        type: 'warning'
      }).then(() => {
        delshiti(id).then((res) => {
          this.getlist()
          this.$message({
            message: this.t('删除成功'),
            type: 'success'
          })
        })
      })
    },
    handleCheckedAnnotedTypeChange(value) {
      console.log(value)
      console.log(this.checkedAnnotatedTypes)
    },
    send1() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (
            this.form.regex != '' &&
            this.form.regex != null &&
            this.form.regex.indexOf('/') == -1
          ) {
            this.$message({
              message: this.t('正则格式不对'),
              type: 'error'
            })
            return
          }

          this.form.annotatedType = {
            txt:
              this.checkedAnnotatedTypes.indexOf('文本标注') >= 0
                ? true
                : false,
            image:
              this.checkedAnnotatedTypes.indexOf('图片标注') >= 0
                ? true
                : false,
          }
          this.definSubmitLoading = true
          if (this.definDialogTitle == '新建实体标签') {
            addshiti(this.form).then((res) => {
              this.definDialogVisible = false
              this.getlist()
              this.definSubmitLoading = false
            }).catch(err=>{
               this.definSubmitLoading = false
            })
          } else {
            editshiti(this.form).then((res) => {
              this.definDialogVisible = false
              this.getlist()
              this.definSubmitLoading = false
            }).catch(err=>{
               this.definSubmitLoading = false
            })
          }
        }
      })
    },
    edit2(row, index) {
      this.relationDialogVisible = true
      this.relationDialogTitle = '编辑关系标签'
      this.index2 = index
      this.form2 = JSON.parse(JSON.stringify(row))
    },
    remove2(id) {
      this.$confirm(this.t('是否删除该实体标签') + '?', this.t('提示'), {
        confirmButtonText: this.t('确定'),
        cancelButtonText: this.t('取消'),
        type: 'warning'
      }).then(() => {
        delguanxi(id).then((res) => {
          this.getlist()
          this.$message({
            message: this.t('删除成功'),
            type: 'success'
          })
        })
      })
    },
    send2() {     
      this.$refs['form2'].validate((valid) => {
        if (valid) {
          this.relationshipSubmitLoading = true
          if (this.relationDialogTitle == '新建关系标签') {
            addguanxi({
              ...this.form2,
              projectId: this.id
            }).then((res) => {
              this.relationDialogVisible = false
              this.getlist()
              this.relationshipSubmitLoading = false
            }).catch(err=>{
              this.relationshipSubmitLoading = false
            })
          } else {
            let repeatList = this.leftlist2.filter(item=>this.form2.id != item.id && item.name==this.form2.name);
            if (repeatList.length > 0) {
              this.$message({
                message: "关系名称重复",
                type: "error"
              })
              this.relationshipSubmitLoading = false;
              return;
            }
            editguanxi({
              ...this.form2,
              projectId: this.id
            }).then((res) => {
              this.relationDialogVisible = false
              this.getlist()
              this.relationshipSubmitLoading = false
            }).catch(err=>{
              this.relationshipSubmitLoading = false
            })
          }
        }
      })
    },
    send4() {
      this.$refs['form2'].validate((valid) => {
        if (valid) {
          this.correlationSubmitLoading = true
          addguanxi({
            ...this.form2,
            projectId: this.id
          })
            .then((res) => {
              this.form3.relationId = res.data.id
              addgl({
                ...this.form3,
                projectId: this.id
              }).then((res) => {
                this.definRelationDialogVisible = false
                this.getlist()
                this.correlationSubmitLoading = false
              })
            })
            .catch(() => {
              this.correlationSubmitLoading = false
            })
        }
      })
    },
    del3() {
      this.$confirm(this.t('是否删除该关联') + '?', this.t('提示'), {
        confirmButtonText: this.t('确定'),
        cancelButtonText: this.t('取消'),
        type: 'warning'
      }).then(() => {
        delgl(this.form3.id).then((res) => {
          this.definRelationDialogVisible = false
          this.getlist()
          this.$message({
            message: this.t('删除成功'),
            type: 'success'
          })
        })
      })
    },
    send3() {
      if (this.form3.id) {
        editgl(this.form3).then((res) => {
          this.definRelationDialogVisible = false
          this.getlist()
        })
      } else {
        addgl({
          ...this.form3,
          projectId: this.id
        }).then((res) => {
          this.definRelationDialogVisible = false
          this.getlist()
        })
      }
    },

    tabclick(index) {
      if (index === 2) {
        if (
          this.typeValue === 'synergies' ||
          this.typeValue === 'behavioralIntent'
        ) {
          return
        }
      }

      this.act = index
    },
    tabclick2(e) {
      this.act2 = e
    },
    cancelDefinRelationDialog() {
      this.definRelationDialogVisible = false
      this.getlist()
    },
    createGraphic() {
      const vm = this
      this.graph = null
      const grid = new G6.Grid()
      const toolbar = new G6.ToolBar({
        position: {
          x: document.getElementById('hbdiv').offsetWidth - 240,
          y: document.getElementById('hbdiv').offsetHeight - 60
        }
      })
      let layout = {
        type: ''
      }
      const cfg = registerFactory(G6, {
        width: document.getElementById('hbdiv').offsetWidth,
        height: document.getElementById('hbdiv').offsetHeight,
        renderer: 'svg',
        enabledStack: true,
        layout: layout,
        defaultNode: {
          type: 'rect-node',
          style: {
            radius: 10,
            width: 100,
            height: 50,
            cursor: 'move',
            fill: '#ecf3ff'
          },
          labelCfg: {
            fontSize: 16,
            style: {
              cursor: 'move'
            }
          }
        },
        defaultEdge: {
          type: 'arc',
          style: {
            radius: 5,
            offset: 15,
            stroke: '#aab7c3',
            lineAppendWidth: 10,
            endArrow: true
          }
        },
        nodeStateStyles: {
          'nodeState:default': {
            opacity: 1
          },
          'nodeState:hover': {
            opacity: 0.8
          },
          'nodeState:selected': {
            opacity: 0.9
          }
        },
        edgeStateStyles: {
          'edgeState:default': {
            stroke: '#aab7c3'
          },
          'edgeState:selected': {
            stroke: '#1890FF'
          },
          'edgeState:hover': {
            animate: true,
            animationType: 'dash',
            stroke: '#1890FF'
          }
        },
        modes: {
          default: [
            'drag-canvas',
            'drag-shadow-node',
            'canvas-event',
            'delete-item',
            'select-node',
            'hover-node',
            'active-edge',
            'zoom-canvas'
          ],
          originDrag: [
            'drag-canvas',
            'drag-node',
            'canvas-event',
            'delete-item',
            'select-node',
            'hover-node',
            'active-edge'
          ]
        },
        plugins: [grid, toolbar]
      })

      this.graph = new G6.Graph(cfg)
      this.getlist(1)
    },
    initGraphEvent() {
      this.graph.on('node:dragend', (e) => {
        e.item.getOutEdges().forEach((edge) => {
          edge.clearStates('edgeState')
        })
        if (e.target.cfg.className) {
          var newform = e.item.get('model').form
          newform.coodx = e.x
          newform.coody = e.y

          editshiti(newform).then((res) => {
            this.definDialogVisible = false
          })
        }
      })
      this.graph.on('click', (ev) => {
        this.evt = ev.item
        const shape = ev.target
        if (ev.item) {
          const item = ev.item
          const type = item.getType()

          this.selectedItem = ev.item._cfg.model
          if (this.selectedItem.type == 'arc') {
            console.log('treecomplex click 当前节点信息', this.selectedItem)
            this.radio = 1
            this.definRelationDialogVisible = true
            this.form3.fromid = this.selectedItem.source
            this.form3.toid = this.selectedItem.target
            if (this.selectedItem.label) {
              let obj = this.gxlist.filter(
                (item) =>
                  item.relationName == this.selectedItem.label &&
                  item.fromDefinId == this.selectedItem.source &&
                  item.toDefinId == this.selectedItem.target
              )[0]
              this.form3.relationId = obj.relationId
              this.form3.id = obj.id
            }
          }
        }
      })
      this.graph.on(
        'before-edge-add',
        ({ source, target, sourceAnchor, targetAnchor }) => {
          setTimeout(() => {
            this.graph.addItem('edge', {
              id: `${+new Date() + (Math.random() * 10000).toFixed(0)}`,
              source: source.get('id'),
              target: target.get('id'),
              type: 'arc',
              sourceAnchor,
              targetAnchor
            })
            this.radio = 1
            this.definRelationDialogVisible = true
            this.form3.relationId = ''
            this.form3.id = null
            this.form3.fromid = source.get('id')
            this.form3.toid = target.get('id')
          }, 100)
        }
      )
    },
    deleteNode(item) {
      this.graph.removeItem(item, true)
    },
    async getlist(autoHtml) {
      if (autoHtml != undefined) {
        this.autoHtml = false
      } else {
        this.autoHtml = true
      }
      let nodes = await getshiti({ projectId: this.id })
      let edges = await getguanxi({ projectId: this.id })
      let getRelation = await getgl({ projectId: this.id })
      this.allDefine = nodes.data
      this.leftlist = this.filteDefineList()
      this.lefttreelist = this.getTreeData(this.leftlist)
      this.leftlist2 = edges.data
      this.gxlist = getRelation.data

      let data = this.getRightDataStructure()
      if (this.unRelationsLable) {
        data = {}
      }
      this.graph.read(data)
      this.graph.render()

      if (!this.autoHtml) {
        let innerHtml = document.getElementsByClassName(
          'g6-component-toolbar'
        )[0].innerHTML
        let text = this.t('自动排版')
        let textWidth = this.t('自动排版') === '自动排版' ? 35 : 58
        let str =
          '<li code="Fruchterman" id="Fruchterman" onclick="fruchterman()" style="cusor:pointer; width: ' +
          textWidth +
          'px;">' +
          this.t('自动排版') +
          '</li>'
        document.getElementsByClassName('g6-component-toolbar')[0].innerHTML =
          innerHtml + str
        document.getElementsByClassName('g6-component-toolbar')[0].style.left =
          '475px'
        document.getElementsByClassName('g6-component-toolbar')[0].style.top =
          'calc(100% - 60px)'
      }
      const projectId = this.id
      this.addExportImportButtons(projectId, () => this.getlist())
    },
    filteDefineList() {
      return this.allDefine
    },
    getTreeData(data) {
      var treeData = []
      if (data && Array.isArray(data)) {
        var dataMap = {}
        for (var i = 0; i < data.length; i++) {
          var item = data[i]
          var items = dataMap[item.parentId + '']
          if (!items || !Array.isArray(items)) {
            items = []
          }
          items.push(Object.assign(item))
          dataMap[item.parentId + ''] = items
        }
        treeData = dataMap['0'] ? JSON.parse(JSON.stringify(dataMap['0'])) : []
        this.createTreeData(treeData, dataMap)
      }
      return treeData
    },
    createTreeData(arr, dataMap) {
      for (var i = 0; i < arr.length; i++) {
        var item = arr[i]
        var children = dataMap[item.id + '']
        if (children && Array.isArray(children)) {
          item.children = JSON.parse(JSON.stringify(children))
          this.createTreeData(item.children, dataMap)
        }
      }
    },

    getRightDataStructure() {
      return {
        nodes: this.leftlist.map((item) => {
          return {
            id: item.id,
            x: Number(item.coodx),
            y: Number(item.coody),
            type: 'rect-node',
            style: {
              fill: '#fff',
              stroke: item.color,
              lineWidth: 2,
              width: 150,
              height: 50
            },
            linkPoints: {
              top: true,
              bottom: true,
              left: true,
              right: true
            },
            label: item.definName,
            collected: item.collected,
            key: '',
            labelCfg: {
              style: {
                fontSize: 16
              }
            },
            form: item
          }
        }),
        edges: this.gxlist.map((item, index) => {
          return {
            source: item.fromDefinId,
            target: item.toDefinId,
            type: 'arc',
            label: item.relationName,
            curveOffset: 20 + 40 * index,
            labelCfg: {
              autoRotate: true,
              style: {
                fill: '#ffffff',
                background: {
                  fill: item.relationColor,
                  padding: [5, 5, 3, 5],
                  radius: 4
                }
              }
            }
          }
        })
      }
    },

    fruchterman() {
      setTimeout(() => {
        this.graph.updateLayout({
          type: 'radial',
          linkDistance: 125,
          maxIteration: 2500,
          unitRadius: 300,
          preventOverlap: true,
          nodeSize: 50,
          strictRadial: false
        })
      }, 100)

      setTimeout(() => {
        this.saveNodes()
      }, 1000)
    },
    saveNodes() {
      var nodes = this.graph.cfg.data.nodes
      if (!nodes || !Array.isArray(nodes)) {
        node = []
      }
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i]
        var ind = this.leftlist.findIndex((item) => item.id === node.id)
        if (ind < 0) {
          continue
        }
        var indItem = this.leftlist[ind]
        indItem.coodx = node.x
        indItem.coody = node.y
        editshiti(indItem).then((res) => {})
      }
    },

    addExportImportButtons(projectId, uploadedListener) {
      const tbEl = document.querySelector('.g6-component-toolbar')
      if (tbEl.querySelector('[code="import"]')) {
        return
      }

      const upEl = document.createElement('input')
      upEl.type = 'file'
      upEl.addEventListener('change', async (event) => {
        const formData = new FormData()
        formData.append('file', event.target.files[0])
        const resp = await request.post(
          `/import/definrelation/${projectId}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        )
        uploadedListener && uploadedListener()
      })
      upEl.style = 'position:absolute;width:0;height:0;'
      tbEl.appendChild(upEl)

      let liEl = document.createElement('li')
      liEl.title = this.t('导入')
      liEl.style = 'cusor:pointer; width: 38px;'
      liEl.setAttribute('code', 'import')
      liEl.addEventListener('click', function () {
        upEl.click()
      })
      liEl.innerHTML = `<i class="el-icon" style="font-size:24px"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" data-v-ea893728=""><path fill="currentColor" d="M160 832h704a32 32 0 1 1 0 64H160a32 32 0 1 1 0-64m384-578.304V704h-64V247.296L237.248 490.048 192 444.8 508.8 128l316.8 316.8-45.312 45.248z"></path></svg></i>`
      tbEl.appendChild(liEl)

      liEl = document.createElement('li')
      liEl.title = this.t('导出')
      liEl.style = 'cusor:pointer; width: 38px;'
      liEl.setAttribute('code', 'import')
      liEl.innerHTML = `<a><i class="el-icon" style="font-size:24px"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" data-v-ea893728=""><path fill="currentColor" d="M160 832h704a32 32 0 1 1 0 64H160a32 32 0 1 1 0-64m384-253.696 236.288-236.352 45.248 45.248L508.8 704 192 387.2l45.248-45.248L480 584.704V128h64z"></path></svg></i></a>`
      liEl.addEventListener('click', async function () {
        var otpTokenResult = await getUserOptToken()
        var params = {
          projectId: projectId,
          otpToken: otpTokenResult.data
        }
        exportBenti(params)
      })
      tbEl.appendChild(liEl)
    }
  }
}
</script>

<style lang="scss" scoped>
.ysli {
  display: flex;
  align-items: center;
  li {
    font-size: 43px;
    width: 43px;
    flex: 1;
    .el-icon-success {
      display: none;
    }
    .colordiv {
      width: 40px;
      height: 40px;
      cursor: pointer;
      border-radius: 50%;
    }
  }
  li.colorhov {
    .el-icon-success {
      display: block;
    }
    .colordiv {
      display: none;
    }
  }
}
.benti {
  display: flex;
  overflow: hidden;
  height: calc(100% - 40px);
  padding: 20px;
  flex-direction: column;
  .content {
    display: flex;
    overflow: hidden;
    padding-top: 10px;
    flex: 1;
    .bentileft {
      width: 420px;
      .tab {
        background: url(@/assets/tabmenu.png) no-repeat;
        height: 51px;
        background-size: 100% 100%;
        li {
          font-size: 14px;
          width: 190px;
          display: inline-block;
          text-align: center;
          line-height: 51px;
          cursor: pointer;
          color: #787878;
          &.disabled {
            cursor: not-allowed;
            color: #787878 !important;
          }
          span {
            display: block;
            width: 88%;
            text-align: center;
          }
          .ml-10 {
            margin-left: 15px;
          }
        }
        li.hov,
        li:hover {
          color: #333;
        }
      }
      .tab2 {
        background: url(@/assets/tabmenu2.png) no-repeat;
        height: 51px;
        background-size: 100% 100%;
      }
      .borbox {
        margin-top: 20px;
        padding: 10px 10px 0px 10px;
        height: calc(100% - 71px);
        border: 1px solid #ccc;
        box-sizing: border-box;
        border-radius: 10px;
        .leftlist,
        .leftlist2 {
          height: calc(100% - 60px);
          overflow: auto;
          li {
            height: 38px;
            background: #f9f9f9;
            border-radius: 8px 8px 8px 8px;
            border-left: 7px solid;
            display: flex !important;
            align-items: center;
            padding-left: 20px;
            padding-right: 20px;
            margin-bottom: 10px;
            .listname {
              flex: 1;
            }
            .listmore {
              cursor: pointer;
            }
            .liststart2 {
              background: url(@/assets/start2.png) no-repeat center center;
              background-size: 20px 20px;
              width: 20px;
              height: 20px;
              margin-right: 10px;
              cursor: pointer;
            }
            .listkey {
              margin-right: 20px;
              color: #6b6b6b;
            }
          }
        }
        :deep(.el-tree) {
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
              border-left: 7px solid white;
              padding-left: 20px;
              padding-right: 20px;
              height: 38px;
              align-items: center;
              .tree-item-name {
                flex: 1;
              }
              .tree-item-collect {
                background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPCAYAAAA71pVKAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAD6ADAAQAAAABAAAADwAAAAAHNtsJAAABzUlEQVQoFaVRvUtCURT3I59aWNIWPZfGQqipoc18LRWBQ4TV0FRUikF+pZCBoiDVUGAUDUFL/gmBNbS0hUVOgQSZfQwvklDRp/2OdCVBJy8c7j2/j3PPPVcma2PJW3kDgUCvWq0WwF96vV6xmU7RDCRMq9VuyuXyfcRWK01TcygU6qtWqxPlctkC81gwGOxvVqDBHI/HlWiXUyqVSxAn/X7/LfZH5FbCif9fpIOScDg8olKpNtLpNK/RaHoAlRDLxCkUigN0cQp8FnwuGo2+SJK06/F4kuzmqUqlYgC4gjanEQKRZHY6nffITYgZ8KsIA2ALcTUz2jqBOY9b1vP5/Ifb7c4RyRbler3+EwXWgP2gwBFxNbPL5XorFApzaK8bU47hbRwz0k7vFUUxhqMOugWfz5clnLVNgm9MdwcFBlOpVCeRbOG/u3Aewly2oftieG1gLOE4zghzlgQ2m03N87wRnTzY7XYxEom8ovgwtM9M3zB6QRDm8e602WyWdDrdMUTWUqk0aTKZnvBeDnMZSCQSV8xcb5sA3KpFLOIYhfg8k8mMotgZ4hA5FaZvrK+GtvG2vWKxeIc/TTgcjvc/1QX+9hotj8N8U3e2e/gF8oe7mgU1MtYAAAAASUVORK5CYII=)
                  no-repeat center center;
                background-size: 20px 20px;
                width: 20px;
                height: 20px;
                margin-right: 10px;
                cursor: pointer;
              }
              .tree-item-collected {
                background: url(@/assets/start2.png) no-repeat center center;
                background-size: 20px 20px;
                width: 20px;
                height: 20px;
                margin-right: 10px;
                cursor: pointer;
              }
              .tree-item-key {
                margin-right: 20px;
                color: #6b6b6b;
              }
              .btnaddChild {
                font-size: 20px;
                width: 20px;
                margin-right: 10px;
                border: none;
                padding: 0px;
                background: rgb(1, 1, 1, 0);
              }
              .circolor {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                margin-right: 10px;
              }
            }
          }
        }
        .leftlist2 {
          li {
            border: 0px;
            .circolor {
              width: 12px;
              height: 12px;
              border-radius: 50%;
              margin-right: 10px;
            }
          }
        }
        .btnaddChild {
          font-size: 20px;
          width: 20px;
          margin-right: 10px;
          border: none;
          padding: 0px;
        }
        .btnadd {
          width: 100%;
          height: 40px;
          background: linear-gradient(
            136deg,
            $base-color-blue 0%,
            $base-color-blue 100%
          );
          box-shadow: 3px 4px 7px 1px rgba(80, 72, 153, 0.25);
          border-radius: 8px 8px 8px 8px;
          font-size: 20px;
        }
      }
    }
    .bentiright {
      flex: 1;
      margin-left: 20px;
      .czmenu {
        text-align: center;
        li {
          display: inline-block;
          width: 72px;
          height: 52px;
          border-radius: 6px;
          cursor: pointer;
          .cz1 {
            background: url(@/assets/cz1.png) no-repeat center center;
            background-size: 25px 25px;
            width: 72px;
            height: 52px;
          }
          .cz2 {
            background: url(@/assets/cz2.png) no-repeat center center;
            background-size: 25px 25px;
            width: 72px;
            height: 52px;
          }
          .cz3 {
            background: url(@/assets/cz3.png) no-repeat center center;
            background-size: 25px 25px;
            width: 72px;
            height: 52px;
          }
          .cz4 {
            background: url(@/assets/cz4.png) no-repeat center center;
            background-size: 25px 25px;
            width: 72px;
            height: 52px;
          }
          .cz5 {
            background: url(@/assets/cz5.png) no-repeat center center;
            background-size: 25px 25px;
            width: 72px;
            height: 52px;
          }
          margin-left: 20px;
          margin-right: 20px;
        }
        li:hover {
          background: linear-gradient(138deg, #4443e2 0%, #575bcb 100%);
          box-shadow: 3px 4px 7px 1px rgba(80, 72, 153, 0.25);
          .cz1 {
            background: url(@/assets/cz1hov.png) no-repeat center center;
            background-size: 25px 25px;
          }
          .cz2 {
            background: url(@/assets/cz2hov.png) no-repeat center center;
            background-size: 25px 25px;
          }
          .cz3 {
            background: url(@/assets/cz3hov.png) no-repeat center center;
            background-size: 25px 25px;
          }
          .cz4 {
            background: url(@/assets/cz4hov.png) no-repeat center center;
            background-size: 25px 25px;
          }
          .cz5 {
            background: url(@/assets/cz5hov.png) no-repeat center center;
            background-size: 25px 25px;
          }
        }
      }
      .rightmain {
        background: #f9f9f9;
        height: calc(100% - 2px);
        border-radius: 8px 8px 8px 8px;
        border: 1px solid #ccc;
        position: relative;
        overflow: hidden;
        .righttab {
          li {
            width: 126px;
            height: 42px;
            line-height: 42px;
            font-size: 16px;
            color: #787878;
            text-align: center;
            cursor: pointer;
            display: inline-block;
          }
          li:hover,
          li.hov {
            border-bottom: 2px solid #08979c;
            background: #fff;
            color: #333;
            font-weight: bold;
          }
        }
      }
    }
  }
}
.g6-tooltip {
  position: fixed;
  top: 0;
  left: 0;
  font-size: 12px;
  color: #545454;
  border-radius: 4px;
  border: 1px solid #e2e2e2;
  background-color: rgba(255, 255, 255, 0.9);
  box-shadow: rgb(174, 174, 174) 0 0 10px;
  padding: 10px 8px;
}
@font-face {
  font-family: 'iconfont';
  src: url('//at.alicdn.com/t/font_1540180_5hj90so1tea.eot?t=1578985252153');
  src: url('//at.alicdn.com/t/font_1540180_5hj90so1tea.eot?t=1578985252153#iefix')
      format('embedded-opentype'),
    url('data:application/x-font-woff2;charset=utf-8;base64,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')
      format('woff2'),
    url('//at.alicdn.com/t/font_1540180_5hj90so1tea.woff?t=1578985252153')
      format('woff'),
    url('//at.alicdn.com/t/font_1540180_5hj90so1tea.ttf?t=1578985252153')
      format('truetype'),
    url('//at.alicdn.com/t/font_1540180_5hj90so1tea.svg?t=1578985252153#iconfont')
      format('svg');
}
.iconfont {
  font-family: 'iconfont' !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.icon-actual-size:before {
  content: '\e686';
}
.icon-font-size:before {
  content: '\e662';
}
.icon-background:before {
  content: '\e819';
}
.icon-redo:before {
  content: '\e627';
}
.icon-zoom-out:before {
  content: '\e642';
}
.icon-user:before {
  content: '\e606';
}
.icon-model-rect:before {
  content: '\e669';
}
.icon-search:before {
  content: '\e600';
}
.icon-triangle:before {
  content: '\e607';
}
.icon-undo:before {
  content: '\e666';
}
.icon-cubic:before {
  content: '\e64e';
}
.icon-fold-right:before {
  content: '\e601';
}
.icon-copy:before {
  content: '\e60c';
}
.icon-star:before {
  content: '\e608';
}
.icon-line-strong:before {
  content: '\e604';
}
.icon-full-screen:before {
  content: '\e6b7';
}
.icon-quadratic:before {
  content: '\e6d5';
}
.icon-paste:before {
  content: '\e62d';
}
.icon-dot-line:before {
  content: '\e6a2';
}
.icon-jinggao:before {
  content: '\e661';
}
.icon-ellipse:before {
  content: '\e671';
}
.icon-todown:before {
  content: '\e603';
}
.icon-toup:before {
  content: '\e605';
}
.icon-zoom-in:before {
  content: '\e64c';
}
.icon-arc:before {
  content: '\e649';
}
.icon-diamond:before {
  content: '\e643';
}
.icon-rect:before {
  content: '\e60a';
}
.icon-circle:before {
  content: '\e623';
}
.icon-line-style:before {
  content: '\e696';
}
.icon-v-drag:before {
  content: '\e805';
}
.icon-h-drag:before {
  content: '\e66c';
}
.icon-line:before {
  content: '\e71d';
}
.icon-preview:before {
  content: '\e65a';
}
.icon-polyline:before {
  content: '\e609';
}
.icon-text:before {
  content: '\e624';
}
.icon-interval:before {
  content: '\e68e';
}
.icon-fill-screen:before {
  content: '\e85b';
}
.icon-save:before {
  content: '\e64d';
}
.icon-setting:before {
  content: '\e645';
}
.icon-up-fill:before {
  content: '\e602';
}
.icon-delete:before {
  content: '\e62c';
}
.gb-toggle-btn {
  position: absolute;
  background: #fff;
  cursor: pointer;
  &:hover {
    background: #eee;
  }
}
.root,
#canvasPanel {
  position: absolute !important;
  right: 0;
  bottom: 0;
  background: #fff;
}
.root {
  left: 0;
  top: 0;
}
#canvasPanel {
  left: 0px;
  top: 0px;
}
#configPanel {
  position: absolute;
  top: 100px;
  left: 50%;
  margin-left: -150px;
  width: 460px;
  height: 300px;
  overflow: auto;
  background: #fff;
  padding: 40px 0 10px;
  box-sizing: border-box;
  transition: transform 0.3s ease-in-out;
  box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.1);
  &.hidden {
    transform: translate(100%, 0);
    display: none;
  }

  .panel-title {
    font-size: 16px;
    padding: 5px 10px;
    background: #f0f2f5;
  }

  .gb-toggle-btn {
    width: 10px;
    height: 20px;
    top: 50%;
    right: 100%;
    border-radius: 10px 0 0 10px;
    box-shadow: -2px 0 2px 0 rgba(0, 0, 0, 0.1);
    transform: translate(0, -50%);
  }

  .config-data {
    padding: 5px 10px;
  }
  .config-item {
    input {
      width: 80px;
      padding: 5px;
      margin: 5px 10px;
      background: #f4f7fd;
      border-radius: 4px;
    }
  }
  button {
    width: 80px;
    line-height: 24px;
    display: inline-block;
    padding: 5px 10px;
    border-radius: 6px;
    border: 1px solid #ccc;
    margin: 0 5px;
    cursor: pointer;
  }
  .save {
    color: #fff;
    background: #46a0fc;
    border-color: #46a0fc;
  }
}
#toolbar {
  position: absolute;
  top: 0;
  left: 50%;
  padding: 5px 10px;
  user-select: none;
  white-space: nowrap;
  transform: translate(-50%, 0);
  box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.1);
  background: #fff;
  z-index: 100;
  .split {
    display: inline-block;
    position: relative;
    top: 5px;
    height: 20px;
    width: 1px;
    background: #999;
    margin: 0 5px;
  }

  .iconfont {
    display: inline-block;
    vertical-align: top;
    text-align: center;
    line-height: 30px;
    font-size: 20px;
    height: 30px;
    width: 30px;
    color: #bfbfbf;
    cursor: pointer;
    border: 1px solid transparent;

    &:hover {
      border-color: #ccc;
    }

    &.enabled {
      color: #666;
    }
  }
}
.g6-grid {
  transform: none !important;
}
.ysdiv {
  position: relative;
  :deep(.el-color-picker) {
    overflow: hidden;
    border-radius: 50% !important;
    opacity: 0;
    .el-color-picker__trigger {
      border: 0px;
    }
    .el-color-picker--small .el-color-picker__trigger,
    .el-color-picker {
      width: 40px !important;
      height: 40px !important;
      display: block;
      padding: 0px !important;
    }
    .el-color-picker__color {
      border: 0px !important;
    }
    .el-color-picker__icon {
      font-size: 22px;
      font-weight: bold;
    }
  }
}
.tabbutton {
  margin-top: -10px;
  margin-bottom: 20px;
  display: flex;
  width: 100%;
  .el-radio-button {
    .el-radio-button__inner {
      width: 100%;
      background: #f4f4f4;
    }
  }
  .is-active {
    .el-radio-button__inner {
      width: 100%;
      background: #4f50d6;
    }
  }
}
</style>
