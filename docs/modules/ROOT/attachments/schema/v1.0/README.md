# ODRL Permissions Assertion Schemas

This directory contains JSON schemas for validating ODRL Permissions Assertions in C2PA manifests.

## Schema Architecture

### 1. ODRL Policy Schema (`index.json`)

The main schema that validates ODRL policies (Offers and Agreements) following the CAWG ODRL Profile for C2PA.

**Key Features:**
- Validates both `Offer` and `Agreement` policy types
- Enforces CAWG profile constraints (`https://cawg.io/profiles/odrl-c2pa/v1`)
- Requires identity binding via `cawg:assertionRef`
- Requires ingredient binding via `cawg:ingredient`
- Supports action refinements and constraints
- Includes conflict resolution strategies

**Usage:**
```bash
# Validate an ODRL policy
ajv validate -s index.json -d offer.json
```

### 2. C2PA Assertion Wrapper Schema (`c2pa-assertion.json`)

Validates the C2PA assertion structure that contains an ODRL policy.

**Key Features:**
- Validates assertion label (`cawg.odrlPermissions`)
- Validates the embedded ODRL policy data
- References the main ODRL policy schema

**Usage:**
```bash
# Validate a C2PA assertion containing an ODRL policy
ajv validate -s c2pa-assertion.json -d c2pa-assertion-example.json
```

## Schema Design Principles

### One Policy Type Per Assertion
- Each `cawg.odrlPermissions` assertion contains exactly one ODRL policy
- Policy must be either `Offer` or `Agreement` (not both)
- Use `inheritFrom` to link Agreements to their originating Offers

### One Ingredient Per Assertion
- Each assertion targets exactly one ingredient via `cawg:ingredient`
- Multiple ingredients require multiple assertions
- All permissions in a policy must target the same ingredient

### Identity Binding
- `assigner` and `assignee` must be verifiable via CAWG Identity assertions
- `cawg:assertionRef` must point to the relevant CAWG Identity assertion
- Identity verification is handled by validators, not schema

### Action Constraints
- Only C2PA-safe actions are allowed: `c2pa.published`, `c2pa.transcoded`, `c2pa.repackaged`
- Actions can be simple strings or objects with refinements
- Refinements allow spatial, temporal, and other constraints

## Examples

### Offer Policy
```json
{
  "@context": ["https://www.w3.org/ns/odrl.jsonld", "https://cawg.io/contexts/odrl-c2pa/v1"],
  "@type": "Offer",
  "uid": "https://example.com/policy/offer-001",
  "profile": "https://cawg.io/profiles/odrl-c2pa/v1",
  "assigner": "did:web:originvault.io",
  "assignee": "did:web:cdn.example",
  "conflict": "perm",
  "permission": [{
    "target": "self#jumbf=c2pa.assertions/c2pa.ingredient",
    "action": {
      "rdf:value": "c2pa.transcoded",
      "refinement": [{
        "leftOperand": "odrl:spatial",
        "operator": "odrl:eq",
        "rightOperand": "US"
      }]
    }
  }],
  "cawg:assertionRef": "self#jumbf=c2pa.assertions/cawg.identity",
  "cawg:ingredient": "self#jumbf=c2pa.assertions/c2pa.ingredient"
}
```

### Agreement Policy
```json
{
  "@context": ["https://www.w3.org/ns/odrl.jsonld", "https://cawg.io/contexts/odrl-c2pa/v1"],
  "@type": "Agreement",
  "uid": "https://example.com/policy/agreement-009",
  "profile": "https://cawg.io/profiles/odrl-c2pa/v1",
  "assigner": "did:web:originvault.io",
  "assignee": "did:web:distributor.example",
  "conflict": "perm",
  "permission": [{
    "target": "self#jumbf=c2pa.assertions/c2pa.ingredient",
    "action": "c2pa.published"
  }],
  "obligation": [{
    "action": "odrl:attribute",
    "target": "did:web:originvault.io"
  }],
  "cawg:assertionRef": "self#jumbf=c2pa.assertions/cawg.identity",
  "cawg:ingredient": "self#jumbf=c2pa.assertions/c2pa.ingredient"
}
```

### C2PA Assertion Wrapper
```json
{
  "label": "cawg.odrlPermissions",
  "data": {
    // ... ODRL policy as above
  }
}
```

## Validation Rules

### Schema-Level Validation
- JSON Schema validates structure, types, and constraints
- Required fields must be present
- Enum values must match allowed options
- Format validation for URIs and date-times

### Business Logic Validation (Validator Implementation)
- Identity binding verification via CAWG Identity assertions
- Ingredient binding verification via JUMBF resolution
- Action parity with `c2pa.actions` assertions
- Time constraint evaluation
- Conflict resolution according to strategy
- Status attestation handling

## File Structure

```
schema/v1.0/
├── index.json                    # Main ODRL policy schema
├── c2pa-assertion.json          # C2PA assertion wrapper schema
├── README.md                    # This documentation
└── examples/
    ├── offer.json               # Offer policy example
    ├── agreement.json           # Agreement policy example
    └── c2pa-assertion-example.json # C2PA assertion example
```

## Testing

Use the validation tool to test schemas and examples:

```bash
npm run lint:schema
```

This will validate all examples against their respective schemas and report any errors.
