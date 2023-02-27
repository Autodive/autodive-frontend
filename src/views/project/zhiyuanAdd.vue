<template>
  <div class="zhiyuanAdd">
    <div class="addtop">
      <div class="backbtn" @click="goback">
        <img src="../../assets/back.png" />{{ $t('返回已有资源列表') }}
      </div>
      <div class="stepdiv stepdiv1" v-if="step == 1">
        <div class="step1">
          <div class="stepcir">1</div>
          {{ $t('导入资源') }}
        </div>
        <div class="step1sx"></div>
        <div class="step2">
          <div class="stepcir">2</div>
          {{ $t('指派任务') }}
        </div>
        <div class="step2sx"></div>
        <div class="step3">
          <div class="stepcir">3</div>
          {{ $t('指派完成') }}
        </div>
      </div>
      <div class="stepdiv stepdiv2" v-if="step == 2">
        <div class="step1">
          <div class="stepcir">1</div>
          {{ $t('导入资源') }}
        </div>
        <div class="step1sx"></div>
        <div class="step2">
          <div class="stepcir">2</div>
          {{ $t('指派任务') }}
        </div>
        <div class="step2sx"></div>
        <div class="step3">
          <div class="stepcir">3</div>
          {{ $t('指派完成') }}
        </div>
      </div>
      <div @click="drawer = true" class="lookzy">{{ $t('查看已选资源') }}</div>
    </div>
    <div>{{ $t('文献搜索') }}</div>
    <div
      v-if="step == 1"
      style="display: flex; margin-top: 10rem; margin-bottom: 20rem; align-items: center"
    >
      <el-input
        prefix-icon="el-icon-search"
        v-model="keyword"
        size="small"
        style="width: 340rem"
        :placeholder="$t('搜索文献（模糊关键字）')"
      ></el-input>
      <el-button type="primary" @click="search" size="small" style="margin-left: 20rem"
        >{{ $t('搜索') }}</el-button
      >
      <div class="wxtype">
        <ul>
          <li :class="{ hov: act == '' }" @click="tabclick('')">{{ $t('全部') }}</li>
          <li
            v-for="(item, index) in typelist"
            :key="index"
            :class="{ hov: act == item.id }"
            @click="tabclick(item.id)"
          >
            {{ item.name }}
          </li>
        </ul>
      </div>
      <el-upload
        :show-file-list="false"
        :action="baseURL + '/upload'"
        :on-success="handleAvatarSuccess2"
      >
        <el-button type="primary" size="small">{{ $t('上传doi列表') }}</el-button>
      </el-upload>

      <el-dropdown placement="top">
        <img
          src="../../assets/wh.png"
          style="
            width: 20rem;
            height: 20rem;
            margin-right: 20rem;
            cursor: pointer;
            margin-left: 5rem;
            margin-top: 8rem;
          "
        />
        <el-dropdown-menu slot="dropdown"
          ><el-dropdown-item>{{ $t('请上传本地TXT文件') }}</el-dropdown-item></el-dropdown-menu
        >
      </el-dropdown>
      <el-button type="default" @click="addwx" size="small">{{ $t('上传文献') }}</el-button>
    </div>
    <div v-if="step == 2" style="display: flex; margin-top: 10rem; margin-bottom: 20rem">
      <el-input
        prefix-icon="el-icon-search"
        style="width: 340rem"
        :placeholder="$t('搜索文献（模糊关键字）')"
      ></el-input>
      <div style="flex: 1"></div>
      <el-button type="primary" @click="zhipai" size="small">{{ $t('批量指派') }}</el-button>
      <el-button type="default" @click="delmore" size="small">{{ $t('批量删除') }}</el-button>
    </div>
    <el-table
      v-if="step == 1"
      :data="tableData"
      @select-all="selectall"
      @select="handleSelect"
      @selection-change="handleSelectionChange"
      ref="multipleTableClinicRoom"
      :height="550"
      style="margin-top: 10px; width: 100%"
      :header-cell-style="{ background: '#F9F9F9' }"
    >
      <el-table-column
        type="selection"
        :selectable="selectable"
        align="center"
        width="55"
      >
      </el-table-column>

      <el-table-column
        width="300"
        prop="doi"
        align="center"
        label="DOI"
      ></el-table-column>
      <el-table-column prop="title" :label="$t('文献标题')"></el-table-column>
      <el-table-column align="center" label="" width="50">
        <template slot-scope="scope"
          ><img
            src="../../assets/lookicon.png"
            @click="openurl(scope.row.previewUrl)"
            style="cursor: pointer; width: 20rem; height: 20rem"
        /></template>
      </el-table-column>
      <el-table-column prop="authors" :label="$t('作者')"></el-table-column>
      <el-table-column
        width="220" prop="keywords" align="center" :label="$t('关键词')">
        <template slot-scope="scope">
