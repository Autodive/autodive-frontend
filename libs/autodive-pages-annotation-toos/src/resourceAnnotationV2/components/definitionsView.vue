<template>
  <div class="mark-list">
    <div class="mark-list-benti borbox">
      <div style="display: flex; align-items: center">
        <el-input
          prefix-icon="el-icon-search"
          style="flex: 1"
          v-model="bentiFilter.keyword"
          :placeholder="$t('搜索标签名')"
          @input="bentiSearchInputChange"
        ></el-input>
        <el-dropdown
          style="margin-left: 15px; margin-right: 15px"
          @command="bentiCollectFilterChange"
        >
          <div style="cursor: pointer; display: flex; align-items: center">
            <span v-if="bentiFilter.collected == '0'">{{
              $t('所有标签名')
            }}</span
            ><span v-if="bentiFilter.collected == '1'">{{
              $t('收藏标签名')
            }}</span>
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
      <div style="display: flex; height: calc(100% - 32px)">
        <div class="scrolldiv" id="scrollindex">
          <div
            class="libor"
            v-for="(e, i) in bentiMakListGroupData"
            :key="i"
            :id="e.ind"
          >
            <div class="libortop">{{ e.ind }}</div>
            <div class="libormain">
              <el-collapse class="leftdivlist leftdivlist1">
                <el-collapse-item
                  v-for="(item, index) in e.children"
                  :key="index"
                  :style="{ borderColor: item.color }"
                >
                  <template v-slot:title>
                    <div
                      :id="item.id"
                      class="leftdivlisttitle"
                      draggable="true"
                    >
                      <div class="listname">{{ item.definName }}</div>
                      <img
                        v-for="(item, index) in item.btns"
                        :key="index"
                        @click="
                          $event.stopPropagation()
                          item.act(item)
                        "
                        :title="item.title"
                        :src="item.url"
                        :style="{
                          width: '15px',
                          marginRight: '10px',
                          cursor: 'pointer',
                        }"
                      />
                    </div>
                  </template>
                  <div
                    class="leftdivinp"
                    v-for="(n, index2) in item.annotationList"
                    :key="index2"
                    :id="'leftdivinp' + n.presentation.fId"
                    @mouseenter="mouseenter(n)"
                    @mouseleave="mouseleave(n)"
                  >
                    <el-checkbox v-model="n.selected"></el-checkbox>
                    <el-input
                      @mouseenter="mouseenter(n)"
                      @mouseleave="mouseleave(n)"
                      input="annotationTitleChange"
                      v-model="n.name"
                      size="small"
                    ></el-input>
                    <img
                      @click="clickDelBiaoZhu(n.presentation.fId, item)"
                      src="@/assets/cz4.png"
                    />
                    <img
                      @click="showTag(n)"
                      v-if="n.isClose"
                      src="@/assets/closeTag.png"
                      style="width: 20px"
                    />
                    <img
                      @click="closeTag(n)"
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
          :List="bentiMakListGroupData"
          @go="goTop"
        ></aindex>
      </div>
    </div>
  </div>
</template>

