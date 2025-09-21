/**
 * Change value to ';' on child objects of type 'div'
 * @param {Array.<Object>} obj An array of objects
 * @returns {Array.<Object>} An array of objects
 */
export const divToSemiColon = obj => {
  obj.map(childObj => {
    if (childObj.type === 'div') {
      childObj.value = ';'
    }
    return childObj
  })
  return obj
}

/**
 * Wrap a string telling the user we couldn't parse it
 * @param {String} input A string
 * @returns {String} The full error message wrapped around the string
 */
export const errorMsg = input => {
  return `Couldn't parse:
${input}
Check the syntax to see if it's correct/supported.`
}

/**
 * Check if a string is a CSS variable
 * @param {String} str The string to check
 * @returns {Boolean} True if it's a CSS variable
 */
export const isCSSVariable = str => {
  if (typeof str !== 'string') return false
  const trimmed = str.trim()
  return /^var\(--[a-zA-Z_][a-zA-Z0-9_-]*\)$/.test(trimmed)
}

/**
 * Check if a string is a gradient direction or CSS variable
 * @param {String} str The string to check
 * @returns {Boolean} True if it's a direction or CSS variable
 */
export const isDirection = str => {
  if (typeof str !== 'string') return false
  const trimmed = str.trim()
  // Check for CSS variables
  if (isCSSVariable(trimmed)) return true
  // Check for common directions
  const directions = ['to top', 'to right', 'to bottom', 'to left', 'to top left', 'to top right', 'to bottom left', 'to bottom right']
  if (directions.includes(trimmed)) return true
   // Check for angle with various units
   if (/^-?\d*\.?\d+(deg|rad|grad|turn)$/.test(trimmed)) return true
  return false
}

/**
 * Check if a string is an easing function
 * @param {String} str The string to check
 * @returns {Boolean} True if it's an easing function
 */
export const isEasingFunction = str => {
  if (typeof str !== 'string') return false
  const trimmed = str.trim()
  // Standard CSS easing functions
  const standard = ['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear']
  if (standard.includes(trimmed)) return true
   // Cubic-bezier with exactly 4 parameters
   if (/^cubic-bezier\(\s*\d*\.?\d+\s*,\s*\d*\.?\d+\s*,\s*\d*\.?\d+\s*,\s*\d*\.?\d+\s*\)$/.test(trimmed)) return true
  // Steps
  if (/^steps\(.+\)$/.test(trimmed)) return true
  // Saltcat easing (assuming they start with ease or have specific patterns)
  if (/^ease[A-Z]/.test(trimmed)) return true
   // Easing wrapper
   if (/^easing\((ease|ease-in|ease-out|ease-in-out|linear|in|out|in-out|inout|cubic-bezier\(.+\)|steps\(.+\)|ease[A-Z][a-zA-Z]*)\)$/.test(trimmed)) return true
  return false
}