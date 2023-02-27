<template>
  <div style="display: flex; height: 100%">
    <div class="pdfleft">
      <div class="pdftop">
        <div class="pdfym">{{$t('页码')+' :'}} + {{page}}/ {{ numPages ? numPages : "∞" }}</div>
        <div class="pdfname">
          <div v-if="pdftitle != ''" style="line-height: 20px">{{ pdftitle }}.pdf</div>
        </div>
        <div class="pdf_top_right">
          <img class="pdftopimg" @click="jia" src="../../../assets/fd.png" />
          <div class="pdfsf">{{ formattedZoom }} %</div>
          <img class="pdftopimg" @click="jian" src="../../../assets/sx.png" />
        </div>
      </div>
      <div class="pdfmain">
        <div class="czlbg" id="leftgjl">
          <el-button
            icon="el-icon-loading"
            class="robot-switch"
            v-if="robotProcessing"
            circle
          />
          <el-switch
            v-model="robotAnnoShow"
            class="robot-switch"
            v-if="!robotProcessing"
          />
          <img @click="zcbtn" src="../../../assets/zc.png" class="zc" />
          <img @click="okbtn" src="../../../assets/dui.png" class="duihao" />
        </div>
        <div class="pdfmaindiv">
          <div id="pdfvuer" ref="container">
            <div id="buttons"></div>
            <pdf
              ref="pdfDom"
              :src="pdfdata"
              v-for="i in numPages"
              :key="i"
              :id="i"
              :page="i"
              :scale.sync="scale"
              v-if="pdfshow"
              :annotation="true"
              :resize="resize"
              @link-clicked="handle_pdf_link"
            >
              <template slot="loading"> loading content here... </template>
            </pdf>
            <div
              ref="maskContainer"
              style="width: 100%; height: 0; top: 0; position: absolute"
            />
            <div class="seachbq" id="seachbqdiv">
              <div style="padding: 6rem; font-weight: bold">{{ $t('选择标签') }}</div>
              <ul>
                <li @click="biaozhu(item)" v-for="(item, index) in leftdata" :key="index">
                  <span :style="{ borderColor: item.color, color: item.color }">{{ $t('推荐') }}</span
                  >{{ item.definName }}
                </li>
              </ul>
            </div>
            <div class="seachbq" id="seachgxdiv">
              <div style="padding: 6rem; font-weight: bold">{{ $t('选择关系') }}</div>
              <ul>
                <li @click="guanxi(item)" v-for="(item, index) in leftdata2" :key="index">
                  <span :style="{ borderColor: item.color, color: item.color }">{{ $t('推荐') }}</span
                  >{{ item.name }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="pdfright" id="pdfslt"></div>
  </div>
</template>

<script>
import pdfvuer from "pdfvuer";
import "pdfjs-dist/build/pdf.worker.entry"; // not needed since v1.9.1
import "pdfvuer/dist/pdfvuer.css";
import { debuglog } from "util";
import { complete } from "@/api/yuliao";

import request from "@/utils/request";
import { baseURL } from "@/config";

const INLINE_TAGS = new Set([
  // Inline text semantics
  "a",
  "abbr",
  "b",
  "bdi",
  "bdo",
  "br",
  "cite",
  "code",
  "data",
  "dfn",
  "em",
  "i",
  "kbd",
  "mark",
  "q",
  "rp",
  "rt",
  "rtc",
  "ruby",
  "s",
  "samp",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "time",
  "u",
  "var",
  "wbr",
]);
const sentenceHeadTester = /((.(?![ .]))|[^.?!。？！…rn])+$/;
const sentenceTailTester = /^((.(?![ .]))|[^.?!。？！…rn])+(.)3{0,2}/;
export default {
  props: {
    leftdata: {
      type: Array,
      default: [],
    },
    leftdata2: {
      type: Array,
      default: [],
    },
  },
  watch: {
    leftdata(newVal, oldVal) {
      this.leftdata = newVal;
    },
    leftdata2(newVal, oldVal) {
      this.leftdata2 = newVal;
    },
    robotAnnoShow(newVal) {
      const getRobotAnnos = async () => {
        this.robotProcessing = true;
        try {
          if (!this.robotLoaded) {
             const resp = await request({
              url: "/robot/by-model-and-doi",
              method: "GET",
              params: { model: this.project.modelId, doi: this.doi },
            });
            const labelNames = this.leftdata.map((d) => d.definName);
            const relationNames = this.leftdata2.map((d) => d.name);
            this.robotAnnos = resp.data.labels.filter(
              (d) => d.ontology && labelNames.includes(d.ontology)
            );
            this.robotRelations = resp.data.relations.filter(
              (d) => d.relation && relationNames.includes(d.relation)
            );
            this.robotLoaded = true;
          }

          for (const anno of this.robotAnnos) {
            const selection = window.getSelection();
            selection.removeAllRanges();
            const targetRanges = this.getRangeOfRobotOntology(anno.sen, anno.text);
            if (targetRanges) {
              for (const r of targetRanges) {
                selection.addRange(r);
              }
              const checkobj = this.leftdata.find((d) => d.definName === anno.ontology);
              this.biaozhu(checkobj, "robot", anno.figure, anno.sen);
            }
          }

          for (const rel of this.robotRelations) {
            const ldItem = this.leftdata2.find((d) => d.name === rel.relation);
            const fromAnno = this.robotAnnos.find((d) => d.figure === rel.fromFigure);
            const toAnno = this.robotAnnos.find((d) => d.figure === rel.toFigure);
            if (fromAnno && toAnno) {
              ldItem.resourcesDefinRelationDefinListList.push({
                tag: "robot",
                resourcesDefinRelationDefinList: [
                  {
                    definName: fromAnno.ontology,
                    fontname: fromAnno.text,
                    color: this.leftdata.find((d) => d.definName === fromAnno.ontology)
                      ?.color,
                  },
                  {
                    definName: toAnno.ontology,
                    fontname: toAnno.text,
                    color: this.leftdata.find((d) => d.definName === toAnno.ontology)
                      ?.color,
                  },
                ],
              });
            }
          }
        } finally {
          this.robotProcessing = false;
        }
      };

      if (!newVal) {
        this.removeAllRobotAnno();
      } else if (newVal && this.resourceId) {
        getRobotAnnos();
      }
    },
  },
  components: {
    pdf: pdfvuer,
  },
  data() {
    return {
      page: 1,
      numPages: 0,
      pdfdata: undefined,
      errors: [],
      scale: "page-width",
      rects: [],
      bqname: "",
      context: "",
      addgxarry: [],
      pdftitle: "",
      pdfshow: true,
      resourceId: "",
      robotAnnoShow: false,
      robotLoaded: false,
      robotAnnos: null,
      robotRelations: null,
      robotProcessing: false,
      doi: null,
      project: null,
      newformattedZoom: 100,
      newdataarry: [],
      resize: false
    };
  },
  computed: {
    formattedZoom() {
      return Number.parseInt(this.scale * 100);
    },
  },
  mounted() {
    // this.getPdf()
    this.listener = this.createEventListener();
    document.addEventListener("keypress", this.listener);
    let that = this;
    document.addEventListener(
      "scroll",
      function () {
        that.changePage();
        that.stickyNav();
      },
      true
    );

    document.getElementById("pdfvuer").addEventListener(
      "mouseup",
      async function (e) {
        const selection = window.getSelection();
        const container = document.getElementById("pdfvuer");
        const range = selection.getRangeAt(0);
        const rects = range.getClientRects();
        const firstRect = rects[0];

        if (selection.toString() != "") {
          that.rects = rects;
          that.bqname = selection.toString();
          that.context = await that.getSelectionSentence();
          document.getElementById("seachbqdiv").style.display = "block";
          document.getElementById("seachbqdiv").style.top =
            firstRect.y - container.getBoundingClientRect().top + 28 + "px";
          document.getElementById("seachbqdiv").style.left =
            firstRect.x - container.getBoundingClientRect().left + "px";
        } else {
          document.getElementById("seachbqdiv").style.display = "none";
        }
      },
      true
    );

    window.delfont = function (e) {
      that.delbq(e);
      that.$emit("getdelbq", e);
    };
    window.addgx = function (e, x, y) {
      if (that.addgxarry.length == 0) {
        that.addgxarry.push(e);
        document.getElementsByClassName(e)[0].style.fontWeight = "bold";
      } else if (that.addgxarry.length == 1 && that.addgxarry.indexOf(e) == -1) {
        that.addgxarry.push(e);
        document.getElementById("seachgxdiv").style.display = "block";
        document.getElementById("seachgxdiv").style.top = y + 10 + "px";
        document.getElementById("seachgxdiv").style.left = x + "px";
        document.getElementsByClassName(e)[0].style.fontWeight = "bold";
      } else {
        document.getElementsByClassName(that.addgxarry[0])[0].style.fontWeight = "normal";
        document.getElementsByClassName(that.addgxarry[1])[0].style.fontWeight = "normal";
        that.addgxarry = [];
        document.getElementById("seachgxdiv").style.display = "none";
      }
      console.log(that.addgxarry);
    };
  },
  unmounted() {
    document.removeEventListener("keypress", this.listener);
  },
  methods: {
    jian() {
      this.scale -= this.scale > 0.2 ? 0.1 : 0;
      console.log(this.scale)
      this.inittag();
    },
    jia() {
      this.scale += this.scale < 2 ? 0.1 : 0;
      this.inittag();
    },
    getSelectionSentence() {
      const selection = window.getSelection();
      const anchorNode = selection.anchorNode;
      const selectedText = anchorNode.parentElement.innerText;
      var prefont = "";
      var nextfont = "";
      for (
        let node = anchorNode.parentElement.previousSibling;
        node && node.innerText.indexOf(".") == -1;
        node = node.previousSibling
      ) {
        prefont = node.innerHTML + " " + prefont;
      }
      for (
        let node = anchorNode.parentElement.nextSibling;
        node && node.innerText.indexOf(".") == -1;
        node = node.nextSibling
      ) {
        console.log(node.nextSibling)
        if (node.nextSibling.innerText.indexOf(".") != -1) {
          nextfont = nextfont + node.innerHTML + node.nextSibling.innerHTML.split(".")[0];
        } else {
          nextfont = nextfont + node.innerHTML;
        }
      }
      console.log(prefont + selectedText + nextfont);
      return prefont + selectedText + nextfont;
    },
    okbtn() {
      this.$emit("getok", "saveok");
    },
    zcbtn() {
      this.$emit("getzc", "savezc");
    },
    inittag(arry0) {
      let that = this;
      var arry = [];
      if (arry0) {
        this.newdataarry = arry0;
        arry = arry0;
      } else {
        arry = this.newdataarry;
      }

      this.robotAnnoShow = false;
      this.$refs.maskContainer.innerHTML = "";
      // const container = document.getElementById('pdfvuer');
      const hintBgColor = "#ffffff";
      const hintColor = "#333";
      if(arry[0].markList.length!=0){
        this.newformattedZoom = JSON.parse(arry[0].markList[0].container).formattedZoom;
      }
      for (let i = 0; i < arry.length; i++) {
        const maskColor = arry[i].color;
        const hintBorderColor = arry[i].color;
        for (let j = 0; j < arry[i].markList.length; j++) {
          // if(arry[i].tags[j]){

          const hintEl = document.createElement("div");
          Object.assign(hintEl.style, {
            position: "absolute",
            left:
              ((arry[i].markList[j].x - JSON.parse(arry[i].markList[j].container).left) *
                that.formattedZoom) /
                JSON.parse(arry[i].markList[j].container).formattedZoom +
              "px",
            top:
              ((arry[i].markList[j].y -
                JSON.parse(arry[i].markList[j].container).top -
                26) *
                that.formattedZoom) /
                JSON.parse(arry[i].markList[j].container).formattedZoom +
              "px",
            color: hintColor,
            borderRadius: "6px",
            padding: "5px 10px",
            backgroundColor: hintBgColor,
            border: "1px solid " + hintBorderColor,
            borderLeft: "5px solid " + hintBorderColor,
            // transform:'scale('+that.formattedZoom/(JSON.parse(arry[i].markList[j].container).formattedZoom)+')'
          });
          hintEl.innerHTML =
            '<span onclick=addgx("' +
            (arry[i].markList[j].shortcutKey || "") +
            arry[i].markList[j].x +
            "-" +
            arry[i].markList[j].y +
            '",' +
            (arry[i].markList[j].x - arry[i].markList[j].left) +
            "," +
            (arry[i].markList[j].y - JSON.parse(arry[i].markList[j].container).top) +
            ")>" +
            arry[i].markList[j].name.slice(0, 30) +
            "...</span>" +
            '<span onclick=delfont("' +
            (arry[i].markList[j].shortcutKey || "") +
            arry[i].markList[j].x +
            "-" +
            arry[i].markList[j].y +
            '") class="gbclose">×</span>';
          hintEl.className =
            arry[i].markList[j].shortcutKey +
            arry[i].markList[j].x +
            "-" +
            arry[i].markList[j].y;
          this.$refs.maskContainer.append(hintEl);

          let newrects = JSON.parse(arry[i].markList[j].rects);
          for (let ind in newrects) {
            const maskEl = document.createElement("div");
            Object.assign(maskEl.style, {
              position: "absolute",
              left:
                ((newrects[ind].x - JSON.parse(arry[i].markList[j].container).left) *
                  that.formattedZoom) /
                  JSON.parse(arry[i].markList[j].container).formattedZoom +
                "px",
              top:
                ((newrects[ind].y - JSON.parse(arry[i].markList[j].container).top) *
                  that.formattedZoom) /
                  JSON.parse(arry[i].markList[j].container).formattedZoom +
                "px",
              width:
                ((newrects[ind].width + 4) * that.formattedZoom) /
                  JSON.parse(arry[i].markList[j].container).formattedZoom +
                "px",
              height:
                ((newrects[ind].height + 4) * that.formattedZoom) /
                  JSON.parse(arry[i].markList[j].container).formattedZoom +
                "px",
              backgroundColor: maskColor,
              opacity: 0.3,
            });
            maskEl.className =
              arry[i].markList[j].shortcutKey +
              arry[i].markList[j].x +
              "-" +
              arry[i].markList[j].y;
            this.$refs.maskContainer.append(maskEl);
          }
          // }
        }
      }
    },
    guanxi(item) {
      this.$emit("getgx", { item: item, addgxarry: this.addgxarry });
      document.getElementById("seachgxdiv").style.display = "none";
    },
    delbq(id) {
      let newarr = document.getElementsByClassName(id);
      for (var i = newarr.length - 1; i >= 0; i--) {
        newarr[i].parentNode.removeChild(newarr[i]); //全部删除
      }
    },
    handle_pdf_link: function (params) {
      var page = document.getElementById(String(params.pageNumber));
      page.scrollIntoView();
    },
    async getProjectInfo(prjId) {
      const resp = await request({ method: "GET", url: "/project/" + prjId });
      this.project = resp.data;
    },
    getPdf(row) {
      if (row != undefined) {
        this.getProjectInfo(row.projectId);
        this.doi = row.doi;

        this.resourceId = row.id;
        this.pdfshow = false;
        document.getElementById("pdfslt").innerHTML = "";
        this.pdftitle = row.title;
        var self = this;
        self.pdfdata = pdfvuer.createLoadingTask(
          row.url.startsWith("/profile") ? baseURL + row.url : row.url
        );
        self.pdfdata.then((pdf) => {
          console.log(pdf)
          submitRobotTask(row.doi, pdf, row.projectId);
          self.numPages = pdf.numPages;
          var pages = [];
          while (pages.length < pdf.numPages) pages.push(pages.length + 1);

          return Promise.all(
            pages.map(function (num) {
              // create a div for each page and build a small canvas for it
              var div1 = document.createElement("div");
              div1.id = "slt" + num;
              div1.onclick = function () {
                var page = document.getElementById(num);
                page.scrollIntoView();
              };
              document.getElementById("pdfslt").appendChild(div1);
              return pdf
                .getPage(num)
                .then(self.makeThumb)
                .then(function (canvas) {
                  div1.appendChild(canvas);
                  self.pdfshow = true;
                  self.$emit("showbq", true);
                  self.$forceUpdate();
                });
            })
          );
        });
      }
    },
    findPos(obj) {
      let xx = obj.getBoundingClientRect();
      if (xx) {
        return Math.abs(xx.top);
      }
    },

    stickyNav() {
      var sticky = document.getElementById("buttons").offsetTop;
      if (window.pageYOffset >= sticky) {
        document.getElementById("buttons").classList.remove("hidden");
      } else {
        document.getElementById("buttons").classList.add("hidden");
      }
    },

    changePage() {
      var self = this;
      var maint =
        self.findPos(document.getElementById(1)) +
        self.findPos(document.getElementById("leftgjl")) +
        10;
      var mainh = document.getElementById("1").offsetHeight;
      self.page = Math.ceil(maint / mainh);
      var divarry = document.getElementById("pdfslt").getElementsByTagName("div");
      for (let i = 0; i < divarry.length; i++) {
        divarry[i].classList.remove("pagehov");
      }
      document.getElementById("slt" + self.page).classList.add("pagehov");
      // document.getElementById('slt'+self.page).scrollIntoView();
    },
    makeThumb(page) {
      var vp = page.getViewport({ scale: 1 });
      var canvas = document.createElement("canvas");
      var scalesize = 0.2;
      canvas.width = vp.width * scalesize;
      canvas.height = vp.height * scalesize;
      canvas.className = "slt";
      var scale = Math.min(canvas.width / vp.width, canvas.height / vp.height);
      return page
        .render({
          canvasContext: canvas.getContext("2d"),
          viewport: page.getViewport({ scale: scale }),
        })
        .promise.then(function () {
          return canvas;
        });
    },
    createEventListener() {
      return (event) => {
        if (this.addgxarry.length == 2) {
          let checkobj = this.leftdata2.filter(
            (item) => item.shortcutKey.toUpperCase() == event.key.toUpperCase()
          )[0];
          if (checkobj && checkobj != undefined) {
            this.guanxi(checkobj);
          }
        } else {
          let checkobj = this.leftdata.filter(
            (item) => item.shortcutKey.toUpperCase() == event.key.toUpperCase()
          )[0];
          if (checkobj && checkobj != undefined) {
            this.biaozhu(checkobj);
          }
        }
      };
    },
    biaozhu(checkobj, tag, figure, sen) {
      console.log(checkobj);
      const container = document.getElementById("pdfvuer");
      const maskColor = checkobj.color;
      const hintBorderColor = checkobj.color;
      const hintBgColor = "#ffffff";
      const hintColor = "#333";
      const selection = window.getSelection();
      for (let i = 0; i < selection.rangeCount; i++) {
        console.log(selection)
        const range = selection.getRangeAt(i);
        const clientRects = range.getClientRects();
        const rects = clientRects.length == 0 ? this.rects : clientRects;
        // 增加提示
        const firstRect = rects[0];
        console.log(rects);
        const hintEl = document.createElement("div");
        if (tag) {
          hintEl.setAttribute("data-tag", tag);
        }
        if (figure) {
          hintEl.setAttribute("data-figure", figure);
        }
        Object.assign(hintEl.style, {
          position: "absolute",
          left: firstRect.x - container.getBoundingClientRect().left + "px",
          top: firstRect.y - container.getBoundingClientRect().top - 26 + "px",
          color: hintColor,
          borderRadius: "6px",
          padding: "5px 10px",
          backgroundColor: hintBgColor,
          border: "1px solid " + hintBorderColor,
          borderLeft: "5px solid " + hintBorderColor,
        });
        hintEl.innerHTML =
          '<span onclick=addgx("' +
          (checkobj.shortcutKey || "") +
          firstRect.x +
          "-" +
          firstRect.y +
          '",' +
          (firstRect.x - container.getBoundingClientRect().left) +
          "," +
          (firstRect.y - container.getBoundingClientRect().top) +
          ")>" +
          (selection.toString() != ""
            ? selection.toString().slice(0, 30)
            : this.bqname.slice(0, 30)) +
          "...</span>" +
          '<span onclick=delfont("' +
          (checkobj.shortcutKey || "") +
          firstRect.x +
          "-" +
          firstRect.y +
          '") class="gbclose">×</span>';
        hintEl.className = checkobj.shortcutKey + firstRect.x + "-" + firstRect.y;
        this.$refs.maskContainer.append(hintEl);
        this.$emit("getbz", {
          name: selection.toString() != "" ? selection.toString() : this.bqname,
          context: sen ? sen : this.context,
          doi: "",
          fId: checkobj.shortcutKey + firstRect.x + "-" + firstRect.y,
          shortcutKey: checkobj.shortcutKey,
          x: firstRect.x,
          y: firstRect.y,
          rects: JSON.stringify(rects),
          container: JSON.stringify({
            left: container.getBoundingClientRect().left,
            top: container.getBoundingClientRect().top,
            formattedZoom: this.formattedZoom,
          }),
          definitionId: checkobj.definitionId,
        });
        for (let rect of rects) {
          const maskEl = document.createElement("div");
          Object.assign(maskEl.style, {
            position: "absolute",
            left: rect.x - container.getBoundingClientRect().left + "px",
            top: rect.y - container.getBoundingClientRect().top + "px",
            width: rect.width + 4 + "px",
            height: rect.height + 4 + "px",
            backgroundColor: maskColor,
            opacity: 0.3,
          });
          maskEl.className = checkobj.shortcutKey + firstRect.x + "-" + firstRect.y;
          this.$refs.maskContainer.append(maskEl);
        }
      }
    },
    getRangeOfRobotOntology(sen, text) {
      const pdfEl = this.$refs.container;

      let words = sen.split(" ");
      let wordIdx = 0;

      const itor = document.createNodeIterator(pdfEl, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          const startIdx = wordIdx;
          while (
            wordIdx < words.length &&
            node.textContent.includes(words.slice(startIdx, wordIdx + 1).join(" "))
          ) {
            wordIdx++;
          }
          const found = wordIdx > startIdx;
          return found ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        },
      });

      const els = [];
      let n = itor.nextNode();
      while (n) {
        els.push(n.parentElement);
        n = itor.nextNode();
      }

      const elTexts = els.map((d) => d.textContent);
      const termRanges = indexOfTerm(elTexts, text);

      return termRanges.map(({ startTerm, startOffset, endTerm, endOffset }) => {
        const range = new Range();
        range.setStart(els[startTerm].firstChild, startOffset);
        range.setEnd(els[endTerm].firstChild, endOffset);
        return range;
      });

      function indexOfTerm(terms, searchText) {
        const fullTerm = terms.join(" ");
        const termStartIndexes = terms.map((_, i) => {
          return terms
            .slice(0, i)
            .map((d) => d.length + 1)
            .reduce((a, b) => a + b, 0);
        });
        const termIndexRanges = termStartIndexes.map((d, i) => [
          d,
          termStartIndexes[i + 1] - 1 || fullTerm.length - 1,
          i,
        ]);
        const resultIndexes = [];
        let start = fullTerm.indexOf(searchText);
        let end = Math.min(start + searchText.length, fullTerm.length - 1);
        while (start >= 0) {
          const startRange = termIndexRanges.find((r) => r[0] <= start && start <= r[1]);
          const endRange = termIndexRanges.find((r) => r[0] <= end && end <= r[1]);
          resultIndexes.push({
            startTerm: startRange[2],
            startOffset: start - startRange[0],
            endTerm: endRange[2],
            endOffset: end - endRange[0],
          });
          start = fullTerm.indexOf(searchText, end);
          end = Math.min(start + searchText.length, fullTerm.length - 1);
        }
        return resultIndexes;
      }
    },
    removeAllRobotAnno() {
      const pdfEl = this.$refs.container;
      for (const tagEl of pdfEl.querySelectorAll('[data-tag="robot"]')) {
        this.delbq(tagEl.className);
      }
      for (const ldItem of this.leftdata2) {
        ldItem.resourcesDefinRelationDefinListList = ldItem.resourcesDefinRelationDefinListList.filter(
          (d) => d.tag !== "robot"
        );
      }
    },

    drawScaled () {
      let pdfDomList = this.$refs.pdfDom
      pdfDomList.forEach(item => {
        item.drawScaled('page-width')
      })
    }
  },
};