<!--          <el-tooltip class="item" effect="dark" placement="bottom">-->
<!--            <div slot="content" style="max-width: 400rem">{{ scope.row.keywords }}</div>-->
<!--            <span>{{ keywordevent(scope.row.keywords) }}</span>-->
<!--          </el-tooltip>-->
          <TableColumnText :text="scope.row.keywords"></TableColumnText>
        </template>
      </el-table-column>
      <el-table-column :label="$t('类型')" prop="type" width="100" align="center">
      </el-table-column>
      <!-- <el-table-column label="操作" width="80"  align="center">
      <template slot-scope="scope">
        <i class="el-icon-delete" style="color:#6B6B6B;font-size:20rem;cursor: pointer;"  @click="del(scope.id)"></i>
      </template>
    </el-table-column> -->
    </el-table>

    <el-table
      v-if="step == 2"
      :data="tableData2"
      @selection-change="handleSelectionChange2"
      style="margin-top: 10px; width: 100%"
      :header-cell-style="{ background: '#F9F9F9' }"
    >
      <el-table-column align="center" type="selection" width="55"> </el-table-column>
      <el-table-column prop="name" width="100" align="center" :label="$t('任务状态')">
        <template slot-scope="scope">
          <div v-if="scope.row.status == 1" class="wks">{{ $t('未开始') }}</div>
          <div v-if="scope.row.status == 2" class="jxz">{{ $t('进行中') }}</div>
          <div v-if="scope.row.status == 3" class="wc">{{ $t('标注完成') }}</div>
        </template>
      </el-table-column>
      <el-table-column
        width="300"
        prop="doi"
        align="center"
        label="DOI"
      ></el-table-column>
      <el-table-column prop="title" :label="$t('文献标题')"></el-table-column>
      <el-table-column align="center" label="" width="50">
        <template slot-scope="scope"
          ><img
            src="../../assets/lookicon.png"
            @click="openurl(scope.row.previewUrl)"
            style="cursor: pointer; width: 20rem; height: 20rem"
        /></template>
      </el-table-column>
      <el-table-column width="220" prop="authors" :label="$t('作者')">
        <template slot-scope="scope">
          <!--          <el-tooltip class="item" effect="dark" placement="bottom">-->
          <!--            <div slot="content" style="max-width: 400rem">{{ scope.row.keywords }}</div>-->
          <!--            <span>{{ keywordevent(scope.row.keywords) }}</span>-->
          <!--          </el-tooltip>-->
          <TableColumnText :text="scope.row.authors"></TableColumnText>
        </template>
      </el-table-column>
      <el-table-column
        prop="keywords"
        align="center"
        width="100"
        :label="$t('关键词')"
      ></el-table-column>
      <el-table-column :label="$t('标注者')" align="center">
        <template slot-scope="scope">
          <div class="bzz">
            <el-dropdown v-for="(item, index) in scope.row.userResources" :key="index">
              <div class="cir" :class="'cir' + (index + 1)">{{ item.userName }}</div>
              <el-dropdown-menu slot="dropdown"
                ><el-dropdown-item
                  ><div
                    @click="
                      delpeo(
                        scope.row.id,
                        scope.row.userResources,
                        item.userId,
                        scope.$index
                      )
                    "
                  >
                    {{ $t('删除') }}
                  </div></el-dropdown-item
                ></el-dropdown-menu
              >
            </el-dropdown>

            <i
              @click="zp(scope.row.id, scope.row.title, scope.row.userResources)"
              style="
                color: #403ee6;
                font-size: 42rem;
                font-weight: bold;
                z-index: 0;
                cursor: pointer;
              "
              class="el-icon-circle-plus-outline"
            ></i>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('操作')" width="80" align="center">
        <template slot-scope="scope">
          <i
            class="el-icon-delete"
            style="color: #6b6b6b; font-size: 20rem; cursor: pointer"
            @click="del2(scope.$index)"
          ></i>
        </template>
      </el-table-column>
    </el-table>
    <div v-if="step == 1" style="text-align: right; margin-top: 20rem">
      <el-button @click="goback" type="default">{{ $t('返回已有资源列表') }}</el-button>
      <el-button type="primary" @click="qrdr">{{ $t('确认导入') }}</el-button>
    </div>
    <div v-if="step == 2" style="text-align: right; margin-top: 20rem">
      <el-button @click="step = 1" type="default">{{ $t('上一步') }}</el-button>
      <el-button type="primary" @click="qrzp">{{ $t('确认指派') }}</el-button>
    </div>
    <div class="pagediv" v-if="step == 1">
      <el-pagination
        background
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
        :page-sizes="[10, 20, 30, 40, 50]"
        :current-page="page"
        :total="total"
        layout="total,sizes,prev, pager, next, jumper"
      >
      </el-pagination>
    </div>

    <el-dialog
      :title="$t('上传文献')"
      custom-class="outdivstyle"
      :visible.sync="dialogVisible"
      width="30%"
    >
      <div style="text-align: center">{{ $t('请填写文献信息并上传pdf文件') }}</div>
      <el-form
        ref="form"
        :rules="rules"
        :model="form"
        label-width="140px"
        style="margin-top: 15rem"
      >
        <el-form-item :label="$t('文献标题')" prop="title">
          <el-input :placeholder="$t('请输入')" v-model="form.title"></el-input>
        </el-form-item>
        <el-form-item :label="$t('doi')" prop="doi">
          <el-input :placeholder="$t('请输入')" v-model="form.doi"></el-input>
        </el-form-item>
        <el-form-item :label="$t('作者')" prop="authors">
          <el-input :placeholder="$t('请输入')" v-model="form.authors"></el-input>
        </el-form-item>
        <el-form-item :label="$t('关键字')" prop="keywords">
          <el-input :placeholder="$t('请输入')" v-model="form.keywords"></el-input>
        </el-form-item>
        <el-form-item :label="$t('类型')" prop="type">
          <el-select v-model="form.type" :placeholder="$t('请选择')" style="width: 100%">
            <el-option
              v-for="item in typelist"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('文件')" prop="url">
          <el-upload
            :file-list="fileList"
            :action="baseURL + '/upload'"
            :on-success="handleAvatarSuccess"
          >
            <el-button type="primary" size="small">{{ $t('选择文件') }}</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">{{ $t('取消') }}</el-button>
        <el-button type="primary" @click="send1">{{ $t('确认') }}</el-button>
      </span>
    </el-dialog>

    <el-dialog
      :title="$t('上传doi列表')"
      custom-class="outdivstyle"
      :visible.sync="dialogVisible2"
      width="50%"
      center
    >
      <div style="max-height: 500rem; overflow: auto">
        <div style="text-align: center; color: #575bca">
          {{ $t('根据上传doi列表，检索到以下资源') }}
        </div>
        <div class="disflex">
          <div class="doi">{{ $t('DOI') }}</div>
          <div class="title">{{ $t('文献标题') }}</div>
        </div>
        <div class="disflex yxzylist" v-for="(item, index) in pplist" :key="index">
          <div class="doi">{{ item.doi }}</div>
          <div class="title">{{ item.title }}</div>
        </div>
        <div style="text-align: center; color: #cc0000; margin-bottom: 10rem">
          {{ $t('未检索到以下资源，请自行上传') }}
        </div>
        <div
          class="disflex yxzylist wsclist"
          v-for="(item, index) in wpplist"
          :key="index"
        >
          <div class="doi">{{ item.doi }}</div>
          <div class="title">{{ item.title }}</div>
          <el-button size="mini" type="primary" @click="uploadwx(item)"
            >{{ $t('上传文献') }}</el-button
          >
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogVisible2 = false">{{ $t('确认') }}</el-button>
      </span>
    </el-dialog>

    <el-dialog
      :title="$t('指派任务')"
      custom-class="outdivstyle"
      :visible.sync="dialogVisible3"
      center
      width="20%"
    >
      <div>
        {{ $t('已选择') }}<br />
        <div
          v-for="(item, index) in checklistname"
          :key="index"
          style="word-break: break-word"
        >
          {{ item }}
        </div>
      </div>
      <el-input
        v-model="userName"
        @input="getpeople"
        prefix-icon="el-icon-search"
        style="margin-top: 20rem"
        :placeholder="$t('搜索标注者名称')"
      ></el-input>
      <el-checkbox-group style="margin-top: 20rem" v-model="checkpoeple">
        <div class="renlist" v-for="(item, index) in peoplelist" :key="index">
          <el-checkbox :label="item.userId">{{ item.userName }}</el-checkbox>
        </div>
      </el-checkbox-group>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible3 = false">{{ $t('取消') }}</el-button>
        <el-button type="primary" @click="send3">{{ $t('确认指派') }}</el-button>
      </span>
    </el-dialog>

    <el-drawer :title="$t('已选资源列表')" :visible.sync="drawer" direction="rtl">
      <div style="padding-left: 20rem; padding-right: 20rem">
        <div class="disflex">
          <div class="scdiv"></div>
          <div class="doi">{{ $t('DOI') }}</div>
          <div class="title">{{ $t('文献标题') }}</div>
        </div>
        <div class="disflex yxzylist" v-for="(item, index) in checklist" :key="index">
          <div class="scdiv">
            <i class="el-icon-close" @click="delcheck(item.id)"></i>
          </div>
          <div class="doi">{{ item.doi }}</div>
          <div class="title">{{ item.title }}</div>
        </div>
      </div>
    </el-drawer>

    <el-dialog
      :title="$t('文献预览')"
      custom-class="outdivstyle outdivstyle2"
      :visible.sync="dialogyulan"
      center
      width="80%"
    >
      <iframe :src="iframeurl"></iframe>
    </el-dialog>
  </div>
