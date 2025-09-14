import valueParser from 'postcss-value-parser'
import getColorStops, { isAdvancedEasing, getAdvancedColorStops, generateCoordinates } from './lib/colorStops.js'
import { isTimingFunctionSync, isDirection, divToSemiColon, errorMsg } from './lib/helpers.js'

/**
 * Extract all colors from gradient parameters
 * @param {array} gradientParams Array of gradient parameters
 * @returns {array} Array of colors found in the gradient
 */
function extractColors(gradientParams) {
  const colors = []
  
  for (const param of gradientParams) {
    // Skip directions, timing functions, and radial gradient position syntax
    if (!isDirection(param) && !isTimingFunctionSync(param) && 
        !param.includes('circle') && !param.includes('ellipse') && 
        !param.includes('at') && !param.includes('%') && !param.includes('px')) {
      colors.push(param)
    }
  }
  
  return colors
}

/**
 * Find timing functions in gradient parameters
 * @param {array} gradientParams Array of gradient parameters
 * @returns {array} Array of timing function names found
 */
function extractTimingFunctions(gradientParams) {
  return gradientParams.filter(param => isTimingFunctionSync(param))
}

/**
 * Choose the appropriate color processing method based on easing function
 * @param {array} colors Colors in an array (can be any number)
 * @param {array} coordinates An array of coordinates
 * @param {number} alphaDecimals Number of alpha decimals
 * @param {string} colorMode Color space for interpolation
 * @param {string} easingFunction The easing function name
 * @returns {array} Array of color stops
 */
function getOptimalColorStops(colors, coordinates, alphaDecimals, colorMode, easingFunction) {
  // Use advanced processing for saltcat-easing functions
  if (isAdvancedEasing(easingFunction)) {
    return getAdvancedColorStops(
      colors, 
      coordinates, 
      alphaDecimals, 
      colorMode || 'oklch', 
      easingFunction
    )
  }
  
  // Use legacy processing for standard CSS timing functions
  return getColorStops(colors, coordinates, alphaDecimals, colorMode)
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
          // Parse the declaration and walk through the nodes - https://github.com/TrySound/postcss-value-parser.
          const parsedValue = valueParser(decl.value)
          parsedValue.walk(node => {
            // Only modify gradient as the value can contain more e.g. 'linear-gradient(black, pink) center'.
            if (node.value === 'linear-gradient' || node.value === 'radial-gradient') {
              // Get a sensible array of gradient parameters where e.g. a function is split into multiple array items
              const gradientParams = valueParser
                .stringify(divToSemiColon(node.nodes))
                .split(';')
                .map(str => str.trim())

              // Check if we should apply default easing when no timing function is present
              const hasTimingFunction = gradientParams.some(param => isTimingFunctionSync(param))
              
              if (!hasTimingFunction && options.defaultEasing) {
                // Apply default easing function to all colors
                try {
                  const colors = extractColors(gradientParams)
                  // Find direction or radial gradient position syntax
                  const direction = gradientParams.find(param => 
                    isDirection(param) || param.includes('circle') || param.includes('ellipse') || param.includes('at')
                  )
                  
                  if (colors.length >= 2) {
                    const coordinates = generateCoordinates(options.stops - 1)
                    const colorStops = getOptimalColorStops(
                      colors,
                      coordinates,
                      options.alphaDecimals,
                      options.colorMode,
                      options.defaultEasing
                    )
                    
                    // Update node
                    node.type = 'word'
                    if (direction) {
                      node.value = `${node.value}(${direction}, ${colorStops.join(', ')})`
                    } else {
                      node.value = `${node.value}(${colorStops.join(', ')})`
                    }
                    // Update our declaration value
                    decl.value = parsedValue.toString()
                  }
                } catch (error) {
                  console.log(errorMsg(decl.value))
                }
              }

              // Apply timing functions found in the gradient
              const timingFunctions = extractTimingFunctions(gradientParams)
              
              if (timingFunctions.length > 0) {
                try {
                  const colors = extractColors(gradientParams)
                  // Find direction or radial gradient position syntax
                  const direction = gradientParams.find(param => 
                    isDirection(param) || param.includes('circle') || param.includes('ellipse') || param.includes('at')
                  )
                  
                  // Use the first timing function found
                  const easingFunction = timingFunctions[0]
                  
                  if (colors.length >= 2) {
                    const coordinates = generateCoordinates(options.stops - 1)
                    const colorStops = getOptimalColorStops(
                      colors,
                      coordinates,
                      options.alphaDecimals,
                      options.colorMode,
                      easingFunction
                    )
                    
                    // Update node
                    node.type = 'word'
                    if (direction) {
                      node.value = `${node.value}(${direction}, ${colorStops.join(', ')})`
                    } else {
                      node.value = `${node.value}(${colorStops.join(', ')})`
                    }
                    // Update our declaration value
                    decl.value = parsedValue.toString()
                  }
                } catch (error) {
                  console.log(errorMsg(decl.value))
                }
              }
            }
          })
        }
      })
    }
  }
}

plugin.postcss = true
export default plugin