<script>
import { getshiti } from '@/api/benti'
import aindex from './aIndex'
import { pinyin } from 'pinyin-pro'
export default {
  components: {
    aindex,
  },
  data() {
    return {
      userId: 0,
      bentiFilter: {
        filter: 'both',
        collected: '0',
        keyword: '',
      },
      searchType: '',
      bentiMakListData: [],
      bentiMakListGroupData: [],
      activeId: '',
    }
  },
  watch: {
    bentiMakListData: {
      deep: true,
      handler(newVal) {
        this.setBentiMarkListData(newVal)
      },
    },
  },
  unmounted() {
    document.removeEventListener('scroll', this.scrollEventHandler, true)
  },
  mounted() {
    let timeId
    this.scrollEventHandler = () => {
      clearTimeout(timeId)
      timeId = setTimeout(() => {
        this.setActiveId()
      })
    }
    window.addEventListener('scroll', this.scrollEventHandler, true)

    window.addEventListener(
      'dragstart',
      function (e) {
        console.log('dragstart====')
        console.log(e)
        console.log(e.target.id)
      },
      true
    )
  },
  methods: {
    async getBentiMarkListData() {
      let nodes = await getshiti({ projectId: this.$route.query.id })

      this.bentiMakListData = nodes.data.map((item) => {
        if (item.annotationList == null) {
          item.annotationList = []
        }
        if (item.annotationList.length > 0) {
          item.annotationList.map((e) => {
            e['selected'] = true
            return e
          })
        }
        delete item.createBy
        delete item.createDate
        return item
      })
      this.setBentiMarkListData(this.bentiMakListData)
    },

    clickBtn(index, item) {
      alert(index)
    },

    setBentiMarkListData(data) {
      this.bentiMakListData = data
      this.groupBentiMarkListData(data)
    },

    groupBentiMarkListData(bentiMakListData) {
      var data = []

      bentiMakListData.forEach((item) => {
        if (this.bentiFilter.filter == 'both') {
          data.push(item)
        } else if (
          this.bentiFilter.filter == 'image' &&
          item.annotatedType.image
        ) {
          data.push(item)
        } else if (this.bentiFilter.filter == 'txt' && item.annotatedType.txt) {
          data.push(item)
        }
      })

      let newarr = data.map((item) => {
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
      this.bentiMakListGroupData = newlist.sort(function (s1, s2) {
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
    },

    bentiSearchInputChange(value) {
      this.bentiFilter.keyword = value
      this.getBentiMarkListData()
    },

    bentiCollectFilterChange(e) {
      this.bentiFilter.collected = e
      this.getBentiMarkListData()
    },
    goTop(ind) {
      this.activeId = ind
      this.$el.querySelector('[id="' + ind + '"]').scrollIntoView()
    },
    setActiveId() {
      if (!document.querySelector('#scrollindex').scrollTop) {
        return
      }
      let scrollTop = document.querySelector('#scrollindex').scrollTop

      this.bentiMakListGroupData.map((v, i) => {
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

    mouseenter(n) {
      this.$emit('setResourceZoneAnnotationActive', n.presentation.fId, true)
    },
    mouseleave(n) {
      this.$emit('setResourceZoneAnnotationActive', n.presentation.fId, false)
    },
    setAnnotationActive(fId, isActive) {
      var ele = document.getElementById('leftdivinp' + fId)
      ele.className = 'leftdivinp' + (isActive ? ' active' : '')
    },
  }
}
</script>

<style lang="scss">
.mark-list {
  height: calc(100% - 20px);
  width: 368px;
  display: flex;
  flex-direction: column;
  background: #fff;
  padding: 10px 10px;
  .mark-list-header {
    background: url('@/assets/tabmenu.png') no-repeat;
    height: 42px;
    display: flex;
    padding: 0px;
    background-size: 100% 100%;
    li {
      font-size: 14px;
      display: inline-block;
      text-align: center;
      line-height: 42px;
      cursor: pointer;
      color: #787878;
      width: 164px;
      padding-right: 20px;
    }
    li.hov,
    li:hover {
      color: #333;
    }
  }
  .relation {
    background: url('@/assets/tabmenu2.png') no-repeat;
    background-size: 100% 100%;
  }
  .borbox {
    height: 100%;
    margin-top: 20px;
    box-sizing: border-box;
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
      .img-turn {
        animation: turn 1s linear infinite;
      }
      @keyframes turn {
        0% {
          transform: rotate(0deg);
        }
        25% {
          transform: rotate(90deg);
        }
        50% {
          transform: rotate(180deg);
        }
        75% {
          transform: rotate(270deg);
        }
        100% {
          transform: rotate(360deg);
        }
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
      .leftdivinp:hover {
        .el-input__inner {
          border: 2px solid #dcdfe6;
          font-weight: bold;
          background: #999;
        }
      }
      .active {
        .el-input__inner {
          border: 2px solid #dcdfe6;
          font-weight: bold;
          background: #999;
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
    .leftdivlist1 {
      .el-collapse-item.is-active {
        border-top: 1px solid;
        border-right: 1px solid;
        border-bottom: 1px solid;
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
      height: 100%;
      position: relative;
      flex: 1;
    }
    .libor {
      margin-top: 20px;
      .libortop {
        background: url(../../../assets/bortopbg.png) no-repeat;
        width: 100%;
        height: 44px;
        line-height: 44px;
        background-size: 100% 100%;
        color: #fff;
        font-size: 14px;
        font-weight: bold;
        padding-left: 20px;
      }
      .libormain {
        border: 1px solid #e2e2e2;
        border-top: 0;
        border-radius: 0px 0px 8px 8px;
        padding: 6px;
        width: 100%;
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
  .filter-select {
    padding: 10px;
  }
}
</style>
