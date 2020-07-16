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
  name: 'socket',
  data() {
    return {
      username: '',
      roomId: '',
      socket: '',
      input: '',
      output: '',
    };
  },
  methods: {
    connect() {
      // connect
      this.socket = io.connect('http://0.0.0.0:80');

      // recieve message
      this.socket.on('joined', (room, id) => {

      });

      this.socket.on('leaved', (room, id) => {
        this.socket.disconnect();
      });

      this.socket.on('message', (room, data) => {
        console.log(room, data);
        this.output = `${this.output + data}<br>`;
      });

      this.socket.on('disconnect', (socket) => {

      });

      // send message
      this.socket.emit('join', this.roomId);
    },
    leave() {
      this.socket.emit('leave', this.roomId);
    },
    send() {
      const data = `${this.username}:${this.input}`;
      this.socket.emit('message', this.roomId, data);
      this.output = `${this.output + data}<br>`;
      this.input = '';
    },
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
}
.btn{
  vertical-align: bottom;
  display: inline-block;
  margin-left: 10px;
}
</style>
