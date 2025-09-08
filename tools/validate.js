#!/usr/bin/env node

/**
 * Validation tool for ODRL Permissions Assertion examples
 * Validates JSON examples against the JSON Schema
 */

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

// Initialize AJV
const ajv = new Ajv({ 
  strict: false,
  allErrors: true,
  verbose: true
});
addFormats(ajv);

// Example files to validate
const examplesDir = path.join(__dirname, '..', 'docs', 'modules', 'ROOT', 'attachments', 'examples', 'v1.0');
const schemaDir = path.join(__dirname, '..', 'docs', 'modules', 'ROOT', 'attachments', 'schema', 'v1.0');

const exampleFiles = [
  { file: 'offer.json', schema: 'index.json', description: 'ODRL Offer Policy' },
  { file: 'agreement.json', schema: 'index.json', description: 'ODRL Agreement Policy' },
  { file: 'c2pa-assertion-example.json', schema: 'c2pa-assertion.json', description: 'C2PA Assertion Wrapper' }
];

let hasErrors = false;

console.log('🔍 Validating ODRL Permissions Assertion examples...\n');

// Validate each example
exampleFiles.forEach(({ file: filename, schema: schemaFile, description }) => {
  const filePath = path.join(examplesDir, filename);
  const schemaPath = path.join(schemaDir, schemaFile);
  
  console.log(`Validating ${filename} against ${schemaFile}...`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Example file not found: ${filename}`);
    hasErrors = true;
    return;
  }
  
  if (!fs.existsSync(schemaPath)) {
    console.error(`❌ Schema file not found: ${schemaFile}`);
    hasErrors = true;
    return;
  }
  
  try {
    const exampleData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const exampleSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    
    // Remove the $schema reference to avoid AJV issues
    delete exampleSchema.$schema;
    
    // Create a new AJV instance for each validation to avoid ID conflicts
    const freshAjv = new Ajv({ 
      strict: false,
      allErrors: true,
      verbose: true
    });
    addFormats(freshAjv);
    
    const exampleValidate = freshAjv.compile(exampleSchema);
    const valid = exampleValidate(exampleData);
    
    if (valid) {
      console.log(`✅ ${filename} (${description}) - Valid`);
    } else {
      console.error(`❌ ${filename} (${description}) - Invalid:`);
      exampleValidate.errors.forEach(error => {
        console.error(`  - ${error.instancePath || 'root'}: ${error.message}`);
        if (error.params) {
          console.error(`    Allowed values: ${JSON.stringify(error.params.allowedValues || error.params)}`);
        }
      });
      hasErrors = true;
    }
  } catch (error) {
    console.error(`❌ ${filename} - Error: ${error.message}`);
    hasErrors = true;
  }
});

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('❌ Validation failed - see errors above');
  process.exit(1);
} else {
  console.log('✅ All validations passed');
  process.exit(0);
}
