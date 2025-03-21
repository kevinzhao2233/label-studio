import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Get current file directory for resolving paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine correct paths for the workspace
const findWorkspaceRoot = () => {
  // We'll start with this file's directory and go up until we find the web directory
  let currentDir = __dirname;
  while (!currentDir.endsWith("web") && currentDir !== "/") {
    currentDir = path.dirname(currentDir);
  }

  if (!currentDir.endsWith("web")) {
    throw new Error("Could not find workspace root directory");
  }

  return currentDir;
};

const workspaceRoot = findWorkspaceRoot();

// Paths
const designVariablesPath = path.join(workspaceRoot, "design-tokens.json");
const cssOutputPath = path.join(workspaceRoot, "libs/ui/src/tokens/tokens.scss");
const jsOutputPath = path.join(workspaceRoot, "libs/ui/src/tokens/tokens.js");

/**
 * Convert a value to rem units rounded to 4 decimal places no trailing zeros
 * @param {string} value - The value to convert
 * @returns {string} - The converted value in rem units
 */
function convertToRem(value) {
  const remValue = (Number(value) / 16).toFixed(4).replace(/\.?0+$/, "");
  // Ensure 0 is returned as a unitless value
  if (remValue === "0") {
    return remValue;
  }
  return `${remValue}rem`;
}

/**
 * Process design variables and extract tokens
 * @param {Object} variables - The design variables object
 * @returns {Object} - Object containing tokens for CSS and JavaScript
 */
function processDesignVariables(variables) {
  const result = {
    cssVariables: {
      light: [],
      dark: [],
    },
    jsTokens: {
      colors: {},
      spacing: {},
      typography: {},
      cornerRadius: {},
    },
  };

  // Process colors
  if (variables["@color"] && variables["@color"].$color) {
    processColorTokens(variables["@color"].$color, "", result, variables);
  }

  // Process primitives
  if (variables["@primitives"] && variables["@primitives"].$color) {
    processPrimitiveColors(variables["@primitives"].$color, result, variables);
  }

  // Process primitive spacing
  if (variables["@primitives"] && variables["@primitives"].$spacing) {
    processPrimitiveSpacing(variables["@primitives"].$spacing, result);
  }

  // Process primitive typography
  if (variables["@primitives"] && variables["@primitives"].$typography) {
    processPrimitiveTypography(variables["@primitives"].$typography, result);
  }

  // Process primitive corner-radius
  if (variables["@primitives"] && variables["@primitives"]["$corner-radius"]) {
    processPrimitiveCornerRadius(variables["@primitives"]["$corner-radius"], result);
  }

  // Process spacing
  if (variables["@sizing"] && variables["@sizing"].$spacing) {
    processSpacingTokens(variables["@sizing"].$spacing, result, variables);
  }

  // Process typography
  if (variables["@typography"]) {
    processTypographyTokens(variables["@typography"], result, variables);
  }

  // Process corner-radius (fixing the "corder-radius" typo if it exists)
  if (variables["@sizing"] && variables["@sizing"]["$corner-radius"]) {
    processCornerRadiusTokens(variables["@sizing"]["$corner-radius"], result, variables);
  } else if (variables["@sizing"] && variables["@sizing"]["$corder-radius"]) {
    processCornerRadiusTokens(variables["@sizing"]["$corder-radius"], result, variables);
  }

  // Post-process for Tailwind compatibility
  result.jsTokens.colors = transformColorObjectForTailwind(result.jsTokens.colors);

  return result;
}

/**
 * Process primitive spacing tokens
 * @param {Object} spacingObj - The spacing object from primitives
 * @param {Object} result - The result object to populate
 */
function processPrimitiveSpacing(spacingObj, result) {
  for (const key in spacingObj) {
    if (spacingObj[key].$type === "number" && spacingObj[key].$value !== undefined) {
      const name = key.replace("$", "");
      const value = spacingObj[key].$value;
      const cssVarName = `--spacing-primitive-${name}`;

      // Add to CSS variables
      result.cssVariables.light.push(`${cssVarName}: ${convertToRem(value)};`);

      // Add to JavaScript tokens
      if (!result.jsTokens.spacing.primitive) {
        result.jsTokens.spacing.primitive = {};
      }

      result.jsTokens.spacing.primitive[name] = `var(${cssVarName})`;
    }
  }
}

