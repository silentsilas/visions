<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

html {
  height  : 100%;
  overflow: hidden;
  position: fixed;
}

body {
  overflow: hidden;
  height: 100%;
  position: fixed;
  margin: 0px;
  padding: 0px;
}
</style>
