import postcss from 'postcss'
import plugin from './index.js'
import { expect, it } from 'vitest'

function run(input, output, opts) {
  return postcss([plugin(opts)])
    .process(input, { from: null })
    .then(result => {
      expect(result.css).toEqual(output)
      expect(result.warnings()).toHaveLength(0)
    })
}

/* eslint-disable max-len */

/**
 * Default output
 */
it('create a cubic bezier gradient with direction', () => {
  return run(
    'a{ background: linear-gradient(to right, black, cubic-bezier(0.48, 0.30, 0.64, 1.00), transparent); }',
    'a{ background: linear-gradient(to right, hsl(0, 0%, 0%), hsla(0, 0%, 0%, 0.91667) 8.33%, hsla(0, 0%, 0%, 0.83333) 16.67%, hsla(0, 0%, 0%, 0.75) 25%, hsla(0, 0%, 0%, 0.66667) 33.33%, hsla(0, 0%, 0%, 0.58333) 41.67%, hsla(0, 0%, 0%, 0.5) 50%, hsla(0, 0%, 0%, 0.41667) 58.33%, hsla(0, 0%, 0%, 0.33333) 66.67%, hsla(0, 0%, 0%, 0.25) 75%, hsla(0, 0%, 0%, 0.16667) 83.33%, hsla(0, 0%, 0%, 0.08333) 91.67%, hsla(0, 0%, 0%, 0)); }',
    {}
  )
})
it('create an ease gradient with direction', () => {
  return run(
    'a{ background: linear-gradient(to right, green, ease, red); }',
    'a{ background: linear-gradient(to right, hsl(120, 100%, 25.1%), hsl(83.96, 100%, 24.03%) 8.33%, hsl(66.54, 100%, 22.91%) 16.67%, hsl(52.17, 100%, 25%) 25%, hsl(42.59, 100%, 28.87%) 33.33%, hsl(35.64, 100%, 32.27%) 41.67%, hsl(30.12, 100%, 35.36%) 50%, hsl(25.45, 100%, 38.19%) 58.33%, hsl(21.3, 100%, 40.82%) 66.67%, hsl(17.39, 100%, 43.3%) 75%, hsl(13.47, 100%, 45.64%) 83.33%, hsl(9.08, 100%, 47.87%) 91.67%, hsl(0, 100%, 50%)); }',
    {}
  )
})
it('create an ease radial-gradient', () => {
  return run(
    'a{ background: radial-gradient(circle at top right, red, ease-in-out, blue); }',
    'a{ background: radial-gradient(circle at top right, hsl(0, 100%, 50%), hsl(341.91, 100%, 47.87%) 8.33%, hsl(333.17, 100%, 45.64%) 16.67%, hsl(325.36, 100%, 43.3%) 25%, hsl(317.57, 100%, 40.82%) 33.33%, hsl(309.29, 100%, 38.19%) 41.67%, hsl(300, 100%, 35.36%) 50%, hsl(290.71, 100%, 38.19%) 58.33%, hsl(282.43, 100%, 40.82%) 66.67%, hsl(274.64, 100%, 43.3%) 75%, hsl(266.83, 100%, 45.64%) 83.33%, hsl(258.09, 100%, 47.87%) 91.67%, hsl(240, 100%, 50%)); }',
    {}
  )
})

/**
 * Output with custom settings
 */
it('create a cubic bezier gradient with 1 alphaDecimal', () => {
  return run(
    'a{ background: linear-gradient(black, cubic-bezier(0.48, 0.30, 0.64, 1.00), transparent); }',
    'a{ background: linear-gradient(hsl(0, 0%, 0%), hsla(0, 0%, 0%, 0.9) 8.33%, hsla(0, 0%, 0%, 0.8) 16.67%, hsla(0, 0%, 0%, 0.8) 25%, hsla(0, 0%, 0%, 0.7) 33.33%, hsla(0, 0%, 0%, 0.6) 41.67%, hsla(0, 0%, 0%, 0.5) 50%, hsla(0, 0%, 0%, 0.4) 58.33%, hsla(0, 0%, 0%, 0.3) 66.67%, hsla(0, 0%, 0%, 0.3) 75%, hsla(0, 0%, 0%, 0.2) 83.33%, hsla(0, 0%, 0%, 0.1) 91.67%, hsla(0, 0%, 0%, 0)); }',
    { alphaDecimals: 1 }
  )
})
it('create a cubic-bezier gradient with 5 stops', () => {
  return run(
    'a{ background: linear-gradient(black, cubic-bezier(0.48, 0.30, 0.64, 1.00), transparent); }',
    'a{ background: linear-gradient(hsl(0, 0%, 0%), hsla(0, 0%, 0%, 0.75) 25%, hsla(0, 0%, 0%, 0.5) 50%, hsla(0, 0%, 0%, 0.25) 75%, hsla(0, 0%, 0%, 0)); }',
    { stops: 5 }
  )
})
it('create an ease gradient with hsl colorMode', () => {
  return run(
    'a{ background: linear-gradient(to right, green, ease, red); }',
    'a{ background: linear-gradient(to right, hsl(120, 100%, 25.1%), hsl(110, 100%, 27.17%) 8.33%, hsl(100, 100%, 29.25%) 16.67%, hsl(90, 100%, 31.32%) 25%, hsl(80, 100%, 33.4%) 33.33%, hsl(70, 100%, 35.47%) 41.67%, hsl(60, 100%, 37.55%) 50%, hsl(50, 100%, 39.62%) 58.33%, hsl(40, 100%, 41.7%) 66.67%, hsl(30, 100%, 43.77%) 75%, hsl(20, 100%, 45.85%) 83.33%, hsl(10, 100%, 47.92%) 91.67%, hsl(0, 100%, 50%)); }',
    { colorMode: 'hsl' }
  )
})
/**
 * Ignore incorrect/unsuported input
 */
