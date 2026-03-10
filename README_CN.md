# @bg-effects/prism

[English](./README.md) | [简体中文](./README_CN.md)

基于 OGL 和 Vue 构建的高性能棱镜背景特效。

[在线演示](https://huangzida.github.io/prism/)

---

### 特性

- 🚀 **高性能**: 基于 OGL (轻量级 WebGL 库) 构建，运行流畅。
- 🎨 **高度可定制**: 支持几何参数、动画模式、辉光/噪声/泛光和运动控制。
- 🛠️ **调试模式**: 内置可视化调试面板，方便实时调整效果。
- 📦 **开箱即用**: 作为 Vue 组件，简单配置即可使用。

### 安装

```bash
pnpm add @bg-effects/prism ogl
```

> **注意**: `ogl` 是 peer dependency，需要手动安装。

### 使用

```vue
<script setup>
import { Prism } from '@bg-effects/prism'
</script>

<template>
  <div style="width: 100vw; height: 100vh; background: #000;">
    <Prism
      :height="3.5"
      :base-width="5.5"
      animation-type="rotate"
      :glow="1"
      :scale="3.6"
      :time-scale="0.5"
    />
  </div>
</template>
```

### 属性 (Props)

| 属性名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- |
| `height` | `number` | `3.5` | 棱镜高度 |
| `base-width` | `number` | `5.5` | 棱镜底边宽度 |
| `animation-type` | `'rotate' \| 'hover' \| '3drotate'` | `'rotate'` | 动画模式 |
| `glow` | `number` | `1` | 辉光强度 |
| `noise` | `number` | `0.05` | 噪声强度 |
| `scale` | `number` | `3.6` | 整体缩放 |
| `hue-shift` | `number` | `0` | 色相偏移（度） |
| `color-frequency` | `number` | `1` | 颜色震荡频率 |
| `hover-strength` | `number` | `2` | 悬停响应强度 |
| `inertia` | `number` | `0.05` | 悬停插值惯性 |
| `bloom` | `number` | `1` | 泛光强度 |
| `time-scale` | `number` | `0.5` | 动画时间缩放 |
| `offset-x` | `number` | `0` | X 方向像素偏移 |
| `offset-y` | `number` | `0` | Y 方向像素偏移 |
| `transparent` | `boolean` | `true` | 使用透明画布渲染 |
| `suspend-when-offscreen` | `boolean` | `false` | 离开视口时暂停渲染 |
| `debug` | `boolean` | `false` | 是否开启调试面板 |
| `lang` | `'zh-CN' \| 'en'` | `'zh-CN'` | 界面语言 |

### 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发环境
pnpm dev
```

### 许可

MIT