/**
 * Process primitive typography tokens
 * @param {Object} typographyObj - The typography object from primitives
 * @param {Object} result - The result object to populate
 */
function processPrimitiveTypography(typographyObj, result) {
  // Process font sizes
  if (typographyObj["$font-size"]) {
    for (const key in typographyObj["$font-size"]) {
      if (
        typographyObj["$font-size"][key].$type === "number" &&
        typographyObj["$font-size"][key].$value !== undefined
      ) {
        const name = key.replace("$", "");
        const value = typographyObj["$font-size"][key].$value;
        const cssVarName = `--font-size-primitive-${name}`;

        // Add to CSS variables
        result.cssVariables.light.push(`${cssVarName}: ${convertToRem(value)};`);

        // Add to JavaScript tokens
        if (!result.jsTokens.typography.fontSize) {
          result.jsTokens.typography.fontSize = {};
        }
        if (!result.jsTokens.typography.fontSize.primitive) {
          result.jsTokens.typography.fontSize.primitive = {};
        }
        result.jsTokens.typography.fontSize.primitive[name] = `var(${cssVarName})`;
      }
    }
  }

  // Process font weights
  if (typographyObj["$font-weight"]) {
    for (const key in typographyObj["$font-weight"]) {
      if (
        typographyObj["$font-weight"][key].$type === "number" &&
        typographyObj["$font-weight"][key].$value !== undefined
      ) {
        const name = key.replace("$", "");
        const value = typographyObj["$font-weight"][key].$value;
        const cssVarName = `--font-weight-primitive-${name}`;

        // Add to CSS variables
        result.cssVariables.light.push(`${cssVarName}: ${value};`);

        // Add to JavaScript tokens
        if (!result.jsTokens.typography.fontWeight) {
          result.jsTokens.typography.fontWeight = {};
        }
        if (!result.jsTokens.typography.fontWeight.primitive) {
          result.jsTokens.typography.fontWeight.primitive = {};
        }
        result.jsTokens.typography.fontWeight.primitive[name] = `var(${cssVarName})`;
      }
    }
  }

  // Process line heights
  if (typographyObj["$line-height"]) {
    for (const key in typographyObj["$line-height"]) {
      if (
        typographyObj["$line-height"][key].$type === "number" &&
        typographyObj["$line-height"][key].$value !== undefined
      ) {
        const name = key.replace("$", "");
        const value = typographyObj["$line-height"][key].$value;
        const cssVarName = `--line-height-primitive-${name}`;

        // Add to CSS variables
        result.cssVariables.light.push(`${cssVarName}: ${convertToRem(value)};`);

        // Add to JavaScript tokens
        if (!result.jsTokens.typography.lineHeight) {
          result.jsTokens.typography.lineHeight = {};
        }
        if (!result.jsTokens.typography.lineHeight.primitive) {
          result.jsTokens.typography.lineHeight.primitive = {};
        }
        result.jsTokens.typography.lineHeight.primitive[name] = `var(${cssVarName})`;
      }
    }
  }

  // Process letter spacing
  if (typographyObj["$letter-spacing"]) {
    for (const key in typographyObj["$letter-spacing"]) {
      if (
        typographyObj["$letter-spacing"][key].$type === "number" &&
        typographyObj["$letter-spacing"][key].$value !== undefined
      ) {
        const name = key.replace("$", "");
        const value = typographyObj["$letter-spacing"][key].$value;
        const cssVarName = `--letter-spacing-primitive-${name}`;

        // Add to CSS variables
        result.cssVariables.light.push(`${cssVarName}: ${convertToRem(value)};`);

        // Add to JavaScript tokens
        if (!result.jsTokens.typography.letterSpacing) {
          result.jsTokens.typography.letterSpacing = {};
        }
        if (!result.jsTokens.typography.letterSpacing.primitive) {
          result.jsTokens.typography.letterSpacing.primitive = {};
        }
        result.jsTokens.typography.letterSpacing.primitive[name] = `var(${cssVarName})`;
      }
    }
  }
}

/**
 * Process primitive corner radius tokens
 * @param {Object} cornerRadiusObj - The corner radius object from primitives
 * @param {Object} result - The result object to populate
 */
