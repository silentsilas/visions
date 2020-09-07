<template>
  <div class="footer">
    <a href="https://github.com/silentsilas/visions" target="_blank"><img src="@/assets/github-logo.png" class="logo" /></a>
     Built by <a href="https://silentsilas.com/" target="_blank">Silent Silas</a><br />
     Sound design by <a href="https://github.com/notchris" target="_blank">notchris</a>
  </div>
</template>

<style lang="scss" scoped>
  .footer {
    position: absolute;
    bottom: 0px;
    left: 50%;
    height: 50px;
    width: 100vw;
    transform: translateX(-50%);
    color: #efefef;
  }
  a {
    color: #33ac14;
    text-decoration: none;
    &:link {
      color: #efefef;
    }
    &:visited {
      color: #efefef;
    }
    &:hover {
      color: #33ac14;
    }
    &:active {
      color: #33ac14;
    }
  }

  .logo {
    max-height: 20px;
    margin-bottom: -5px;
  }
</style>
