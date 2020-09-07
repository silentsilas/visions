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
  width: 100%;
  margin: 0px;
  padding: 0px;
}

a.button{
  display:inline-block;
  padding:0.35em 1.2em;
  border:0.1em solid #FFFFFF;
  margin:0 0.3em 0.3em 0;
  border-radius:0.12em;
  box-sizing: border-box;
  text-decoration:none;
  font-family:'Roboto',sans-serif;
  font-weight:300;
  color:#FFFFFF;
  text-align:center;
  transition: all 0.2s;
}
a.button:hover{
  color:#000000;
  background-color:#FFFFFF;
}
@media all and (max-width:30em){
  a.button{
    display:block;
    margin:0.4em auto;
  }
}
</style>
