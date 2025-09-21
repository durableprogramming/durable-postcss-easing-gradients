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
    'a{ background: linear-gradient(to right, hsl(0, 0%, 0%), hsla(0, 0%, 0%, 0.9167) 8.33%, hsla(0, 0%, 0%, 0.8333) 16.67%, hsla(0, 0%, 0%, 0.75) 25%, hsla(0, 0%, 0%, 0.6667) 33.33%, hsla(0, 0%, 0%, 0.5833) 41.67%, hsla(0, 0%, 0%, 0.5) 50%, hsla(0, 0%, 0%, 0.4167) 58.33%, hsla(0, 0%, 0%, 0.3333) 66.67%, hsla(0, 0%, 0%, 0.25) 75%, hsla(0, 0%, 0%, 0.1667) 83.33%, hsla(0, 0%, 0%, 0.0833) 91.67%, hsla(0, 0%, 0%, 0)); }',
    {}
  )
})
it('create an ease gradient with direction', () => {
  return run(
    'a{ background: linear-gradient(to right, green, ease, red); }',
    'a{ background: linear-gradient(to right, hsl(120, 100%, 25%), hsl(109, 100%, 23%) 8.33%, hsl(96, 100%, 21%) 16.67%, hsl(80, 100%, 19%) 25%, hsl(60, 100%, 17%) 33.33%, hsl(42, 100%, 21%) 41.67%, hsl(30, 100%, 25%) 50%, hsl(22, 100%, 29%) 58.33%, hsl(15, 100%, 33%) 66.67%, hsl(10, 100%, 38%) 75%, hsl(6, 100%, 42%) 83.33%, hsl(3, 100%, 46%) 91.67%, hsl(0, 100%, 50%)); }',
    {}
  )
})
it('create an ease radial-gradient', () => {
  return run(
    'a{ background: radial-gradient(circle at top right, red, ease-in-out, blue); }',
    'a{ background: radial-gradient(circle at top right, hsl(0, 100%, 50%), hsl(355, 100%, 46%) 8.33%, hsl(348, 100%, 42%) 16.67%, hsl(340, 100%, 38%) 25%, hsl(330, 100%, 33%) 33.33%, hsl(317, 100%, 29%) 41.67%, hsl(300, 100%, 25%) 50%, hsl(283, 100%, 29%) 58.33%, hsl(270, 100%, 33%) 66.67%, hsl(260, 100%, 38%) 75%, hsl(252, 100%, 42%) 83.33%, hsl(245, 100%, 46%) 91.67%, hsl(240, 100%, 50%)); }',
    {}
  )
})

/**
 * Output with custom settings
 */
it('create a cubic bezier gradient with 1 alphaDecimal', () => {
  return run(
    'a{ background: linear-gradient(black, cubic-bezier(0.48, 0.30, 0.64, 1.00), transparent); }',
    'a{ background: linear-gradient(hsl(0, 0%, 0%), hsl(0, 0%, 0%) 8.33%, hsl(0, 0%, 0%) 16.67%, hsl(0, 0%, 0%) 25%, hsl(0, 0%, 0%) 33.33%, hsl(0, 0%, 0%) 41.67%, hsl(0, 0%, 0%) 50%, hsla(0, 0%, 0%, 0) 58.33%, hsla(0, 0%, 0%, 0) 66.67%, hsla(0, 0%, 0%, 0) 75%, hsla(0, 0%, 0%, 0) 83.33%, hsla(0, 0%, 0%, 0) 91.67%, hsla(0, 0%, 0%, 0)); }',
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
    'a{ background: linear-gradient(to right, hsl(120, 100%, 25%), hsl(110, 100%, 27%) 8.33%, hsl(100, 100%, 29%) 16.67%, hsl(90, 100%, 31%) 25%, hsl(80, 100%, 33%) 33.33%, hsl(70, 100%, 35%) 41.67%, hsl(60, 100%, 38%) 50%, hsl(50, 100%, 40%) 58.33%, hsl(40, 100%, 42%) 66.67%, hsl(30, 100%, 44%) 75%, hsl(20, 100%, 46%) 83.33%, hsl(10, 100%, 48%) 91.67%, hsl(0, 100%, 50%)); }',
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
    'a{ background: linear-gradient(hsl(0, 0%, 0%), hsla(0, 0%, 0%, 0.9167) 8.33%, hsla(0, 0%, 0%, 0.8333) 16.67%, hsla(0, 0%, 0%, 0.75) 25%, hsla(0, 0%, 0%, 0.6667) 33.33%, hsla(0, 0%, 0%, 0.5833) 41.67%, hsla(0, 0%, 0%, 0.5) 50%, hsla(0, 0%, 0%, 0.4167) 58.33%, hsla(0, 0%, 0%, 0.3333) 66.67%, hsla(0, 0%, 0%, 0.25) 75%, hsla(0, 0%, 0%, 0.1667) 83.33%, hsla(0, 0%, 0%, 0.0833) 91.67%, hsla(0, 0%, 0%, 0)); }',
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
    '@keyframes slideIn { from { background: linear-gradient(45deg, red, ease, blue); } to { background: linear-gradient(45deg, red, ease, blue); } } .test { background: linear-gradient(to right, hsl(120, 100%, 25%), hsl(109, 100%, 23%) 8.33%, hsl(96, 100%, 21%) 16.67%, hsl(80, 100%, 19%) 25%, hsl(60, 100%, 17%) 33.33%, hsl(42, 100%, 21%) 41.67%, hsl(30, 100%, 25%) 50%, hsl(22, 100%, 29%) 58.33%, hsl(15, 100%, 33%) 66.67%, hsl(10, 100%, 38%) 75%, hsl(6, 100%, 42%) 83.33%, hsl(3, 100%, 46%) 91.67%, hsl(0, 100%, 50%)); }',
    {}
  )
})

