<template>
  <div class="quanxian">
      <div style="display:flex">
           <el-input prefix-icon="el-icon-search" style="width:400rem" v-model="username" :placeholder="$t('搜索用户名（支持拼音、模糊关键字）')"></el-input>
           <el-button type="primary" style="margin-left:20rem;" @click="search">{{ $t('搜索') }}</el-button>
           <div style="flex:1"></div>
           <el-button type="primary" style="margin-left:20rem;" @click="addyq">{{ $t('邀请组员') }}</el-button>
           <div class="yqjl" @click="yqjl">
            <img src="../../assets/jl.png">
            {{ $t('邀请记录') }}
           </div>

      </div>
      <el-table class="qxtable" :data="tableData"  border :header-cell-style="{background:'#4848DE'}" style="margin-top:10px;width: 100%">

        <el-table-column
          prop="userName" align="center"
          :label="$t('用户名')"
        >
        <template slot-scope="scope">
              <router-link target="_blank" :to="{path:'/project/home',query:{userId:scope.row.userId,name:$route.query.name,id:$route.query.id}}">
                <el-link type="primary">{{scope.row.userName}}</el-link>
            </router-link>

        </template>
        </el-table-column>
        <el-table-column
          prop="email" align="center"
          :label="$t('邮箱')"
        >
        </el-table-column>
        <el-table-column
          prop="status" align="center"
          :label="$t('状态')"
        >
        <template slot-scope="scope">
            <span class="zc" v-if="scope.row.status==1">{{ $t('正常') }}</span>
            <span class="jy" v-if="scope.row.status==0">{{ $t('禁用') }}</span>
        </template>
        </el-table-column>
        <el-table-column
          prop="role" align="center"
          :label="$t('角色')"
        >
         <template slot-scope="scope">
            <span v-if="scope.row.role==1">{{ $t('超级管理员') }}</span>
            <span v-if="scope.row.role==2">{{ $t('管理员') }}</span>
            <span v-if="scope.row.role==3">{{ $t('标注者') }}</span>
        </template>
        </el-table-column>

        <el-table-column :label="$t('操作')" align="center">
      <template slot-scope="scope">
         <span v-if="scope.row.role=='1'" class="editno"><img src="../../assets/editno.png">{{ $t('编辑权限') }}</span>
         <span @click="edit(scope.row)" v-if="scope.row.role!='1'" class="edityes"><img src="../../assets/edityes.png">{{ $t('编辑权限') }}</span>
      </template>
    </el-table-column>
      </el-table>
      <div class="pagediv">
        <el-pagination
  background
      @current-change="handleCurrentChange"
      :current-page="page"
      :total="total"
      layout="total,prev, pager, next, jumper">
</el-pagination>
      </div>

      <el-dialog
      :title="$t('编辑权限')"
      :visible.sync="dialogVisible" custom-class="outdivstyle"
      width="30%">
        <el-form ref="form" :model="formitem" label-width="100px">
          <el-form-item :label="$t('用户名')+' :'">
            <el-input placeholder="请输入" v-model="formitem.userName" disabled></el-input>
          </el-form-item>
          <el-form-item :label="$t('邮箱')+' :'">
            <el-input placeholder="请输入" v-model="formitem.email" disabled></el-input>
          </el-form-item>
          <el-form-item :label="$t('是否禁用')+' :'">
              <el-radio-group v-model="formitem.status" @change="radiochange">
              <el-radio :label="1">{{ $t('启用') }}</el-radio>
              <el-radio :label="0">{{ $t('禁用') }}</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="$t('权限')+' :'">
              <el-select v-model="formitem.role" style="width:100%" placeholder="请选择" >
              <el-option :label="$t('超级管理员')" :value="1"></el-option>
                <el-option :label="$t('管理员')" :value="2"></el-option>
                <el-option :label="$t('标注者')" :value="3"></el-option>
              </el-select>
          </el-form-item>
        </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">{{$t('取消')}}</el-button>
        <el-button type="primary" @click="send">{{ $t('确定') }}</el-button>
      </span>
    </el-dialog>

     <el-dialog
      :title="$t('新增组员')"
      :visible.sync="dialogVisible2" custom-class="outdivstyle" center
      width="30%">
      <div style="text-align:center;margin-bottom: 20rem;">{{ $t('通过邮箱邀请组员') }}</div>
        <el-form ref="form" :model="formitem2" label-width="100px">
          <!-- <el-form-item label="用户名：">
            <el-input placeholder="请输入用户名" v-model="formitem2.username"></el-input>
          </el-form-item> -->
          <el-form-item :label="$t('用户邮箱')+' :'">
            <el-input :placeholder="$t('请输入用户邮箱')" v-model="formitem2.email"></el-input>
          </el-form-item>
          <el-form-item :label="$t('权限')+' :'">
              <el-select v-model="formitem2.role" style="width:100%" placeholder="请选择" >
                <el-option :label="$t('管理员')" :value="2"></el-option>
                <el-option :label="$t('标注者')" :value="3"></el-option>
              </el-select>
          </el-form-item>
        </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible2 = false">{{ $t('取消') }}</el-button>
        <el-button type="primary" @click="send2">{{ $t('确认邀请') }}</el-button>
      </span>
    </el-dialog>

     <el-dialog
      :title="$t('邀请记录')"
      :visible.sync="dialogVisible3" custom-class="outdivstyle" center
      width="60%">
     <el-table :data="yqjllist"  border style="width: 100%">

        <el-table-column prop="email" align="center" :label="$t('邮箱')"  ></el-table-column>
        <el-table-column prop="createDate" align="center" :label="$t('邀请时间')"  ></el-table-column>
        <el-table-column prop="status" align="center" :label="$t('状态')"  >
           <template slot-scope="scope">
            <span class="yqz" v-if="scope.row.status==0">{{ $t('邀请中') }}</span>
            <span class="yqx" v-if="scope.row.status==1">{{ $t('已同意') }}</span>
        </template>
        </el-table-column>
        <el-table-column  align="center" :label="$t('操作')"  >
             <template slot-scope="scope">

                  <el-tooltip :content="$t('再次邀请')"  placement="top"><img @click="zcyq(scope.row)" style="width:20rem;height:20rem;cursor: pointer;margin-right: 10rem;" src="../../assets/yq.png"></el-tooltip>
                  <el-tooltip :content="$t('取消邀请')" placement="top"><img @click="qxyq(scope.row.id)" style="width:22rem;height:22rem;cursor: pointer;" src="../../assets/qx.png"></el-tooltip>
             </template>
        </el-table-column>
     </el-table>
      <div class="pagediv">
        <el-pagination
  background
      @current-change="handleCurrentChange2"
      :current-page="yqjlform.page"
      :total="total2"
      layout="total,prev, pager, next, jumper">
