<template>
    <div>
      <el-row>
        <el-col :span="12">
          <h2>Local:</h2>
          <video id="localvideo" autoplay playsinline></video>
        </el-col>
        <el-col :span="12">
          <h2>Remote:</h2>
          <video id="remotevideo" autoplay playsinline></video>
        </el-col>
      </el-row>
      <div>
        <el-button :disabled="btnConn" @click="connSignalServer">connSignalServer</el-button>
        <el-button :disabled="!btnConn" @click="leave">Leave</el-button>
      </div>
    </div>
</template>

<script>
// const remoteVideo = document.querySelector('video#remotevideo');
function handleError(err) {
  console.error('Failed to get Media Stream!', err);
}
export default {
  name: 'peerRemote',
  data() {
    return {
      localStream: '',
      localVideo: '',
      remoteVideo: '',
      socket: '',
      btnConn: false,
      pc: '',
      state: '',
      roomId: '111111'
    };
  },
  mounted() {
    this.localVideo = document.querySelector('#localvideo');
    this.remoteVideo = document.querySelector('#remotevideo');
  },
  methods: {
    connSignalServer(){
      this.start()
    },
    start() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('the getUserMedia is not supported');
      } else {
        const MediaDevices = {
          video: {
            width: 320,
            height: 240,
          },
          audio: false,
        };
        navigator.mediaDevices.getUserMedia(MediaDevices).then((stream) => {
          this.localVideo.srcObject = stream;
          this.localStream = stream;

          this.conn()
        }).catch(handleError);
      }
    },
    // 创建信令连接，初始化socket
    conn(){
      this.socket = io.connect('http://0.0.0.0:80')

      this.socket.on('joined', (roomId, id) => {
        console.log('receive joined message:', roomId, id);
        this.state = 'joined'

        this.createPeerConnection()
        this.btnConn = true
        console.log('state', this.state);
      })
      this.socket.on('otherjoin', (roomId, id) => {
        console.log('receive otherjoin message:', roomId, id);
        if(this.state === 'joined_unbind'){
          this.createPeerConnection()
        }
        this.state = 'joined_conn'
        // 媒体协商
        this.call()
        console.log('state', this.state);
      })
      this.socket.on('full', (roomId, id) => {
        console.log('receive full message:', roomId, id);
        this.state = 'leaved'
        console.log('state', this.state);
        this.socket.disconnect()
        alert('the room is full')
        this.btnConn = false
      })
      this.socket.on('leaved', (roomId, id) => {
        console.log('receive leaved message:', roomId, id);

        this.state = 'leaved'
        console.log('state', this.state);
        this.socket.disconnect()
        this.btnConn = false
      })
      this.socket.on('bye', (roomId, id) => {
        console.log('receive bye message:', roomId, id);

        this.state = 'joined_unbind'
        this.closePeerConnection()
        console.log('state', this.state);
      })
      this.socket.on('message', (roomId, data) => {
        console.log('receive client message:', roomId, data);
        // 媒体协商
        if(data){
          if(data.type === 'offer'){
            this.pc.setRemoteDescription(new RTCSessionDescription(data))
            this.pc.createAnswer().then(this.getAnswer)
          }else if(data.type === 'answer'){
            this.pc.setRemoteDescription(new RTCSessionDescription(data))
          }else if(data.type === 'candidate'){
            let candidate = new RTCIceCandidate(data.candidate)
            this.pc.addIceCandidate(candidate)
          }else{
            console.error('this message is invalid')
          }
        }
      })
      this.socket.emit('join', '111111')
    },
    createPeerConnection(){
      console.log('create RTCPeerConnection');
      if(!this.pc){
        let pcConfig = {
          // 'iceServers': [{
          //   'urls': 'turn:stun.al.learningrtc.cn:3478',
          //   'credential': "mypasswd",
          //   'username': "garrylea"
          // }]
        };
        this.pc = new RTCPeerConnection()

        // 监听ICE候选信息 如果收集到，就发送给对方
        this.pc.onicecandidate = e => {
          if(e.candidate){
            console.log('find an new candidate');
            this.sendMessage(this.roomId, {
              type: 'candidate',
              candidate: e.candidate
            })
          }
        }
        this.pc.ontrack = e => {
          this.remoteVideo.srcObject = e.streams[0];
        }
      }
      // 添加本地流
      if(this.localStream){
        this.localStream.getTracks().forEach(track => {
          this.pc.addTrack(track, this.localStream)
        })
      }
    },
    // 关闭PeerConnection
    closePeerConnection(){
      console.log('close RTCPeerConnection');
      if(this.pc){
        this.pc.close()
        this.pc = null
      }
    },
    call(){
      if(this.state === 'joined_conn'){
        if(this.pc){
          let options = {
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1
          }
          this.pc.createOffer(options).then(this.getOffer)
        }
      }
    },
    getOffer(desc){
      this.pc.setLocalDescription(desc)
      this.sendMessage(this.roomId, desc)
    },
    getAnswer(desc){
      this.pc.setLocalDescription(desc)
      this.sendMessage(this.roomId, desc)
    },
    sendMessage(roomId, data){
      console.log('send p2p message');
      if(this.socket){
        this.socket.emit('message', roomId, data)
      }
    },
    // 关闭媒体视频
    closeLocalMedia(){
      if(this.localStream && this.localStream.getTracks()){
        this.localStream.getTracks().forEach(track => {
          track.stop()
        })
      }
      this.localStream = null
    },
    leave(){
      if(this.socket){
        this.socket.emit('leave', '111111')
      }
      this.closePeerConnection()
      this.closeLocalMedia()
      this.btnConn = false
    }
  },
};
</script>

<style scoped>

</style>
