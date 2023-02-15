<template>
  <div class="benti">
    <div class="bentileft">
      <ul class="tab" :class="{ tab2: act == 2 }">
        <li :class="{ hov: act == 1 }" @click="tabclick(1)">{{ $t('实体标签') }}</li>
        <li :class="{ hov: act == 2 }" @click="tabclick(2)">{{ $t('关系标签') }}</li>
      </ul>
      <div v-if="act == 1" class="borbox">
        <ul class="leftlist" v-if="leftlist.length > 0">
          <li v-for="(item, index) in leftlist" :style="{ borderColor: item.color }">
            <div class="listname">{{ item.definName }}</div>
            <div
              @click="sc(item)"
              class="liststart"
              :class="{ liststart2: item.collected }"
            ></div>
            <div class="listkey">{{$t('快捷键')+' :'+ item.shortcutKey }}</div>
            <el-dropdown v-if="role != 3">
              <img class="listmore" src="../../assets/more.png" />
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  ><span @click="edit(item, index)">{{ $t('编辑标签') }}</span></el-dropdown-item
                >
                <el-dropdown-item
                  ><span @click="remove(item.id)">{{ $t('删除标签') }}</span></el-dropdown-item
                >
              </el-dropdown-menu>
            </el-dropdown>
          </li>
        </ul>
        <el-button
          class="btnadd"
          v-if="role != 3"
          icon="el-icon-plus"
          type="primary"
          @click="add1"
        ></el-button>
      </div>
      <div v-if="act == 2" class="borbox">
        <ul class="leftlist2" v-if="leftlist2.length > 0">
          <li v-for="(item, index) in leftlist2">
            <div :style="{ background: item.color }" class="circolor"></div>
            <div class="listname">{{ item.name }}</div>
            <div
              @click="sc2(item)"
              class="liststart"
              :class="{ liststart2: item.collected }"
            ></div>
            <div class="listkey">{{$t('快捷键')+' :' +item.shortcutKey }}</div>
            <el-dropdown v-if="role != 3">
              <img class="listmore" src="../../assets/more.png" />
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  ><span @click="edit2(item, index)">{{$t('编辑标签') }}</span></el-dropdown-item
                >
                <el-dropdown-item
                  ><span @click="remove2(item.id)">{{ $t('删除标签') }}</span></el-dropdown-item
                >
              </el-dropdown-menu>
            </el-dropdown>
          </li>
        </ul>
        <el-button
          class="btnadd"
          v-if="role != 3"
          icon="el-icon-plus"
          type="primary"
          @click="add2"
        ></el-button>
      </div>
    </div>
    <div class="bentiright">
      <!-- <ul class="czmenu">
             <li><div class="cz1"></div></li>
             <li><div class="cz2"></div></li>
             <li><div class="cz3"></div></li>
             <li><div class="cz4"></div></li>
             <li><div class="cz5"></div></li>
          </ul> -->
      <div
        class="rightmain"
        id="hbdiv"
        :style="{ pointerEvents: role == 3 ? 'none' : '' }"
      >
        <!-- <ul class="righttab">
                <li :class="{hov:act2==1}" @click="tabclick2(1)" style="border-top-left-radius:10rem;">本体列表</li>
                <li :class="{hov:act2==2}" @click="tabclick2(2)">攻击战略</li>
              </ul> -->
        <!-- <div @click="fruchterman" style="position:absolute;top:0;left:0;z-index: 9999;">1111</div> -->
        <div id="canvasPanel" ref="canvasPanel" @dragover.prevent />
        <div
          v-if="tooltip && !isMouseDown"
          class="g6-tooltip"
          :style="`top: ${top}px; left: ${left}px;`"
        >
          id: {{ tooltip }}
        </div>
      </div>
    </div>

    <el-dialog
      :title="$t(title1)"
      custom-class="outdivstyle"
      :visible.sync="dialogVisible"
      width="35%"
    >
      <el-form ref="form" :rules="rules" :model="form" label-width="80px">
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
            <el-upload
              style="position: absolute; right: 10rem; top: 8rem"
              :action="baseURL + '/upload'"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
            >
              <img src="../../assets/sc.png" />
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item :label="$t('快捷键')" prop="shortcutKey">
          <el-input v-model="form.shortcutKey" @input="dxx" :maxlength="1"></el-input>
        </el-form-item>
        <el-form-item :label="$t('颜色')">
          <ul class="ysli">
            <li
              @click="colorclick('#E9458F')"
              :class="{ colorhov: form.color == '#E9458F' }"
            >
              <i style="color: #e9458f" class="el-icon-success"></i>
              <div class="colordiv" style="background: #e9458f"></div>
            </li>
            <li
              @click="colorclick('#575BCA')"
              :class="{ colorhov: form.color == '#575BCA' }"
            >
              <i style="color: #575bca" class="el-icon-success"></i>
              <div class="colordiv" style="background: #575bca"></div>
            </li>
            <li
              @click="colorclick('#9BE8F3')"
              :class="{ colorhov: form.color == '#9BE8F3' }"
            >
              <i style="color: #9be8f3" class="el-icon-success"></i>
              <div class="colordiv" style="background: #9be8f3"></div>
            </li>
            <li
              @click="colorclick('#8345E9')"
              :class="{ colorhov: form.color == '#8345E9' }"
            >
              <i style="color: #8345e9" class="el-icon-success"></i>
              <div class="colordiv" style="background: #8345e9"></div>
            </li>
            <li
              @click="colorclick('#70E1CB')"
              :class="{ colorhov: form.color == '#70E1CB' }"
            >
              <i style="color: #70e1cb" class="el-icon-success"></i>
              <div class="colordiv" style="background: #70e1cb"></div>
            </li>
            <li
              @click="colorclick('#FFDC26')"
              :class="{ colorhov: form.color == '#FFDC26' }"
            >
              <i style="color: #ffdc26" class="el-icon-success"></i>
              <div class="colordiv" style="background: #ffdc26"></div>
            </li>
            <li class="ysdiv">
              <img
                style="position: absolute; top: 20rem; z-index: 99"
                src="../../assets/more.png"
              />
              <el-tooltip effect="dark" :content="$t('更多颜色')" placement="top">
                <el-color-picker v-model="form.color"></el-color-picker>
              </el-tooltip>
            </li>
          </ul>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">{{$t('取消')}}</el-button>
        <el-button type="primary" @click="send1">{{$t('确定')}}</el-button>
      </span>
    </el-dialog>

    <el-dialog
      :title="$t(title2)"
      custom-class="outdivstyle"
      :visible.sync="dialogVisible2"
      width="35%"
    >
      <el-form ref="form2" :rules="rules2" :model="form2" label-width="80px">
        <el-form-item :label="$t('名称')" prop="name">
          <el-input v-model="form2.name"></el-input>
        </el-form-item>
        <el-form-item :label="$t('快捷键')" prop="shortcutKey">
          <el-input v-model="form2.shortcutKey" @input="dxx2" :maxlength="1"></el-input>
        </el-form-item>
        <el-form-item :label="$t('颜色')">
          <ul class="ysli">
            <li
              @click="colorclick2('#E9458F')"
              :class="{ colorhov: form2.color == '#E9458F' }"
            >
              <i style="color: #e9458f" class="el-icon-success"></i>
              <div class="colordiv" style="background: #e9458f"></div>
            </li>
            <li
              @click="colorclick2('#575BCA')"
              :class="{ colorhov: form2.color == '#575BCA' }"
            >
              <i style="color: #575bca" class="el-icon-success"></i>
              <div class="colordiv" style="background: #575bca"></div>
            </li>
            <li
              @click="colorclick2('#9BE8F3')"
              :class="{ colorhov: form2.color == '#9BE8F3' }"
            >
              <i style="color: #9be8f3" class="el-icon-success"></i>
              <div class="colordiv" style="background: #9be8f3"></div>
            </li>
            <li
              @click="colorclick2('#8345E9')"
              :class="{ colorhov: form2.color == '#8345E9' }"
            >
              <i style="color: #8345e9" class="el-icon-success"></i>
              <div class="colordiv" style="background: #8345e9"></div>
            </li>
            <li
              @click="colorclick2('#70E1CB')"
              :class="{ colorhov: form2.color == '#70E1CB' }"
            >
              <i style="color: #70e1cb" class="el-icon-success"></i>
              <div class="colordiv" style="background: #70e1cb"></div>
            </li>
            <li
              @click="colorclick2('#FFDC26')"
              :class="{ colorhov: form2.color == '#FFDC26' }"
            >
              <i style="color: #ffdc26" class="el-icon-success"></i>
              <div class="colordiv" style="background: #ffdc26"></div>
            </li>
            <li class="ysdiv">
              <img
                style="position: absolute; top: 20rem; z-index: 99"
                src="../../assets/more.png"
              />
              <el-tooltip effect="dark" :content="$t('更多颜色')" placement="top">
                <el-color-picker v-model="form2.color"></el-color-picker>
              </el-tooltip>
            </li>
          </ul>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible2 = false">{{$t('取消')}}</el-button>
        <el-button type="primary" @click="send2">{{ $t('确定') }}</el-button>
      </span>
    </el-dialog>

    <el-dialog
      :title="$t('关联关系')"
      custom-class="outdivstyle"
      :visible.sync="dialogVisible3"
      width="30%"
    >
      <el-radio-group class="tabbutton" v-model="radio" size="medium">
        <el-radio-button :label="1">{{ $t('选择已有关系标签') }}</el-radio-button>
        <el-radio-button :label="2">{{ $t('新建关系标签') }}</el-radio-button>
      </el-radio-group>
      <el-form
        ref="form2"
        v-if="radio == 1"
        :rules="rules3"
        :model="form3"
        label-width="80px"
      >
        <el-form-item :label="$t('选择关系')" prop="relationId">
          <el-select style="width: 100%" v-model="form3.relationId" :placeholder="$t('请选择')">
            <el-option
              v-for="item in leftlist2"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <el-form
        ref="form2"
        v-if="radio == 2"
        :rules="rules2"
        :model="form2"
        label-width="80px"
      >
        <el-form-item :label="$t('名称')" prop="name">
          <el-input v-model="form2.name"></el-input>
        </el-form-item>
        <el-form-item :label="$t('快捷键')" prop="shortcutKey">
          <el-input v-model="form2.shortcutKey" @input="dxx2"></el-input>
        </el-form-item>
        <el-form-item :label="$t('颜色')">
          <ul class="ysli">
            <li
              @click="colorclick2('#E9458F')"
              :class="{ colorhov: form2.color == '#E9458F' }"
            >
              <i style="color: #e9458f" class="el-icon-success"></i>
              <div class="colordiv" style="background: #e9458f"></div>
            </li>
            <li
              @click="colorclick2('#575BCA')"
              :class="{ colorhov: form2.color == '#575BCA' }"
            >
              <i style="color: #575bca" class="el-icon-success"></i>
              <div class="colordiv" style="background: #575bca"></div>
            </li>
            <li
              @click="colorclick2('#9BE8F3')"
              :class="{ colorhov: form2.color == '#9BE8F3' }"
            >
              <i style="color: #9be8f3" class="el-icon-success"></i>
              <div class="colordiv" style="background: #9be8f3"></div>
            </li>
            <li
              @click="colorclick2('#8345E9')"
              :class="{ colorhov: form2.color == '#8345E9' }"
            >
              <i style="color: #8345e9" class="el-icon-success"></i>
              <div class="colordiv" style="background: #8345e9"></div>
            </li>
            <li
              @click="colorclick2('#70E1CB')"
              :class="{ colorhov: form2.color == '#70E1CB' }"
            >
              <i style="color: #70e1cb" class="el-icon-success"></i>
              <div class="colordiv" style="background: #70e1cb"></div>
            </li>
            <li
              @click="colorclick2('#FFDC26')"
              :class="{ colorhov: form2.color == '#FFDC26' }"
            >
              <i style="color: #ffdc26" class="el-icon-success"></i>
              <div class="colordiv" style="background: #ffdc26"></div>
            </li>
            <li class="ysdiv">
              <img
                style="position: absolute; top: 20rem; z-index: 99"
                src="../../assets/more.png"
              />
              <el-tooltip effect="dark" :content="$t('更多颜色')" placement="top">
                <el-color-picker v-model="form.color"></el-color-picker>
              </el-tooltip>
            </li>
          </ul>
        </el-form-item>
      </el-form>

      <span v-if="radio == 1" slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible3 = false">{{ $t('取消') }}</el-button>
        <el-button type="primary" @click="send3">{{$t('确定')}}</el-button>
        <el-button v-if="form3.id" type="danger" @click="del3">{{ $t('删除') }}</el-button>
      </span>
      <span v-if="radio == 2" slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible3 = false">{{$t('取消')}}</el-button>
        <el-button type="primary" @click="send4">{{ $t('新增') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import G6 from "@antv/g6";
import insertCss from "insert-css";
import registerFactory from "../../components/graph/graph";
import ItemPanel from "./ItemPanel.vue";
import data from "./data.js";
import { getxmqx } from "@/api/quanxian";
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
  delgxsc,
} from "@/api/benti";
import { baseURL } from "@/config/setting.config";
insertCss(`
  .g6-component-toolbar li {
    list-style-type: none !important;
  }
`);
// import i18next from 'i18next';
export default {
  components: {
    ItemPanel,
  },
  data() {
    return {
      dialogVisible: false,
      title1: "新建实体标签",
      dialogVisible2: false,
      dialogVisible3: false,
      title2: "新建关系标签",
      act: 1,
      act2: 1,
      leftlist: [],
      leftlist2: [],
      autoHtml: false,
      configVisible: false,
      isMouseDown: false,
      config: "",
      tooltip: "",
      top: 0,
      left: 0,
      form: {
        projectId: this.$route.query.id,
        definName: "",
        coodx: 200,
        coody: 100,
        color: "#E9458F",
        description: "",
        regex: "",
        dict: "",
        shortcutKey: "",
      },
      form2: {
        projectId: this.$route.query.id,
        name: "",
        color: "#E9458F",
        shortcutKey: "",
      },
      form3: {
        projectId: this.$route.query.id,
        fromid: "",
        toid: "",
        relationId: "",
      },
      rules: {
        definName: [{ required: true, message: "请输入名称", trigger: "blur" }],
        //  shortcutKey: [
        //   { required: true, message: '请输入快捷键', trigger: 'blur' }
        // ],
      },
      index: 0,
      rules2: {
        name: [{ required: true, message: "请输入名称", trigger: "blur" }],
        //  shortcutKey: [
        //   { required: true, message: '请输入快捷键', trigger: 'blur' }
        // ],
      },
      rules3: {
        relationId: [{ required: true, message: "请选择关系", trigger: "change" }],
      },
      index2: 0,
      gxlist: [],
      graph: null,
      radio: 1,
      role: 3,
      baseURL: "",
    };
  },
  mounted() {
    this.baseURL = baseURL;
    this.$nextTick(() => {
      this.createGraphic();
      this.initGraphEvent();
    });
    getxmqx({ projectId: this.$route.query.id }).then((res) => {
      this.role = res.data.role;
    });
  },
  beforeDestroy() {
    this.graph.destroy();
  },
  created() {
    let _this = this;
    window.fruchterman = _this.fruchterman;
  },
  methods: {
    sc(item) {
      if (item.collected) {
        delstsc({ ids: [item.id] }).then((res) => {
          this.getlist();
        });
      } else {
        addstsc({ ids: [item.id] }).then((res) => {
          this.getlist();
        });
      }
    },
    sc2(item) {
      if (item.collected) {
        delgxsc({ ids: [item.id] }).then((res) => {
          this.getlist();
        });
      } else {
        addgxsc({ ids: [item.id] }).then((res) => {
          this.getlist();
        });
      }
    },
    isChinese(temp) {
      var re = /[^\u4E00-\u9FA5]/;
      if (re.test(temp)) return false;
      return true;
    },
    dxx(e) {
      if (this.isChinese(e)) {
        this.$message({
          message: this.$t('不允许输入中文'),
          type: "error",
        });
        this.form.shortcutKey = "";
        return;
      }
      this.form.shortcutKey = e.toUpperCase();
    },
    dxx2(e) {
      if (this.isChinese(e)) {
        this.$message({
          message: this.$t('不允许输入中文'),
          type: "error",
        });
        this.form2.shortcutKey = "";
        return;
      }
      this.form2.shortcutKey = e.toUpperCase();
    },
    handleAvatarSuccess(e) {
      console.log(e);
      this.form.dict = e;
    },
    colorclick(e) {
      this.form.color = e;
    },
    colorclick2(e) {
      this.form2.color = e;
    },
    //随机升成 id
    RndNum(n) {
      var rnd = "";
      for (var i = 0; i < n; i++) rnd += Math.floor(Math.random() * 10);
      return rnd;
    },
    add1() {
      this.dialogVisible = true;
      this.form = {
        projectId: this.$route.query.id,
        definName: "",
        coodx: 200 + this.leftlist.length * 10,
        coody: 100 + this.leftlist.length * 10,
        color: "#E9458F",
        description: "",
        regex: "",
        dict: "",
        shortcutKey: "",
        // id:this.RndNum(6),
        // x: 200,
        // y:100,
        // type:  'rect-node',
        // style: {
        //   fill:'#fff',
        //   stroke:'#555ec5',
        //   lineWidth: 2,
        //   width: 150,
        //   height: 50,
        // },
        // label: '',
        // isadd:false,
        // key:'',
        // labelCfg: {
        //   style: {
        //     fontSize:16,
        //   },
        // }
      };
      this.title1 = "新建实体标签";
    },
    add2() {
      this.dialogVisible2 = true;
      this.form2 = {
        projectId: this.$route.query.id,
        name: "",
        color: "#E9458F",
        shortcutKey: "",
        // id:this.RndNum(6),
        // source: '',
        // target: '',
        // label: '',
        // labelCfg: {
        //   style: {
        //     stroke: 'white', // 给文本添加白边和白色背景
        //     fill: '#000000', // 文本颜色
        //     background: {
        //       fill: '#ffffff',
        //       stroke: '#cc0000',
        //       padding: [2, 2, 2, 2],
        //       radius: 2,
        //     },
        //   },
        // },
      };
      this.title2 = "新建关系标签";
    },
    edit(row, index) {
      this.dialogVisible = true;
      this.title1 = "编辑实体标签";
      this.index = index;
      this.form = JSON.parse(JSON.stringify(row));
    },
    remove(id) {
      this.$confirm(this.$t('是否删除该实体标签')+"?", this.$t('提示'), {
        confirmButtonText:this.$t('确定'),
        cancelButtonText: this.$t('取消'),
        type: "warning",
      }).then(() => {
        delshiti(id).then((res) => {
          this.getlist();
          this.$message({
            message: this.$t('删除成功'),
            type: "success",
          });
        });
      });
    },
    send1() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (
            this.form.regex != "" &&
            this.form.regex != null &&
            this.form.regex.indexOf("/") == -1
          ) {
            this.$message({
              message: this.$t('正则格式不对'),
              type: "error",
            });
            return;
          }
          if (this.title1 == "新建实体标签") {
            // this.leftlist.push(this.form)
            // this.graph.addItem('node', this.form);
            addshiti(this.form).then((res) => {
              this.dialogVisible = false;
              this.getlist();
            });
          } else {
            // this.graph.updateItem(this.leftlist[this.index].id, this.form);
            // this.dialogVisible=false;
            editshiti(this.form).then((res) => {
              this.dialogVisible = false;
              this.getlist();
            });
          }
        }
      });
    },
    edit2(row, index) {
      this.dialogVisible2 = true;
      this.title2 = "编辑关系标签";
      this.index2 = index;
      this.form2 = JSON.parse(JSON.stringify(row));
    },
    remove2(id) {
      //  this.index2=index;
      //  this.leftlist2.splice(index,1)
      //  this.graph.removeItem(row.id,true);
      this.$confirm(this.$t('是否删除该实体标签')+"?", this.$t('提示'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消'),
        type: "warning",
      }).then(() => {
        delguanxi(id).then((res) => {
          this.getlist();
          this.$message({
            message: this.$t('删除成功'),
            type: "success",
          });
        });
      });
    },
    send2() {
      this.$refs["form2"].validate((valid) => {
        if (valid) {
          if (this.title2 == "新建关系标签") {
            addguanxi(this.form2).then((res) => {
              this.dialogVisible2 = false;
              this.getlist();
            });
          } else {
            editguanxi(this.form2).then((res) => {
              this.dialogVisible2 = false;
              this.getlist();
            });
          }
        }
      });
    },
    send4() {
      this.$refs["form2"].validate((valid) => {
        if (valid) {
          addguanxi(this.form2).then((res) => {
            this.form3.relationId = res.data.id;
            addgl(this.form3).then((res) => {
              this.dialogVisible3 = false;
              this.getlist();
            });
          });
        }
      });
    },
    del3() {
      this.$confirm(this.$t('是否删除该关联')+"?", this.$t('提示'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消'),
        type: "warning",
      }).then(() => {
        delgl(this.form3.id).then((res) => {
          this.dialogVisible3 = false;
          this.getlist();
          this.$message({
            message: this.$t('删除成功'),
            type: "success",
          });
        });
      });
    },
    send3() {
      //  this.$refs['form3'].validate((valid) => {
      //     if (valid) {
      if (this.form3.id) {
        editgl(this.form3).then((res) => {
          this.dialogVisible3 = false;
          this.getlist();
        });
      } else {
        addgl(this.form3).then((res) => {
          this.dialogVisible3 = false;
          this.getlist();
        });
      }

      //   }
      // });
    },

    tabclick(e) {
      this.act = e;
    },
    tabclick2(e) {
      this.act2 = e;
    },
    createGraphic() {
      const vm = this;
      this.graph = null;
      const grid = new G6.Grid();
      const toolbar = new G6.ToolBar({
        position: {
          x: document.getElementById("hbdiv").offsetWidth - 240,
          y: document.getElementById("hbdiv").offsetHeight - 60,
        },
      });
      let layout = {
        type: "",
      };
      const cfg = registerFactory(G6, {
        width: document.getElementById("hbdiv").offsetWidth,
        height: document.getElementById("hbdiv").offsetHeight,
        renderer: "svg",
        // 设置为true，启用 redo & undo 栈功能
        enabledStack: true,
        layout: layout,
        // 所有节点默认配置
        defaultNode: {
          type: "rect-node",
          style: {
            radius: 10,
            width: 100,
            height: 50,
            cursor: "move",
            fill: "#ecf3ff",
          },
          labelCfg: {
            fontSize: 16,
            style: {
              cursor: "move",
            },
          },
        },
        // 所有边的默认配置
        defaultEdge: {
          type: "arc", // 扩展了内置边, 有边的事件
          style: {
            radius: 5,
            offset: 15,
            stroke: "#aab7c3",
            lineAppendWidth: 10, // 防止线太细没法点中
            endArrow: true,
          },
        },
        // 覆盖全局样式
        nodeStateStyles: {
          "nodeState:default": {
            opacity: 1,
          },
          "nodeState:hover": {
            opacity: 0.8,
          },
          "nodeState:selected": {
            opacity: 0.9,
          },
        },
        // 默认边不同状态下的样式集合
        edgeStateStyles: {
          "edgeState:default": {
            stroke: "#aab7c3",
          },
          "edgeState:selected": {
            stroke: "#1890FF",
          },
          "edgeState:hover": {
            animate: true,
            animationType: "dash",
            stroke: "#1890FF",
          },
        },
        modes: {
          // 支持的 behavior
          default: [
            "drag-canvas",
            "drag-shadow-node",
            "canvas-event",
            "delete-item",
            "select-node",
            "hover-node",
            "active-edge",
            "zoom-canvas",
          ],
          originDrag: [
            "drag-canvas",
            "drag-node",
            "canvas-event",
            "delete-item",
            "select-node",
            "hover-node",
            "active-edge",
          ],
        },
        plugins: [grid, toolbar],
        // ... 其他G6原生入参
      });

      this.graph = new G6.Graph(cfg);
      this.getlist(1);
    },
    // 初始化图事件
    initGraphEvent() {
      this.graph.on("node:dragend", (e) => {
        e.item.getOutEdges().forEach((edge) => {
          edge.clearStates("edgeState");
        });
        //console.log(e.target.cfg.className)
        // console.log(e.item.get('model'))
        if (e.target.cfg.className) {
          var newform = e.item.get("model").form;
          newform.coodx = e.x;
          newform.coody = e.y;

          editshiti(newform).then((res) => {
            this.dialogVisible = false;
            this.getlist();
          });
        }
      });
      this.graph.on("click", (ev) => {
        // 监听节点点击事件
        this.evt = ev.item;
        const shape = ev.target;
        if (ev.item) {
          const item = ev.item;
          const type = item.getType();

          this.selectedItem = ev.item._cfg.model;
          if (this.selectedItem.type == "arc") {
            console.log("treecomplex click 当前节点信息", this.selectedItem);
            this.radio = 1;
            this.dialogVisible3 = true;
            this.form3.fromid = this.selectedItem.source;
            this.form3.toid = this.selectedItem.target;
            if (this.selectedItem.label) {
              let obj = this.gxlist.filter(
                (item) =>
                  item.relationName == this.selectedItem.label &&
                  item.fromDefinId == this.selectedItem.source &&
                  item.toDefinId == this.selectedItem.target
              )[0];
              this.form3.relationId = obj.relationId;
              this.form3.id = obj.id;
            }
          }
        }
      });

      // this.graph.on('on-node-mouseenter', e => {
      //   if(e && e.item) {
      //     e.item.getOutEdges().forEach(edge => {
      //       edge.clearStates('edgeState');
      //       edge.setState('edgeState', 'hover');
      //     });
      //   }
      // });

      // // 鼠标拖拽到画布外时特殊处理
      // this.graph.on('mousedown', e => {
      //   this.isMouseDown = true;
      // });
      // this.graph.on('mouseup', e => {
      //   this.isMouseDown = false;
      // });
      // this.graph.on('canvas:mouseleave', e => {
      //   this.graph.getNodes().forEach(x => {
      //     const group = x.getContainer();

      //     group.clearAnchor();
      //     x.clearStates('anchorActived');
      //   });
      // });

      // this.graph.on('on-node-mousemove', e => {
      //   if (e && e.item) {
      //     this.tooltip = e.item.get('model').id;
      //     this.left = e.clientX + 40;
      //     this.top = e.clientY - 20;
      //   }
      // });

      // this.graph.on('on-node-mouseleave', e => {
      //   if (e && e.item) {
      //     this.tooltip = '';
      //     if(e && e.item) {
      //       e.item.getOutEdges().forEach(edge => {
      //         edge.clearStates('edgeState');
      //       });
      //     }
      //   }
      // });

      // this.graph.on('before-node-removed', ({ target, callback }) => {
      //   console.log(target);
      //   setTimeout(() => {
      //     // 确认提示
      //     callback(true);
      //   }, 1000);
      // });

      // this.graph.on('after-node-dblclick', e => {
      //   if (e && e.item) {
      //     console.log(e.item);
      //   }
      // });

      // this.graph.on('after-edge-selected', e => {
      //   this.configVisible = !!e;

      //   if (e && e.item) {
      //     this.config = e.item.get('model').id;

      //     this.graph.updateItem(e.item, {
      //       // shape: 'line-edge',
      //       style: {
      //         radius:    10,
      //         lineWidth: 2,
      //       },
      //     });
      //   }
      // });

      // this.graph.on('on-edge-mousemove', e => {
      //   if (e && e.item) {
      //     this.tooltip = e.item.get('model').label;
      //     this.left = e.clientX + 40;
      //     this.top = e.clientY - 20;
      //   }
      // });

      // this.graph.on('on-edge-mouseleave', e => {
      //   if (e && e.item) {
      //     this.tooltip = '';
      //   }
      // });

      this.graph.on(
        "before-edge-add",
        ({ source, target, sourceAnchor, targetAnchor }) => {
          setTimeout(() => {
            console.log(source);
            console.log(target);
            this.graph.addItem("edge", {
              id: `${+new Date() + (Math.random() * 10000).toFixed(0)}`, // edge id
              source: source.get("id"),
              target: target.get("id"),
              type: "arc",
              sourceAnchor,
              targetAnchor,
              // label:  'edge label',
            });
            this.radio = 1;
            this.dialogVisible3 = true;
            this.form3.relationId = "";
            this.form3.id = null;
            this.form3.fromid = source.get("id");
            this.form3.toid = target.get("id");
          }, 100);
        }
      );
    },
    deleteNode(item) {
      this.graph.removeItem(item, true);
    },
    async getlist(autoHtml) {
      if (autoHtml != undefined) {
        this.autoHtml = false;
      } else {
        this.autoHtml = true;
      }
      let nodes = await getshiti({ projectId: this.$route.query.id });
      let edges = await getguanxi({ projectId: this.$route.query.id });
      let guanxi = await getgl({ projectId: this.$route.query.id });
      this.leftlist = nodes.data;
      this.leftlist2 = edges.data;
      this.gxlist = guanxi.data;
      let data = {
        nodes: nodes.data.map((item) => {
          return {
            id: item.id,
            x: Number(item.coodx),
            y: Number(item.coody),
            type: "rect-node",
            style: {
              fill: "#fff",
              stroke: item.color,
              lineWidth: 2,
              width: 150,
              height: 50,
            },
            // size: [150, 50],
            // preRect:{
            //   show: true,
            //   fill:item.color,
            //   width: 8,
            //   radius:[10,0,0,10]
            // },
            // logoIcon:{
            //   show:false,
            // },
            // stateIcon:{
            //   show:false,
            // },
            // anchorPoints: [
            //   [0, 1],
            //   [0.5, 1],
            // ],
            linkPoints: {
              top: true,
              bottom: true,
              left: true,
              right: true,
            },
            label: item.definName,
            collected: item.collected,
            key: "",
            labelCfg: {
              style: {
                fontSize: 16,
              },
            },
            form: item,
          };
        }),
        edges: guanxi.data.map((item, index) => {
          return {
            source: item.fromDefinId,
            target: item.toDefinId,
            type: "arc",
            label: item.relationName,
            curveOffset: 20 + 40 * index,
            labelCfg: {
              autoRotate: true,
              style: {
                fill: "#ffffff", // 文本颜色
                background: {
                  fill: item.relationColor,
                  padding: [5, 5, 3, 5],
                  radius: 4,
                },
              },
            },
          };
        }),
      };
      this.graph.read(data); // 读取数据
      this.graph.render();
      // setTimeout(() => {
      //   this.graph.updateLayout({
      //     type: 'force',               // 布局名称
      //     preventOverlap: true,        // 布局参数，是否允许重叠
      //     nodeSize: 40,                // 布局参数，节点大小，用于判断节点是否重叠
      //     linkDistance: 100            // 布局参数，边长
      //   });
      // }, 100);
      if (!this.autoHtml) {
        let innerHtml = document.getElementsByClassName("g6-component-toolbar")[0]
          .innerHTML;
        let str =
          '<li code="Fruchterman" id="Fruchterman" onclick="fruchterman()" style="cusor:pointer;">自动排版</li>';
        document.getElementsByClassName("g6-component-toolbar")[0].innerHTML =
          innerHtml + str;
        document.getElementsByClassName("g6-component-toolbar")[0].style.left = "475px";
      }
    },
    save() {
      console.log(this.graph.cfg.data);
    },
    fruchterman() {
      setTimeout(() => {
        this.graph.updateLayout({
          // type: 'force',               // 布局名称
          // preventOverlap: true,        // 布局参数，是否允许重叠
          // nodeSize: 40,                // 布局参数，节点大小，用于判断节点是否重叠
          // linkDistance: 700,
          // collideStrength: [0, 8]            // 布局参数，边长
          type: "radial",
          // center: [200, 200], // 可选，默认为图的中心
          linkDistance: 500, // 可选，边长
          maxIteration: 10000, // 可选
          // focusNode: "node11", // 可选
          unitRadius: 1000, // 可选
          preventOverlap: true, // 可选，必须配合 nodeSize
          nodeSize: 100, // 可选
          strictRadial: false, // 可选
        });
      }, 100);
    },
  },
};
</script>

