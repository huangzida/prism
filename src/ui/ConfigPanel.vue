<script setup lang="ts">
import { computed, ref } from "vue";
import { SubTabs } from "@bg-effects/shared";
import en from "../locales/en.json";
import zhCN from "../locales/zh-CN.json";
import type { PrismProps } from "../types";

const props = defineProps<{
  config: PrismProps;
  lang?: "zh-CN" | "en";
}>();

const emit = defineEmits<{
  "update:config": [value: PrismProps];
}>();

const activeTab = ref("basic");

const updateConfig = (key: keyof PrismProps, value: any) => {
  emit("update:config", {
    ...props.config,
    [key]: value,
  });
};

defineExpose({
  activeTab,
});

const i18n = {
  "zh-CN": zhCN,
  en,
};

const t = (path: string) => {
  const dict = i18n[props.lang || "zh-CN"];
  return path.split(".").reduce((obj: any, key) => obj?.[key], dict) || path;
};

const subTabs = computed(() => [
  { id: "basic", label: t("tabs.basic") },
  { id: "motion", label: t("tabs.motion") },
  { id: "render", label: t("tabs.render") },
]);

</script>

<template>
  <div class="flex flex-col gap-6 text-white/90">
    <SubTabs v-model="activeTab" :tabs="subTabs" />
    <div class="flex flex-col gap-6 px-1 pointer-events-auto overflow-y-auto max-h-[400px] custom-scrollbar pr-2">
      <div v-if="activeTab === 'basic'" class="flex flex-col gap-6">
        <div v-for="prop in [
          { id: 'height', min: 1, max: 10, step: 0.1, label: 'height' },
          { id: 'baseWidth', min: 1, max: 10, step: 0.1, label: 'baseWidth' },
          { id: 'scale', min: 0.5, max: 10, step: 0.1, label: 'scale' },
          { id: 'hueShift', min: 0, max: 360, step: 1, label: 'hueShift', suffix: '°' },
          { id: 'colorFrequency', min: 0.1, max: 4, step: 0.1, label: 'colorFrequency' },
        ]" :key="prop.id" class="flex flex-col gap-3 group/item">
          <div class="flex justify-between items-center px-1">
            <label class="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 group-hover/item:text-white/40 transition-colors">
              {{ t(`labels.${prop.label}`) }}
            </label>
            <span class="text-[11px] font-black font-mono text-white/40 group-hover/item:text-blue-400 transition-colors">
              {{ ((config[prop.id as keyof PrismProps] as number) ?? 0).toFixed(prop.step < 1 ? 2 : 0) }}{{ prop.suffix || "" }}
            </span>
          </div>
          <input
            :value="config[prop.id as keyof PrismProps]"
            @input="(e: any) => updateConfig(prop.id as keyof PrismProps, Number(e.target.value))"
            type="range"
            :min="prop.min"
            :max="prop.max"
            :step="prop.step"
            class="w-full accent-blue-500 bg-white/5 hover:bg-white/10 h-1.5 rounded-full appearance-none cursor-pointer transition-all border border-white/5"
          />
        </div>
      </div>

      <div v-if="activeTab === 'motion'" class="flex flex-col gap-6">
        <div class="flex flex-col gap-3">
          <label class="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
            {{ t("labels.animationType") }}
          </label>
          <div class="grid grid-cols-3 gap-2">
            <button
              class="py-2 text-[9px] font-bold border rounded-lg transition-all shadow-sm cursor-pointer"
              :class="config.animationType === 'rotate' ? 'bg-blue-600 text-white border-blue-400/50 ring-1 ring-blue-400/30' : 'bg-white/[0.03] text-white/25 border-white/5 hover:bg-white/10'"
              @click="updateConfig('animationType', 'rotate')"
            >
              Rotate
            </button>
            <button
              class="py-2 text-[9px] font-bold border rounded-lg transition-all shadow-sm cursor-pointer"
              :class="config.animationType === 'hover' ? 'bg-blue-600 text-white border-blue-400/50 ring-1 ring-blue-400/30' : 'bg-white/[0.03] text-white/25 border-white/5 hover:bg-white/10'"
              @click="updateConfig('animationType', 'hover')"
            >
              Hover
            </button>
            <button
              class="py-2 text-[9px] font-bold border rounded-lg transition-all shadow-sm cursor-pointer"
              :class="config.animationType === '3drotate' ? 'bg-blue-600 text-white border-blue-400/50 ring-1 ring-blue-400/30' : 'bg-white/[0.03] text-white/25 border-white/5 hover:bg-white/10'"
              @click="updateConfig('animationType', '3drotate')"
            >
              3D Rotate
            </button>
          </div>
        </div>

        <div v-for="prop in [
          { id: 'hoverStrength', min: 0, max: 5, step: 0.1, label: 'hoverStrength' },
          { id: 'inertia', min: 0, max: 1, step: 0.01, label: 'inertia' },
          { id: 'timeScale', min: 0, max: 3, step: 0.05, label: 'timeScale' },
        ]" :key="prop.id" class="flex flex-col gap-3 group/item">
          <div class="flex justify-between items-center px-1">
            <label class="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 group-hover/item:text-white/40 transition-colors">
              {{ t(`labels.${prop.label}`) }}
            </label>
            <span class="text-[11px] font-black font-mono text-white/40 group-hover/item:text-blue-400 transition-colors">
              {{ ((config[prop.id as keyof PrismProps] as number) ?? 0).toFixed(prop.step < 0.1 ? 2 : 1) }}
            </span>
          </div>
          <input
            :value="config[prop.id as keyof PrismProps]"
            @input="(e: any) => updateConfig(prop.id as keyof PrismProps, Number(e.target.value))"
            type="range"
            :min="prop.min"
            :max="prop.max"
            :step="prop.step"
            class="w-full accent-blue-500 bg-white/5 hover:bg-white/10 h-1.5 rounded-full appearance-none cursor-pointer transition-all border border-white/5"
          />
        </div>
      </div>

      <div v-if="activeTab === 'render'" class="flex flex-col gap-6">
        <div v-for="prop in [
          { id: 'glow', min: 0, max: 3, step: 0.1, label: 'glow' },
          { id: 'noise', min: 0, max: 0.3, step: 0.01, label: 'noise' },
          { id: 'bloom', min: 0, max: 3, step: 0.1, label: 'bloom' },
          { id: 'offsetX', min: -400, max: 400, step: 1, label: 'offsetX' },
          { id: 'offsetY', min: -400, max: 400, step: 1, label: 'offsetY' },
        ]" :key="prop.id" class="flex flex-col gap-3 group/item">
          <div class="flex justify-between items-center px-1">
            <label class="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 group-hover/item:text-white/40 transition-colors">
              {{ t(`labels.${prop.label}`) }}
            </label>
            <span class="text-[11px] font-black font-mono text-white/40 group-hover/item:text-blue-400 transition-colors">
              {{ ((config[prop.id as keyof PrismProps] as number) ?? 0).toFixed(prop.step < 1 ? 2 : 0) }}
            </span>
          </div>
          <input
            :value="config[prop.id as keyof PrismProps]"
            @input="(e: any) => updateConfig(prop.id as keyof PrismProps, Number(e.target.value))"
            type="range"
            :min="prop.min"
            :max="prop.max"
            :step="prop.step"
            class="w-full accent-blue-500 bg-white/5 hover:bg-white/10 h-1.5 rounded-full appearance-none cursor-pointer transition-all border border-white/5"
          />
        </div>

        <label class="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
          <span>{{ t("labels.transparent") }}</span>
          <input
            :checked="config.transparent !== false"
            type="checkbox"
            class="accent-blue-500"
            @change="(e: any) => updateConfig('transparent', !!e.target.checked)"
          >
        </label>
        <label class="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
          <span>{{ t("labels.suspendWhenOffscreen") }}</span>
          <input
            :checked="config.suspendWhenOffscreen === true"
            type="checkbox"
            class="accent-blue-500"
            @change="(e: any) => updateConfig('suspendWhenOffscreen', !!e.target.checked)"
          >
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
