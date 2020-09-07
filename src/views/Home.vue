<template>
  <div class="home">
    <div v-if="!begun" class="container">
      <div class="modal-container">
        <div class="modal noTouchie" style="top: 45%">
          <p>Hey man, you've been acting funny.<br />
            Are you sure you're alright?</p>
        </div>
        <div class="modal noTouchie" style="top: 55%;">
          <p>{{ loading ? "One sec, lemme check" : "Yeah probably, let's do this." }}</p>
        </div>
        <div class="clickReminder noTouchie">
          {{ loading ? `Loaded ${soundsLoaded}/9 thingies` : "plz click" }}
        </div>
      </div>
    </div>
    <div>
      <Tripping class="threejs" :bg="bg" :sounds="sounds" />
    </div>
    <Footer />
  </div>
</template>

<script>
// @ is an alias to /src
import { EventBus } from '@/utils/EventBus';
import Tripping from '@/components/Tripping.vue';
import Footer from '@/components/Footer.vue';
import PromisedLoad from '@/utils/PromisedLoad';

export default {
  name: 'Home',
  components: {
    Tripping, Footer,
  },
  async mounted() {
    EventBus.$on('clicked', () => {
      this.begun = true;
    });
    try {
      this.bg = await PromisedLoad.GetAudio('/bg/loop.wav');
      this.soundsLoaded += 1;

      const promises = [];
      for (let i = 1; i < 9; i += 1) {
        promises.push(
          PromisedLoad.GetAudio(`/sfx/boop${i}.wav`, () => {
            this.soundsLoaded += 1;
          }),
        );
      }
      this.sounds = await Promise.all(promises);
      EventBus.$emit('loaded', true);
      this.loading = false;
    } catch (error) {
      console.error(error);
    }
  },
  data() {
    return {
      loading: true,
      begun: false,
      bg: null,
      sounds: [],
      soundsLoaded: 0,
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
    position: absolute;
    left: 0px;
    top: 0px;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0,0,0, 0.7);
  }
  .modal {
    color: #efefef;
    background-color: rgba(0, 0, 0, 0.3);
    width: 300px;

    padding: 20px;
    margin-bottom: 20px;
  }
  .modal-container {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  .noTouchie {
    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
     -khtml-user-select: none; /* Konqueror HTML */
       -moz-user-select: none; /* Old versions of Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
            user-select: none;
  }
  .clickReminder {
    color: #efefef;
  }
</style>
