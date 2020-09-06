<template>
  <div class="home">
    <Scene class="threejs" />
    <Footer />
  </div>
</template>

<script>
// @ is an alias to /src
import Scene from '@/components/Scene.vue';
import Footer from '@/components/Footer.vue';

export default {
  name: 'Home',
  components: {
    Scene, Footer,
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
