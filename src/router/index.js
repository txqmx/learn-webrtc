import Vue from 'vue';
import VueRouter from 'vue-router';
import getUserMedia from '../views/getStream.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'getStream',
    component: getUserMedia,
  },
  // 视频录制
  {
    path: '/videoRecord',
    name: 'videoRecord',
    component: () => import('../views/videoRecord.vue'),
  },
  // 截屏
  {
    path: '/screenShot',
    name: 'screenShot',
    component: () => import('../views/screenShot.vue'),
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
