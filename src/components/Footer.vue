<template>
  <div class="footer">
    <a href="https://github.com/silentsilas/visions" target="_blank"><img src="@/assets/github-logo.png" class="logo" /></a>
     Built by <a href="https://silentsilas.com/" target="_blank">Silent Silas</a>
  </div>
</template>

<style lang="scss" scoped>
  .footer {
    position: absolute;
    bottom: 0px;
    left: 50%;
    height: 30px;
    transform: translateX(-50%);
    color: #efefef;
  }
  a {
    color: #333333;
    text-decoration: none;
    &:link {
      color: #333333;
    }
    &:visited {
      color: #333333;
    }
    &:hover {
      color: #EFEFEF;
    }
    &:active {
      color: #EFEFEF;
    }
  }

  .logo {
    max-height: 20px;
    margin-bottom: -5px;
  }
</style>
