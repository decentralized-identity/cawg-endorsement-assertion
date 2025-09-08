# Manifest Embedding Examples

This document shows how to embed ODRL Permissions Assertions in C2PA manifests.

## Assertion Store Entry

The ODRL policy should be embedded in the C2PA assertion store with the label `cawg.odrlPermissions`:

```json
{
  "label": "cawg.odrlPermissions",
  "data": {
    "@context": [
      "https://www.w3.org/ns/odrl.jsonld",
      "https://cawg.io/contexts/odrl-c2pa/v1"
    ],
    "@type": "Offer",
    "uid": "urn:uuid:odrl-offer-123",
    "profile": "https://cawg.io/profiles/odrl-c2pa/v1",
    "assigner": "did:web:originvault.io",
    "permission": [{
      "target": "self#jumbf=c2pa/…/c2pa.assertions/c2pa.ingredient",
      "action": "c2pa.transcoded",
      "constraint": [{
        "leftOperand": "odrl:dateTime",
        "operator": "odrl:lteq",
        "rightOperand": "2026-12-31T23:59:59Z"
      }]
    }],
    "cawg:assertionRef": "self#jumbf=c2pa/…/c2pa.assertions/cawg.identity",
    "cawg:ingredient": "self#jumbf=c2pa/…/c2pa.assertions/c2pa.ingredient"
  }
}
```

## JUMBF Self-Links

### CAWG Identity Assertion Reference

The `cawg:assertionRef` must point to the CAWG Identity assertion in the same manifest:

```
self#jumbf=c2pa/…/c2pa.assertions/cawg.identity
```

### Ingredient Assertion Reference

The `cawg:ingredient` must point to the ingredient assertion referenced by the `c2pa.actions`:

```
self#jumbf=c2pa/…/c2pa.assertions/c2pa.ingredient
```

## Required Assertions

### CAWG Identity Assertion

A CAWG Identity assertion must be present in the same manifest:

```json
{
  "label": "cawg.identity",
  "data": {
    "issuer": "did:web:originvault.io",
    "subject": "did:web:originvault.io",
    "verificationMethod": "did:web:originvault.io#key-1"
  }
}
```

### C2PA Actions Assertion

A `c2pa.actions` assertion must reference the same ingredient:

```json
{
  "label": "c2pa.actions",
  "data": {
    "actions": [{
      "action": "c2pa.transcoded",
      "parameters": {
        "ingredient": "self#jumbf=c2pa/…/c2pa.assertions/c2pa.ingredient"
      }
    }]
  }
}
```

### C2PA Ingredient Assertion

The ingredient assertion must be present and properly linked:

```json
{
  "label": "c2pa.ingredient",
  "data": {
    "instance_id": "xmp:iid:12345678-1234-1234-1234-123456789abc",
    "relationship": "parentOf",
    "title": "Source Image",
    "format": "image/jpeg"
  }
}
```

## Complete Manifest Structure

A complete manifest should include:

1. **ODRL Permissions Assertion** (`cawg.odrlPermissions`)
2. **CAWG Identity Assertion** (`cawg.identity`)
3. **C2PA Actions Assertion** (`c2pa.actions`)
4. **C2PA Ingredient Assertion** (`c2pa.ingredient`)

All assertions must be properly linked through JUMBF references, and the manifest must be cryptographically signed to ensure integrity and authenticity.