function processPrimitiveCornerRadius(cornerRadiusObj, result) {
  for (const key in cornerRadiusObj) {
    if (cornerRadiusObj[key].$type === "number" && cornerRadiusObj[key].$value !== undefined) {
      const name = key.replace("$", "");
      const value = cornerRadiusObj[key].$value;
      const cssVarName = `--corner-radius-primitive-${name}`;

      let resolvedValue;
      if (typeof value === "string" && value.startsWith("{") && value.endsWith("}")) {
        const reference = value.substring(1, value.length - 1);
        const parts = reference.split(".");

        // If it's a reference to a primitive spacing value, directly use the corresponding CSS variable
        if (parts[0] === "@primitives") {
          const collectionKey = parts[1].replace("$", "");
          const valueKey = parts[2].replace("$", "");
          resolvedValue = `var(--${collectionKey}-primitive-${valueKey})`;
          result.cssVariables.light.push(`${cssVarName}: ${resolvedValue};`);
        } else {
          // Otherwise, try to resolve the value normally
          resolvedValue = resolveReference(value, variables);
          result.cssVariables.light.push(`${cssVarName}: ${convertToRem(resolvedValue)};`);
        }
      } else {
        // Not a reference, use directly
        resolvedValue = value;
        result.cssVariables.light.push(`${cssVarName}: ${convertToRem(resolvedValue)};`);
      }

      // Add to JavaScript tokens
      if (!result.jsTokens.cornerRadius.primitive) {
        result.jsTokens.cornerRadius.primitive = {};
      }
      result.jsTokens.cornerRadius.primitive[name] = `var(${cssVarName})`;
    }
  }
}

/**
 * Process spacing tokens from design variables
 * @param {Object} spacingObj - The spacing object from design variables
 * @param {Object} result - The result object to populate
 * @param {Object} variables - The variables object for reference resolution
 */
function processSpacingTokens(spacingObj, result, variables) {
  for (const key in spacingObj) {
    if (spacingObj[key].$type === "number" && spacingObj[key].$value !== undefined) {
      const name = key.replace("$", "");
      const value = resolveReference(spacingObj[key].$value, variables);
      const cssVarName = `--spacing-${name}`;

      // Add to CSS variables
      result.cssVariables.light.push(`${cssVarName}: ${convertToRem(value)};`);

      // Add to JavaScript tokens
      if (!result.jsTokens.spacing) {
        result.jsTokens.spacing = {};
      }

      result.jsTokens.spacing[name] = `var(${cssVarName})`;
    }
  }
}

/**
 * Process typography tokens from design variables
 * @param {Object} typographyObj - The typography object from design variables
 * @param {Object} result - The result object to populate
 * @param {Object} variables - The variables object for reference resolution
 */
function processTypographyTokens(typographyObj, result, variables) {
  // Process font families
  if (typographyObj.$font) {
    processFontFamilyTokens(typographyObj.$font, result);
  }

  // Process font sizes
  if (typographyObj["$font-size"]) {
    processFontSizeTokens(typographyObj["$font-size"], result, variables);
  }

  // Process font weights
  if (typographyObj["$font-weight"]) {
    processFontWeightTokens(typographyObj["$font-weight"], result, variables);
  }

  // Process line heights
  if (typographyObj["$line-height"]) {
    processLineHeightTokens(typographyObj["$line-height"], result, variables);
  }

  // Process letter spacing
  if (typographyObj["$letter-spacing"]) {
    processLetterSpacingTokens(typographyObj["$letter-spacing"], result, variables);
  }
}

/**
 * Process font family tokens
 * @param {Object} fontObj - The font family object from typography
 * @param {Object} result - The result object to populate
 */
function processFontFamilyTokens(fontObj, result) {
  for (const key in fontObj) {
    if (fontObj[key].$type === "string" && fontObj[key].$value) {
      const name = key.replace("$", "");
      const value = fontObj[key].$value;
      const cssVarName = `--font-family-${name}`;

      // Add to CSS variables
      result.cssVariables.light.push(`${cssVarName}: ${value};`);

      // Add to JavaScript tokens
      if (!result.jsTokens.typography.fontFamily) {
        result.jsTokens.typography.fontFamily = {};
      }
      result.jsTokens.typography.fontFamily[name] = `var(${cssVarName})`;
    }
  }
}

/**
 * Process font size tokens
 * @param {Object} fontSizeObj - The font size object from typography
 * @param {Object} result - The result object to populate
 * @param {Object} variables - The variables object for reference resolution
 */
