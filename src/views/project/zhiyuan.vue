<template>
  <div class="zhiyuan">
     <div>{{ $t('已有资源列表') }}</div>
     <div class="btntop" style="display:flex;align-items: center;">
          <el-button type="primary" @click="add" size="small">{{ $t('新建任务') }}</el-button>
          <el-button type="default" @click="delmore" size="small">{{ $t('批量删除') }}</el-button>
          <el-button type="default"  @click="zpmore" size="small">{{ $t('批量指派') }}</el-button>
          <el-input size="small" prefix-icon="el-icon-search" v-model="title" style="margin-left:12px;margin-right:12px;width:400rem" :placeholder="$t('搜索文献（模糊关键字）')"></el-input>
          <el-button size="small" type="primary" @click="search">{{ $t('搜素') }}</el-button>
     </div>
     <el-table :data="tableData" @selection-change="handleSelectionChange" height="800rem"  style="margin-top:10px;width: 100%" :header-cell-style="{background:'#F9F9F9'}">
       <el-table-column align="center"
          type="selection"
          width="55">
        </el-table-column>
        <el-table-column prop="name" width="100" align="center" :label="$t('任务状态')">
            <template slot-scope="scope">
                <div v-if="scope.row.status==1" class="wks">{{ $t('未开始') }}</div>
                <div v-if="scope.row.status==2" class="jxz">{{ $t('进行中') }}</div>
                <div v-if="scope.row.status==3" class="wc">{{ $t('标注完成') }}</div>
            </template>
        </el-table-column>
        <el-table-column width="300" prop="doi" align="center" label="DOI" ></el-table-column>
        <el-table-column prop="title" :label="$t('文献标题')" ></el-table-column>
        <el-table-column align="center" label="" width="50">
          <template slot-scope="scope"><img src="../../assets/lookicon.png" @click="openurl(scope.row.previewUrl)" style="cursor:pointer;width:20rem;height:20rem;"></template>
        </el-table-column>
       <el-table-column prop="authors"  :label="$t('作者')" ></el-table-column>
        <el-table-column prop="keywords" width="100" align="center" :label="$t('关键词')" >
          <template slot-scope="scope">
            <el-tooltip class="item" effect="dark" placement="bottom">
              <div slot="content" style="max-width:400rem;">{{scope.row.keywords}}</div>
               <span>{{keywordevent(scope.row.keywords)}}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column :label="$t('标注者')"  align="center">
      <template slot-scope="scope">
        <div class="bzz">

            <el-dropdown v-for="(item,index) in scope.row.userList" :key="index">
               <div class="cir" :class="'cir'+(index+1)">{{item.userName}}</div>
               <el-dropdown-menu slot="dropdown"><el-dropdown-item><div @click="delpeo(scope.row.id,scope.row.userList,item.userId)">{{ $t('删除') }}</div></el-dropdown-item></el-dropdown-menu>
            </el-dropdown>
            <!-- <el-dropdown>
               <div class="cir">小明</div>
               <el-dropdown-menu slot="dropdown"><el-dropdown-item>启用</el-dropdown-item></el-dropdown-menu>
            </el-dropdown>
            <el-dropdown>
               <div class="cir cir3">小明</div>
               <el-dropdown-menu slot="dropdown"><el-dropdown-item>禁用</el-dropdown-item></el-dropdown-menu>
            </el-dropdown>
            <el-dropdown>
               <div class="cir cir4">小明</div>
               <el-dropdown-menu slot="dropdown"><el-dropdown-item>禁用</el-dropdown-item></el-dropdown-menu>
            </el-dropdown>
            <el-dropdown>
               <div class="cir cir5">小明</div>
               <el-dropdown-menu slot="dropdown"><el-dropdown-item>禁用</el-dropdown-item></el-dropdown-menu>
            </el-dropdown>
            <el-dropdown>
               <div class="cir cir6">小明</div>
               <el-dropdown-menu slot="dropdown"><el-dropdown-item>禁用</el-dropdown-item></el-dropdown-menu>
            </el-dropdown>
            <el-dropdown>
               <div class="cir cir7">小明</div>
               <el-dropdown-menu slot="dropdown"><el-dropdown-item>禁用</el-dropdown-item></el-dropdown-menu>
            </el-dropdown>
            <el-dropdown>
               <div class="cir cir8">小明</div>
               <el-dropdown-menu slot="dropdown"><el-dropdown-item>禁用</el-dropdown-item></el-dropdown-menu>
            </el-dropdown> -->


          <i @click="zp(scope.row.id,scope.row.title,scope.row.userList)" style="color:#403EE6;font-size:42rem;font-weight: bold;z-index: 0;cursor: pointer;" class="el-icon-circle-plus-outline"></i>
           </div>
      </template>
    </el-table-column>
        <el-table-column :label="$t('操作')" width="80"  align="center">
      <template slot-scope="scope">
        <i class="el-icon-delete" style="color:#6B6B6B;font-size:20rem;cursor: pointer;"  @click="del(scope.row.id)"></i>
      </template>
    </el-table-column>
      </el-table>
      <div class="pagediv">
        <el-pagination
  background
      @current-change="handleCurrentChange"  @size-change="handleSizeChange" :page-sizes="[10, 20, 30, 40,50]"
      :current-page="page"
      :total="total"
      layout="total,sizes,prev, pager, next, jumper">>
