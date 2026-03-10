# @bg-effects/prism

[English](./README.md) | [简体中文](./README_CN.md)

A high-performance prism background effect built with OGL and Vue.

[Live Demo](https://huangzida.github.io/prism/)

---

### Features

- 🚀 **High Performance**: Built with OGL (a lightweight WebGL library) for smooth rendering.
- 🎨 **Highly Customizable**: Supports geometric parameters, animation modes, glow/noise/bloom, and motion controls.
- 🛠️ **Debug Mode**: Built-in visual debug panel for real-time adjustments.
- 📦 **Ready to Use**: Easy-to-use Vue component with simple configuration.

### Installation

```bash
pnpm add @bg-effects/prism ogl
```

> **Note**: `ogl` is a peer dependency and needs to be installed manually.

### Usage

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

### Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `height` | `number` | `3.5` | Prism height |
| `base-width` | `number` | `5.5` | Prism base width |
| `animation-type` | `'rotate' \| 'hover' \| '3drotate'` | `'rotate'` | Animation mode |
| `glow` | `number` | `1` | Glow intensity |
| `noise` | `number` | `0.05` | Noise amount |
| `scale` | `number` | `3.6` | Overall scale |
| `hue-shift` | `number` | `0` | Hue shift in degrees |
| `color-frequency` | `number` | `1` | Color oscillation frequency |
| `hover-strength` | `number` | `2` | Hover response strength |
| `inertia` | `number` | `0.05` | Hover interpolation inertia |
| `bloom` | `number` | `1` | Bloom strength |
| `time-scale` | `number` | `0.5` | Animation time scale |
| `offset-x` | `number` | `0` | Horizontal offset in pixels |
| `offset-y` | `number` | `0` | Vertical offset in pixels |
| `transparent` | `boolean` | `true` | Render with transparent canvas |
| `suspend-when-offscreen` | `boolean` | `false` | Pause rendering when offscreen |
| `debug` | `boolean` | `false` | Enable debug panel |
| `lang` | `'zh-CN' \| 'en'` | `'zh-CN'` | UI language |

### Local Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### License

MIT
