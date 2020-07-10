const http = require('http');

// socket.io
const socketIo = require('socket.io');

const USERCONST= 3

// http server
const app = http.createServer((res) => {});
app.listen(80, '0.0.0.0');

const io = socketIo.listen(app);

// connection
io.sockets.on('connection', (socket)=>{

  socket.on('message', (room, data)=>{
    socket.to(room).emit('message', room, data)//房间内所有人,除自己外
  });

  //该函数应该加锁
  socket.on('join', (room)=> {
    socket.join(room);
    let myRoom = io.sockets.adapter.rooms[room];
    let users = myRoom? Object.keys(myRoom.sockets).length : 0;
    console.log('the number of user in room is: ' + users);

    //在这里可以控制进入房间的人数,现在一个房间最多 2个人
    //为了便于客户端控制，如果是多人的话，应该将目前房间里
    //人的个数当做数据下发下去。
    if(users < USERCONST) {
      socket.emit('joined', room, socket.id);
      if (users > 1) {
        socket.to(room).emit('otherjoin', room);//除自己之外  2980.85
      }
    }else {
      socket.leave(room);
      socket.emit('full', room, socket.id);
    }
    //socket.to(room).emit('joined', room, socket.id);//除自己之外
    //io.in(room).emit('joined', room, socket.id)//房间内所有人
    //socket.broadcast.emit('joined', room, socket.id);//除自己，全部站点
  });

  socket.on('leave', (room)=> {
    let myRoom = io.sockets.adapter.rooms[room];
    let users = Object.keys(myRoom.sockets).length;
    //users - 1;

    console.log('the number of user in room is: ' + (users-1));

    socket.leave(room);
    socket.to(room).emit('bye', room, socket.id)//房间内所有人,除自己外
    socket.emit('leaved', room, socket.id);
    //socket.to(room).emit('joined', room, socket.id);//除自己之外
    //io.in(room).emit('joined', room, socket.id)//房间内所有人
    //socket.broadcast.emit('joined', room, socket.id);//除自己，全部站点
  });

});
