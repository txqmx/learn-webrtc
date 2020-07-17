<template>
  <div id="app">
    <div id="nav">
      <router-link to="/getStream">音视频获取</router-link> |
      <router-link to="/screenShot">截屏</router-link> |
      <router-link to="/videoRecord">视频录制</router-link> |
      <router-link to="/audioRecord">音频录制</router-link> |
      <router-link to="/screenRecord">屏幕录制</router-link> |
      <router-link to="/socket">socket实时聊天</router-link> |
      <router-link to="/playerVideo">播放器video.js</router-link>|
      <router-link to="/peerLocal">peer 本地视频</router-link>|
      <router-link to="/peerRemote">peer 远端视频</router-link>|
      <router-link to="/dataChannel">peer 实时聊天</router-link>|
      <router-link to="/whiteboard">本地白板</router-link>|
      <router-link to="/palette">远端白板</router-link>
    </div>
    <router-view/>
  </div>
</template>

<style lang="scss">

</style>
