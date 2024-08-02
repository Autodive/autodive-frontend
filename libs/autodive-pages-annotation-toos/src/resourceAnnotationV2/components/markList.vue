<template>
  <div class="mark-list">
    <ul class="mark-list-header" :class="markType">
      <li
        :class="{ hov: markType == 'benti' }"
        @click="clickHeaderBar('benti')"
      >
        <span>{{ $t('实体标签') }}</span>
      </li>
      <li
        :class="{ hov: markType == 'relation' }"
        @click="clickHeaderBar('relation')"
      >
        <span>{{ $t('关系标签') }}</span>
      </li>
    </ul>
    <div class="mark-list-benti borbox" v-if="markType == 'benti'">
      <el-radio-group
        @input="defineChanged"
        class="filter-select"
        v-model="bentiFilter.filter"
      >
        <el-radio
          v-for="(e, i) in bentiFilters"
          :key="i"
          :id="e.value"
          :disabled="e.disabled"
          :label="e.value"
          >{{ $t(e.title) }}</el-radio
        >
      </el-radio-group>
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
      <div style="display: flex; height: calc(100% - 70px)">
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
                    <div class="leftdivlisttitle">
                      <div class="listname">{{ item.definName }}</div>
                      <div
                        class="listnum"
                        v-if="item.annotationList.length > 0"
                        :style="{ background: item.color }"
                      >
                        {{ item.annotationList.length }}
                      </div>
                      <img
                        :class="
                          searchType == 'dict' && searchItem == item
                            ? 'img-turn'
                            : ''
                        "
                       @click.stop=" item.dict && clickDictBiaoZhu(item)"
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
                        :class="
                          searchType == 'reg' && searchItem == item
                            ? 'img-turn'
                            : ''
                        "
                        @click.stop="
                          item.regex && clickRegBiaoZhu(item)
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
                        @click.stop="
                          clickBatchDeleteBiaoZhu(item)
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
                        @click.stop="
                          showTag(item, 'all')
                        "
                        v-if="item.isClose"
                        src="@/assets/closeTag.png"
                        style="width: 20px"
                      />
                      <img
                        @click.stop="
                          closeTag(item, 'all')
                        "
                        v-else
                        src="@/assets/showTag.png"
                        style="width: 20px; height: 20px"
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

    <div class="mark-list-relation borbox" v-if="markType == 'relation'">
      <div style="display: flex; align-items: center">
        <el-input
          prefix-icon="el-icon-search"
          style="flex: 1"
          v-model="relationFilter.keyword"
          :placeholder="$t('搜索标签名')"
          @input="relationSearchInputChange"
        ></el-input>
        <el-dropdown
          style="margin-left: 15px; margin-right: 15px"
          @command="relationCollectFilterChange"
        >
          <div style="cursor: pointer; display: flex; align-items: center">
            <span v-if="relationFilter.collected == '0'">{{
              $t('所有标签名')
            }}</span
            ><span v-if="relationFilter.collected == '1'">{{
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
      <div class="gxborbg">
        <div class="gxbormain">
          <el-collapse class="leftdivlist leftdivlist2">
            <el-collapse-item
              v-for="(item, index) in relationMarkListData"
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
                        borderColor: n.fromColor,
                        color: n.fromColor,
                      }"
                    >
                      {{ n.fromDefinName }}
                    </div>
                    <el-input
                      v-model="n.fromAnnotationName"
                      size="mini"
                    ></el-input>
                  </li>
                  <li>
                    <div
                      class="bqtag"
                      :style="{
                        borderColor: n.toColor,
                        color: n.toColor,
                      }"
                    >
                      {{ n.toDefinName }}
                    </div>
                    <el-input
                      v-model="n.toAnnotationName"
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
    <div class="mark-list-footer"></div>
  </div>
</template>

<script>
import { getresourcesDefinRelation } from '@/api/yuliao'