/**
 * Tests for default easing functionality
 */
it('apply default easing when specified', () => {
  return run(
    'a{ background: linear-gradient(red, blue); }',
    'a{ background: linear-gradient(hsl(0, 100%, 50%), hsl(355, 100%, 46%) 8.33%, hsl(348, 100%, 42%) 16.67%, hsl(340, 100%, 38%) 25%, hsl(330, 100%, 33%) 33.33%, hsl(317, 100%, 29%) 41.67%, hsl(300, 100%, 25%) 50%, hsl(283, 100%, 29%) 58.33%, hsl(270, 100%, 33%) 66.67%, hsl(260, 100%, 38%) 75%, hsl(252, 100%, 42%) 83.33%, hsl(245, 100%, 46%) 91.67%, hsl(240, 100%, 50%)); }',
    { defaultEasing: 'ease-in-out' }
  )
})

it('apply default easing with direction', () => {
  return run(
    'a{ background: linear-gradient(to right, green, red); }',
    'a{ background: linear-gradient(to right, hsl(120, 100%, 25%), hsl(109, 100%, 23%) 8.33%, hsl(96, 100%, 21%) 16.67%, hsl(80, 100%, 19%) 25%, hsl(60, 100%, 17%) 33.33%, hsl(42, 100%, 21%) 41.67%, hsl(30, 100%, 25%) 50%, hsl(22, 100%, 29%) 58.33%, hsl(15, 100%, 33%) 66.67%, hsl(10, 100%, 38%) 75%, hsl(6, 100%, 42%) 83.33%, hsl(3, 100%, 46%) 91.67%, hsl(0, 100%, 50%)); }',
    { defaultEasing: 'ease' }
  )
})

it('apply default easing with multiple colors', () => {
  return run(
    'a{ background: linear-gradient(black, gray, white); }',
    'a{ background: linear-gradient(hsl(0, 0%, 0%), hsl(224, 0%, 1%) 8.33%, hsl(224, 0%, 9%) 16.67%, hsl(224, 0%, 18%) 25%, hsl(224, 0%, 28%) 33.33%, hsl(224, 0%, 39%) 41.67%, hsl(0, 0%, 50%) 50%, hsl(224, 0%, 58%) 58.33%, hsl(224, 0%, 66%) 66.67%, hsl(224, 0%, 74%) 75%, hsl(224, 0%, 83%) 83.33%, hsl(224, 0%, 91%) 91.67%, hsl(0, 0%, 100%)); }',
    { defaultEasing: 'linear' }
  )
})

it('skip default easing when explicit timing function exists', () => {
  return run(
    'a{ background: linear-gradient(red, ease-in, blue); }',
    'a{ background: linear-gradient(hsl(0, 100%, 50%), hsl(355, 100%, 46%) 8.33%, hsl(348, 100%, 42%) 16.67%, hsl(340, 100%, 38%) 25%, hsl(330, 100%, 33%) 33.33%, hsl(317, 100%, 29%) 41.67%, hsl(300, 100%, 25%) 50%, hsl(283, 100%, 29%) 58.33%, hsl(270, 100%, 33%) 66.67%, hsl(260, 100%, 38%) 75%, hsl(252, 100%, 42%) 83.33%, hsl(245, 100%, 46%) 91.67%, hsl(240, 100%, 50%)); }',
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