function processFontSizeTokens(fontSizeObj, result, variables) {
  for (const key in fontSizeObj) {
    if (fontSizeObj[key].$type === "number" && fontSizeObj[key].$value !== undefined) {
      const name = key.replace("$", "");
      const value = resolveReference(fontSizeObj[key].$value, variables);
      const cssVarName = `--font-size-${name}`;

      // Add to CSS variables
      result.cssVariables.light.push(`${cssVarName}: ${convertToRem(value)};`);

      // Add to JavaScript tokens
      if (!result.jsTokens.typography.fontSize) {
        result.jsTokens.typography.fontSize = {};
      }
      result.jsTokens.typography.fontSize[name] = `var(${cssVarName})`;
    }
  }
}

/**
 * Process font weight tokens
 * @param {Object} fontWeightObj - The font weight object from typography
 * @param {Object} result - The result object to populate
 * @param {Object} variables - The variables object for reference resolution
 */
function processFontWeightTokens(fontWeightObj, result, variables) {
  for (const key in fontWeightObj) {
    if (fontWeightObj[key].$type === "number" && fontWeightObj[key].$value !== undefined) {
      const name = key.replace("$", "");
      const value = resolveReference(fontWeightObj[key].$value, variables);
      const cssVarName = `--font-weight-${name}`;

      // Add to CSS variables
      result.cssVariables.light.push(`${cssVarName}: ${value};`);

      // Add to JavaScript tokens
      if (!result.jsTokens.typography.fontWeight) {
        result.jsTokens.typography.fontWeight = {};
      }
      result.jsTokens.typography.fontWeight[name] = `var(${cssVarName})`;
    }
  }
}

/**
 * Process line height tokens
 * @param {Object} lineHeightObj - The line height object from typography
 * @param {Object} result - The result object to populate
 * @param {Object} variables - The variables object for reference resolution
 */
function processLineHeightTokens(lineHeightObj, result, variables) {
  for (const key in lineHeightObj) {
    if (lineHeightObj[key].$type === "number" && lineHeightObj[key].$value !== undefined) {
      const name = key.replace("$", "");
      const value = resolveReference(lineHeightObj[key].$value, variables);
      const cssVarName = `--line-height-${name}`;

      // Add to CSS variables
      result.cssVariables.light.push(`${cssVarName}: ${convertToRem(value)};`);

      // Add to JavaScript tokens
      if (!result.jsTokens.typography.lineHeight) {
        result.jsTokens.typography.lineHeight = {};
      }
      result.jsTokens.typography.lineHeight[name] = `var(${cssVarName})`;
    }
  }
}

/**
 * Process letter spacing tokens
 * @param {Object} letterSpacingObj - The letter spacing object from typography
 * @param {Object} result - The result object to populate
 * @param {Object} variables - The variables object for reference resolution
 */
function processLetterSpacingTokens(letterSpacingObj, result, variables) {
  for (const key in letterSpacingObj) {
    if (letterSpacingObj[key].$type === "number" && letterSpacingObj[key].$value !== undefined) {
      const name = key.replace("$", "");
      const value = resolveReference(letterSpacingObj[key].$value, variables);
      const cssVarName = `--letter-spacing-${name}`;

      // Add to CSS variables
      result.cssVariables.light.push(`${cssVarName}: ${convertToRem(value)};`);

      // Add to JavaScript tokens
      if (!result.jsTokens.typography.letterSpacing) {
        result.jsTokens.typography.letterSpacing = {};
      }
      result.jsTokens.typography.letterSpacing[name] = `var(${cssVarName})`;
    }
  }
}

/**
 * Process corner radius tokens (correcting 'corder-radius' to 'corner-radius')
 * @param {Object} cornerRadiusObj - The corner radius object from sizing
 * @param {Object} result - The result object to populate
 * @param {Object} variables - The variables object for reference resolution
 */
