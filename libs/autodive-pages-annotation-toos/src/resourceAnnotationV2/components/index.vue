<template>
  <div class="yuliao">
    <div class="lookrw">
      <div class="lookbtn1 look_btn_style" @click="seeTaskList">
        <img src="@/assets/jtright.png" />
        <p class="rotate_text">{{ $t('查看任务列表') }}</p>
      </div>
    </div>
    <div
      class="lookrw2_outside lookrw2_animation"
      :style="{ width: showrw ? '439px' : 0 }"
    >
      <div class="lookrw2">
        <div class="rwdiv">
          <div>
            <el-input
              v-model="keyword"
              prefix-icon="el-icon-search"
              style="width: 230px"
              :placeholder="$t('输入关键词')"
            ></el-input>
            <el-button type="primary" @click="search">{{
              $t('搜索')
            }}</el-button>
            <div class="wxtype">
              <ul>
                <li :class="{ hov: act2 == '1' }" @click="tabclick2('1')">
                  {{ $t('未标注') }}
                </li>
                <li :class="{ hov: act2 == '2' }" @click="tabclick2('2')">
                  {{ $t('暂存') }}
                </li>
                <li :class="{ hov: act2 == '3' }" @click="tabclick2('3')">
                  {{ $t('标注完成') }}
                </li>
              </ul>
            </div>
          </div>
          <div style="height: calc(100% - 82px)" ref="taskView">
            <el-table
              :max-height="
                $refs.taskView ? $refs.taskView.clientHeight - 10 : null
              "
              :data="tableData"
              style="margin-top: 20px; width: 100%"
              :header-cell-style="{ background: '#F9F9F9' }"
            >
              <el-table-column
                prop="name"
                width="100"
                align="center"
                :label="$t('任务状态')"
              >
                <template v-slot="scope">
                  <div v-if="scope.row.status == 1" class="wks">
                    {{ $t('未开始') }}
                  </div>
                  <div v-if="scope.row.status == 2" class="jxz">
                    {{ $t('进行中') }}
                  </div>
                  <div v-if="scope.row.status == 3" class="wc">
                    {{ $t('标注完成') }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="title" :label="$t('文献标题')">
                <template v-slot="scope">
                  <TableColumnText :text="scope.row.title"></TableColumnText>
                </template>
              </el-table-column>

              <el-table-column :label="$t('操作')" width="80" align="center">
                <template v-slot="scope">
                  <img
                    src="@/assets/edit.png"
                    @click="tabpdf(scope.row)"
                    style="width: 18px; height: 18px; cursor: pointer"
                  />
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
        <div class="lookbtn1 look_btn_style" @click="closeTaskListPopup">
          <img src="@/assets/jtleft.png" />
          <p class="rotate_text">{{ $t('收起任务列表') }}</p>
        </div>
      </div>
    </div>
    <div class="lookbq">
      <div class="lookbtn1 look_btn_style" @click="seeLabel">
        <img src="@/assets/jtright.png" />
        <p class="rotate_text">{{ $t('查看标签') }}</p>
      </div>
    </div>
    <div
      class="bentileft_outside bentileft_animation"
      :style="{ width: lookbq ? '410px' : 0 }"
    >
      <div class="bentileft">
        <div style="width: 328px">
          <ul class="tab">
            <li :class="{ hov: act == 'paper' }" @click="tabclick('paper')">
              {{ $t('文献标签') }}
            </li>
            <li :class="{ hov: act == 'image' }" @click="tabclick('image')">
              {{ $t('图像标签') }}
            </li>
            <li :class="{ hov: act == 'txt' }" @click="tabclick('txt')">
              {{ $t('文本标签') }}
            </li>
            <li
              :class="{ hov: act == 'relation' }"
              @click="tabclick('relation')"
            >
              {{ $t('关系标签') }}
            </li>
          </ul>
          <div v-if="act != 'relation'" class="borbox">
            <div style="display: flex; align-items: center">
              <el-input
                prefix-icon="el-icon-search"
                style="flex: 1"
                v-model="keyword1"
                :placeholder="$t('搜索标签名')"
                @input="getlist"
              ></el-input>
              <el-dropdown
                style="margin-left: 15px; margin-right: 15px"
                @command="handleCommand"
              >
                <div
                  style="cursor: pointer; display: flex; align-items: center"
                >
                  <span v-if="actbq == '0'">{{ $t('所有标签名') }}</span
                  ><span v-if="actbq == '1'">{{ $t('收藏标签名') }}</span>
                  <img
                    style="width: 12px; height: 16px; margin-left: 5px"
                    src="@/assets/arricon.png"
                  />
                </div>
                <template v-slot:dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="0">{{
                      $t('所有标签名')
                    }}</el-dropdown-item>
                    <el-dropdown-item command="1">{{
                      $t('收藏标签名')
                    }}</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            <div>
              <el-dropdown
                style="margin-left: 230px; margin-top: 10px"
                @command="timingtemporarystorage"
              >
                <span class="el-dropdown-link"
                  >{{ temporarystoragetitle
                  }}<i class="el-icon-arrow-down el-icon--right"></i
                ></span>
                <template v-slot:dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                      v-for="(item, index) in [
                        '10s',
                        '30s',
                        '1m',
                        '5m',
                        '取消',
                      ]"
                      :key="index"
                      :command="index"
                      >{{ $t(`${item}`) }}</el-dropdown-item
                    >
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            <div style="display: flex">
              <div class="scrolldiv" id="scrollindex">
                <div
                  class="libor"
                  v-for="(e, i) in leftlist"
                  :key="i"
                  :id="e.ind"
                >
                  <div class="libortop">{{ e.ind }}</div>
                  <div class="libormain">
                    <el-collapse class="leftdivlist">
                      <el-collapse-item
                        v-for="(item, index) in e.children"
                        :key="index"
                        :style="{ borderColor: item.color }"
                      >
                        <template v-slot:title>
                          <div class="leftdivlisttitle">
                            <div class="listname">{{ item.definName }}</div>

                            <div
                              class="listnum"
                              v-if="item.markList.length > 0"
                              :style="{ background: item.color }"
                            >
                              {{ item.markList.length }}
                            </div>
                            <img
                              @click="
                                $event.stopPropagation()
                                item.dict && getDict(item)
                              "
                              :title="$t('字典标注')"
                              src="@/assets/icon_ondict.svg"
                              :style="{
                                width: '15px',
                                marginRight: '10px',
                                opacity: item.dict ? '1' : '0.3',
                                cursor: item.dict ? 'pointer' : 'not-allowed',
                              }"
                            />

                            <img
                              @click="
                                $event.stopPropagation()
                                item.regex && getReg(item, 'all')
                              "
                              :title="$t('正则标注')"
                              src="@/assets/icon_onregex.svg"
                              :style="{
                                width: '15px',
                                marginRight: '10px',
                                opacity: item.regex ? '1' : '0.3',
                                cursor: item.regex ? 'pointer' : 'not-allowed',
                              }"
                            />
                            <i
                              class="el-icon-delete"
                              @click="
                                $event.stopPropagation()
                                batchDelete(item)
                              "
                              :title="$t('批量删除')"
                              src="@/assets/closeTag.png"
                              :style="{
                                width: '15px',
                                marginRight: '10px',
                                opacity: '1',
                                cursor: 'pointer',
                              }"
                            />
                            <div
                              class="liststart"
                              :class="{ liststart2: item.collected }"
                            ></div>
                            <div class="listkey" v-if="!!item.shortcutKey">
                              {{ $t('快捷键') + ' :' + item.shortcutKey }}
                            </div>
                            <img
                              @click="showTag(item, 'all')"
                              v-if="item.isShow"
                              src="@/assets/closeTag.png"
                              style="width: 20px"
                            />
                            <img
                              @click="closeTag(item, 'all')"
                              v-else
                              src="@/assets/showTag.png"
                              style="width: 20px; height: 20px"
                            />
                          </div>
                        </template>

                        <div
                          class="leftdivinp"
                          v-for="(n, index2) in item.markList"
                          :key="index2"
                        >
                          <el-checkbox v-model="n.selected"></el-checkbox>
                          <el-input
                            v-model="n.name"
                            size="mini"
                          ></el-input>
                          <img
                            @click="delbq(n.fId)"
                            src="@/assets/cz4.png"
                          />
                          <img
                            @click="showTag(n.fId)"
                            v-if="n.isShow"
                            src="@/assets/closeTag.png"
                            style="width: 20px"
                          />
                          <img
                            @click="closeTag(n.fId)"
                            v-else
                            src="@/assets/showTag.png"
                            style="width: 20px; height: 20px"
                          />
                        </div>
                      </el-collapse-item>
                    </el-collapse>
                  </div>
                </div>
              </div>
              <aindex
                :activeId="activeId"
                :List="leftlist"
                @go="goTop"
              ></aindex>
            </div>
          </div>
          <div v-if="act == 'relation'" class="borbox">
            <div style="display: flex; align-items: center">
              <el-input
                prefix-icon="el-icon-search"
                style="flex: 1"
                v-model="keyword2"
                :placeholder="$t('搜索标签名')"
                @input="getlist"
              ></el-input>
              <el-dropdown
                style="margin-left: 15px; margin-right: 15px"
                @command="handleCommand2"
              >
                <div
                  style="cursor: pointer; display: flex; align-items: center"
                >
                  <span v-if="actbq2 == '0'">{{ $t('所有标签名') }}</span
                  ><span v-if="actbq2 == '1'">{{ $t('收藏标签名') }}</span>
                  <img
                    style="width: 12px; height: 16px; margin-left: 5px"
                    src="@/assets/arricon.png"
                  />
                </div>
                <template v-slot:dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="0">{{
                      $t('所有标签名')
                    }}</el-dropdown-item>
                    <el-dropdown-item command="1">{{
                      $t('收藏标签名')
                    }}</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            <div class="gxborbg">
              <div class="gxbormain">
                <el-collapse class="leftdivlist leftdivlist2">
                  <el-collapse-item
                    v-for="(item, index) in leftdata2"
                    :key="index"
                  >
                    <template v-slot:title>
                      <div class="leftdivlisttitle">
                        <div
                          :style="{ background: item.color }"
                          class="circolor"
                        ></div>
                        <div class="listname">{{ item.name }}</div>
                        <div
                          class="listnum"
                          v-if="
                            item.resourcesDefinRelationDefinListList.length > 0
                          "
                          :style="{ background: item.color }"
                        >
                          {{ item.resourcesDefinRelationDefinListList.length }}
                        </div>
                        <div
                          class="liststart"
                          :class="{ liststart2: item.collected }"
                        ></div>
                        <div class="listkey">
                          {{ $t('快捷键') + ' :' + item.shortcutKey }}
                        </div>
                      </div>
                    </template>

                    <div
                      class="leftguanxi"
                      v-for="(
                        n, index2
                      ) in item.resourcesDefinRelationDefinListList"
                      :key="index2"
                    >
                      <img src="@/assets/gxbg.png" class="gximg" />
                      <ul class="leftguanximain">
                        <li>
                          <div
                            class="bqtag"
                            :style="{
                              borderColor:
                                n.resourcesDefinRelationDefinList[0].color,
                              color: n.resourcesDefinRelationDefinList[0].color,
                            }"
                          >
                            {{ n.resourcesDefinRelationDefinList[0].definName }}
                          </div>
                          <el-input
                            v-model="
                              n.resourcesDefinRelationDefinList[0].fontname
                            "
                            size="mini"
                          ></el-input>
                        </li>
                        <li>
                          <div
                            class="bqtag"
                            :style="{
                              borderColor:
                                n.resourcesDefinRelationDefinList[1].color,
                              color: n.resourcesDefinRelationDefinList[1].color,
                            }"
                          >
                            {{ n.resourcesDefinRelationDefinList[1].definName }}
                          </div>
                          <el-input
                            v-model="
                              n.resourcesDefinRelationDefinList[1].fontname
                            "
                            size="mini"
                          ></el-input>
                        </li>
                      </ul>
                      <img
                        @click="delgx(index, index2)"
                        src="@/assets/cz4.png"
                        class="gxdel"
                      />
                    </div>
                  </el-collapse-item>
                </el-collapse>
              </div>
            </div>
          </div>
        </div>
        <div class="lookbtn1 look_btn_style" @click="closeLabelPopup">
          <img src="@/assets/jtleft.png" />
          <p class="rotate_text">{{ $t('收起标签') }}</p>
        </div>
      </div>
    </div>
    <div
      class="bentiright"
      :style="{ left: showrw ? '520px' : lookbq ? '457px' : '81px' }"
    >
      <PdfZone
        :leftdata="leftdata"
        :leftdata2="leftdata2"
        @getbz="getbz"
        @getdelbq="getdelbq"
        @getgx="getgx"
        @showbq="showbq"
        @getok="savetoapi"
        @getzc="savezc"
        ref="pdfzone"
      ></PdfZone>
    </div>
  </div>
