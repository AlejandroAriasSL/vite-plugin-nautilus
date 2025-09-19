## vite-plugin-nautilus

Vite plugin for nautilus framework integration with vite

## Installation

```bash
npm install --save-dev vite-plugin-nautilus
```

## Example

```ts
import { defineConfig } from "vite";
import nautilus from "vite-plugin-nautilus";

export default defineConfig({
  plugins: [nautilus()]
    // your vite settings...
})
```