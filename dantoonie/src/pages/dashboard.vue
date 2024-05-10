<script lang="ts" setup>
import { useStore } from '@nanostores/vue'
import { $user } from "../store/user";

const user = useStore($user)
</script>

<template>
  {{ JSON.stringify(user) }}
</template>

<style scoped>

</style>