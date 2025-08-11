#!/usr/bin/env node

/**
 * Validation tool for ODRL Permissions Assertion examples
 * Validates JSON examples against the JSON Schema
 */

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

// Initialize AJV with JSON Schema Draft 2020-12
const ajv = new Ajv({ strict: false });
addFormats(ajv);

// Load the JSON Schema
const schemaPath = path.join(__dirname, '..', 'docs', 'modules', 'ROOT', 'attachments', 'schema', 'v1.0', 'index.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

// Compile the schema
const validate = ajv.compile(schema);

// Example files to validate
const examplesDir = path.join(__dirname, '..', 'docs', 'modules', 'ROOT', 'attachments', 'examples', 'v1.0');
const exampleFiles = [
  'offer.json',
  'agreement.json'
];

let hasErrors = false;

console.log('🔍 Validating ODRL Permissions Assertion examples...\n');

// Validate each example
exampleFiles.forEach(filename => {
  const filePath = path.join(examplesDir, filename);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Example file not found: ${filename}`);
    hasErrors = true;
    return;
  }
  
  try {
    const exampleData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const valid = validate(exampleData);
    
    if (valid) {
      console.log(`✅ ${filename} - Valid`);
    } else {
      console.error(`❌ ${filename} - Invalid:`);
      console.error(JSON.stringify(validate.errors, null, 2));
      hasErrors = true;
    }
  } catch (error) {
    console.error(`❌ ${filename} - JSON Parse Error: ${error.message}`);
    hasErrors = true;
  }
});

// Validate schema itself
console.log('\n🔍 Validating JSON Schema...');
try {
  const metaSchema = require('ajv/dist/refs/json-schema-draft-2020-12.json');
  const metaValidate = ajv.compile(metaSchema);
  const schemaValid = metaValidate(schema);
  
  if (schemaValid) {
    console.log('✅ JSON Schema - Valid');
  } else {
    console.error('❌ JSON Schema - Invalid:');
    console.error(JSON.stringify(metaValidate.errors, null, 2));
    hasErrors = true;
  }
} catch (error) {
  console.error(`❌ JSON Schema validation error: ${error.message}`);
  hasErrors = true;
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ Validation failed - see errors above');
  process.exit(1);
} else {
  console.log('✅ All validations passed');
  process.exit(0);
}