async function submitRobotTask(doi, pdf, projectId) {
  try {
    const fulltext = await pdfDataToText(pdf);
    await request({
      url: "/robot/submit-task",
      method: "POST",
      data: {
        doi,
        fulltext,
        project_id: projectId,
      },
    });
  } catch (e) {
    console.error(e);
  }
}

async function pdfDataToText(pdf) {
  const lines = await Promise.all(
    new Array(pdf.numPages).fill(null).map(async (_, pageNumber) => {
      const page = await pdf.getPage(pageNumber + 1);
      const textContent = await page.getTextContent();
      return textContent.items.map((d) => d.str).join(" ");
    })
  );

  return lines.join("\r\n");
}
</script>
<style lang="scss">
#pdfvuer {
  position: relative;
  margin: 0 auto;
}
.pdfright {
  width: 200rem;
  background: #f9f9f9;
  overflow: auto;
  text-align: center;
  div {
    margin-top: 10rem;
    cursor: pointer;
  }
  .slt {
    border-radius: 8rem;
  }
  .slt:hover,
  .pagehov canvas {
    border: 5rem solid #575bca;
  }
}
.pdfleft {
  flex: 1;
  .pdftop {
    background: #fff;
    line-height: 80rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 20rem;
    color: #595959;
    padding: 15px;
    border-bottom: 1rem solid #979797;
    .pdfym {
      width: 160rem;
    }
    .pdfname {
      font-weight: bold;
      max-width: 600px;
      word-break: break-all;
    }
    .pdf_top_right{
      display: flex;
      align-items: center;
      .pdftopimg {
        cursor: pointer;
        width: 15px;
        height: 15px;
      }
      .pdfsf {
        width: 90rem;
        text-align: center;
        font-size: 18rem;
      }
    }
  }
  .pdfmain {
    display: flex;
    align-items: flex-start;
    height: calc(100% - 100px);
    .czlbg {
      background: #fff;
      width: 60rem;
      border-right: 1rem solid #979797;
      height: 100%;
      text-align: center;
      position: relative;
      .robot-switch {
        position: absolute;
        bottom: 140rem;
        left: 50%;
        margin-left: -20rem;
      }
      .duihao {
        width: 40rem;
        cursor: pointer;
        position: absolute;
        bottom: 10rem;
        left: 50%;
        margin-left: -20rem;
      }
      .zc {
        width: 50rem;
        cursor: pointer;
        position: absolute;
        bottom: 60rem;
        left: 50%;
        margin-left: -25rem;
      }
    }
    .pdfmaindiv {
      height: 100%;
      flex: 1;
      overflow: scroll;
      // .page {
      // }
    }
  }
  .gbclose {
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
  }
  .seachbq {
    position: absolute;
    z-index: 9999;
    left: 0;
    top: 0;
    background: #fff;
    max-height: 300px;
    overflow: auto;
    display: none;
    width: 200rem;
    border-radius: 8rem;
    box-shadow: 0px 0px 8px 2px rgba(201, 200, 208, 0.35);
    li {
      font-size: 12px;
      padding: 6px;
      cursor: pointer;
      span {
        border: 1px solid;
        height: 15px;
        display: inline-block;
        line-height: 15px;
        border-radius: 8px;
        margin-right: 10rem;
        padding: 3px 5px;
      }
    }
    li:hover {
      background: #f4f4f4;
    }
  }
}
</style>
