<template>
  <div>
    <el-row>
      <el-col :span="12">
        <h2>Local:</h2>
        <video id="localvideo" autoplay playsinline></video>
        <h2>Offer SDP</h2>
        <el-input
          type="textarea"
          :rows="10"
          placeholder="请输入内容"
          v-model="offer">
        </el-input>
      </el-col>
      <el-col :span="12">
        <h2>Remote:</h2>
        <video id="remotevideo" autoplay playsinline></video>
        <h2>Answer SDP</h2>
        <el-input
          type="textarea"
          :rows="10"
          placeholder="请输入内容"
          v-model="answer">
        </el-input>
      </el-col>
    </el-row>
    <div>
      <el-button @click="start">start</el-button>
      <el-button @click="call">call</el-button>
      <el-button @click="hangUp">hangUp</el-button>
    </div>
  </div>
</template>

<script>
  // const remoteVideo = document.querySelector('video#remotevideo');
  function handleError(err) {
    console.error('Failed to get Media Stream!', err);
  }
  export default {
    name: 'peerLocal',
    data() {
      return {
        localStream: '',
        localVideo: '',
        remoteVideo: '',
        pc1: '',
        pc2: '',
        offer: '',
        answer: ''
      };
    },
    mounted() {
      this.localVideo = document.querySelector('#localvideo');
      this.remoteVideo = document.querySelector('#remotevideo');
    },
    methods: {
      start() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.error('the getUserMedia is not supported');
        } else {
          const MediaDevices = {
            video: true,
            audio: false,
          };
          navigator.mediaDevices.getUserMedia(MediaDevices).then((stream) => {
            this.localVideo.srcObject = stream;
            this.localStream = stream;
          }).catch(handleError);
        }
      },
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
      },
      getOffer(desc) {
        this.pc1.setLocalDescription(desc);
        this.offer = desc.sdp
        // send desc to signal
        // receive desc from signal
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
    },
  };
</script>

<style scoped>

</style>