it('ignore unsuported gradients', () => {
  return run(
    'a{ background: linear-gradient(black, funky-ease, transparent); }',
    'a{ background: linear-gradient(black, funky-ease, transparent); }',
    {}
  )
})
it('process gradients with color stop locations', () => {
  return run(
    'a{ background: linear-gradient(black 20px, cubic-bezier(0.48, 0.30, 0.64, 1.00), transparent); }',
    'a{ background: linear-gradient(hsl(0, 0%, 0%), hsla(0, 0%, 0%, 0.91667) 8.33%, hsla(0, 0%, 0%, 0.83333) 16.67%, hsla(0, 0%, 0%, 0.75) 25%, hsla(0, 0%, 0%, 0.66667) 33.33%, hsla(0, 0%, 0%, 0.58333) 41.67%, hsla(0, 0%, 0%, 0.5) 50%, hsla(0, 0%, 0%, 0.41667) 58.33%, hsla(0, 0%, 0%, 0.33333) 66.67%, hsla(0, 0%, 0%, 0.25) 75%, hsla(0, 0%, 0%, 0.16667) 83.33%, hsla(0, 0%, 0%, 0.08333) 91.67%, hsla(0, 0%, 0%, 0)); }',
    {}
  )
})

/**
 * Fallback to linear gradient when incorrect transition functions
 */
it('ignore gradients with incorrect transition function syntax set', () => {
  return run(
    'a{ background: linear-gradient(black, cubic-bezier(0.48, 0.30, 0.64), transparent); }',
    'a{ background: linear-gradient(black, cubic-bezier(0.48, 0.30, 0.64), transparent); }',
    {}
  )
})

/**
 * Should ignore @keyframes rules to prevent CSS corruption
 */
it('ignore gradients inside @keyframes rules', () => {
  return run(
    '@keyframes fadeIn { 0% { opacity: 0; background: linear-gradient(to right, red, ease, blue); } 100% { opacity: 1; background: linear-gradient(to right, red, ease, blue); } }',
    '@keyframes fadeIn { 0% { opacity: 0; background: linear-gradient(to right, red, ease, blue); } 100% { opacity: 1; background: linear-gradient(to right, red, ease, blue); } }',
    {}
  )
})

it('ignore gradients inside @keyframes but process regular gradients', () => {
  return run(
    '@keyframes slideIn { from { background: linear-gradient(45deg, red, ease, blue); } to { background: linear-gradient(45deg, red, ease, blue); } } .test { background: linear-gradient(to right, green, ease, red); }',
    '@keyframes slideIn { from { background: linear-gradient(45deg, red, ease, blue); } to { background: linear-gradient(45deg, red, ease, blue); } } .test { background: linear-gradient(to right, hsl(120, 100%, 25.1%), hsl(83.96, 100%, 24.03%) 8.33%, hsl(66.54, 100%, 22.91%) 16.67%, hsl(52.17, 100%, 25%) 25%, hsl(42.59, 100%, 28.87%) 33.33%, hsl(35.64, 100%, 32.27%) 41.67%, hsl(30.12, 100%, 35.36%) 50%, hsl(25.45, 100%, 38.19%) 58.33%, hsl(21.3, 100%, 40.82%) 66.67%, hsl(17.39, 100%, 43.3%) 75%, hsl(13.47, 100%, 45.64%) 83.33%, hsl(9.08, 100%, 47.87%) 91.67%, hsl(0, 100%, 50%)); }',
    {}
  )
})

/**
 * Tests for default easing functionality
 */
