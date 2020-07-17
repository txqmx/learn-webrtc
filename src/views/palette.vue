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
      <div class="btn">
        <el-button @click="connect">call</el-button>
        <el-button @click="leave">Leave</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import {Palette} from "../utils/palette";
export default {
  name: 'palette',
  data() {
    return {
      socket: '',
      pc: '',
      dc: '',
      state: '',
      username: '',
      roomId: '111111',
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
  methods: {
    // 创建信令连接，初始化socket
    connect(){
      this.socket = io.connect('http://0.0.0.0:80')
      this.initPalette();
      this.allowCall = true;
      this.allowHangup = false;

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
        console.log(e.data);
        let [type, ...arr] = JSON.parse(e.data);
        // console.log('onmessage', type, arr);
        this.palette[type](...arr);
      }else{
        console.error('received msg is null');
      }
    },
    // dataChannel 状态改变
    dataChannelStateChange(){
      let readyState = this.dc.readyState;
      console.log('Send channel state is: ' + readyState);
    },

    // 画板操作
    initPalette() {
      this.palette = new Palette(this.$refs['canvas'], {
        drawColor: this.color,
        drawType: this.currHandle,
        lineWidth: this.lineWidth,
        allowCallback: this.allowCallback,
        moveCallback: this.moveCallback
      });
    },
    moveCallback(...arr) { // 同步到对方
      // console.log('moveCallback', arr);
      console.log(arr);
      if(this.dc){
        this.dc.send(JSON.stringify(arr));
      }
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
