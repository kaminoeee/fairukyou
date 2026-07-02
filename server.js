const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: "*" }
});

app.use(express.static('public')); // クライアント側のファイルを配置するフォルダ

io.on('connection', (socket) => {
  console.log('ユーザーが接続しました:', socket.id);

  // 部屋に入室
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`ユーザー ${socket.id} が部屋 ${roomId} に入室しました`);

    // 部屋にいる他のユーザーに、新しいユーザーが来たことを通知
    socket.to(roomId).emit('user-connected', socket.id);
  });

  // WebRTCのシグナリングデータ（SDPやIceCandidate）を転送
  socket.on('signal', (data) => {
    // data.to（送信相手のID）に向けてデータを転送
    io.to(data.to).emit('signal', {
      sender: socket.id,
      signal: data.signal
    });
  });

  socket.on('disconnect', () => {
    console.log('ユーザーが切断しました:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