function processCornerRadiusTokens(cornerRadiusObj, result, variables) {
  for (const key in cornerRadiusObj) {
    if (cornerRadiusObj[key].$type === "number" && cornerRadiusObj[key].$value !== undefined) {
      const name = key.replace("$", "");
      const refValue = cornerRadiusObj[key].$value;
      // Fix the variable name from corder to corner
      const cssVarName = `--corner-radius-${name}`;

      // For corner radius tokens, we need to handle the special case of it referencing spacing values
      let resolvedValue;
      if (typeof refValue === "string" && refValue.startsWith("{") && refValue.endsWith("}")) {
        const reference = refValue.substring(1, refValue.length - 1);
        const parts = reference.split(".");

        // If it's a reference to a primitive spacing value, directly use the corresponding CSS variable
        if (parts[0] === "@primitives") {
          const collectionKey = parts[1].replace("$", "");
          const valueKey = parts[2].replace("$", "");
          resolvedValue = `var(--${collectionKey}-primitive-${valueKey})`;
          result.cssVariables.light.push(`${cssVarName}: ${resolvedValue};`);
        } else {
          // Otherwise, try to resolve the value normally
          resolvedValue = resolveReference(refValue, variables);
          result.cssVariables.light.push(`${cssVarName}: ${convertToRem(resolvedValue)};`);
        }
      } else {
        // Not a reference, use directly
        resolvedValue = refValue;
        result.cssVariables.light.push(`${cssVarName}: ${convertToRem(resolvedValue)};`);
      }

      // Add to JavaScript tokens
      if (!result.jsTokens.cornerRadius) {
        result.jsTokens.cornerRadius = {};
      }
      result.jsTokens.cornerRadius[name] = `var(${cssVarName})`;
    }
  }
}

/**
 * Process color tokens from design variables
 * @param {Object} colorObj - The color object from design variables
 * @param {String} parentPath - The parent path for nesting
 * @param {Object} result - The result object to populate
 */
function processColorTokens(colorObj, parentPath, result, variables) {
  for (const key in colorObj) {
    if (typeof colorObj[key] === "object" && !Array.isArray(colorObj[key])) {
      const newPath = parentPath ? `${parentPath}-${key.replace("$", "")}` : key.replace("$", "");

      // If this is a color token with value and type
      if (colorObj[key].$type === "color" && colorObj[key].$value) {
        const name = parentPath ? `${parentPath}-${key.replace("$", "")}` : key.replace("$", "");
        const value = colorObj[key].$value;
        const cssVarName = `--color-${name.replace(/\$/g, "")}`;

        // Add to CSS variables for light mode
        if (
          colorObj[key].$variable_metadata &&
          colorObj[key].$variable_metadata.modes &&
          colorObj[key].$variable_metadata.modes.light
        ) {
          const lightValue = resolveColor(colorObj[key].$variable_metadata.modes.light, variables);
          result.cssVariables.light.push(`${cssVarName}: ${lightValue};`);
        } else {
          const resolvedValue = resolveColor(value, variables);
          result.cssVariables.light.push(`${cssVarName}: ${resolvedValue};`);
        }

        // Add to CSS variables for dark mode
        if (
          colorObj[key].$variable_metadata &&
          colorObj[key].$variable_metadata.modes &&
          colorObj[key].$variable_metadata.modes.dark
        ) {
          const darkValue = resolveColor(colorObj[key].$variable_metadata.modes.dark, variables);
          result.cssVariables.dark.push(`${cssVarName}: ${darkValue};`);
        }

        // Add to JavaScript tokens
        addToJsTokens(result.jsTokens.colors, name.replace(/\$/g, ""), cssVarName);
      } else {
        // Recursively process nested color objects
        processColorTokens(colorObj[key], newPath, result, variables);
      }
    }
  }
}

/**
 * Process primitive colors
 * @param {Object} primitiveColors - The primitive colors object
 * @param {Object} result - The result object to populate
 * @param {Object} variables - The variables object for reference resolution
 */
function processPrimitiveColors(primitiveColors, result, variables) {
  for (const colorFamily in primitiveColors) {
    const familyName = colorFamily.replace("$", "");

    for (const shade in primitiveColors[colorFamily]) {
      try {
        if (primitiveColors[colorFamily][shade].$type === "color" && primitiveColors[colorFamily][shade].$value) {
          const name = `${familyName}-${shade}`;
          const value = primitiveColors[colorFamily][shade].$value;
          const cssVarName = `--color-primitive-${name}`;

          // Add to CSS variables
          result.cssVariables.light.push(`${cssVarName}: ${value};`);

          // Add to JavaScript tokens
          if (!result.jsTokens.colors.primitive) {
            result.jsTokens.colors.primitive = {};
          }
          if (!result.jsTokens.colors.primitive[familyName]) {
            result.jsTokens.colors.primitive[familyName] = {};
          }

          result.jsTokens.colors.primitive[familyName][shade] = `var(${cssVarName})`;
        }
      } catch (error) {
        console.warn(`Warning: Error processing primitive color ${colorFamily}.${shade}:`, error.message);
      }
    }
  }
}

