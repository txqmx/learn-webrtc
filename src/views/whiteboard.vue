<template>
  <div>
    <div class="paleList">
      <ul>
        <li v-for="v in handleList" :key="v.type">
          <el-color-picker v-model="color" show-alpha v-if="v.type === 'color'" @change="colorChange"></el-color-picker>
          <el-button :disabled="v.type === 'cancel' ? allowHangup || allowCancel:
                            v.type === 'go' ? allowHangup || allowGo
                            :allowHangup"
                  @click="handleClick(v)"
                   size="mini"
                  v-if="!['color', 'lineWidth', 'polygon'].includes(v.type)"
          >
            {{v.name}}
          </el-button>
          <el-popover
            placement="top"
            width="400"
            trigger="click"
            v-if="v.type === 'polygon'"
          >
            <el-input-number v-model="sides" controls-position="right" @change="sidesChange" :min="3" :max="10"></el-input-number>
            <el-button size="mini" slot="reference" :disabled="allowHangup" @click="handleClick(v)" >{{v.name}}</el-button>
          </el-popover>
          <el-popover
            placement="top"
            width="400"
            trigger="click"
            v-if="v.type === 'lineWidth'"
          >
            <el-slider v-model="lineWidth" :max=20 @change="lineWidthChange"></el-slider>
            <el-button size="mini" slot="reference" :disabled="allowHangup">{{v.name}} <i>{{lineWidth + 'px'}}</i></el-button>
          </el-popover>
        </li>
      </ul>
    </div>
    <div class="content">
      <h2>白板:</h2>
      <canvas width="400" height="300" ref="canvas"></canvas>
    </div>
    <div class="content">
      <h2>视频:</h2>
      <video id="remotevideo" autoplay playsinline></video>
      <div class="btn">
        <el-button @click="call">call</el-button>
        <el-button @click="hangUp">hangUp</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import {Palette} from "../utils/palette";
export default {
  name: 'whiteboard',
  data() {
    return {
      localStream: '',
      remoteVideo: '',
      pc1: '',
      pc2: '',
      offer: '',
      answer: '',
      // 画板
      allowCall: true,
      allowHangup: true,
      handleList: [
        {name: '圆', type: 'arc'},
        {name: '线条', type: 'line'},
        {name: '矩形', type: 'rect'},
        {name: '多边形', type: 'polygon'},
        {name: '橡皮擦', type: 'eraser'},
        {name: '撤回', type: 'cancel'},
        {name: '前进', type: 'go'},
        {name: '清屏', type: 'clear'},
        {name: '线宽', type: 'lineWidth'},
        {name: '颜色', type: 'color'}
      ],
      color: 'rgba(0, 0, 0, 1)',
      currHandle: 'line',
      lineWidth: 5,
      palette: null, // 画板
      allowCancel: true,
      allowGo: true,
      sides: 3
    };
  },
  mounted() {
    this.localStream = this.$refs['canvas'].captureStream();
    this.remoteVideo = document.querySelector('#remotevideo');
  },
  methods: {
    call() {
      // 调用者
      this.pc1 = new RTCPeerConnection(); // 创建连接
      // 被调用者
      this.pc2 = new RTCPeerConnection();
      this.pc1.onicecandidate = (e) => { // 收集连接
        this.pc2.addIceCandidate(e.candidate); // 模拟信令交互
      };

      this.pc2.onicecandidate = (e) => {
        this.pc1.addIceCandidate(e.candidate);
      };
      // pc2 接收数据
      this.pc2.ontrack = (e) => {
        console.log(e);
        // eslint-disable-next-line prefer-destructuring
        this.remoteVideo.srcObject = e.streams[0];
        this.initPalette(); // 初始化画板
      };
      this.localStream.getTracks().forEach((track) => {
        this.pc1.addTrack(track, this.localStream);
      });
      // 媒体协商
      const offerOptions = {
        offerToRecieveAudio: 0,
        offerToRecieveVideo: 1,
        iceRestart:false
      };
      this.pc1.createOffer(offerOptions).then(this.getOffer);
      this.allowCall = true;
      this.allowHangup = false;
    },
    getOffer(desc) {
      this.pc1.setLocalDescription(desc);
      this.offer = desc.sdp
      this.pc2.setRemoteDescription(desc);
      this.pc2.createAnswer().then(this.getAnswer);
    },
    getAnswer(desc) {
      this.pc2.setLocalDescription(desc);
      this.answer = desc.sdp
      this.pc1.setRemoteDescription(desc);
    },
    hangUp() {
      this.pc1.close();
      this.pc2.close();
      this.pc1 = null;
      this.pc2 = null;
    },
    // 画板操作
    initPalette() {
      this.palette = new Palette(this.$refs['canvas'], {
        drawColor: this.color,
        drawType: this.currHandle,
        lineWidth: this.lineWidth,
        allowCallback: this.allowCallback
      });
    },
    allowCallback(cancel, go) {
      this.allowCancel = !cancel;
      this.allowGo = !go;
    },
    sidesChange() {
      this.palette.changeWay({sides: this.sides});
    },
    colorChange() {
      this.palette.changeWay({color: this.color});
    },
    lineWidthChange() {
      this.palette.changeWay({lineWidth: this.lineWidth});
    },
    handleClick(v) {
      if (['cancel', 'go', 'clear'].includes(v.type)) {
        this.palette[v.type]();
        return;
      }
      this.palette.changeWay({type: v.type});
      if (['color', 'lineWidth'].includes(v.type)) return;
      this.currHandle = v.type;
    },
  },
};
</script>

<style scoped lang="scss">
.paleList{
  margin-top: 20px;
  display: inline-block;
  li{
    list-style: none;
    text-decoration: none;
    margin: 10px;
  }
}
.content{
  margin-left: 50px;
  display: inline-block;
  canvas{
    border: 1px solid #000;
  }
  video{
    border: 1px solid #000;
    width: 400px;
    height: 300px;
  }
  .btn{
    display: inline-block;
    vertical-align: bottom;
    margin-left: 20px;
  }
}
</style>