</el-pagination>
      </div>

      <el-dialog :title="$t('指派任务')" custom-class="outdivstyle" :visible.sync="dialogVisible3" center width="25%">
            <div>{{ $t('已选择') }}<br/>
               <div v-for="(item,index) in checklistname" :key="index" style="word-break:break-word;">{{item}}</div>
            </div>
            <el-input v-model="userName" @input="getpeople" prefix-icon="el-icon-search" style="margin-top:20rem;" :placeholder="$t('搜索标注者名称')"></el-input>
            <el-checkbox-group style="margin-top:20rem;" v-model="checkpoeple">
              <div class="renlist" v-for="(item,index) in peoplelist" :key="index"><el-checkbox :label="item.userId">{{item.userName}}</el-checkbox></div>
            </el-checkbox-group>
            <span  slot="footer" class="dialog-footer">
              <el-button @click="dialogVisible3 = false">{{$t('取消')}}</el-button>
              <el-button type="primary" @click="send3">{{ $t('确认指派') }}</el-button>
            </span>
      </el-dialog>

      <el-dialog :title="$t('文献预览')" custom-class="outdivstyle outdivstyle2" :visible.sync="dialogyulan" center width="80%">
            <iframe :src="iframeurl"></iframe>
      </el-dialog>
  </div>
</template>