import { getAnnotationRelationListData } from '@/api/task'

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
      markType: 'benti',
      bentiFilter: {
        filter: 'both',
        collected: '0',
        keyword: '',
      },
      bentiFilters: [
        { title: '混', value: 'both', disabled: false },
        { title: '图', value: 'image', disabled: false },
        { title: '文', value: 'txt', disabled: false },
      ],
      relationFilter: {
        collected: '0',
        keyword: '',
      },
      searchItem: {},
      searchType: '',
      bentiMakListData: [],
      bentiMakListGroupData: [],
      relationMarkListData: [],
      activeId: '',
      layerId: 3,
      resource: {},
      annotationList: [],
    }
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
    if (this.$route.query.userId) {
      this.userId = this.$route.query.userId
    } else {
      this.userId = JSON.parse(localStorage.getItem('user')).id
    }
  },
  methods: {
    setResource(resource) {
      if (this.resource.id != resource.id) {
        this.resource = resource
        var filter = resource.type == 'paper' ? 'both' : resource.type
        this.bentiFilter = {
          filter: filter,
          collected: '0',
          keyword: '',
        }
        if (resource.type == 'paper') {
          this.bentiFilters = [
            { title: '混', value: 'both', disabled: false },
            { title: '图', value: 'image', disabled: false },
            { title: '文', value: 'txt', disabled: false },
          ]
        } else if (resource.type == 'image') {
          this.bentiFilters = [
            { title: '混', value: 'both', disabled: true },
            { title: '图', value: 'image', disabled: false },
            { title: '文', value: 'txt', disabled: true },
          ]
        } else if (resource.type == 'txt') {
          this.bentiFilters = [
            { title: '混', value: 'both', disabled: true },
            { title: '图', value: 'image', disabled: true },
            { title: '文', value: 'txt', disabled: false },
          ]
        }
        this.getBentiMarkListData()
        this.getRelationMarkListData()
      }
    },
    setAnnotationList(data) {
      this.resource.annotationList = data
    },
    setNewAnnotation(annotation) {
      annotation.selected = true
      let ind = this.bentiMakListData.findIndex(
        (item) => item.id === annotation.definitionId
      )
      if (ind != -1) {
        this.bentiMakListData[ind].annotationList.push(annotation)
        this.groupBentiMarkListData(this.bentiMakListData)
        this.$forceUpdate()
      }
    },
    setNewRelation(relation) {
      this.relationMarkListData.forEach((item) => {
        if (item.definRelationId == relation.relationId) {
          var relationList = item.resourcesDefinRelationDefinListList
          if (!relationList || !Array.isArray(relationList)) {
            relationList = []
          }
          this.bentiMakListData.forEach((mark) => {
            mark.annotationList.forEach((annotation) => {
              if (annotation.presentation.fId == relation.fromFId) {
                relation.fromDefinName = mark.definName
                relation.fromColor = mark.color
                relation.fromAnnotationName = annotation.name
              }
              if (annotation.presentation.fId == relation.toFId) {
                relation.toDefinName = mark.definName
                relation.toColor = mark.color
                relation.toAnnotationName = annotation.name
              }
            })
          })
          relationList.push(relation)
          item.resourcesDefinRelationDefinListList = relationList
        }
      })
    },

    delgx(index1, index2) {
      var relationMark = this.relationMarkListData[index1]
      this.$emit(
        'deleteRelation',
        relationMark.resourcesDefinRelationDefinListList[index2]
      )
      relationMark.resourcesDefinRelationDefinListList.splice(index2, 1)

      this.$forceUpdate()
    },

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
      this.$emit( 'didGetNewBentiMarkListData', this.bentiMakListData)
      this.groupBentiMarkListData(this.bentiMakListData)

      if (
        this.resource.annotationList &&
        Array.isArray(this.resource.annotationList)
      ) {
        this.resource.annotationList.forEach((annotation) => {
          this.setNewAnnotation(annotation)
        })
      }
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

    async getRelationMarkListData() {
      let edges = await getresourcesDefinRelation({
        resourceId: this.resource.id,
        layerId: this.layerId,
        projectId: this.$route.query.id,
        keyword: this.relationFilter.keyword,
        isCollected: this.relationFilter.collected,
      })
      this.relationMarkListData = edges.data.map((item) => {
        if (item.resourcesDefinRelationDefinListList == null) {
          item.resourcesDefinRelationDefinListList = []
        }
        return item
      })

      var re = await getAnnotationRelationListData(
        this.resource.id,
        this.userId
      )

      var relationList = []
      if (re.data) {
        relationList = re.data
      }
      var annotationList = this.resource.annotationList
      if (!annotationList || !Array.isArray(annotationList)) return
      relationList.forEach((relation) => {
        annotationList.forEach((annotation) => {
          if (annotation.id == relation.fromId) {
            relation.fromFId = annotation.presentation.fId
          }
          if (annotation.id == relation.toId) {
            relation.toFId = annotation.presentation.fId
          }
        })
        this.setNewRelation(relation)
      })

      this.$emit('didGetNewRelationMarkListData', this.relationMarkListData)
    },

    clickHeaderBar(type) {
      this.markType = type
    },
    bentiSearchInputChange(value) {
      this.bentiFilter.keyword = value
      this.getBentiMarkListData()
    },

    relationSearchInputChange(value) {
      this.relationFilter.keyword = value
      this.getRelationMarkListData()
    },

    bentiCollectFilterChange(e) {
      this.bentiFilter.collected = e
      this.getBentiMarkListData()
    },

    clickDictBiaoZhu(item) {
      if (this.resource.type != 'paper' || this.searchType != '') {
        return
      }
      this.searchItem = item
      this.searchType = 'dict'
      this.$emit('clickDictBiaoZhu', item)
    },
    clickRegBiaoZhu(item) {
      if (this.resource.type != 'paper' || this.searchType != '') {
        return
      }
      this.searchItem = item
      this.searchType = 'reg'
      this.$emit('clickRegBiaoZhu', item)
    },
    finishedSearch() {
      this.searchItem = {}
      this.searchType = ''
      this.$message({
        message: '匹配完成',
        type: 'message',
      })
    },
    clickBatchDeleteBiaoZhu(item) {
      this.$baseConfirm(this.$t('确认删除') + '?', null, () => {
        const annotationList = []
        const deleteAnnotationList = []
        item.annotationList.forEach((annotation) => {
          if (!annotation.selected) {
            annotationList.push(annotation)
          } else {
            deleteAnnotationList.push(annotation)
          }
        })
        item.annotationList = annotationList
        this.$forceUpdate()
        deleteAnnotationList.forEach((annotation) => {
          this.$emit('deleteBiaozhu', annotation.presentation.fId)
        })
      })
    },
    deleteAnnotation(id) {
      this.bentiMakListData.forEach((mark) => {
        let ind = mark.annotationList.findIndex(
          (item) => item.presentation.fId == id
        )
        if (ind != -1) {
          mark.annotationList.splice(ind, 1)
        }
      })
      this.relationMarkListData.forEach((relationMark) => {
        var definitionRelationList =
          relationMark.resourcesDefinRelationDefinListList
        if (!definitionRelationList || !Array.isArray(definitionRelationList)) {
          definitionRelationList = []
        }
        var ind1 = definitionRelationList.findIndex((item) => {
          return item.fromFId == id || item.toFId == id
        })
        if (ind1 >= 0) {
          this.$emit('deleteRelation', definitionRelationList[ind1])
          definitionRelationList.splice(ind1, 1)
        }
      })
      this.$forceUpdate()
    },
    clickDelBiaoZhu(id, item) {
      const list = []
      item.annotationList.forEach((annotation) => {
        if (annotation.presentation.fId != id) {
          list.push(annotation)
        }
      })
      item.annotationList = list
      this.$forceUpdate()
      this.$emit('deleteBiaozhu', id)
    },
    annotationTitleChange(value) {},

    showTag(value, isAll) {
      if (isAll) {
        value.annotationList.forEach((item, index) => {
          value.isClose = false
          value.annotationList[index].isClose = false
          this.$emit('setAnnotationDisplay', item)
          this.$forceUpdate()
        })
      } else {
        value.isClose = false
        this.$forceUpdate()
        this.$emit('setAnnotationDisplay', value)
      }
    },
    closeTag(value, isAll) {
      if (isAll) {
        value.annotationList.forEach((item, index) => {
          value.isClose = true
          value.annotationList[index].isClose = true
          this.$emit('setAnnotationDisplay', item)
          this.$forceUpdate()
        })
      } else {
        value.isClose = true
        this.$forceUpdate()
        this.$emit('setAnnotationDisplay', value)
      }
    },

    relationCollectFilterChange(e) {
      this.relationFilter.collected = e
      this.getRelationMarkListData()
      this.groupBentiMarkListData(data)
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

    defineChanged(value) {
      this.groupBentiMarkListData(this.bentiMakListData)
    },

    mouseenter(n) {
      this.$emit(this, 'setResourceZoneAnnotationActive', n.presentation.fId, true)
    },
    mouseleave(n) {
      this.$emit(this, 'setResourceZoneAnnotationActive', n.presentation.fId, false)
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
      text-align: left;
      line-height: 42px;
      cursor: pointer;
      color: #787878;
      width: 48%;
      span {
        display: inline-block;
        text-align: center;
        width: 86%;
      }
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
    height: calc(100% - 42px);
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
        line-height: 38px;
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
