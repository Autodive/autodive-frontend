<template>
  <div class="projectlist">
    <div>
      <el-button type="primary" @click="add">{{ $t("新建项目") }}</el-button>
      <el-button @click="delmore">{{ $t("删除项目") }}</el-button>
      <el-input
        prefix-icon="el-icon-search"
        style="margin-left: 12px; width: 400rem"
        :placeholder="$t('请输入搜索内容')"
      ></el-input>
    </div>
    <el-table
      :data="tableData"
      border
      @selection-change="handleSelectionChange"
      style="margin-top: 10px; width: 100%"
    >
      <el-table-column type="selection" align="center" width="55"> </el-table-column>
      <el-table-column prop="name" align="center" :label="$t('项目名称')">
      </el-table-column>
      <el-table-column prop="desc" align="center" :label="$t('项目描述')">
      </el-table-column>
      <el-table-column prop="createDate" align="center" :label="$t('创建时间')">
        <template slot-scope="scope">
          {{ formatTime(scope.row.createDate) }}
        </template>
      </el-table-column>

      <el-table-column :label="$t('操作')" align="center">
        <template slot-scope="scope">
          <el-tooltip
            class="item"
            effect="dark"
            :content="$t('进入项目')"
            placement="bottom"
            ><img
              style="cursor: pointer"
              @click="look(scope.row)"
              src="../../assets/listenter.png"
          /></el-tooltip>
          <el-tooltip
            class="item"
            effect="dark"
            :content="$t('编辑项目')"
            placement="bottom"
            ><img
              style="cursor: pointer; margin-left: 10rem; margin-right: 10rem"
              @click="edit(scope.row)"
              src="../../assets/listedit.png"
          /></el-tooltip>
          <el-tooltip
            class="item"
            effect="dark"
            :content="$t('删除项目')"
            placement="bottom"
            ><img
              style="cursor: pointer"
              @click="del(scope.row.id)"
              src="../../assets/listdel.png"
          /></el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagediv">
      <el-pagination
        background
        @current-change="handleCurrentChange"
        :current-page="page"
        :total="total"
        layout="total,prev, pager, next, jumper"
      >
      </el-pagination>
    </div>

    <el-dialog :title="title" :visible.sync="dialogVisible" width="40%">
      <el-form ref="form" :model="formitem" label-width="150px">
        <el-form-item :label="$t('项目名称') + ' :'">
          <el-input :placeholder="$t('请输入项目名')" v-model="formitem.name"></el-input>
        </el-form-item>
        <el-form-item :label="$t('项目描述') + ' :'">
          <el-input
            :placeholder="$t('请输入项目描述')"
            v-model="formitem.desc"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('智能模型') + ' :'">
          <el-select v-model="formitem.modelId" style="width: 100%">
            <el-option value="generic" :label="$t('通用')"></el-option>
            <el-option
              v-for="(item, index) in modearry"
              :key="index"
              :value="item.id"
              :label="item.value"
            ></el-option>
            <!-- <el-option value="bio" label="医药"></el-option> -->
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('项目领域') + ' :'" v-if="formitem.modelId == 'generic'">
          <el-input
            :placeholder="$t('请输入项目领域')"
            v-model="formitem.fieldId"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="send">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { addproject, getproject, delproject, editproject, modelist } from "@/api/project";
import { getxmqx } from "@/api/quanxian";
import dayjs from 'dayjs';

export default {
  data() {
    return {
      title: "新增项目",
      tableData: [],
      dialogVisible: false,
      formitem: {
        name: "",
        desc: "",
        modelId: null,
        fieldId: null,
      },
      page: 1,
      size: 20,
      total: 0,
      checklist: [],
      modearry: [],
    };
  },
  mounted() {
    this.getmodelist();
    this.getlist();
  },
  methods: {
    formatTime(timestamp) {
      return dayjs(timestamp).format('LL LT');
    },
    getmodelist() {
      modelist({ page: 0, size: 999999 }).then((res) => {
        this.modearry = res.data;
      });
    },
    handleSelectionChange(val) {
      this.checklist = val.map((item) => {
        return item.id;
      });
    },
    handleCurrentChange(val) {
      this.page = val;
      this.getlist();
    },
    getlist() {
      getproject({ page: this.page - 1, size: this.size }).then((res) => {
        console.log(res);
        this.tableData = res.data.content;
        this.total = res.data.totalElements;
      });
    },
    look(row) {
      getxmqx({ projectId: row.id }).then((res) => {
        if (res.data.status == 1) {
          this.$router.push({ path: "/project/home?name=" + row.name + "&id=" + row.id });
        } else {
          this.$message({
            message: this.$t("你已经被禁用，请联系管理员"),
            type: "error",
          });
        }
      });
    },
    add() {
      this.title = "新增项目";
      this.formitem = {
        name: "",
        desc: "",
        modelId: null,
        fieldId: null,
      };
      this.dialogVisible = true;
    },
    edit(row) {
      getxmqx({ projectId: row.id }).then((res) => {
        if (res.data.status == 1) {
          this.formitem = JSON.parse(JSON.stringify(row));
          this.title = "编辑项目";
          this.dialogVisible = true;
        } else {
          this.$message({
            message: this.$t("你已经被禁用，请联系管理员"),
            type: "error",
          });
        }
      });
    },
    send() {
      if (this.formitem.id) {
        delete this.formitem.createDate;
        editproject(this.formitem).then((res) => {
          this.$message({
            message: this.$t("编辑成功"),
            type: "success",
          });
          this.dialogVisible = false;
          this.page = 1;
          this.getlist();
        });
      } else {
        addproject(this.formitem).then((res) => {
          this.$message({
            message: this.$t("新增成功"),
            type: "success",
          });
          this.dialogVisible = false;
          this.page = 1;
          this.getlist();
        });
      }
    },
    del(id) {
      getxmqx({ projectId: id }).then((res) => {
        if (res.data.status == 0) {
          this.$message({
            message: this.$t("你已经被禁用，请联系管理员"),
            type: "error",
          });
          return;
        }
      });
      this.$confirm(this.$t("是否删除该项目") + "?", this.$t('"提示"'), {
        confirmButtonText: this.$t("确定"),
        cancelButtonText: this.$t("取消"),
        type: "warning",
      }).then(() => {
        delproject(id).then((res) => {
          this.$message({
            message: this.$t("删除成功"),
            type: "success",
          });
          this.page = 1;
          this.getlist();
        });
      });
    },
    delmore() {
      if (this.checklist.length == 0) {
        this.$message({ message: this.$t("请最少勾选一条数据"), type: "error" });
        return;
      }
      for (let i = 0; i < this.checklist.length; i++) {
        delproject(this.checklist[i]).then((res) => {
          if (i == this.checklist.length - 1) {
            this.$message({
              message: this.$t("删除成功"),
              type: "success",
            });
            this.page = 1;
            this.getlist();
          }
        });
      }
    },
  },
};
</script>
<style scoped>
.projectlist {
  padding: 20px;
}
</style>
