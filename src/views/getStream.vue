<template>
  <div>
    <div>
      <div class="deviceInfo">
        <label>audioInput：</label>
        <el-select v-model="audioInputValue" size="mini" placeholder="请选择">
          <el-option
            v-for="item in audioInput"
            :key="item.deviceId"
            :label="item.label"
            :value="item.deviceId">
          </el-option>
        </el-select>
      </div>
      <div class="deviceInfo">
        <label>audioOutput：</label>
        <el-select v-model="audioOutputValue" size="mini" placeholder="请选择">
          <el-option
            v-for="item in audioOutput"
            :key="item.deviceId"
            :label="item.label"
            :value="item.deviceId">
          </el-option>
        </el-select>
      </div>
      <div class="deviceInfo">
        <label>videoInput：</label>
        <el-select v-model="videoInputValue" size="mini" placeholder="请选择">
          <el-option
            v-for="item in videoInput"
            :key="item.deviceId"
            :label="item.label"
            :value="item.deviceId">
          </el-option>
        </el-select>
      </div>
    </div>
    <div>
      <video ref="player" autoplay playsinline ></video>
      <div style="display: inline-block">{{videoMsg}}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'getStream',
  mounted() {
    this.getDevices();
    this.getUserMedia();
  },
  data() {
    return {
      audioInputValue: '',
      audioOutputValue: '',
      videoInputValue: '',
      audioInput: [],
      audioOutput: [],
      videoInput: [],
      videoStream: '',
      videoMsg: '',
    };
  },
  methods: {
    // 获取音视频设备信息
    getDevices() {
      navigator.mediaDevices.enumerateDevices().then((deviceInfos) => {
        deviceInfos.forEach((deviceInfo) => {
          if (deviceInfo.kind === 'audioinput') {
            this.audioInput.push(deviceInfo);
          } else if (deviceInfo.kind === 'audiooutput') {
            this.audioOutput.push(deviceInfo);
          } else if (deviceInfo.kind === 'videoinput') {
            this.videoInput.push(deviceInfo);
          }
        });
      });
    },
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
      navigator.mediaDevices.getUserMedia(MediaDevices).then((stream) => {
        // stream 流里面包含 视频轨和音频轨
        const videoTrack = stream.getVideoTracks()[0]; // 获取视频轨道
        this.videoMsg = videoTrack.getSettings();
        player.srcObject = stream;
      });
    },
  },

};
</script>

<style lang="scss">
.deviceInfo{
  margin: 10px;
  label{
    display: inline-block;
    width: 150px;
  }
}
</style>
