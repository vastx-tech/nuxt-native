<template>
  <NPage title="Details">
    <StackLayout style="padding: 20">
      <Label :text="`Item #${id}`" style="font-size: 18; font-weight: bold" />
      <Button text="Back" style="margin-top: 20" @tap="back" />
    </StackLayout>
  </NPage>
</template>

<script setup lang="ts">
const props = defineProps<{ id?: string }>()
const id = props.id ?? 'unknown'

const { back } = useNativeRouter()
</script>
