<template>
  <div class="relative">
    <Codemirror
      @update:model-value="(val) => emit('update:model-value', val)"
      :model-value="modelValue"
      :style="{ height: '100%' }"
      :indent-with-tab="true"
      :tab-size="2"
      :extensions="[javascript(), oneDark, basicSetup]"
    ></Codemirror>
  </div>
</template>

<script setup lang="ts">
// import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
// import "monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution.js";
import { Codemirror } from "vue-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import { basicSetup } from "codemirror";

defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: "update:model-value", value: string): void;
}>();
</script>

<style scoped></style>