</template>

<script>
import {
  getzhiyuan,
  addzhiyuan,
  delzhiyuan,
  gettype,
  findListByUserName,
  resourcesAssign,
  insertBatch,
  searchResourcesByDoi,
  searchResources,
} from "@/api/zhiyuan";
import { getqx } from "@/api/quanxian";
import { itemIntersectByLine } from "@antv/g6-core/lib/util/math";
import { baseURL } from "@/config/setting.config";
import TableColumnText from '@/components/TableColumnText'
// import i18next from 'i18next';
export default {
  components: {TableColumnText},
  data() {
    return {
      baseURL,
      dialogyulan: false,
      iframeurl: "",
      drawer: false,
      dialogVisible: false,
      dialogVisible2: false,
      dialogVisible3: false,
      checklist: [],
      userName: "",
      checkpoeple: [],
      tableData: [],
      total: 0,
      page: 1,
      size: 10,
      total: 0,
      step: 1,
      act: "",
      form: {
        id: (Math.random() + new Date().getTime()).toString(32).slice(0, 8),
        projectId: this.$route.query.id,
        title: "",
        doi: "",
        keywords: "",
        url: "",
        type: "",
        authors: "",
      },
      rules: {
        title: [{ required: true, message: this.$t('请输入文献标题'), trigger: "blur" }],
        doi: [{ required: true, message: this.$t('请输入doi'), trigger: "blur" }],
        url: [{ required: true, message: this.$t('请上传文件'), trigger: "change" }],
        authors: [{ required: true, message:this.$t('请填写作者'), trigger: "blur" }],
      },
      typelist: [],
      peoplelist: [],
      checklist2: [],
      checklistname: [],

      renindex: 0,
      tableData2: [],
      keyword: "",
      pplist: [],
      wpplist: [],
      bdtable: [],
      yytableData: [],
      fileList: [],
      baseURL: "",
    };
  },
  mounted() {
    this.baseURL = baseURL;
    getzhiyuan({
      page: 0,
      size: 999999999,
      projectId: this.$route.query.id,
      title: this.title,
    }).then((res) => {
      this.yytableData = res.data.content;
    });
    gettype().then((res) => {
      this.typelist = res.data;
    });
    this.getpeople();
    this.getlist();
  },
  methods: {
    keywordevent(e) {
      if (e != "" && e != null && e != undefined) {
        let arr = e.split(";");
        if (arr.length > 1) {
          return arr[0] + ";" + arr[1];
        } else {
          return arr[0];
        }
      } else {
        return "";
      }
    },
    uploadwx(item) {
      this.fileList = [];
      this.dialogVisible = true;
      this.form = item;
    },
    selectable: function (row, index) {
      if (this.yytableData.findIndex((item) => item.doi == row.doi) != -1) {
        return false;
      } else {
        return true;
      }
    },
    search() {
      this.page = 1;
      this.getlist();
    },
    delpeo(resid, userList, id, ind) {
      this.checkpoeple = userList.map((item) => {
        return item.userId;
      });
      let index = this.checkpoeple.indexOf(id);
      this.checkpoeple.splice(index, 1);
      resourcesAssign({ resourcesIds: [resid], userIds: this.checkpoeple }).then(
        (res) => {
          this.$message({
            message: this.$t('删除成功'),
            type: "success",
          });
          let newarr = this.peoplelist.filter(
            (item) => this.checkpoeple.indexOf(item.userId) != -1
          );
          this.tableData2[ind].userResources = newarr;
        }
      );
    },
    getpeople() {
      getqx({
        page: 0,
        size: 9999,
        username: this.userName,
        projectId: this.$route.query.id,
      }).then((res) => {
        this.peoplelist = res.data.content;
      });
    },
    delcheck(id) {
      let ind = this.checklist.findIndex((item) => item.id == id);
      this.checklist.splice(ind, 1);
      let ind2 = this.tableData.findIndex((item) => item.id == id);
      this.$nextTick(() => {
        this.$refs.multipleTableClinicRoom.toggleRowSelection(
          this.tableData[ind2],
          false
        );
      });
    },
    zhipai() {
      if (this.checklist2.length == 0) {
        this.$message({ message: this.$t('请最少勾选一条数据'), type: "error" });
        return;
      }
      this.dialogVisible3 = true;
    },
    qrzp() {
      this.$router.push({
        path:
          "/project/zhiyuanok?name=" +
          this.$route.query.name +
          "&id=" +
          this.$route.query.id,
      });
    },
    openurl(url) {
      //window.open(url, '_blank')
      this.iframeurl = url;
      this.dialogyulan = true;
    },
    qrdr() {
      if (this.checklist.length == 0) {
        this.$message({ message: this.$t('请最少勾选一条数据'), type: "error" });
        return;
      }
      insertBatch(this.checklist).then((res) => {
        this.step = 2;
        this.tableData2 = this.tableData2.concat(res.data);
        var newarr = this.checklist.map((item) => {
          return item.id;
        });
        this.tableData = this.tableData.filter((item) => newarr.indexOf(item.id) == -1);
      });
    },
    load(name) {
      let xhr = new XMLHttpRequest(),
        okStatus = document.location.protocol === "file:" ? 0 : 200;
      xhr.open("GET", name, false);
      xhr.overrideMimeType("text/html;charset=utf-8"); //默认为utf-8
      xhr.send(null);
      return xhr.status === okStatus ? xhr.responseText : null;
    },
    handleAvatarSuccess2(e) {
      console.log("https://autodive.m2.mayeve.cn/api" + e);
      let newtext = this.load("https://autodive.m2.mayeve.cn/api" + e);
      let snsArr = newtext.split(/[(\r\n)\r\n]+/);
      //删除空项
      snsArr.forEach((item, index) => {
        if (!item) {
          snsArr.splice(index, 1);
        }
      });
      searchResourcesByDoi(snsArr)
        .then((res) => {
          this.pplist = res.data.filter(
            (item) =>
              item.url != null &&
              item.url != "" &&
              item.authors != "" &&
              item.doi != "" &&
              item.title != ""
          );
          let newarr = res.data.filter(
            (item) =>
              item.url == null ||
              item.url == "" ||
              item.authors == "" ||
              item.doi == "" ||
              item.title == ""
          );
          let newarr2 = [];
          for (let i = 0; i < snsArr.length; i++) {
            if (res.data.findIndex((it) => it.doi == snsArr[i]) == -1) {
              newarr2.push({
                title: "",
                doi: snsArr[i],
                url: "",
              });
            }
          }
          this.wpplist = newarr.concat(newarr2);
          this.adddoi();
        })
        .catch((reason) => {
          console.error(reason);
          return Promise.resolve([]);
        });
    },
    handleAvatarSuccess(e) {
      this.form.url = e;
    },
    adddoi() {
      this.dialogVisible2 = true;
    },
    addwx() {
      this.dialogVisible = true;
      this.fileList = [];
      this.form = {
        id: (Math.random() + new Date().getTime()).toString(32).slice(0, 8),
        projectId: this.$route.query.id,
        title: "",
        doi: "",
        keywords: "",
        url: "",
        type: "",
        authors: "",
      };
    },
    tabclick(e) {
      this.act = e;
      this.page = 1;
      this.getlist();
    },
    goback() {
      this.$router.go(-1);
    },
    handleSizeChange(val) {
      this.size = val;
      this.getlist();
    },
    handleCurrentChange(val) {
      this.page = val;
      this.getlist();
    },
    send1() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.form.url == "") {
            this.$message({
              message: this.$t('请上传文献'),
              type: "error",
            });
            return;
          }
          this.bdtable.push(this.form);
          //localStorage.setItem('tableData',JSON.stringify(this.tableData))
          this.dialogVisible = false;
          this.getlist();
          //  addzhiyuan(this.form).then(res=>{
          //     this.dialogVisible=false;
          //     this.getlist()
          //   })
        }
      });
    },
    getlist() {
      // let newarr=JSON.parse(localStorage.getItem('tableData'))?JSON.parse(localStorage.getItem('tableData')):[];
      searchResources({
        page: this.page,
        size: this.size,
        keyword: this.keyword,
        tags: this.act,
      })
        .then((res) => {
          this.tableData = this.bdtable.concat(res.data.content);
          this.total = res.data.totalElements;
          this.$nextTick(() => {
            this.$refs.multipleTableClinicRoom.bodyWrapper.scrollTop = 0;
          });
          setTimeout(() => {
            for (let j = 0; j < this.checklist.length; j++) {
              let ind = this.tableData.findIndex(
                (item) => item.id == this.checklist[j].id
              );

              if (ind != -1) {
                console.log(ind);
                this.$refs.multipleTableClinicRoom.toggleRowSelection(
                  this.tableData[ind],
                  true
                );
                this.$forceUpdate();
              }
            }
          }, 500);
        })
        .catch((reason) => {
          console.error(reason);
          return Promise.resolve({});
        });
    },
    selectall(val) {
      if (val.length == 0) {
        for (let i = 0; i < this.tableData.length; i++) {
          let ind = this.checklist.findIndex((item) => item.id == this.tableData[i].id);
          if (ind != -1) {
            this.checklist.splice(ind, 1);
          }
        }
      }
    },
    handleSelect(val, row) {
      let ind = this.checklist.findIndex((item) => item.id == row.id);
      if (ind != -1) {
        this.checklist.splice(ind, 1);
      }
    },
    handleSelectionChange(val) {
      let newarr = val.map((item) => {
        item.projectId = this.$route.query.id;
        delete item.createBy;
        return item;
      });
      let newarr2 = JSON.parse(JSON.stringify(this.checklist.concat(newarr)));

      const res = new Map();
      this.checklist = newarr2.filter(
        (item) => !res.has(item["id"]) && res.set(item["id"], 1)
      );
      console.log(this.checklist);
    },
    handleSelectionChange2(val) {
      this.checklist2 = val.map((item) => {
        return item.id;
      });
      this.checklistname = val.map((item) => {
        return item.title;
      });
    },
    del(id) {
      this.$confirm(this.$t('是否删除该数据')+"?", this.$t('提示'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消'),
        type: "warning",
      }).then(() => {
        let ind = this.tableData.findIndex((item) => item.id == id);
        this.tableData.splice(ind, 1);
        //  delzhiyuan(id).then((res) => {
        //     this.$message({
        //         message: '删除成功',
        //         type: 'success'
        //       })
        //    this.page=0;
        //    this.getlist()
        // })
      });
    },
    del2(ind) {
      this.$confirm(this.$t('是否删除该数据')+"?",  this.$t('提示'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消'),
        type: "warning",
      }).then(() => {
        this.tableData2.splice(ind, 1);
      });
    },
    delmore() {
      if (this.checklist2.length == 0) {
        this.$message({ message: this.$t("请最少勾选一条数据"), type: "error" });
        return;
      }
      for (let i = 0; i < this.checklist2.length; i++) {
        let ind = this.tableData2.findIndex((item) => item.id == this.checklist2[i]);
        this.tableData2.splice(ind, 1);
        if (i == this.checklist2.length - 1) {
          this.$message({
            message: this.$t("删除成功"),
            type: "success",
          });
        }
      }
    },
    send3() {
      resourcesAssign({ resourcesIds: this.checklist2, userIds: this.checkpoeple }).then(
        (res) => {
          this.$message({
            message:  this.$t("指派成功"),
            type: "success",
          });
          // this.qrzp()
          this.dialogVisible3 = false;
          for (let i = 0; i < this.checklist2.length; i++) {
            let ind = this.tableData2.findIndex((item) => item.id == this.checklist2[i]);
            let newarr = this.peoplelist.filter(
              (item) => this.checkpoeple.indexOf(item.userId) != -1
            );
            this.tableData2[ind].userResources = newarr;
          }
        }
      );
    },
    zp(id, name, userResources) {
      this.checklist2 = [id];
      this.checklistname = [name];
      this.checkpoeple = userResources.map((item) => {
        return item.userId;
      });
      this.dialogVisible3 = true;
    },
  },
};
</script>

