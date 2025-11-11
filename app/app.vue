<script setup lang="ts">
onNuxtReady(() => {
  const loginStore = useLoginStore();
  loginStore.loadUserFromLocalStorage();
});
</script>

<template>
  <NuxtPage />
</template>
