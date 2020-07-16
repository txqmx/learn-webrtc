<template>
  <div style="margin: 20px">
    <el-form :inline="true">
      <el-form-item label="UserName">
        <el-input v-model="username"></el-input>
      </el-form-item>
      <el-form-item label="room">
        <el-input v-model="roomId"></el-input>
      </el-form-item>
      <el-form-item>
        <el-button @click="connect">Connect</el-button>
        <el-button @click="leave">Leave</el-button>
      </el-form-item>
    </el-form>
    <div class="content">
      <label>聊天: </label><br>
      <div v-html = 'output' class="output"></div>
      <el-input type="textarea"  v-model="input" rows="2"></el-input>
    </div>
    <div class="btn">
      <el-button type="success" @click="send">发送</el-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'dataChannel',
  data() {
    return {
      socket: '',
      btnConn: false,
      pc: '',
      state: '',
      username: '',
      roomId: '111111',
      input: '',
      output: ''
    };
  },
  methods: {
    // 创建信令连接，初始化socket
    connect(){
      this.socket = io.connect('http://0.0.0.0:80')

      this.socket.on('joined', (roomId, id) => {
        console.log('receive joined message:', roomId, id);
        this.state = 'joined'
        this.createPeerConnection()
      })
      this.socket.on('otherjoin', (roomId, id) => {
        console.log('receive otherjoin message:', roomId, id);
        if(this.state === 'joined_unbind'){
          this.createPeerConnection()
        }
        this.dc = this.pc.createDataChannel(this.roomId)
        this.dc.onmessage = this.dataChannelMsg;
        this.dc.onopen = this.dataChannelStateChange;
        this.dc.onclose = this.dataChannelStateChange;

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
      this.socket.emit('join', this.roomId)
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

        this.pc.ondatachannel = e => {
          if(!this.dc){
            this.dc = e.channel
            this.dc.onmessage = this.dataChannelMsg;
            this.dc.onopen = this.dataChannelStateChange;
            this.dc.onclose = this.dataChannelStateChange;
          }
        }
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
            // offerToReceiveAudio: 1,
            // offerToReceiveVideo: 1
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
    leave(){
      if(this.socket){
        this.socket.emit('leave', '111111')
      }
      this.closePeerConnection()
      this.btnConn = false
    },
    // dataChannel message事件
    dataChannelMsg(e){
      let msg = e.data;
      if(msg){
        this.output = `${this.output + msg}<br>`;
      }else{
        console.error('received msg is null');
      }
    },
    // dataChannel 状态改变
    dataChannelStateChange(){
      let readyState = this.dc.readyState;
      console.log('Send channel state is: ' + readyState);
    },
    // dataChannel 消息发送
    send(){
      const data = `${this.username}:${this.input}`;
      this.dc.send(data)
      this.output = `${this.output + data}<br>`;
      this.input = '';
    }
  },
};
</script>

<style scoped>
.content{
  display: inline-block;
  width: 500px;
}
.output{
  height: 117px;
  border: 1px solid #DCDFE6;
  border-radius: 4px;
  overflow: auto;
}
.btn{
  vertical-align: bottom;
  display: inline-block;
  margin-left: 10px;
}
</style>
