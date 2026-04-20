/**
 * validate.ts — schema validation for DocSpec.
 *
 * v0.2 scope:
 * - Frontmatter required-fields check against DocTypeSchema
 * - Component name lookups against ComponentRegistry
 * - Component prop presence + primitive-type check against each component's PropSchema
 */

import type {
  ComponentRegistry,
  DocSpec,
  DocTypeSchema,
  ValidationError,
  ValidationResult,
  ValidationWarning,
} from "./types.js";

export interface ValidateOpts {
  docTypeSchema?: DocTypeSchema;
  components?: ComponentRegistry;
}

export function validate(spec: DocSpec, opts: ValidateOpts = {}): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Doc type schema (optional — if absent, skip frontmatter validation).
  if (opts.docTypeSchema) {
    if (opts.docTypeSchema.id !== spec.type) {
      errors.push({
        code: "UNKNOWN_DOC_TYPE",
        message: `Document declares type "${spec.type}", but schema is for "${opts.docTypeSchema.id}".`,
      });
    }
    for (const key of opts.docTypeSchema.requiredFrontmatter) {
      if (spec.frontmatter[key] === undefined || spec.frontmatter[key] === null) {
        errors.push({
          code: "MISSING_FRONTMATTER",
          message: `Required frontmatter field "${key}" is missing.`,
          path: `frontmatter.${key}`,
        });
      }
    }
    // Warnings for recommended sections.
    for (const recommended of opts.docTypeSchema.recommendedSections || []) {
      const present = spec.sections.some(
        (s) => s.heading && s.heading.toLowerCase().includes(recommended.toLowerCase())
      );
      if (!present) {
        warnings.push({
          code: "MISSING_RECOMMENDED_SECTION",
          message: `Recommended section "${recommended}" not found.`,
        });
      }
    }
  }

  // Component validation.
  if (opts.components) {
    for (const section of spec.sections) {
      for (const usage of section.components) {
        const def = opts.components[usage.name];
        if (!def) {
          errors.push({
            code: "UNKNOWN_COMPONENT",
            message: `Component "${usage.name}" is not registered.`,
            path: `sections.${section.id}.components.${usage.id}`,
          });
          continue;
        }
        const required = def.propSchema.required || [];
        for (const propName of required) {
          if (usage.props[propName] === undefined) {
            errors.push({
              code: "COMPONENT_MISSING_PROP",
              message: `Component "${usage.name}" is missing required prop "${propName}".`,
              path: `sections.${section.id}.components.${usage.id}.props.${propName}`,
            });
          }
        }
        for (const [propName, propDef] of Object.entries(def.propSchema.properties)) {
          const value = usage.props[propName];
          if (value === undefined) continue;
          if (typeof value !== propDef.type) {
            errors.push({
              code: "COMPONENT_BAD_PROP_TYPE",
              message: `Prop "${propName}" on "${usage.name}" expected ${propDef.type}, got ${typeof value}.`,
              path: `sections.${section.id}.components.${usage.id}.props.${propName}`,
            });
          }
        }
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}