</template>

<script>
import {
  getresources,
  addresources,
  addresourcesDefinRelation,
  getresourcesDefinRelation,
  complete,
} from '@/api/yuliao'
import { getzhiyuan } from '@/api/zhiyuan'
import PdfZone from './pdfZone'
import { pinyin } from 'pinyin-pro'
import aindex from './aIndex'
import TableColumnText from '@/components/TableColumnText'
var step = 0
var step2 = 1
export default {
  beforeRouteLeave(to, from, next) {
    if (step == step2) {
      next()
    } else {
      this.$confirm(
        this.$t('正在离开本页面，本页面内所有未保存数据都会丢失'),
        this.$t('警告'),
        {
          confirmButtonText: this.$t('确定'),
          cancelButtonText: this.$t('取消'),
          type: 'warning',
        }
      )
        .then(() => {
          next()
        })
        .catch(() => {
          window.history.go(1)
        })
    }
  },
  components: {
    PdfZone,
    aindex,
    TableColumnText,
  },
  data() {
    return {
      resourceId: '2',
      layerId: '3',
      act: 'paper',
      act2: '1',
      allBiaoqian: [],
      leftlist: [],
      leftdata: [],
      leftdata2: [],
      showrw: false,
      lookbq: false,
      tableData: [],
      timer: null,
      activeId: '',
      actbq: '0',
      actbq2: '0',
      keyword: '',
      isCollected1: '',
      isCollected2: '',
      keyword1: '',
      keyword2: '',
      userId: '',
      temporarystoragetitle: '定时暂存',
      scrollEventHandler: null,
    }
  },
  watch: {},
  mounted() {
    if (this.$route.query.userId) {
      this.userId = this.$route.query.userId
    } else {
      this.userId = JSON.parse(localStorage.getItem('user')).id
    }
    getzhiyuan({
      page: 0,
      size: 100,
      projectId: this.$route.query.id,
      status: this.act2,
      title: this.keyword,
      userId: this.userId,
    }).then((res) => {
      this.tableData = res.data.content
      console.log(res.data)
      this.tabpdf(this.tableData[0])
    })
    let timeId
    this.scrollEventHandler = () => {
      clearTimeout(timeId)
      timeId = setTimeout(() => {
        this.scrollToTop()
      })
    }
    window.addEventListener('scroll', this.scrollEventHandler, true)
    window.onbeforeunload = function (e) {
      e = e || window.event
      if (step == step2) {
        console.log(step)
        console.log(step2)
      } else {
        console.log('22222222')
        if (e) {
          e.returnValue = this.$t('关闭提示')
        }
        return this.$t('关闭提示')
      }
    }
  },
  beforeUnmount() {
    clearInterval(this.timer)
    this.timer = null
  },

  methods: {
    timingtemporarystorage(val) {
      if (val === 0) {
        this.temporarystoragetitle = '10s'
        this.atregulartimesave(1000)
      } else if (val === 1) {
        this.temporarystoragetitle = '30s'
        this.atregulartimesave(30000)
      } else if (val === 2) {
        this.temporarystoragetitle = '1m'
        this.atregulartimesave(60000)
      } else if (val === 3) {
        this.temporarystoragetitle = '5m'
        this.atregulartimesave(300000)
      } else if (val === 4) {
        this.atregulartimesave(false)
      }
    },

    atregulartimesave(time) {
      if (time == false) {
        this.temporarystoragetitle = '定时暂存'
        clearInterval(this.timer)
        this.timer = null
      } else {
        if (this.timer != null) {
          clearInterval(this.timer)
          this.timer = null
        }
        console.log(this.timer)
        this.timer = setInterval(() => {
          this.savezc()
        }, time)
      }
    },
    beforeunloadHandler(e) {
      if (e) {
        e = e || window.event
        console.log(e)
        if (e) {
          e.returnValue = this.$t('关闭提示')
        }
        return this.$t('关闭提示')
      }
    },

    tabpdf(row) {
      console.log(row)
      if (row != undefined) {
        this.$refs.pdfzone.getPdf(row)
        this.resourceId = row.id
      }
    },
    showbq() {
      this.getlist()
    },
    search() {
      this.getzylist()
    },
    getzylist() {
      getzhiyuan({
        page: 0,
        size: 100,
        projectId: this.$route.query.id,
        status: this.act2,
        title: this.keyword,
      }).then((res) => {
        this.tableData = res.data.content
      })
    },
    add2() {},
    delgx(index, index2) {
      this.leftdata2[index].resourcesDefinRelationDefinListList.splice(
        index2,
        1
      )
      this.saveleft()
    },
    getgx(e) {
      console.log(e)
      let index = this.leftdata2.findIndex(
        (row) => row.definRelationId == e.item.definRelationId
      )
      let obj1 = {}
      let obj2 = {}

      for (let i = 0; i < this.leftdata.length; i++) {
        for (let j = 0; j < this.leftdata[i].markList.length; j++) {
          if (this.leftdata[i].markList[j].fId == e.addgxarry[0]) {
            console.log(this.leftdata[i].markList[j])
            obj1 = JSON.parse(JSON.stringify(this.leftdata[i]))
            obj1.fontname = this.leftdata[i].markList[j].name
          }
        }
      }
      for (let i = 0; i < this.leftdata.length; i++) {
        for (let j = 0; j < this.leftdata[i].markList.length; j++) {
          if (this.leftdata[i].markList[j].fId == e.addgxarry[1]) {
            console.log(this.leftdata[i].markList[j])
            obj2 = JSON.parse(JSON.stringify(this.leftdata[i]))
            obj2.fontname = this.leftdata[i].markList[j].name
          }
        }
      }
      console.log([obj1, obj2])
      this.leftdata2[index].resourcesDefinRelationDefinListList.push({
        resourcesDefinRelationDefinList: [obj1, obj2],
      })
      this.saveleft()
    },
    getdelbq(id) {
      for (let i = 0; i < this.leftdata.length; i++) {
        let ind = this.leftdata[i].markList.findIndex((item) => item.fId == id)
        if (ind != -1) {
          this.leftdata[i].markList.splice(ind, 1)
          this.datachange()
          this.saveleft()
          this.$forceUpdate()
        }
      }
    },
    saveleft() {
      try {
        localStorage.setItem('leftdata', JSON.stringify(this.leftdata))
        localStorage.setItem('leftdata2', JSON.stringify(this.leftdata2))
      } catch (e) {
        console.error(e)
      }
      step = step + 1
    },
    savezc() {
      addresourcesDefinRelation(
        JSON.parse(localStorage.getItem('leftdata2'))
      ).then((res) => {
        this.$message({
          message: this.$t('暂存成功'),
          type: 'success',
        })
      })
      step = 1
    },
    savetoapi() {
      if (JSON.parse(localStorage.getItem('leftdata')).length == 0) {
        this.$message({
          message: this.$t('请最少标注一个实体标签'),
          type: 'error',
        })
        return
      }
      addresources(JSON.parse(localStorage.getItem('leftdata'))).then(
        (res) => {}
      )

      if (JSON.parse(localStorage.getItem('leftdata2')).length > 0) {
        addresourcesDefinRelation(
          JSON.parse(localStorage.getItem('leftdata2'))
        ).then((res) => {
          complete({ resourceId: this.resourceId }).then((res) => {
            this.$message({
              message: this.$t('提交成功'),
              type: 'success',
            })
          })
          step = 1
        })
      } else {
        complete({ resourceId: this.resourceId }).then((res) => {
          this.$message({
            message: this.$t('提交成功'),
            type: 'success',
          })
        })
        step = 1
      }
    },
    showTag(id, isAll) {
      console.log(id, '去显示')
      if (isAll) {
        id.markList.forEach((item, index) => {
          document.getElementsByClassName(item.fId)[0].style.opacity = '1'
          id.isShow = false
          id.markList[index].isShow = false
          this.$forceUpdate()
        })
      } else {
        for (let i = 0; i < this.leftdata.length; i++) {
          let ind = this.leftdata[i].markList.findIndex(
            (item) => item.fId == id
          )
          if (ind != -1) {
            console.log(this.leftdata[i].markList, this.$refs.pdfzone)
            document.getElementsByClassName(id)[0].style.opacity = '1'
            this.leftdata[i].markList[ind].isShow = false
            if (this.leftdata[i].markList.length == 1) {
              this.leftdata[i].isShow = false
            }
            let j = 0
            this.leftdata[i].markList.forEach((item, index) => {
              if (item.isShow == false) {
                j++
              }
            })
            if (j == this.leftdata[i].markList.length) {
              this.leftdata[i].isShow = false
            }
            this.$forceUpdate()
          }
        }
      }
    },
    closeTag(id, isAll) {
      console.log(id, '去隐藏')
      if (isAll) {
        id.markList.forEach((item, index) => {
          document.getElementsByClassName(item.fId)[0].style.opacity = '0'
          id.isShow = true
          id.markList[index].isShow = true
          this.$forceUpdate()
        })
      } else {
        for (let i = 0; i < this.leftdata.length; i++) {
          let ind = this.leftdata[i].markList.findIndex(
            (item) => item.fId == id
          )
          if (ind != -1) {
            console.log(this.leftdata[i].markList, this.$refs.pdfzone)
            document.getElementsByClassName(id)[0].style.opacity = '0'
            this.leftdata[i].markList[ind].isShow = true
            if (this.leftdata[i].markList.length == 1) {
              this.leftdata[i].isShow = true
            }
            let j = 0
            this.leftdata[i].markList.forEach((item, index) => {
              if (item.isShow == true) {
                j++
              }
            })
            if (j == this.leftdata[i].markList.length) {
              this.leftdata[i].isShow = true
            }
            this.$forceUpdate()
          }
        }
      }
    },
    delbq(id) {
      for (let i = 0; i < this.leftdata.length; i++) {
        let ind = this.leftdata[i].markList.findIndex((item) => item.fId == id)
        if (ind != -1) {
          this.leftdata[i].markList.splice(ind, 1)
          this.datachange()
          this.saveleft()
          this.$forceUpdate()
          this.$refs.pdfzone.delbq(id)
        }
      }
    },
    getbz(e) {
      e.selected = true
      let ind = this.leftdata.findIndex(
        (item) => item.definition.id === e.definitionId
      )
      if (ind != -1) {
        this.leftdata[ind].markList.push(e)
        this.datachange()
        this.saveleft()
        this.$forceUpdate()
      }
    },

    handleCommand(e) {
      this.actbq = e
      if (e == '1') {
        this.leftdata = this.leftdata.filter((item) => item.collected == true)
        console.log(this.leftdata)
        this.datachange()
      } else {
        this.getlist()
      }
    },
    handleCommand2(e) {
      this.actbq2 = e
      if (e == '1') {
        this.leftdata2 = this.leftdata2.filter((item) => item.collected == true)
      } else {
        this.getlist()
      }
    },
    tabclick(e) {
      this.act = e
      var arr = []
      for (var i = 0; i < this.allBiaoqian.length; i++) {
        var item = this.allBiaoqian[i]
        var annotedType = item.definition.annotedType
        if (annotedType[e]) {
          arr.push(item)
        }
      }
      this.leftdata = arr
      this.datachange()
      this.$refs.pdfzone.cilckBiaoqianTab(e)
    },
    tabclick2(e) {
      this.act2 = e
      this.getzylist()
    },
    async getlist() {
      let nodes = await getresources({
        resourceId: this.resourceId,
        layerId: this.layerId,
        projectId: this.$route.query.id,
        keyword: this.keyword1,
        isCollected: this.isCollected1,
      })

      let edges = await getresourcesDefinRelation({
        resourceId: this.resourceId,
        layerId: this.layerId,
        projectId: this.$route.query.id,
        keyword: this.keyword2,
        isCollected: this.isCollected2,
      })

      this.allBiaoqian = nodes.data.map((item) => {
        if (item.markList == null) {
          item.markList = []
        }
        if (item.markList.length > 0) {
          item.markList.map((e) => {
            e['selected'] = true
            delete e.id
            return e
          })
        }
        delete item.createBy
        delete item.createDate
        delete item.id
        return item
      })
      console.log('this.allBiaoqian=')
      console.log(this.allBiaoqian)
      this.tabclick(this.act)
      this.$refs.pdfzone.inittag(this.leftdata)

      this.leftdata2 = edges.data.map((item) => {
        if (item.resourcesDefinRelationDefinListList == null) {
          item.resourcesDefinRelationDefinListList = []
        }
        return item
      })
      this.saveleft()
    },

    datachange() {
      let newarr = this.leftdata.map((item) => {
        item.ind = pinyin(item.definName, {
          pattern: 'first',
          type: 'array',
          toneType: 'none',
        })[0].toUpperCase()
        return item
      })
      let newlist = []
      newarr.forEach((item) => {
        let newItem = newlist.find((i) => i.ind == item.ind)
        if (!newItem) {
          newlist.push({ ind: item.ind, children: [item] })
        } else {
          newItem.children.push(item)
        }
      })
      this.leftlist = newlist.sort(function (s1, s2) {
        var x1 = s1.ind
        var x2 = s2.ind
        if (x1 < x2) {
          return -1
        }
        if (x1 > x2) {
          return 1
        }
        return 0
      })
      console.log('leftlist =')
      console.log(this.leftlist)
    },

    goTop(ind) {
      this.activeId = ind
      this.$el.querySelector('[id="' + ind + '"]').scrollIntoView()
    },
    scrollToTop() {
      let scrollTop = document.querySelector('#scrollindex').scrollTop

      this.leftlist.map((v, i) => {
        let offsetTop = document.getElementById(v.ind).offsetTop
        let scrollHeight = document.getElementById(v.ind).scrollHeight
        if (scrollTop >= offsetTop && scrollTop <= offsetTop + scrollHeight) {
          this.activeId = v.ind
        }
      })
      if (scrollTop <= 40) {
        this.activeId = ''
      }
    },

    seeTaskList() {
      this.showrw = true
      this.lookbq = false
      this.$refs.pdfzone.inittag()
      this.$refs.pdfzone.scale = 1
    },

    closeTaskListPopup() {
      this.showrw = false
    },

    seeLabel() {
      this.lookbq = true
      this.showrw = false
      this.$refs.pdfzone.inittag()
      this.$refs.pdfzone.scale = 1

      setTimeout(() => {
        this.$refs.pdfzone.drawScaled()
      }, 500)
      setTimeout(() => {
        this.$refs.pdfzone.jian()
        this.$refs.pdfzone.jia()
      }, 1000)
    },

    closeLabelPopup() {
      this.lookbq = false
    },

    onekeyChoose(item) {
      console.log(item)
    },

    getDict(item) {
      this.$refs.pdfzone.getDictData(item)
    },

    getReg(item) {
      this.$refs.pdfzone.getRegData(item)
    },
    batchDelete(item) {
      const markList = []
      const willDeleteMarkList = []
      item.markList.forEach((mark) => {
        if (!mark.selected) {
          markList.push(mark)
        } else {
          willDeleteMarkList.push(mark)
        }
      })
      item.markList = markList

      this.datachange()
      this.saveleft()
      this.$forceUpdate()
      willDeleteMarkList.forEach((mark) => {
        this.$refs.pdfzone.delbq(mark.fId)
      })
    },
  },
  unmounted() {
    if (this.scrollEventListener) {
      window.removeEventListener('scroll', this.scrollEventListener)
    }
    window.clearInterval(this.timer)
    this.timer = null
  },
}
</script>

