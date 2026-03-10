<script setup lang="ts">
import {
  computed,
  defineAsyncComponent,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from "vue";
import { defu } from "defu";
import { DebugShell } from "@bg-effects/debug-ui";
import { PrismRenderer } from "./engine/PrismEngine";
import { meta } from "./meta";
import type { PrismProps } from "./types";

const props = defineProps<
  PrismProps & {
    debug?: boolean;
    lang?: "zh-CN" | "en";
  }
>();

const ConfigContent = defineAsyncComponent(() => import("./ui/ConfigPanel.vue"));
const configContentRef = ref<any>(null);

const resolveInitialConfig = () => defu(props, meta.defaultConfig) as PrismProps;
const config = ref<PrismProps>(resolveInitialConfig());
const internalLang = ref<"zh-CN" | "en">(config.value.lang || "zh-CN");
const containerRef = ref<HTMLElement | null>(null);
let engine: PrismRenderer | null = null;

const engineInterface = computed(() => ({
  pause: () => engine?.pause(),
  resume: () => engine?.resume(),
  restart: () => engine?.restart(),
}));

const handleRandomize = () => {
  if (!meta.randomize) {
    return;
  }
  const currentTab = configContentRef.value?.activeTab as any;
  const tabValue =
    typeof currentTab === "object" && currentTab?.value
      ? currentTab.value
      : currentTab;
  const newConfig = meta.randomize(config.value, tabValue);
  config.value = {
    ...newConfig,
    debug: config.value.debug,
    lang: config.value.lang,
  };
};

watch(
  () => props,
  (newProps) => {
    if (!props.debug) {
      config.value = defu(newProps, meta.defaultConfig) as PrismProps;
    }
  },
  { deep: true },
);

watch(
  config,
  (newConfig) => {
    if (!engine) {
      return;
    }
    engine.updateConfig(newConfig);
  },
  { deep: true },
);

onMounted(() => {
  if (!containerRef.value) {
    return;
  }
  engine = new PrismRenderer(containerRef.value, config.value);
});

onUnmounted(() => {
  engine?.destroy();
  engine = null;
});
</script>

<template>
  <div ref="containerRef" class="prism-container absolute inset-0 z-0" :class="props.className">
    <DebugShell
      v-if="debug"
      v-model:config="config"
      v-model:lang="internalLang"
      :meta="meta"
      :engine="engineInterface"
      @randomize="handleRandomize"
    >
      <template #settings>
        <ConfigContent ref="configContentRef" v-model:config="config" :lang="internalLang" />
      </template>
    </DebugShell>
  </div>
</template>

<style scoped>
.prism-container canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
