import Vue from 'vue';
import VueRouter from 'vue-router';
import getUserMedia from '../views/getStream.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/getStream',
    name: 'getStream',
    component: getUserMedia,
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
  {
    path: '/peerConnection',
    name: 'peerConnection',
    component: () => import('../views/peerConnection.vue'),
  },
];

const router = new VueRouter({
  routes,
});

export default router;
