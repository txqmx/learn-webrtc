import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  // 获取视频流
  {
    path: '/getStream',
    name: 'getStream',
    component: () => import('../views/getStream.vue'),
  },
  // 视频录制
  {
    path: '/videoRecord',
    name: 'videoRecord',
    component: () => import('../views/videoRecord.vue'),
  },
  // 音频录制
  {
    path: '/audioRecord',
    name: 'audioRecord',
    component: () => import('../views/audioRecord.vue'),
  },
  // 屏幕录制
  {
    path: '/screenRecord',
    name: 'screenRecord',
    component: () => import('../views/screenRecord.vue'),
  },
  // 截屏
  {
    path: '/screenShot',
    name: 'screenShot',
    component: () => import('../views/screenShot.vue'),
  },
  // socket
  {
    path: '/socket',
    name: 'socket',
    component: () => import('../views/socket.vue'),
  },
  // 播放器
  {
    path: '/playerVideo',
    name: 'playerVideo',
    component: () => import('../views/playerVideo.vue'),
  },
  // p2p 远端
  {
    path: '/peerRemote',
    name: 'peerRemote',
    component: () => import('../views/peerRemote.vue'),
  },
  // p2p 本地
  {
    path: '/peerLocal',
    name: 'peerLocal',
    component: () => import('../views/peerLocal.vue'),
  },
  // datachennel 聊天
  {
    path: '/dataChannel',
    name: 'dataChannel',
    component: () => import('../views/dataChannel.vue'),
  },
];

const router = new VueRouter({
  routes,
});

export default router;