it('apply default easing when specified', () => {
  return run(
    'a{ background: linear-gradient(red, blue); }',
    'a{ background: linear-gradient(hsl(0, 100%, 50%), hsl(341.91, 100%, 47.87%) 8.33%, hsl(333.17, 100%, 45.64%) 16.67%, hsl(325.36, 100%, 43.3%) 25%, hsl(317.57, 100%, 40.82%) 33.33%, hsl(309.29, 100%, 38.19%) 41.67%, hsl(300, 100%, 35.36%) 50%, hsl(290.71, 100%, 38.19%) 58.33%, hsl(282.43, 100%, 40.82%) 66.67%, hsl(274.64, 100%, 43.3%) 75%, hsl(266.83, 100%, 45.64%) 83.33%, hsl(258.09, 100%, 47.87%) 91.67%, hsl(240, 100%, 50%)); }',
    { defaultEasing: 'ease-in-out' }
  )
})

it('apply default easing with direction', () => {
  return run(
    'a{ background: linear-gradient(to right, green, red); }',
    'a{ background: linear-gradient(to right, hsl(120, 100%, 25.1%), hsl(83.96, 100%, 24.03%) 8.33%, hsl(66.54, 100%, 22.91%) 16.67%, hsl(52.17, 100%, 25%) 25%, hsl(42.59, 100%, 28.87%) 33.33%, hsl(35.64, 100%, 32.27%) 41.67%, hsl(30.12, 100%, 35.36%) 50%, hsl(25.45, 100%, 38.19%) 58.33%, hsl(21.3, 100%, 40.82%) 66.67%, hsl(17.39, 100%, 43.3%) 75%, hsl(13.47, 100%, 45.64%) 83.33%, hsl(9.08, 100%, 47.87%) 91.67%, hsl(0, 100%, 50%)); }',
    { defaultEasing: 'ease' }
  )
})

it('apply default easing with multiple colors', () => {
  return run(
    'a{ background: linear-gradient(black, gray, white); }',
    'a{ background: linear-gradient(hsl(0 0% 0%), hsl(223.81 0% 1.292%) 8.33%, hsl(223.81 0% 8.6104%) 16.67%, hsl(223.81 0% 17.914%) 25%, hsl(223.81 0% 28.05%) 33.33%, hsl(223.81 0% 38.846%) 41.67%, hsl(0 0% 50.196%) 50%, hsl(223.81 0% 58.045%) 58.33%, hsl(223.81 0% 66.078%) 66.67%, hsl(223.81 0% 74.308%) 75%, hsl(223.81 0% 82.712%) 83.33%, hsl(223.81 0.0001% 91.279%) 91.67%, hsl(0 0% 100%)); }',
    { defaultEasing: 'linear' }
  )
})

it('skip default easing when explicit timing function exists', () => {
  return run(
    'a{ background: linear-gradient(red, ease-in, blue); }',
    'a{ background: linear-gradient(hsl(0, 100%, 50%), hsl(341.91, 100%, 47.87%) 8.33%, hsl(333.17, 100%, 45.64%) 16.67%, hsl(325.36, 100%, 43.3%) 25%, hsl(317.57, 100%, 40.82%) 33.33%, hsl(309.29, 100%, 38.19%) 41.67%, hsl(300, 100%, 35.36%) 50%, hsl(290.71, 100%, 38.19%) 58.33%, hsl(282.43, 100%, 40.82%) 66.67%, hsl(274.64, 100%, 43.3%) 75%, hsl(266.83, 100%, 45.64%) 83.33%, hsl(258.09, 100%, 47.87%) 91.67%, hsl(240, 100%, 50%)); }',
    { defaultEasing: 'ease-out' }  // Should be ignored since ease-in is specified
  )
})

it('ignore gradients without default easing when no option set', () => {
  return run(
    'a{ background: linear-gradient(red, blue); }',
    'a{ background: linear-gradient(red, blue); }',  // Should remain unchanged
    {}
  )
})

/**
 * CSS Variable (CSS Custom Properties) support
 */
it('handle CSS variables as colors with timing functions', () => {
  return run(
    'a{ background: linear-gradient(var(--start-color), ease, var(--end-color)); }',
    'a{ background: linear-gradient(var(--start-color), var(--end-color)); }',
    {}
  )
})

it('handle CSS variables as direction', () => {
  return run(
    'a{ background: linear-gradient(var(--gradient-direction), red, ease, blue); }',
    'a{ background: linear-gradient(var(--gradient-direction), red, blue); }',
    {}
  )
})

it('handle mixed CSS variables and regular colors', () => {
  return run(
    'a{ background: linear-gradient(to right, var(--primary), ease-in, #ff0000); }',
    'a{ background: linear-gradient(to right, var(--primary), #ff0000); }',
    {}
  )
})

it('handle CSS variables with positions', () => {
  return run(
    'a{ background: linear-gradient(var(--start) 10%, cubic-bezier(0.25, 0.1, 0.25, 1), var(--end) 90%); }',
    'a{ background: linear-gradient(var(--start) 10%, var(--end) 90%); }',
    {}
  )
})
