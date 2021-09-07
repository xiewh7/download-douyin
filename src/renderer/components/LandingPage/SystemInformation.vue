<template>
  <div style="height: 100%; width: 100%;">
    <!-- <div class="download-list">
      <div class="download-item" v-for="(item, index) in downloadList" :key="index">
        <img :src="item.videoImg">
        <div class="desc">{{item.desc}}</div>
        <div class="link">{{item.videoLink}}</div>
      </div>
    </div> -->
    <el-table
      ref="multipleTable"
      :data="downloadList"
      tooltip-effect="dark"
      style="width: 100%;"
      max-height="250"
      @selection-change="handleSelectionChange">
      <el-table-column
        type="selection"
        width="55">
      </el-table-column>
      <el-table-column
        prop="videoImg"
        label="视频图"
        width="120">
        <template slot-scope="scope">
          <img :src="scope.row.videoImg" style="height: 50px; width: 50px;"/>
        </template>
      </el-table-column>
      <el-table-column
        prop="desc"
        label="标题"
        show-overflow-tooltip>
      </el-table-column>
      <el-table-column
        prop="videoLink"
        label="地址"
        show-overflow-tooltip>
      </el-table-column>
      <el-table-column
        label="下载">
        <template slot-scope="scope">
          <el-button type="primary" @click="download(scope.row.videoLink, scope.row.desc)">下载</el-button>
        </template>
      </el-table-column>
    </el-table>
    <webview ref="webview" :src="webviewSrc" style="height: 100%; width: 100%" :preload="preloadPath"></webview>
  </div>
</template>

<script>
import {ipcRenderer} from 'electron'
const fs = require('fs')
const path = require('path')
  export default {
    data () {
      return {
        webviewSrc: 'https://www.douyin.com/',
        history: ['https://www.douyin.com/'],
        curIndex: 0,
        downloadList: [{
          desc:"英雄联盟S1总决赛，你还记得吗？#s9 #lol #英雄联盟",
          videoImg: 'https://p3-pc.douyinpic.com/tos-cn-p-0015/a92c310dd3e14b1892e0cd9cfedabdf6~tplv-dy-resize-origshort-autoq-75:330.jpeg?from=4257465056',
          videoLink: 'http://v26-web.douyinvod.com/89bc029baaee48dda1b55c7740f6f0d5/613730b8/video/m/220931d2782b9814c8585deaca9b19473441163f036c000014a629df9059/?a=6383&br=1062&bt=1062&cd=0%7C0%7C0&ch=11&cr=0&cs=0&cv=1&dr=0&ds=3&er=&ft=~MeSY~88-oU-DYlnh7TQPqeUfTusfrMNWy&l=202109071627080102090890953E00C51C&lr=all&mime_type=video_mp4&net=0&pl=0&qs=0&rc=M2VlNmgzOnI5cDMzOmkzM0ApODU5OjU7ZjxkNzw2ZGdpNGcwal5qb3Jmb21fLS0zLS9zczAzYmE2Yl42MmNfYl4vLi46Yw%3D%3D&vl=&vr='
        }],
        multipleSelection: [],
        keyword: '',
        index: 0
      }
    },
    watch: {
      curIndex (val) {
        this.$refs.webview.src = this.history[val]
      }
    },
    methods: {
      downloadSelect () {
        this.multipleSelection.forEach(item => {
          this.download(item.videoLink)
        })
      },
      download (url) {
        ipcRenderer.send('download', url)
        // this.$downloadVideo(url, 'test')
        // this.$http({
        //   method: 'get',
        //   url,
        //   responseType:'stream'
        // }).then(res => {
        //   res.data.pipe(fs.createWriteStream(path.resolve(__dirname, `../../../../download/${test}.mp4`)))
        // })
      },
      back () {
        if (this.curIndex) {
          this.curIndex--
        }
      },
      goOn () {
        if (this.curIndex < this.history.length - 1) {
          this.curIndex++
        }
      },
      toggleSelection(rows) {
        if (rows) {
          rows.forEach(row => {
            this.$refs.multipleTable.toggleRowSelection(row)
          });
        } else {
          this.$refs.multipleTable.clearSelection()
        }
      },
      handleSelectionChange(val) {
        this.multipleSelection = val
        console.warn('selection-change')
        console.warn(this.multipleSelection)
      }
    },
    async mounted () {
      await this.$nextTick()
      const that = this
      this.$refs.webview && this.$refs.webview.addEventListener('dom-ready', ()=> {
        this.$refs.webview.openDevTools()
      })
      this.$refs.webview && this.$refs.webview.addEventListener('new-window', (e) => {
        const { protocol } = require('url').parse(e.url)
        this.history.splice(this.curIndex+1, this.history.length - this.curIndex - 1, e.url)
        this.curIndex++
        console.warn(this.$refs.webview)
      })
      this.$refs.webview && this.$refs.webview.addEventListener('ipc-message', (e) => {
        const data = e.args[0].data
        this.keyword = e.args[0].global_doodle_config.keyword
        console.warn('search')
        console.warn(that.downloadList)
        this.downloadList = []
        that.downloadList.push(...data.map(item => ({
          videoImg: item.aweme_info.video.cover.url_list[0],
          desc: item.aweme_info.desc,
          videoLink: item.aweme_info.video.play_addr_lowbr.url_list[0]
        })))
        console.warn(that.downloadList)
      })
    }
  }
</script>
<style scoped>
  .title {
    color: #888;
    font-size: 18px;
    font-weight: initial;
    letter-spacing: .25px;
    margin-top: 10px;
  }

  .items { margin-top: 8px; }

  .item {
    display: flex;
    margin-bottom: 6px;
  }

  .item .name {
    color: #6a6a6a;
    margin-right: 6px;
  }

  .item .value {
    color: #35495e;
    font-weight: bold;
  }

  .download-list {
    /* position: fixed;
    top: 0px;
    right: 0px; */
    height: 200px;
    width: 1000px;
    color: white;
    background: rgba(0,0,0,0.8);
    max-height: 400px;
    overflow: scroll;
  }
  .download-item {
      display: flex;
      flex-flow: row;
      align-items: center;
  }
  .download-item img {
    height: 30px;
    width: 30px;
  }
  .desc {
    font-size: 14px;
    color: pink;
    width: 600px;
  }
  .link {
    max-width: 230px;
    overflow: scroll;
    height: 50px;
  }
</style>