<style lang="scss">
.ysli {
  display: flex;
  align-items: center;
  li {
    font-size: 43rem;
    flex: 1;
    .el-icon-success {
      display: none;
    }
    .colordiv {
      width: 40rem;
      height: 40rem;
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
  .bentileft {
    width: 420rem;
    .tab {
      background: url(../../assets/tabmenu.png) no-repeat;
      height: 51rem;
      background-size: 100% 100%;
      li {
        font-size: 20rem;
        width: 190rem;
        display: inline-block;
        text-align: center;
        line-height: 51rem;
        cursor: pointer;
        color: #787878;
      }
      li.hov,
      li:hover {
        color: #333;
      }
    }
    .tab2 {
      background: url(../../assets/tabmenu2.png) no-repeat;
      height: 51rem;
      background-size: 100% 100%;
    }
    .borbox {
      margin-top: 20rem;
      padding: 10rem;
      border: 1px solid #ccc;
      box-sizing: border-box;
      border-radius: 10rem;
      .leftlist,
      .leftlist2 {
        height: calc(100vh - 255rem);
        overflow: auto;
        li {
          height: 38rem;
          background: #f9f9f9;
          border-radius: 8rem 8rem 8rem 8rem;
          border-left: 7rem solid;
          display: flex !important;
          align-items: center;
          padding-left: 20rem;
          padding-right: 20rem;
          margin-bottom: 10rem;
          .listname {
            flex: 1;
          }
          .listmore {
            cursor: pointer;
          }
          .liststart {
            background: url(../../assets/start.png) no-repeat center center;
            background-size: 20rem 20rem;
            width: 20rem;
            height: 20rem;
            margin-right: 10rem;
            cursor: pointer;
          }
          .liststart2 {
            background: url(../../assets/start2.png) no-repeat center center;
            background-size: 20rem 20rem;
            width: 20rem;
            height: 20rem;
            margin-right: 10rem;
            cursor: pointer;
          }
          .listkey {
            margin-right: 20rem;
            color: #6b6b6b;
          }
        }
      }
      .leftlist2 {
        li {
          border: 0px;
          .circolor {
            width: 12rem;
            height: 12rem;
            border-radius: 50%;
            margin-right: 10rem;
          }
        }
      }
      .btnadd {
        width: 100%;
        height: 40rem;
        background: linear-gradient(136deg, #403de6 0%, #575bca 100%);
        box-shadow: 3px 4px 7px 1px rgba(80, 72, 153, 0.25);
        border-radius: 8px 8px 8px 8px;
        font-size: 20rem;
      }
    }
  }
  .bentiright {
    flex: 1;
    margin-left: 20rem;
    .czmenu {
      text-align: center;
      li {
        display: inline-block;
        width: 72rem;
        height: 52rem;
        border-radius: 6rem;
        cursor: pointer;
        .cz1 {
          background: url(../../assets/cz1.png) no-repeat center center;
          background-size: 25rem 25rem;
          width: 72rem;
          height: 52rem;
        }
        .cz2 {
          background: url(../../assets/cz2.png) no-repeat center center;
          background-size: 25rem 25rem;
          width: 72rem;
          height: 52rem;
        }
        .cz3 {
          background: url(../../assets/cz3.png) no-repeat center center;
          background-size: 25rem 25rem;
          width: 72rem;
          height: 52rem;
        }
        .cz4 {
          background: url(../../assets/cz4.png) no-repeat center center;
          background-size: 25rem 25rem;
          width: 72rem;
          height: 52rem;
        }
        .cz5 {
          background: url(../../assets/cz5.png) no-repeat center center;
          background-size: 25rem 25rem;
          width: 72rem;
          height: 52rem;
        }
        margin-left: 20rem;
        margin-right: 20rem;
      }
      li:hover {
        background: linear-gradient(138deg, #4443e2 0%, #575bcb 100%);
        box-shadow: 3px 4px 7px 1px rgba(80, 72, 153, 0.25);
        .cz1 {
          background: url(../../assets/cz1hov.png) no-repeat center center;
          background-size: 25rem 25rem;
        }
        .cz2 {
          background: url(../../assets/cz2hov.png) no-repeat center center;
          background-size: 25rem 25rem;
        }
        .cz3 {
          background: url(../../assets/cz3hov.png) no-repeat center center;
          background-size: 25rem 25rem;
        }
        .cz4 {
          background: url(../../assets/cz4hov.png) no-repeat center center;
          background-size: 25rem 25rem;
        }
        .cz5 {
          background: url(../../assets/cz5hov.png) no-repeat center center;
          background-size: 25rem 25rem;
        }
      }
    }
    .rightmain {
      background: #f9f9f9;
      height: calc(100vh - 125rem);
      border-radius: 8px 8px 8px 8px;
      border: 1px solid #ccc;
      position: relative;
      overflow: hidden;
      .righttab {
        li {
          width: 126rem;
          height: 42rem;
          line-height: 42rem;
          font-size: 16rem;
          color: #787878;
          text-align: center;
          cursor: pointer;
          display: inline-block;
        }
        li:hover,
        li.hov {
          border-bottom: 2rem solid #575bca;
          background: #fff;
          color: #333;
          font-weight: bold;
        }
      }
    }
  }
}

/* 提示框的样式 */
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
  font-family: "iconfont";
  src: url("//at.alicdn.com/t/font_1540180_5hj90so1tea.eot?t=1578985252153");
  /* IE9 */
  src: url("//at.alicdn.com/t/font_1540180_5hj90so1tea.eot?t=1578985252153#iefix")
      format("embedded-opentype"),
    /* IE6-IE8 */
      url("data:application/x-font-woff2;charset=utf-8;base64,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")
      format("woff2"),
    url("//at.alicdn.com/t/font_1540180_5hj90so1tea.woff?t=1578985252153") format("woff"),
    url("//at.alicdn.com/t/font_1540180_5hj90so1tea.ttf?t=1578985252153")
      format("truetype"),
    /* chrome, firefox, opera, Safari, Android, iOS 4.2+ */
      url("//at.alicdn.com/t/font_1540180_5hj90so1tea.svg?t=1578985252153#iconfont")
      format("svg");
  /* iOS 4.1- */
}

.iconfont {
  font-family: "iconfont" !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.icon-actual-size:before {
  content: "\e686";
}

.icon-font-size:before {
  content: "\e662";
}

.icon-background:before {
  content: "\e819";
}

.icon-redo:before {
  content: "\e627";
}

.icon-zoom-out:before {
  content: "\e642";
}

.icon-user:before {
  content: "\e606";
}

.icon-model-rect:before {
  content: "\e669";
}

.icon-search:before {
  content: "\e600";
}

.icon-triangle:before {
  content: "\e607";
}

.icon-undo:before {
  content: "\e666";
}

.icon-cubic:before {
  content: "\e64e";
}

.icon-fold-right:before {
  content: "\e601";
}

.icon-copy:before {
  content: "\e60c";
}

.icon-star:before {
  content: "\e608";
}

.icon-line-strong:before {
  content: "\e604";
}

.icon-full-screen:before {
  content: "\e6b7";
}

.icon-quadratic:before {
  content: "\e6d5";
}

.icon-paste:before {
  content: "\e62d";
}

.icon-dot-line:before {
  content: "\e6a2";
}

.icon-jinggao:before {
  content: "\e661";
}

.icon-ellipse:before {
  content: "\e671";
}

.icon-todown:before {
  content: "\e603";
}

.icon-toup:before {
  content: "\e605";
}

.icon-zoom-in:before {
  content: "\e64c";
}

.icon-arc:before {
  content: "\e649";
}

.icon-diamond:before {
  content: "\e643";
}

.icon-rect:before {
  content: "\e60a";
}

.icon-circle:before {
  content: "\e623";
}

.icon-line-style:before {
  content: "\e696";
}

.icon-v-drag:before {
  content: "\e805";
}

.icon-h-drag:before {
  content: "\e66c";
}

.icon-line:before {
  content: "\e71d";
}

.icon-preview:before {
  content: "\e65a";
}

.icon-polyline:before {
  content: "\e609";
}

.icon-text:before {
  content: "\e624";
}

.icon-interval:before {
  content: "\e68e";
}

.icon-fill-screen:before {
  content: "\e85b";
}

.icon-save:before {
  content: "\e64d";
}

.icon-setting:before {
  content: "\e645";
}

.icon-up-fill:before {
  content: "\e602";
}

.icon-delete:before {
  content: "\e62c";
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
  width: 460rem;
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
  .el-color-picker {
    overflow: hidden;
    border-radius: 50% !important;
    opacity: 0;
  }
  .el-color-picker__trigger {
    border: 0px;
  }
  .el-color-picker--small .el-color-picker__trigger,
  .el-color-picker {
    width: 40rem !important;
    height: 40rem !important;
    display: block;
    padding: 0rem !important;
  }
  .el-color-picker__color {
    border: 0px !important;
  }
  .el-color-picker__icon {
    font-size: 22rem;
    font-weight: bold;
  }
}
.tabbutton {
  margin-top: -10rem;
  margin-bottom: 20rem;
  display: flex;
  width: 100%;
  .el-radio-button {
    flex: 1;
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
