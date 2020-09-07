<template>
  <div class="home">
    <div v-if="begun">
      <Tripping class="threejs" :bg="bg" :sounds="sounds" />
    </div>
    <div v-else class="container">
      <BeginModal :onBegin="begin" :loading="loading" />
    </div>
    <Footer />
  </div>
</template>

<script>
// @ is an alias to /src
import BeginModal from '@/components/BeginModal.vue';
import Tripping from '@/components/Tripping.vue';
import Footer from '@/components/Footer.vue';
import PromisedLoad from '@/utils/PromisedLoad';

export default {
  name: 'Home',
  components: {
    Tripping, Footer, BeginModal,
  },
  async mounted() {
    try {
      this.bg = await PromisedLoad.GetAudio('/bg/loop.wav');
      const soundPromises = [];
      for (let i = 1; i < 9; i += 1) {
        soundPromises.push(
          PromisedLoad.GetAudio(`/sfx/boop${i}.wav`),
        );
      }
      this.sounds = await Promise.all(soundPromises);
      this.loading = false;
    } catch (error) {
      console.error(error);
    }
  },
  methods: {
    begin() {
      this.begun = true;
    },
  },
  data() {
    return {
      loading: true,
      begun: false,
      bg: null,
      sounds: [],
    };
  },
};
</script>

<style scoped lang="scss">
  .threejs {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }
  .container {
    width: 100vw;
    height: 100vh;
    background-color: #000000;
  }
  .modal {
    color: #efefef;
    background-color: rgb(59, 59, 59);
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    padding-left: 20px;
    padding-right: 20px;
    padding-bottom: 12px;
  }
</style>
