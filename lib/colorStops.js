import chroma from 'chroma-js'
import Color from 'colorjs.io'
import easingFunctions from 'saltcat-easing/src/easing_functions.js'
import Gradient from 'saltcat-easing/src/gradient.js'
import { transparentFix, roundHslAlpha } from './helpers.js'

/**
 * Check if an easing function is available in saltcat-easing
 * @param {string} easingName The easing function name
 * @returns {boolean} Whether the easing function exists
 */
export function isAdvancedEasing(easingName) {
  return easingName in easingFunctions
}

/**
 * Generate linear coordinates
 * @param {number} steps Number of coordinate steps
 * @returns {array} Array of coordinate objects with x and y properties
 */
export function generateCoordinates(steps) {
  const coordinates = []
  
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    coordinates.push({ x: t, y: t })
  }
  
  return coordinates
}

/**
 * Calculate color stops using advanced color interpolation and easing (Color.js + saltcat-easing)
 * @param {array} colors Colors in an array (can be any number of colors)
 * @param {array} coordinates An array of coordinates (object with x and y keys)
 * @param {number} alphaDecimals How many decimals should be on the returned color values
 * @param {string} colorMode Color space used for color interpolation
 * @param {string} easingFunction The easing function name to use
 * @returns {array} An array of colorstops (a string with color and position)
 */
export function getAdvancedColorStops(colors, coordinates, alphaDecimals = 5, colorMode = 'oklch', easingFunction = 'linear') {
  colors = transparentFix(colors)
  
  // Create gradient stops from colors - distribute evenly across 0-100%
  const stops = colors.map((color, index) => ({
    color: color,
    position: (index / (colors.length - 1)) * 100
  }))
  
  // Create gradient using saltcat-easing
  const gradient = new Gradient(stops, {
    internalColorspace: colorMode,
    outputColorspace: 'hsl',
    defaultColorEasing: easingFunction
  })
  
  // Generate eased stops using the coordinate count
  const easedStops = gradient.generateEasedStops(coordinates.length, {
    colorEasing: easingFunction,
    internalColorspace: colorMode
  })
  
  // Convert to our expected format
  const colorStops = easedStops.map((stop, index) => {
    const coordinate = coordinates[index]
    if (!coordinate) return null
    
    let color = new Color(stop.color).to('hsl').toString({ precision: alphaDecimals })
    color = roundHslAlpha(color, alphaDecimals)
    
    const percent = coordinate.x * 100
    if (Number(coordinate.x) !== 0 && Number(coordinate.x) !== 1) {
      return `${color} ${+percent.toFixed(2)}%`
    } else {
      return color
    }
  }).filter(Boolean)
  
  return colorStops
}

/**
 * Calculate the color stops based on start+stopColor in an array and easingType (legacy chroma.js)
 * @param {array} colors Two colors in an array
 * @param {array} coordinates An array of coordinates (object with x and y keys)
 * @param {number} alphaDecimals How many decimals should be on the returned color values
 * @param {string} colorMode Color space used for color interpolation http://gka.github.io/chroma.js/#chroma-mix
 * @returns {array} An array of colorstops (a string with color and position)
 */
export default function getColorStops(colors, coordinates, alphaDecimals = 5, colorMode = 'lrgb') {
  const colorStops = []
  colors = transparentFix(colors)
  coordinates.forEach(coordinate => {
    const ammount = coordinate.y
    const percent = coordinate.x * 100
    let color = chroma.mix(colors[0], colors[1], ammount, colorMode).css('hsl')
    color = roundHslAlpha(color, alphaDecimals)
    if (Number(coordinate.x) !== 0 && Number(coordinate.x) !== 1) {
      colorStops.push(`${color} ${+percent.toFixed(2)}%`)
    } else {
      colorStops.push(color)
    }
  })
  return colorStops
}
