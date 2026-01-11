# JWT Decoder & Inspector

> **Category**: Development  
> **Path**: `/tools/development/jwt-decoder`  
> **Status**: Live  
> **Processing**: Client-side (no server upload)

## Overview

The JWT Decoder & Inspector is a secure, browser-based tool for decoding, viewing, and validating JSON Web Tokens (JWT). All processing happens locally in your browser - no data is ever sent to any server, making it safe to decode sensitive tokens.

## Features

### Core Features
- **Real-time Decoding**: Instantly decode JWT tokens as you type or paste
- **Token Validation**: Validates JWT structure (header.payload.signature format)
- **Expiration Checking**: Automatically detects and displays token expiration status
- **JSON Syntax Highlighting**: Color-coded display of header and payload data

### Token Sections Displayed
- **Header**: Shows algorithm (alg), token type (typ), and key ID (kid) if present
- **Payload**: Displays all claims with standard claims highlighted
- **Signature**: Hidden by default for security, with toggle visibility option

### Additional Features
- **Copy Functionality**: Copy individual sections (header, payload, signature) to clipboard
- **Standard Claims Display**: Parsed view of common JWT claims with human-readable timestamps
- **Educational Content**: Built-in information about JWT structure and use cases

## How to Use

1. **Paste Token**: Enter or paste your JWT token in the input textarea
2. **View Results**: The tool automatically decodes and displays the token sections
3. **Check Status**: Review the expiration status indicator (Valid/Expired)
4. **Copy Data**: Use copy buttons to copy specific sections
5. **View Signature**: Toggle signature visibility if needed

## Standard JWT Claims

The decoder recognizes and formats these registered claims:

| Claim | Name | Description |
|-------|------|-------------|
| `iss` | Issuer | Entity that issued the token |
| `sub` | Subject | Subject of the token (usually user ID) |
| `aud` | Audience | Recipients the token is intended for |
| `exp` | Expiration | Unix timestamp when token expires |
| `nbf` | Not Before | Unix timestamp when token becomes valid |
| `iat` | Issued At | Unix timestamp when token was issued |
| `jti` | JWT ID | Unique identifier for the token |

## Token Structure

A JWT consists of three parts separated by dots (`.`):

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

| Part | Color | Description |
|------|-------|-------------|
| Header | Indigo | Token type and signing algorithm |
| Payload | Purple | Claims and user data |
| Signature | Pink | Cryptographic signature for verification |

## Example

### Sample JWT Token
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

### Decoded Header
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### Decoded Payload
```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022
}
```

## Supported Algorithms

The decoder can parse JWTs signed with any algorithm, including:

| Algorithm | Type | Description |
|-----------|------|-------------|
| HS256 | HMAC | HMAC with SHA-256 |
| HS384 | HMAC | HMAC with SHA-384 |
| HS512 | HMAC | HMAC with SHA-512 |
| RS256 | RSA | RSA Signature with SHA-256 |
| RS384 | RSA | RSA Signature with SHA-384 |
| RS512 | RSA | RSA Signature with SHA-512 |
| ES256 | ECDSA | ECDSA with P-256 and SHA-256 |
| ES384 | ECDSA | ECDSA with P-384 and SHA-384 |
| ES512 | ECDSA | ECDSA with P-521 and SHA-512 |
| PS256 | RSA-PSS | RSA-PSS with SHA-256 |

> **Note**: This tool decodes JWTs but does not verify signatures. Signature verification requires the secret key or public key.

## Use Cases

1. **API Debugging**: Inspect tokens during API development and testing
2. **Authentication Troubleshooting**: Check token claims when auth issues occur
3. **Token Inspection**: Verify token contents before accepting in your application
4. **Learning**: Understand JWT structure and claims
5. **Security Auditing**: Review what data is exposed in tokens

## Security Features

- **100% Client-Side**: No data leaves your browser
- **No Server Storage**: Tokens are never stored or logged
- **Hidden Signature**: Signature is masked by default
- **Secure Input**: Textarea clears on page refresh

## Technical Details

- **Processing**: All decoding happens in the browser using JavaScript's `atob()` function
- **Privacy**: Zero network requests for token processing
- **Base64URL**: Handles both standard Base64 and Base64URL encoding
- **Error Handling**: Clear error messages for malformed tokens

## Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Invalid JWT format | Token doesn't have 3 parts | Ensure token has header.payload.signature format |
| Failed to decode | Invalid Base64 encoding | Check for missing or extra characters |
| Token Expired | exp claim is in the past | Token needs to be refreshed |

## Related Tools

- [Base64 Encoder/Decoder](/tools/development/base64) - Encode and decode Base64 strings
- [JSON Beautifier](/tools/development/json-beautifier) - Format and validate JSON data
- [Hash Generator](/tools/security/hash-generator) - Generate cryptographic hashes

## Changelog

- **2026-01-08**: Documentation created
- **Initial Release**: JWT decoding with header, payload, and signature display
