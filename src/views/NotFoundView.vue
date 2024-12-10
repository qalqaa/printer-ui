<template>
  <div class="flex justify-content-center align-items-center container">
    <div class="error-box flex flex-column gap-2">
      <div class="flex gap-2">
        <h2 class="title">Error 404</h2>
        <img width="50" src="/warrning.svg" alt="warning-icon" />
      </div>
      <p>Oops... Page not found</p>
      <button @click="$router.push('/')">Go to home, kid</button>
    </div>
  </div>
</template>

<style scoped>
.container {
  height: 85vh;
}
.title {
  margin: 0;
  line-height: 1;
  font-size: 50px;
}

p {
  font-size: 16px;
}

.error-box {
  background: rgb(28, 219, 99);
  padding: 100px;
  background: radial-gradient(rgba(13, 98, 44, 0.444) 0%, rgba(6, 52, 23, 0) 50%);
}
</style>
