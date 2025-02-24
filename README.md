# Datenel

**Datenel = Date + Panel**

Datenel is a web UI component for selecting dates. It provides a customizable date picker panel that can be easily integrated into your React applications.

![A preview of Datenel components for SingleWeekPicker and SingleDayPicker](https://s2.loli.net/2025/02/21/CTnxMcEOg53WK9y.png)

*Shadow border not included. Battery included.*

## Features

- **Zero runtime dependencies**: Slim size with low to 14.26 kB, also flexible to your favorite time processing library.
- **Customizable Colors**: Easily change the main, accent, reversed, hover, and border colors of the panel.
- **Localization**: Supports localization for different languages.
- **Accessibility**: Includes features for screen readers and keyboard navigation.
- **Programmatic Control**: Control the selected date programmatically and handle date selection events.
- **JSDoc Support**: Full IDE prompt support to help you use Datenel more conveniently.

## Installation

To install Datenel, use npm or yarn:

```sh
npm install datenel-vue3 # Use npm
yarn add datenel-vue3 # Use yarn
```

## Usage

Here is an example of how to use Datenel in your React application:

```vue
<script setup lang="ts">
import {SingleDatePicker} from '../src'
import {ref} from 'vue'

const date = ref(new Date())
</script>

<template>
    <SingleDatePicker v-model="date" />
</template>

```

For more information and live demo, refer to [Datenel’s documentation](https://datenel.js.org/guide/vue/gettingstart.html).

## Supported Components & Props

- [x] SingleDatePicker
- [x] SingleWeekPicker
- [ ] MultipleDatePicker
- [ ] DateRangePicker

More features are on the roadmap.

## Contribution & Development

```zsh
npm i # or `yarn`
npm run dev # or `yarn dev`
```

Then the package will launch a testing React hot-reload server on `localhost:1926`. The server file is available in the `playground` folder, feel free to modify the content inside it.

## License

MIT