<script>
import {getzhiyuan,delzhiyuan,gettype,findListByUserName,resourcesAssign,getzhiyuansearch} from '@/api/zhiyuan'
import {getqx} from '@/api/quanxian'
import { thirteenBitTimestamp } from '../../utils';
import { baseURL} from '@/config'
// import i18next from 'i18next';
export default {
  data() {
    return {
      tableData:[ ],
      title:'',
      total:0,
       page:1,
        size:10,
        total:0,
        checklist:[],
        checklistname:[],
        dialogVisible3:false,
        peoplelist:[],
        userName:'',
        checkpoeple:[],
        dialogyulan:false,
        iframeurl:''
    };
  },
  mounted(){
      this.getlist()
      this.getpeople()
    },
   methods: {
    keywordevent(e){
      if(e!=''&&e!=null&&e!=undefined){
              let arr=e.split(';')
              if(arr.length>1){
                return arr[0]+';'+arr[1]
              }else{
                return arr[0]
              }
      }else{
        return ''
      }

    },
    search(){
     this.page=1;
               this.getlist()
    },
     openurl(url){
      // window.open(baseURL+url, '_blank')
      this.iframeurl=url;
      this.dialogyulan=true;
    },
    delpeo(resid,userList,id){
       this.checkpoeple=userList.map(item=>{return item.userId})
       let index=this.checkpoeple.indexOf(id)
       this.checkpoeple.splice(index, 1);
       resourcesAssign({resourcesIds:[resid],userIds:this.checkpoeple}).then(res=>{
             this.$message({
                    message: this.$t('删除成功'),
                    type: 'success'
                  })
               this.page=1;
               this.getlist()
      })
    },
    send3(){
      resourcesAssign({resourcesIds:this.checklist,userIds:this.checkpoeple}).then(res=>{
             this.$message({
                    message: this.$t('指派成功'),
                    type: 'success'
                  })
               this.page=1;
               this.getlist()
               this.dialogVisible3=false;
      })
    },
    getpeople(){
       getqx({ page:0, size:9999,username:this.userName,projectId:this.$route.query.id}).then(res=>{
        this.peoplelist=res.data.content
      })
    },
    add(){
        this.$router.push({ path: '/project/zhiyuanAdd?name='+this.$route.query.name+'&id='+this.$route.query.id })
      },
      handleSizeChange(val) {
        this.size=val;
        this.getlist()
      },
     handleCurrentChange(val) {
        this.page=val;
        this.getlist()
      },
      getlist(){
        getzhiyuansearch({page:this.page-1,size:this.size,projectId:this.$route.query.id,title:this.title}).then(res=>{
          console.log(res)
          this.tableData=res.data.content;
          this.total=res.data.totalElements
        })
      },
      handleSelectionChange(val) {
        this.checklist=val.map(item=>{return item.id})
        this.checklistname=val.map(item=>{return item.title})
      },
       del(id){
        this.$confirm(this.$t('是否删除该数据')+'?', this.$t('提示'), {
          confirmButtonText: this.$t('确定'),
          cancelButtonText: this.$t('取消'),
          type: 'warning'
        }).then(() => {
            delzhiyuan(id).then((res) => {
                this.$message({
                    message: this.$t('删除成功'),
                    type: 'success'
                  })
               this.page=0;
               this.getlist()
            })
        })
      },
      delmore(){
        if(this.checklist.length==0){
           this.$message({message: this.$t('请最少勾选一条数据'),type: 'error'})
          return;
        }
        for(let i=0;i<this.checklist.length;i++){
            delzhiyuan(this.checklist[i]).then((res) => {
               if(i==(this.checklist.length-1)){
                   this.$message({
                        message: this.$t('删除成功'),
                        type: 'success'
                      })
                  this.page=0;
                  this.getlist()
               }
            })
        }
      },
      zpmore(){
         if(this.checklist.length==0){
           this.$message({message: this.$t('请最少勾选一条数据'),type: 'error'})
          return;
        }
        this.dialogVisible3=true
      },
      zp(id,name,userList){
         this.checklist=[id];
         this.checklistname=[name]
         this.checkpoeple=userList.map(item=>{return item.userId})
         this.dialogVisible3=true
      }
   }
};
</script>

<style lang="scss" scoped>
.zhiyuan{
  .btntop {
    margin-top:30rem;
  }
  .wks,.jxz,.wc {width:90rem;height:30rem;line-height: 30rem;margin:0 auto;text-align:center;color:#D63C45;border:1px solid #D63C45;border-radius: 8rem;}
  .jxz {color:#4587E9;border:1px solid #4587E9;}
  .wc {color:#42A414;border:1px solid #42A414;}
  .bzz {display:flex;align-items: center; justify-content: center;
    .el-dropdown {z-index: 1;}
  }
  .cir {background:#ccc;width:40rem;height:40rem;border-radius: 50%;margin-left:-10rem;font-size:10rem;text-align: center;line-height:40rem;overflow: hidden;color:#fff;cursor: pointer;}
  .cir:hover {margin-left:10rem;margin-right:10rem;}
  .cir1 {background:#D63C45;}
  .cir2 {background:#E96C45}
  .cir3 {background:#FFA842}
  .cir4 {background:#FFDC26}
  .cir5 {background:#E6E945}
  .cir6 {background:#BEE945}
  .cir7 {background:#9BE8F3}
  .cir8 {background:#4587E9}

}


</style>
