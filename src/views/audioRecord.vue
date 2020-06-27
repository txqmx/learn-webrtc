<template>
  <div>
    <div>
      <el-button @click="getUserMedia">开始录制</el-button>
      <el-button @click="stopRecord">停止录制</el-button>
      <el-button @click="mediaPlay">播放</el-button>
      <el-button @click="downLoad">下载</el-button>
    </div>
    <audio autoplay controls ref='replay'></audio>
  </div>
</template>

<script>
export default {
  name: 'audioRecord',
  data() {
    return {
      audioBuffer: [],
      audioStream: '',
      mediaRecorder: '',
    };
  },
  methods: {
    // 音视频采集
    getUserMedia() {
      const MediaDevices = {
        video: false,
        audio: {
          noiseSuppression: true,
        },
      };
      navigator.mediaDevices.getUserMedia(MediaDevices).then((stream) => {
        // eslint-disable-next-line prefer-destructuring
        this.audioStream = stream;
        this.startRecord(this.audioStream);
      });
    },
    // 开始录制
    startRecord() {
      this.audioBuffer = [];
      const options = {
        mimeType: 'audio/webm',
      };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.error(`${options.mimeType} is not supported!`);
      }
      const mediaRecorder = new MediaRecorder(this.audioStream, options);
      this.mediaRecorder = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => {
        if (e && e.data && e.data.size > 0) {
          this.audioBuffer.push(e.data);
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
      const blob = new Blob(this.audioBuffer, { type: 'audio/mp3' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.style.display = 'none';
      a.download = 'aaa.mp3';
      a.click();
    },
    // 播放
    mediaPlay() {
      const { replay } = this.$refs;
      const blob = new Blob(this.audioBuffer, { type: 'audio/mp3' });
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
