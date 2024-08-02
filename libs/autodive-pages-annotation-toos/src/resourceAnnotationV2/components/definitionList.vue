<template>
  <div class="definition-list">
    <ul class="definition-header" :class="{ definitionType }">
      <li
        :class="{ hov: definitionType == 'benti' }"
        @click="clickDefintionHeaderBar('benti')"
      >
        {{ $t('本体标签') }}
      </li>
      <li
        :class="{ hov: definitionType == 'relation' }"
        @click="clickDefintionHeaderBar('relation')"
      >
        {{ $t('关系标签') }}
      </li>
    </ul>
    <div id="definition-benti" class="borbox" v-if="act == 'benti'">
      <div class="definition-">
        <el-radio v-model="filter" label="both">混合</el-radio>
        <el-radio v-model="filter" label="txt">图</el-radio>
        <el-radio v-model="filter" label="image">文</el-radio>
      </div>
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
          <div style="cursor: pointer; display: flex; align-items: center">
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
                v-for="(item, index) in ['10s', '30s', '1m', '5m', '取消']"
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
          <div class="libor" v-for="(e, i) in leftlist" :key="i" :id="e.ind">
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
                    <el-input v-model="n.name" size="mini"></el-input>
                    <img @click="delbq(n.fId)" src="@/assets/cz4.png" />
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
        <aindex :activeId="activeId" :List="leftlist" @go="goTop"></aindex>
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
          <div style="cursor: pointer; display: flex; align-items: center">
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
            <el-collapse-item v-for="(item, index) in leftdata2" :key="index">
              <template v-slot:title>
                <div class="leftdivlisttitle">
                  <div
                    :style="{ background: item.color }"
                    class="circolor"
                  ></div>
                  <div class="listname">{{ item.name }}</div>
                  <div
                    class="listnum"
                    v-if="item.resourcesDefinRelationDefinListList.length > 0"
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
                v-for="(n, index2) in item.resourcesDefinRelationDefinListList"
                :key="index2"
              >
                <img src="@/assets/gxbg.png" class="gximg" />
                <ul class="leftguanximain">
                  <li>
                    <div
                      class="bqtag"
                      :style="{
                        borderColor: n.resourcesDefinRelationDefinList[0].color,
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
                        borderColor: n.resourcesDefinRelationDefinList[1].color,
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
</template>

<script>
export default {
  props: {
    resourceId: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      definitionType: 'benti',
      filter: 'both',
    }
  },

  mounted() {},
  methods: {
    getDefinitionList() {},

    getDefinitionRelationList() {},

    clickDefintionHeaderBar(type) {},
  },
}
</script>

<style lang="scss">
.definition-list {
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
    background: url(../../../assets/tabmenu.png) no-repeat;
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
      width: 138px;
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
    background: url(../../../assets/tabmenu2.png) no-repeat;
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
</style>
