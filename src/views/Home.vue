<template>
  <div class="home">
    <IntroScene class="threejs" />
  </div>
</template>

<script>
// @ is an alias to /src
import IntroScene from '@/components/IntroScene.vue';

export default {
  name: 'Home',
  components: {
    IntroScene,
  },
};
</script>

<style scoped lang="scss">
  .threejs {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }
</style>
