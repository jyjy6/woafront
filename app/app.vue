<script setup lang="ts">
onNuxtReady(() => {
  const loginStore = useLoginStore();
  loginStore.loadUserFromLocalStorage();
});
</script>

<template>
  <NuxtLayout name="default">
    <NuxtPage />
  </NuxtLayout>
</template>
