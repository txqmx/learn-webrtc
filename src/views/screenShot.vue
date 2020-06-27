<template>
  <div>
    <div>
      <video :class="filterValue" id="player" autoplay playsinline></video>
      <el-select v-model="filterValue" size="mini" placeholder="选择滤镜">
        <el-option
          v-for="item in filterList"
          :key="item"
          :label="item"
          :value="item">
        </el-option>
      </el-select>
      <el-button @click="screenShot">截取</el-button>
    </div>
    <div>
      <canvas :class="picFilter" :width="width" :height="height" id="picture"></canvas>
    </div>
  </div>
</template>

<script>
export default {
  name: 'screenShot',
  mounted() {
    this.getUserMedia();
    this.videoPlay = document.querySelector('video#player');
    this.picture = document.querySelector('canvas#picture');
  },
  data() {
    return {
      videoPlay: '',
      picture: '',
      stream: '',
      width: 320,
      height: 240,
      // 滤镜
      filterValue: '',
      picFilter: '',
      filterList: ['none', 'blur', 'grayscale', 'invert', 'sepia'],
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
        audio: false,
      };
      navigator.mediaDevices.getUserMedia(MediaDevices).then((stream) => {
        this.stream = stream;
        this.videoPlay.srcObject = stream;
      });
    },
    // 截取图片
    screenShot() {
      this.picFilter = this.filterValue;
      this.picture.getContext('2d').drawImage(this.videoPlay, 0, 0, this.width, this.height);
    },
  },

};
</script>

<style lang="scss">
.none {
  -webkit-filter: none;
}

.blur {
  -webkit-filter: blur(3px);
}

.grayscale {
  -webkit-filter: grayscale(1);
}

.invert {
  -webkit-filter: invert(1);
}

.sepia {
  -webkit-filter: sepia(1);
}
</style>
