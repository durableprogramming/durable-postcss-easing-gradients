import { parse as parseGradient } from 'saltcat-gradient-parser'
import { generateGradientCSS } from 'saltcat-generate-gradient-css'
import { getColorPalette } from 'saltcat-color-palette'
import { divToSemiColon, errorMsg, isEasingFunction, isCSSVariable } from './lib/helpers.js'

/**
 * Generate coordinates for easing stops
 * @param {number} num Number of coordinates
 * @returns {array} Array of coordinates from 0 to 1
 */
function generateCoordinates(num) {
  return Array.from({ length: num }, (_, i) => i / (num - 1) || 0)
}

/**
 * Split parameters by ',' ignoring inside parentheses
 * @param {string} params The parameters string
 * @returns {array} Array of parameter strings
 */
export function splitParams(params) {
  const result = []
  let current = ''
  let depth = 0
  for (const char of params) {
    if (char === '(') depth++
    else if (char === ')') depth--
    else if (char === ',' && depth === 0) {
      result.push(current.trim())
      current = ''
      continue
    }
    current += char
  }
  if (current) result.push(current.trim())
  return result
}

/**
 * Extract colors and direction from parsed gradient
 * @param {array} parsed Parsed gradient array
 * @returns {object} {colors: array, direction: string|null}
 */
function extractFromParsed(parsed) {
  const grad = parsed[0]
  if (!grad) return { colors: [], direction: null }
  const colors = grad.colorStops?.map(stop => stop.value) || []
  let direction = null
  if (grad.orientation) {
    if (grad.type === 'linear-gradient') {
      if (grad.orientation.type === 'directional') {
        direction = `to ${grad.orientation.value}`
      } else if (grad.orientation.type === 'angular') {
        direction = `${grad.orientation.value}deg`
      }
    } else if (grad.type === 'radial-gradient') {
      // For radial, orientation is array, reconstruct the string
      const shape = grad.orientation.find(o => o.type === 'shape')
      const at = shape?.at
      if (shape && at) {
        direction = `${shape.value} at ${at.value.x.value}`
        if (at.value.y) direction += ` ${at.value.y.value}`
      }
    }
  }
  return { colors, direction }
}

/**
 * Extract all colors from gradient parameters using saltcat-gradient-parser
 * @param {array} gradientParams Array of gradient parameters
 * @returns {array} Array of colors found in the gradient
 */
function extractColors(gradientParams) {
  const gradientString = `linear-gradient(${gradientParams.join(', ')})`
  const parsed = parseGradient(gradientString)
  return extractFromParsed(parsed).colors
}

/**
 * Find timing functions in gradient parameters using saltcat-easing
 * @param {array} gradientParams Array of gradient parameters
 * @returns {array} Array of timing function names found
 */
function extractTimingFunctions(gradientParams) {
  const timingFunctions = []
  for (const param of gradientParams) {
    if (isEasingFunction(param)) {
      timingFunctions.push(param)
    }
  }
  return timingFunctions
}

/**
 * Generate eased color stops using saltcat-generate-gradient-css
 * @param {array} colors Colors in an array (can be any number)
 * @param {array} coordinates An array of coordinates
 * @param {number} alphaDecimals Number of alpha decimals
 * @param {string} colorMode Color space for interpolation
 * @param {string} easingFunction The easing function name
 * @returns {array} Array of color stops
 */
function getOptimalColorStops(colors, coordinates, alphaDecimals, colorMode, easingFunction, direction, stops) {
  // Generate eased gradient using saltcat
  let orientation = null
  if (direction) {
    if (direction.startsWith('to ')) {
      orientation = { type: 'directional', value: direction.slice(3) }
    } else if (direction.includes('deg')) {
      orientation = { type: 'angular', value: direction.replace('deg', '') }
    }
  }
  const gradientOptions = {
    type: 'linear-gradient',
    orientation,
    colorStops: colors.map(c => ({ value: c })),
    easing: easingFunction,
    stops: stops,
    colorSpace: colorMode || 'oklch',
    alphaDecimals: alphaDecimals
  }

  const css = generateGradientCSS(gradientOptions)
  // Extract color stops from the generated CSS
  const match = css.match(/(linear|radial)-gradient\((.*)\)/)
  if (match) {
    const params = match[2].split(',').map(s => s.trim())
    // If the first param is the direction, remove it
    if (direction && params[0] === direction) {
      return params.slice(1)
    } else {
      return params
    }
  }
  return []
}

