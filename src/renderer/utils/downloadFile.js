const fs = require('fs')
const path = require('path')

export default function downloadVideo (fileurl, filename) {
    let _that = this;
    this.$http.defaults.timeout = 100 * 60 * 1000;
    // fileurl 为视频地址
    // this.$http({
    //     headers: {
    //         'Content-Type': 'video/mp4',
    //         'referer': fileurl,
    //         'host': fileurl
    //     },
    //     method: 'get',
    //     url: fileurl
    // }
    this.$http.get(
        fileurl, {
            responseType: 'blob',
            onDownloadProgress(progress) {
                //_that.downProgress = Math.round(progress.loaded / progress.total * 100) + '%'
            }
        }
    ).then(response => {
        let blob = response;
        if (typeof window.navigator.msSaveBlob !== 'undefined') {
            window.navigator.msSaveBlob(blob, filename)
        } else {
            let URL = window.URL || window.webkitURL
            // 使用获取到的blob对象创建的blobUrl
            const blobUrl = URL.createObjectURL(blob)

            const a = document.createElement('a')

            if (typeof a.download === 'undefined') {
                window.location = blobUrl
            } else {
                document.body.appendChild(a)
                a.style.display = 'none'
                a.href = blobUrl
                // 指定下载的文件名
                a.download = filename
                a.click()
                document.body.removeChild(a)
                // 移除blob对象的blobUrl
                URL.revokeObjectURL(blobUrl)
            }
        }
        

        // fs.writeFile(path.resolve(__dirname, '../../../download/test.mp4'), blob, { 'flag': 'a' }, (err) => {
        //     if (err) {
        //         throw err
        //     }
        //     console.log('download-success')
        // })
        this.downloading = false;
    }).catch((error) => {
        console.error(error)
        //throw error;
        //this.$message({
        //	showClose: true,
        //	message: '下载失败，请重试..',
        //	type: 'error'
        //});
        //this.downloading = false;
    })
}