/**
 * Resolve color values, handling references to other variables
 * @param {String} value - The color value to resolve
 * @param {Object} variables - The variables object for reference resolution
 * @param {Boolean} asCssVariable - Whether to return the value as a CSS variable
 * @returns {String} - The resolved color value
 */
function resolveColor(value, variables, asCssVariable = true) {
  if (typeof value !== "string") return value;

  // Handle references like "{@primitives.$color.$sand.100}"
  if (value.startsWith("{") && value.endsWith("}")) {
    const reference = value.substring(1, value.length - 1);
    const parts = reference.split(".");

    if (asCssVariable) {
      return `var(--color-${reference
        .replace("@primitives.", "primitive")
        .replace("$color.", "")
        .replace(/[$\.]/g, "-")})`;
    }

    // Navigate through the object to find the referenced value
    let current = variables;
    for (const part of parts) {
      if (current[part]) {
        current = current[part];
      } else {
        // If we can't resolve, return the CSS variable equivalent
        return `var(--color-${reference.replace(/[@$\.]/g, "-").substring(1)})`;
      }
    }

    if (current.$value) {
      return current.$value;
    }

    return value;
  }

  return value;
}

/**
 * Resolve references to other variables
 * @param {String|Number} value - The value to resolve
 * @param {Object} variables - The variables object for reference resolution
 * @returns {String|Number} - The resolved value
 */
function resolveReference(value, variables) {
  if (typeof value !== "string") return value;

  // Handle references like "{@sizing.$spacing.base}"
  if (value.startsWith("{") && value.endsWith("}")) {
    const reference = value.substring(1, value.length - 1);
    const parts = reference.split(".");

    // Navigate through the object to find the referenced value
    let current = variables;
    for (const part of parts) {
      if (current[part]) {
        current = current[part];
      } else {
        // If we can't resolve, return the original value
        return value;
      }
    }

    if (current.$value !== undefined) {
      return current.$value;
    }

    return value;
  }

  return value;
}

/**
 * Add a token to the JavaScript tokens object
 * @param {Object} obj - The object to add to
 * @param {String} path - The path to add at
 * @param {String} cssVarName - The CSS variable name
 */
function addToJsTokens(obj, path, cssVarName) {
  const parts = path.split("-");
  let current = obj;

  // Handle the case where we have nested properties like "surface-hover"
  // which should be transformed to obj.surface.hover
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];

    // Check if this is a terminal value (string) that we're trying to add properties to
    if (typeof current[part] === "string") {
      // Create a new object to replace the string value
      const oldValue = current[part];
      current[part] = {
        DEFAULT: oldValue,
      };
    } else if (!current[part]) {
      current[part] = {};
    }

    current = current[part];
  }

  const lastPart = parts[parts.length - 1];

  // If lastPart is something like "hover" and we're dealing with "surface-hover",
  // we should set it as a property of the "surface" object
  current[lastPart] = `var(${cssVarName})`;
}

/**
 * Generate CSS content
 * @param {Object} result - The processed tokens
 * @returns {String} - The CSS content
 */
function generateCssContent(result) {
  let content = "// Generated from design-tokens.json - DO NOT EDIT DIRECTLY\n\n";

  // Light mode variables (default)
  content += ":root {\n";
  result.cssVariables.light.forEach((variable) => {
    content += `  ${variable}\n`;
  });
  content += "}\n\n";

  // Dark mode variables
  content += '[data-theme="dark"] {\n';
  result.cssVariables.dark.forEach((variable) => {
    content += `  ${variable}\n`;
  });
  content += "}\n";

  return content;
}

/**
 * Transform color object structure for better Tailwind CSS compatibility
 * @param {Object} colors - The color object to transform
 * @returns {Object} - The transformed color object
 */
