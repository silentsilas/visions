<template>
  <div class="modal">
    <p>Hey man, you've been acting funny.<br />
      Are you sure you're alright?</p>
    <a href="#" class="button disabled"
      @click.prevent="begin">{{ loading ? "Lemme check" : "Yeah I'm cool." }}</a>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

const BeginModalProps = Vue.extend({
  props: {
    loading: Boolean,
    onBegin: Function,
  },
});

@Component
export default class BeginModal extends BeginModalProps {
  begin() {
    if (this.onBegin) {
      this.onBegin();
    }
  }
}
</script>

<style lang="scss" scoped>
  .button.disabled {
    color: #efefef;
  }
</style>