<style lang="scss">
.yuliao {
  display: flex;
  overflow: hidden;
  margin: -20px;
  .lookrw,
  .lookbq {
    background: #f0f1fd;
    width: 40px;
    border-right: 1px solid #979797;
    border-radius: 8px;
    font-size: 16px;
    color: #504899;
    display: flex;
    align-items: center;
    .lookbtn1 {
      width: 100%;
      text-align: center;
      cursor: pointer;
    }
    img {
      width: 23px;
      height: 23px;
      margin-bottom: 5px;
    }
  }
  .lookrw2 {
    display: flex;
    width: 420px;
    background: #fff;
    padding: 20px 0 20px 20px;
    flex-grow: 0;
    flex-shrink: 0;
    height: calc(100vh - 120px);
    .rwdiv {
      flex: 1;
      width: 400px;
      display: flex;
      flex-direction: column;
    }
    .lookbtn1 {
      width: 50px;
      text-align: center;
      cursor: pointer;
      font-size: 16px;
      color: #504899;
      img {
        width: 23px;
        height: 23px;
        margin-bottom: 5px;
      }
    }
    .wks,
    .jxz,
    .wc {
      width: 70px;
      height: 24px;
      line-height: 24px;
      margin: 0 auto;
      text-align: center;
      color: #d63c45;
      border: 1px solid #d63c45;
      border-radius: 6px;
    }
    .jxz {
      color: #4587e9;
      border: 1px solid #4587e9;
    }
    .wc {
      color: #42a414;
      border: 1px solid #42a414;
    }
    .wxtype {
      flex: 1;
      margin-top: 20px;
      li {
        display: inline-block;
        border: 1px solid #acacac;
        font-size: 14px;
        color: #787878;
        border-radius: 20px;
        margin-right: 10px;
        padding: 0 15px;
        cursor: pointer;
        height: 28px;
        line-height: 28px;
      }
      li.hov {
        color: #fff;
        background: #5457cf;
        border: 1px solid #5457cf;
      }
    }
  }
  .bentileft {
    width: 368px;
    align-items: center;
    display: flex;
    background: #fff;
    box-shadow: 4px 0px 4px 1px rgba(136, 136, 136, 0.25);
    padding: 20px 0;
    top: 2px;
    .lookbtn1 {
      width: 50px;
      text-align: center;
      cursor: pointer;
      font-size: 16px;
      color: #504899;
      img {
        width: 23px;
        height: 23px;
        margin-bottom: 5px;
      }
    }
    .tab {
      height: 42px;
      display: flex;
      background-size: 100% 100%;
      li {
        font-size: 14px;
        display: inline-block;
        text-align: center;
        line-height: 42px;
        cursor: pointer;
        color: #787878;
        flex: 1;
      }
      li:nth-child(1) {
      }
      li:nth-child(2) {
        margin-left: 20px;
      }
      li.hov,
      li:hover {
        color: #333;
      }
    }
    .tab2 {
      background-size: 100% 100%;
    }
    .borbox {
      margin-top: 20px;
      box-sizing: border-box;
      .leftlist,
      .leftlist2 {
        li {
          min-height: 38px;
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
          .listnum {
            font-size: 14px;
            border-radius: 8px;
            color: #fff;
            padding: 0 5px;
            margin-right: 10px;
          }
          .listmore {
            cursor: pointer;
          }
          .liststart {
            background: url(../../../assets/start.png) no-repeat center center;
            background-size: 20px 20px;
            width: 20px;
            height: 20px;
            margin-right: 10px;
          }
          .liststart2 {
            background: url(../../../assets/start2.png) no-repeat center center;
            background-size: 20px 20px;
            width: 20px;
            height: 20px;
            margin-right: 10px;
          }
          .listkey {
            margin-right: 20px;
            color: #6b6b6b;
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
      .leftdivlist {
        border: 0;
        .el-collapse-item {
          background: #f9f9f9;
          border-radius: 8px 8px 8px 8px;
          border-left: 7px solid;
          margin-bottom: 10px;
        }
        .el-collapse-item__content {
          padding: 0px;
          padding-left: 10px;
        }
        .el-collapse-item__header,
        .el-collapse-item__wrap {
          border: 0;
          background: none;
        }
        .leftdivlisttitle {
          height: 28px;
          flex: 1;
          display: flex !important;
          align-items: center;
          padding-left: 14px;
          padding-right: 14px;
        }
        .el-collapse-item__header {
          height: 24px;
          line-height: 24px;
        }
        .leftdivinp {
          display: flex;
          align-items: center;
          margin-top: 5px;
          margin-bottom: 10px;
          img {
            cursor: pointer;
            width: 11px;
            height: 11px;
            margin-left: 5px;
            margin-right: 10px;
          }
        }

        .listname {
          flex: 1;
        }
        .listnum {
          font-size: 14px;
          border-radius: 8px;
          color: #fff;
          padding: 0 5px;
          margin-right: 10px;
          height: 20px;
          line-height: 20px;
        }
        .listmore {
          cursor: pointer;
        }
        .liststart {
          background: url(../../../assets/start.png) no-repeat center center;
          background-size: 20px 20px;
          width: 20px;
          height: 20px;
          margin-right: 10px;
        }
        .liststart2 {
          background: url(../../../assets/start2.png) no-repeat center center;
          background-size: 20px 20px;
          width: 20px;
          height: 20px;
          margin-right: 10px;
        }
        .listkey {
          margin-right: 20px;
          color: #6b6b6b;
        }
      }
      .leftdivlist2 {
        .el-collapse-item {
          background: #f9f9f9;
          border-radius: 8px 8px 8px 8px;
          margin-bottom: 10px;
          border-left: 0;
        }
        .circolor {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-right: 10px;
        }
        .leftdivlisttitle {
          padding-left: 15px;
          padding-right: 15px;
        }
      }
      .scrolldiv {
        overflow: auto;
        height: calc(100vh - 208px);
        position: relative;
        flex: 1;
      }
      .libor {
        margin-top: 20px;
        .libortop {
          background: url(../../../assets/bortopbg.png) no-repeat;
          width: 245px;
          height: 28px;
          line-height: 28px;
          background-size: 100% 100%;
          color: #fff;
          font-size: 14px;
          font-weight: bold;
          padding-left: 23px;
        }
        .libormain {
          border: 1px solid #e2e2e2;
          border-top: 0;
          border-radius: 0px 0px 8px 8px;
          padding: 6px;
          width: 308px;
          box-sizing: border-box;
        }
      }
      .gxborbg {
        margin-top: 10px;
        border: 1px solid #ccc;
        border-radius: 8px;
        margin-right: 10px;
        padding: 10px;
        .gxbormain {
          height: calc(100vh - 300px);
          overflow: auto;
          .leftguanxi {
            display: flex;
            align-items: center;
            .gximg {
              width: 26px;
              height: 46px;
            }
            .gxdel {
              cursor: pointer;
              width: 11px;
              height: 11px;
              margin-left: 5px;
              margin-right: 10px;
            }
            .leftguanximain {
              flex: 1;
              margin-left: 5px;
              li {
                display: flex;
                align-items: center;
                margin-bottom: 10px;
                .bqtag {
                  font-size: 12px;
                  border: 1px solid;
                  background: #fff;
                  white-space: nowrap;
                  border-radius: 4px;
                  margin-right: 10px;
                  height: 22px;
                  line-height: 22px;
                  padding-left: 10px;
                  padding-right: 10px;
                }
              }
            }
          }
        }
        .btnadd {
          width: 100%;
          height: 40px;
          background: linear-gradient(136deg, #403de6 0%, #575bca 100%);
          box-shadow: 3px 4px 7px 1px rgba(80, 72, 153, 0.25);
          border-radius: 8px 8px 8px 8px;
          font-size: 20px;
        }
      }
    }
  }
  .bentiright {
    position: absolute;
    left: 81px;
    right: 0;
    top: 0;
    bottom: 0;
    flex: 1;
    background: #f4f4f4;
    height: calc(100vh - 82px);
    border-radius: 8px 0px 0px 0px;
    border: 1px solid #ccc;
    overflow: hidden;
    transition: all 0.5s ease-in-out;
  }
}
.rotate_text {
  white-space: nowrap;
  font-size: 14px;
}
.look_btn_style {
  display: flex;
  align-items: center;
  transform: rotate(-90deg);
  img {
    margin-right: 10px;
    transform: rotate(90deg);
  }
}
.bentileft_animation {
  transition: all 0.5s ease-in-out;
}
.bentileft_animation_close {
  animation: animationName_close 1s ease-in-out;
}
.lookrw2_animation {
  transition: all 0.5s ease-in-out;
}
.lookrw2_animation_close {
  animation: lookrw2_animation_close 1s ease-in-out;
}
@keyframes animationName {
  0% {
    width: 0;
  }
  100% {
    width: 368px;
  }
}
@keyframes animationName_close {
  0% {
    width: 368px;
  }
  100% {
    width: 0;
  }
}
@keyframes bentileft_animation {
  0% {
    width: 0;
  }
  100% {
    width: 710px;
  }
}
@keyframes lookrw2_animation_close {
  0% {
    width: 710px;
  }
  100% {
    width: 0;
  }
}
.lookrw2_outside {
  width: 0;
  overflow: hidden;
  background: #ffffff;
}
.bentileft_outside {
  width: 0;
  overflow: hidden;
  background: #ffffff;
}
</style>