function transformColorObjectForTailwind(colors) {
  const transformed = {};

  // Process each color category
  for (const category in colors) {
    transformed[category] = {};
    const colorGroup = colors[category];

    // Group variants like "surface-hover" under their base name with variants as properties
    for (const key in colorGroup) {
      const parts = key.split("-");

      // Skip if already processed
      if (parts.length === 1) {
        transformed[category][key] = colorGroup[key];
        continue;
      }

      // Handle cases like "surface-hover", "surface-active", etc.
      const baseName = parts[0];
      const variantName = parts.slice(1).join("-");

      if (!transformed[category][baseName]) {
        // Check if base color exists in original object
        if (colorGroup[baseName]) {
          transformed[category][baseName] = {
            DEFAULT: colorGroup[baseName],
          };
        } else {
          transformed[category][baseName] = {};
        }
      } else if (typeof transformed[category][baseName] === "string") {
        // Convert string value to object with DEFAULT property
        transformed[category][baseName] = {
          DEFAULT: transformed[category][baseName],
        };
      }

      // Add the variant
      transformed[category][baseName][variantName] = colorGroup[key];
    }
  }

  return transformed;
}

/**
 * Process JS tokens for output, merging primitive values
 * @param {Object} tokens - The tokens to process
 * @returns {Object} - The processed tokens
 */
function processJsTokens(tokens) {
  // Merge primitive values at all levels
  const merged = mergePrimitiveValues(tokens);

  // Then transform colors for Tailwind if they exist
  if (merged.colors) {
    merged.colors = transformColorObjectForTailwind(merged.colors);
  }

  return merged;
}

/**
 * Merge primitive values from nested structures
 * @param {Object} values - The object to process
 * @returns {Object} - The processed object with primitive values merged
 */
function mergePrimitiveValues(values) {
  if (typeof values !== "object" || values === null || Array.isArray(values)) {
    return values;
  }

  const result = {};

  // First, process all non-primitive keys and add them to the result
  for (const [key, value] of Object.entries(values)) {
    if (key !== "primitive") {
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        result[key] = mergePrimitiveValues(value);
      } else {
        result[key] = value;
      }
    }
  }

  // Then, if there's a primitive key, merge up its values into the result
  if (values.primitive) {
    if (typeof values.primitive === "object" && !Array.isArray(values.primitive)) {
      // Handle nested primitive objects (e.g., typography.primitive.fontSize)
      for (const [primKey, primValue] of Object.entries(values.primitive)) {
        result[primKey] = mergePrimitiveValues(primValue);
      }
    }
  }

  return result;
}

/**
 * Generate JS content from tokens
 * @param {Object} jsTokens - The JS tokens to convert to content
 * @returns {string} - The JS content
 */
function generateJsContent(jsTokens) {
  const content = `// This file is generated by the design-tokens-converter tool.
// Do not edit this file directly. Edit design-tokens.json instead.

const designTokens = ${JSON.stringify(processJsTokens(jsTokens), null, 2)};

module.exports = designTokens;
`;

  return content;
}

/**
 * Main function to run the design tokens converter
 */
const designTokensConverter = async () => {
  try {
    console.log("Reading design variables file from:", designVariablesPath);

    // Check if file exists before trying to read it
    try {
      await fs.access(designVariablesPath);
    } catch (error) {
      console.error(`Error: The design-tokens.json file does not exist at ${designVariablesPath}`);
      console.log("Please create this file by exporting your design tokens from Figma");
      return { success: false, error: "Design tokens file not found" };
    }

    const designVariablesData = await fs.readFile(designVariablesPath, "utf8");

    try {
      const variables = JSON.parse(designVariablesData);

      console.log("Processing design variables...");
      const processed = processDesignVariables(variables);

      console.log("Generating CSS...");
      const cssContent = generateCssContent(processed);

      console.log("Generating JavaScript...");
      const jsContent = generateJsContent(processed.jsTokens);

      // Ensure directory exists
      const cssDir = path.dirname(cssOutputPath);
      await fs.mkdir(cssDir, { recursive: true });

      // Write files
      await fs.writeFile(cssOutputPath, cssContent);
      await fs.writeFile(jsOutputPath, jsContent);

      console.log(`CSS variables written to ${cssOutputPath}`);
      console.log(`JavaScript tokens written to ${jsOutputPath}`);

      return { success: true };
    } catch (parseError) {
      console.error("Error parsing design tokens JSON:", parseError.message);
      console.log("Please ensure your design-tokens.json file contains valid JSON");
      return { success: false, error: "JSON parsing error" };
    }
  } catch (error) {
    console.error("Error:", error);
    return { success: false, error: error.message };
  }
};

// Execute the function when this script is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  designTokensConverter().then((result) => {
    if (!result.success) {
      process.exit(1);
    }
    console.log("Design tokens conversion complete");
  });
}

export default designTokensConverter;