</el-pagination>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {addqx,editqx,getqxinfor,getqx,invite,invitelist,qxinvite} from '@/api/quanxian'
import { debug } from 'util';
// import i18next from 'i18next';
  export default {
    data() {
      return {
        tableData:[

        ],
        dialogVisible:false,
        dialogVisible2:false,
        dialogVisible3:false,
        formitem:{
          projectId:this.$route.query.id,
          userId:JSON.parse(localStorage.getItem('user')).id,
          userName:'',
          email:'',
          role:'',
          status:1,
          createBy:JSON.parse(localStorage.getItem('user')).id,
        },
        page:1,
        size:20,
        total:0,
        username:'',
        formitem2:{
           projectId:this.$route.query.id,
          email:'',
          role:'',
          username:''
        },
        yqjllist:[],
        total2:0,
        yqjlform:{
           page:1,
          size:20,
          projectId:this.$route.query.id
        },
      }

    },
    mounted(){
      this.getlist()
    },
    methods:{
      qxyq(id){
        qxinvite(id).then(res=>{
          this.handleCurrentChange2(1)
          this.$message({
          message: this.$t('已取消邀请'),
          type: 'success'
           });
        })
      },
      zcyq(row){
        this.formitem2={
           projectId:this.$route.query.id,
          email:row.email,
          role:row.role,
          username:row.username
        }
        this.send2()
      },
      handleCurrentChange2(val) {
        this.yqjlform.page=val;
        this.yqjl()
      },
       yqjl(){
        invitelist({page:this.yqjlform.page-1,size:this.yqjlform.size,projectId:this.yqjlform.projectId}).then(res=>{
          this.yqjllist=res.data.content;
          this.total2=res.data.totalElements
        })
        this.dialogVisible3=true
      },
      addyq(){
        this.dialogVisible2=true
      },
      search(){
        this.page=1;
        this.getlist()
      },
      radiochange(e){
        this.formitem.status=e;
      },
      handleCurrentChange(val) {
        this.page=val;
        this.getlist()
      },
      getlist(){
        getqx({page:this.page-1,size:this.size,projectId:this.$route.query.id,username:this.username}).then(res=>{
          console.log(res)
          this.tableData=res.data.content;
          this.total=res.data.totalElements
        })
      },

      edit(row){
        this.formitem=JSON.parse(JSON.stringify(row))
        this.formitem.status=JSON.stringify(this.formitem.status)
        this.title="编辑项目"
        this.dialogVisible = true
      },
      send(){
        editqx(this.formitem).then(res=>{
           this.$message({
          message: this.$t('编辑成功'),
          type: 'success'
           });
           this.dialogVisible = false;
          this.page=1;
          this.getlist()
        })
      },
      send2(){
        invite(this.formitem2).then(res=>{
           this.$message({
          message: this.$t('发送成功'),
          type: 'success'
           });
           this.dialogVisible2 = false;
        })
      },
    }

  }
</script>
<style lang="scss">
.quanxian {
  padding:20px;
  .qxtable {
    th .cell {color:#fff;}
    .zc {color:#42A414;border:1px solid #42A414;border-radius: 8rem;padding:2px 10px;display:inline-block;width:60px;}
    .jy {color:#DB555C;border:1px solid #DB555C;border-radius: 8rem;padding:2px 10px;display:inline-block;width:60px;}
    .editno,.edityes {color:#4848DE;cursor: pointer;display:flex;align-items: center;justify-content: center;
      img {margin-right:4px;}
    }
    .editno {color:#7B7B7B;}
  }
  .yqjl {
    font-size: 16rem;color:#5054D3;display:flex; align-items: center;margin-left:20rem;cursor: pointer;
    img {width:22rem;height:22rem;margin-right:4rem;}
  }
  .yqz,.yqx {color:#5054D3;border:1px solid #5054D3;border-radius: 8rem;padding:4rem 20rem;display:inline-block;}
  .yqx {border:1px solid #42A414;color:#42A414;}
}
</style>
