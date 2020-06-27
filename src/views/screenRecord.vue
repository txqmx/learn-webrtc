<template>
  <div>
    <div>
      <video ref="player" autoplay playsinline></video>
      <el-button @click="startRecord">开始录制</el-button>{{videoBuffer.length}}
      <el-button @click="stopRecord">停止录制</el-button>
      <el-button @click="mediaPlay">播放</el-button>
      <el-button @click="downLoad">下载</el-button>
    </div>
    <video playsinline ref="replay"></video>
  </div>
</template>

<script>
export default {
  name: 'screenRecord',
  mounted() {
    this.getUserMedia();
  },
  data() {
    return {
      videoBuffer: [],
      stream: '',
      mediaRecorder: '',
    };
  },
  methods: {
    // 音视频采集
    getUserMedia() {
      const MediaDevices = { // 对音视频限制
        // video: true,
        video: {
          width: 320,
          height: 240,
          frameRate: 18,
        },
        audio: {
          noiseSuppression: true,
        },
      };
      const { player } = this.$refs;
      navigator.mediaDevices.getDisplayMedia(MediaDevices).then((stream) => {
        this.stream = stream;
        player.srcObject = stream;
      });
    },
    // 开始录制
    startRecord() {
      this.videoBuffer = [];
      const options = {
        mimeType: 'video/webm;codecs=vp8',
      };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.error(`${options.mimeType} is not supported!`);
      }
      const mediaRecorder = new MediaRecorder(this.stream, options);
      this.mediaRecorder = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => {
        if (e && e.data && e.data.size > 0) {
          this.videoBuffer.push(e.data);
        }
      };
      mediaRecorder.start(10);
    },
    // 停止录制
    stopRecord() {
      this.mediaRecorder.stop();
    },
    // 下载
    downLoad() {
      const blob = new Blob(this.videoBuffer, { type: 'video/webm' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.style.display = 'none';
      a.download = 'aaa.webm';
      a.click();
    },
    // 播放
    mediaPlay() {
      const { replay } = this.$refs;
      const blob = new Blob(this.videoBuffer, { type: 'video/webm' });
      replay.src = window.URL.createObjectURL(blob);
      replay.srcObject = null;
      replay.controls = true;
      replay.play();
    },
  },

};
</script>

<style lang="scss">

</style>
