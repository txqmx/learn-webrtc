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
  {
    path: '/record',
    name: 'record',
    component: () => import(/* webpackChunkName: "about" */ '../views/videoRecord.vue'),
  },
];

const router = new VueRouter({
  routes,
});

export default router;
