<template>
    <div>
      <div>
        <label>UserName: </label>
        <el-input v-model="username"></el-input>
      </div>
      <div>
        <label>room: </label>
        <el-input v-model="roomId"></el-input>
        <el-button @click="connect">Connect</el-button>
        <el-button @click="leave">Leave</el-button>
      </div>
      <div>
        <label>Content: </label><br>
        <textarea disabled style="line-height: 1.5;" v-model="output" rows="10" cols="100"></textarea>
      </div>
      <div>
        <label>Input: </label><br>
        <textarea  v-model="input" rows="3" cols="100"></textarea>
        <button @click="send">Send</button>
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
        this.output = `${this.output + data}\r`;
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
      this.input = '';
    },
  },
};
</script>

<style scoped>

</style>
