# Durable PostCSS Easing Gradients

[![NPM Version](https://img.shields.io/npm/v/durable-postcss-easing-gradients.svg)](https://www.npmjs.com/package/durable-postcss-easing-gradients)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A [PostCSS](https://github.com/postcss/postcss) plugin to create smooth linear-gradients that approximate easing functions. This is a maintained fork of the original [postcss-easing-gradients](https://github.com/larsenwork/postcss-easing-gradients) with updated dependencies and improved compatibility.

Visual examples and online editor available at [larsenwork.com/easing-gradients](https://larsenwork.com/easing-gradients/)

## Why This Fork?

This fork addresses several issues with the original package:
- **Updated Dependencies**: Compatible with PostCSS 8.x and modern Node.js versions
- **Bug Fixes**: Improved HSL color handling and legacy format conversion
- **Maintained**: Active maintenance and updates for the PostCSS ecosystem
- **Modern Build**: Updated to work with current tooling and build systems

## Installation

```bash
npm install durable-postcss-easing-gradients --save-dev
```

## Usage

Add the plugin to your PostCSS configuration:

```js
const postcss = require('postcss');
const easingGradients = require('durable-postcss-easing-gradients');

postcss([easingGradients()])
  .process(css, { from: undefined })
  .then(result => {
    console.log(result.css);
  });
```

### With PostCSS Config File

```js
// postcss.config.js
module.exports = {
  plugins: [
    require('durable-postcss-easing-gradients')(),
    // other plugins...
  ]
};
```

## Code Examples

### Cubic Bezier Easing
```css
.cubic-bezier {
  background: linear-gradient(to bottom, black, cubic-bezier(0.48, 0.3, 0.64, 1), transparent);
}
```

Transforms to:
```css
.cubic-bezier {
  background: linear-gradient(
    to bottom,
    hsl(0, 0%, 0%),
    hsla(0, 0%, 0%, 0.94505) 7.9%,
    hsla(0, 0%, 0%, 0.88294) 15.3%,
    hsla(0, 0%, 0%, 0.81522) 22.2%,
    hsla(0, 0%, 0%, 0.7426) 28.7%,
    hsla(0, 0%, 0%, 0.66692) 34.8%,
    hsla(0, 0%, 0%, 0.58891) 40.6%,
    hsla(0, 0%, 0%, 0.50925) 46.2%,
    hsla(0, 0%, 0%, 0.42866) 51.7%,
    hsla(0, 0%, 0%, 0.34817) 57.2%,
    hsla(0, 0%, 0%, 0.2693) 62.8%,
    hsla(0, 0%, 0%, 0.19309) 68.7%,
    hsla(0, 0%, 0%, 0.12126) 75.2%,
    hsla(0, 0%, 0%, 0.05882) 82.6%,
    hsla(0, 0%, 0%, 0.01457) 91.2%,
    hsla(0, 0%, 0%, 0)
  );
}
```

### Named Easing Functions
```css
.ease {
  background: linear-gradient(green, ease, red);
}
```

### Step Functions
```css
.steps {
  background: linear-gradient(to right, green, steps(4, skip-none), red);
}
```

### Radial Gradients
```css
.radial {
  background: radial-gradient(circle at top right, red, ease-in-out, blue);
}
```

## Syntax

The plugin supports a subset of the proposed CSS syntax:

```
linear-gradient(
  [ <direction>,]?
  <color>,
  <animation-timing-function>,
  <color>
)
```

### Supported Easing Functions

- **Named functions**: `ease`, `ease-in`, `ease-out`, `ease-in-out`, `linear`
- **Cubic Bezier**: `cubic-bezier(x1, y1, x2, y2)`
- **Steps**: `steps(number, direction)` where direction can be `jump-start`, `jump-end`, `jump-none`, `jump-both`, or `start`/`end` (legacy)

## Options

```js
easingGradients({
  stops: 13,           // Number of color stops (default: 13)
  alphaDecimals: 5,    // Decimal precision for alpha values (default: 5)
  colorMode: 'lrgb'    // Color interpolation mode (default: 'lrgb')
})
```

### Option Details

#### `stops` (default: 13)
Controls the number of intermediate color stops generated. Lower numbers create more "low poly" gradients with less code but higher risk of banding.

#### `alphaDecimals` (default: 5)
Sets decimal precision for alpha values. Lower numbers can result in visible banding.

#### `colorMode` (default: 'lrgb')
Defines the color space for interpolation:
- `'lrgb'` - Linear RGB (closest to browser behavior)
- `'rgb'` - Standard RGB
- `'hsl'` - HSL color space
- `'lab'` - LAB color space
- `'lch'` - LCH color space

See [Chroma.js documentation](https://gka.github.io/chroma.js/#chroma-mix) for more details.

## Browser Support

The generated CSS uses standard `linear-gradient` and `radial-gradient` syntax with HSL/HSLA colors, providing excellent browser support. The plugin itself requires Node.js 6.0.0 or higher.

## Differences from Original

This fork includes several improvements over the original:

1. **PostCSS 8 Compatibility**: Updated to work with the latest PostCSS version
2. **Modern Dependencies**: All dependencies updated to their latest versions
3. **Enhanced HSL Handling**: Better support for modern HSL syntax and legacy format conversion
4. **Bug Fixes**: Resolved issues with color parsing and gradient generation
5. **Improved Testing**: Updated test suite with Jest 29

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. This fork aims to maintain compatibility with the original while providing modern tooling support.

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

This project is a fork of [postcss-easing-gradients](https://github.com/larsenwork/postcss-easing-gradients) by [Andreas Larsen](https://github.com/larsenwork). All credit for the original concept and implementation goes to the original author.

The visual examples and online editor remain available at [larsenwork.com/easing-gradients](https://larsenwork.com/easing-gradients/).
