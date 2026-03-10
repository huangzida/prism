import { rand } from "@bg-effects/shared";
import type { EffectMeta } from "@bg-effects/core";
import type { PrismProps } from "./types";

export const meta: EffectMeta<PrismProps> = {
  id: "prism",
  name: {
    en: "Prism",
    "zh-CN": "棱镜",
  },
  category: "abstract",
  version: "1.0.0",
  defaultConfig: {
    debug: false,
    lang: "zh-CN",
    height: 3.5,
    baseWidth: 5.5,
    animationType: "rotate",
    glow: 1,
    offsetX: 0,
    offsetY: 0,
    noise: 0.05,
    transparent: true,
    scale: 3.6,
    hueShift: 0,
    colorFrequency: 1,
    hoverStrength: 2,
    inertia: 0.05,
    bloom: 1,
    suspendWhenOffscreen: false,
    timeScale: 0.5,
  },
  randomize: (current, tab) => {
    const result = { ...current };

    if (!tab) {
      result.height = rand(1, 8);
      result.baseWidth = rand(2, 9);
      result.animationType = ["rotate", "hover", "3drotate"][
        Math.floor(Math.random() * 3)
      ] as PrismProps["animationType"];
      result.glow = rand(0.3, 2.5);
      result.noise = rand(0, 0.2);
      result.scale = rand(1, 8);
      result.hueShift = rand(0, 360);
      result.colorFrequency = rand(0.2, 3);
      result.hoverStrength = rand(0.5, 3.5);
      result.inertia = rand(0.01, 0.3);
      result.bloom = rand(0.2, 2.5);
      result.timeScale = rand(0, 2);
      result.offsetX = rand(-300, 300);
      result.offsetY = rand(-300, 300);
      return result;
    }

    if (tab === "basic") {
      result.height = rand(1, 8);
      result.baseWidth = rand(2, 9);
      result.scale = rand(1, 8);
      result.hueShift = rand(0, 360);
      result.colorFrequency = rand(0.2, 3);
      return result;
    }

    if (tab === "motion") {
      result.animationType = ["rotate", "hover", "3drotate"][
        Math.floor(Math.random() * 3)
      ] as PrismProps["animationType"];
      result.hoverStrength = rand(0.5, 3.5);
      result.inertia = rand(0.01, 0.3);
      result.timeScale = rand(0, 2);
      return result;
    }

    if (tab === "render") {
      result.glow = rand(0.3, 2.5);
      result.noise = rand(0, 0.2);
      result.bloom = rand(0.2, 2.5);
      result.offsetX = rand(-300, 300);
      result.offsetY = rand(-300, 300);
      return result;
    }

    return result;
  },
  presets: [
    {
      id: "prism_default",
      name: { en: "Default Prism", "zh-CN": "默认棱镜" },
      config: {
        height: 3.5,
        baseWidth: 5.5,
        animationType: "rotate",
        glow: 1,
        offsetX: 0,
        offsetY: 0,
        noise: 0.05,
        transparent: true,
        scale: 3.6,
        hueShift: 0,
        colorFrequency: 1,
        hoverStrength: 2,
        inertia: 0.05,
        bloom: 1,
        suspendWhenOffscreen: false,
        timeScale: 0.5,
      },
    },
    {
      id: "prism_hover",
      name: { en: "Hover Crystal", "zh-CN": "悬浮晶体" },
      config: {
        height: 4.8,
        baseWidth: 6.2,
        animationType: "hover",
        glow: 1.6,
        noise: 0.02,
        scale: 4.5,
        hueShift: 40,
        colorFrequency: 1.8,
        hoverStrength: 2.8,
        inertia: 0.08,
        bloom: 1.5,
        timeScale: 0.4,
      },
    },
    {
      id: "prism_spin",
      name: { en: "Nebula Spin", "zh-CN": "星云旋转" },
      config: {
        height: 5.2,
        baseWidth: 4.6,
        animationType: "3drotate",
        glow: 1.2,
        noise: 0.09,
        scale: 3.2,
        hueShift: 220,
        colorFrequency: 2.2,
        hoverStrength: 1.5,
        inertia: 0.05,
        bloom: 1.8,
        timeScale: 1.1,
      },
    },
  ],
};