/**
 * The easing gradient function is a postcss plugin which supports enhanced gradient types.
 */
const plugin = function(options = {}) {
  if (!options.stops) {
    options.stops = 13
  }
  return {
    postcssPlugin: 'easing-gradient',
    AtRule(atRule) {
      // Skip @keyframes at-rules entirely to avoid corrupting animations
      if (atRule.name === 'keyframes') {
        return
      }
    },
     Rule(rule) {
       // Skip @keyframes rules to avoid corrupting animations - check all ancestor at-rules
       let currentNode = rule.parent
       while (currentNode) {
         if (currentNode.type === 'atrule' && currentNode.name === 'keyframes') {
           return
         }
         currentNode = currentNode.parent
       }

       rule.walkDecls(decl => {
         // If declaration value contains a -gradient.
         if (decl.value.includes('-gradient')) {
           // Use regex to find and replace gradients
            decl.value = decl.value.replace(/(linear-gradient|radial-gradient)\((.*)\)/g, (match, type, params) => {
              const gradientParams = splitParams(params)

             // Check if we should apply default easing when no timing function is present
             const hasTimingFunction = gradientParams.some(param => isEasingFunction(param))

              if (!hasTimingFunction && options.defaultEasing) {
                try {
                  // Remove timing functions for parsing
                  const cleanParams = gradientParams.filter(param => !isEasingFunction(param))
                  const cleanGradientString = `${type}(${cleanParams.join(', ')})`
                  const parsed = parseGradient(cleanGradientString)
                  const { colors, direction } = extractFromParsed(parsed)

                  if (colors && colors.length >= 2) {
                    const coordinates = generateCoordinates(options.stops - 1)
                    const colorStops = getOptimalColorStops(
                      colors,
                      coordinates,
                      options.alphaDecimals,
                      options.colorMode,
                      options.defaultEasing,
                      direction,
                      options.stops
                    )

                    if (direction) {
                      return `${type}(${direction}, ${colorStops.join(', ')})`
                    } else {
                      return `${type}(${colorStops.join(', ')})`
                    }
                  }
                } catch (error) {
                  console.log(error)
                }
              }

              // Apply timing functions found in the gradient
             const timingFunctions = extractTimingFunctions(gradientParams)

              if (timingFunctions.length > 0) {
                try {
                  // Remove timing functions for parsing
                  const cleanParams = gradientParams.filter(param => !isEasingFunction(param))
                  const cleanGradientString = `${type}(${cleanParams.join(', ')})`
                  const parsed = parseGradient(cleanGradientString)
                  const { colors, direction } = extractFromParsed(parsed)

                  // Use the first timing function found
                  const easingFunction = timingFunctions[0]

                  if (colors && colors.length >= 2) {
                    // Check if any colors are CSS variables or if direction is a CSS variable
                    const hasCSSVariables = colors.some(color => isCSSVariable(color)) || isCSSVariable(direction || '')

                    if (hasCSSVariables) {
                      // Pass through CSS variables without processing
                      // Remove timing functions but keep colors and direction as-is
                      const filteredParams = gradientParams.filter(param => !isEasingFunction(param))
                      return `${type}(${filteredParams.join(', ')})`
                    } else {
                      // Process normally for non-CSS variable colors
                      const coordinates = generateCoordinates(options.stops - 1)
                      const colorStops = getOptimalColorStops(
                        colors,
                        coordinates,
                        options.alphaDecimals,
                        options.colorMode,
                        easingFunction,
                        direction,
                        options.stops
                      )

                      if (direction) {
                        return `${type}(${direction}, ${colorStops.join(', ')})`
                      } else {
                        return `${type}(${colorStops.join(', ')})`
                      }
                    }
                   }
                } catch (error) {
                  console.log(error)
                }
              }

              return match
           })
         }
       })
     }
  }
}

plugin.postcss = true
export default plugin