<style lang="scss">
.zhiyuanAdd {
  .wxtype {
    flex: 1;
    text-align: center;
    li {
      display: inline-block;
      border: 1px solid #acacac;
      font-size: 16rem;
      color: #787878;
      border-radius: 20rem;
      margin-right: 20rem;
      padding: 8rem 20rem;
      cursor: pointer;
    }
    li.hov {
      color: #fff;
      background: #5457cf;
      border: 1px solid #5457cf;
    }
  }
  .addtop {
    display: flex;
    align-items: center;
    margin-bottom: 50rem;
    .lookzy {
      font-size: 20rem;
      background: url(../../assets/morezy.png) no-repeat;
      background-size: 37rem 31rem;
      padding-left: 50rem;
      height: 31rem;
      line-height: 31rem;
      cursor: pointer;
    }
    .stepdiv {
      display: flex;
      width: 800rem;
      margin: 0 auto;
      .step1,
      .step2,
      .step3 {
        width: 152rem;
        text-align: center;
        white-space: nowrap;
      }
      .stepcir {
        width: 40rem;
        height: 40rem;
        line-height: 40rem;
        border-radius: 50%;
        border: 1px solid #eff0f6;
        color: #b9b9b9;
        font-size: 24rem;
        text-align: center;
        margin: 0 auto;
        margin-bottom: 10rem;
      }
      .step1sx,
      .step2sx {
        background: #eff0f6;
        height: 5rem;
        flex: 1;
        margin-top: 20rem;
      }
    }
    .stepdiv1 {
      .step1 {
        .stepcir {
          border: 1px solid #3f3ce8;
          color: #3f3ce8;
        }
      }
    }
    .stepdiv2 {
      .step1 {
        .stepcir {
          border: 1px solid #3f3ce8;
          color: #fff;
          background: #3f3ce8;
        }
      }
      .step1sx {
        background: #3f3ce8;
      }
    }
  }
  .backbtn {
    display: flex;
    align-items: center;
    cursor: pointer;
    width: 200rem;
    img {
      width: 32rem;
      height: 32rem;
      margin-right: 10rem;
    }
  }
  .wks,
  .jxz,
  .wc {
    width: 90rem;
    height: 30rem;
    line-height: 30rem;
    margin: 0 auto;
    text-align: center;
    color: #d63c45;
    border: 1px solid #d63c45;
    border-radius: 8rem;
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
    width: 40rem;
    height: 40rem;
    border-radius: 50%;
    margin-left: -10rem;
    font-size: 10rem;
    text-align: center;
    line-height: 40rem;
    overflow: hidden;
    color: #fff;
    cursor: pointer;
  }
  .cir:hover {
    margin-left: 10rem;
    margin-right: 10rem;
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

  .el-drawer__header {
    margin-bottom: 10rem;
    background: linear-gradient(138deg, #403de7 0%, #575bca 100%);
    border-radius: 0;
    height: 52rem;
    line-height: 52rem;
    padding-top: 0;
    padding-bottom: 0;
    color: #fff;
    text-align: center;
    font-weight: bold;
  }
  .disflex {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10rem;
    .scdiv {
      width: 50rem;
      cursor: pointer;
      i {
        font-size: 30rem;
        color: #6b6b6b;
      }
    }
    .doi,
    .title {
      flex: 1;
      padding: 15rem 10rem;
      text-align: center;
      font-size: 14rem;
    }
  }
  .yxzylist {
    align-items: inherit;
    .doi,
    .title {
      flex: 1;
      background: #f4f4f4;
    }
    .doi {
      border-radius: 10rem 0 0 10rem;
    }
    .title {
      border-radius: 0 10rem 10rem 0;
    }
  }
  .wsclist {
    .doi,
    .title {
      flex: 1;
      background: #ffeaea;
    }
  }
  .renlist {
    margin-top: 5rem;
  }
}
</style>
