# Dockerfile Formatter & Linter

> **Category**: Development  
> **Path**: `/tools/development/dockerfile-formatter`  
> **Status**: Live  
> **Processing**: Client-side (no server upload)

## Overview

The Dockerfile Formatter & Linter is a comprehensive tool for beautifying, formatting, and analyzing Dockerfiles. It provides intelligent formatting with automatic best practice recommendations and security checks to help optimize container builds.

## Features

### Core Features
- **Intelligent Formatting**: Automatically formats Dockerfile instructions with proper indentation
- **Multi-line RUN Command Optimization**: Properly formats `RUN` commands with `&&` chains
- **Instruction Normalization**: Converts all instructions to uppercase for consistency
- **Comment Preservation**: Maintains comments in their original positions

### Linting & Analysis
- **Best Practice Checks**: Identifies common Dockerfile anti-patterns
- **Security Analysis**: Detects potential security issues like hardcoded secrets
- **Layer Optimization**: Warns about high layer counts that increase image size
- **Base Image Validation**: Checks for proper version tagging

### Statistics Dashboard
- Total lines count
- Number of Docker instructions
- Build layer count (RUN, COPY, ADD)
- Issues detected count

## How to Use

1. **Paste Dockerfile**: Enter your Dockerfile content in the input textarea
2. **Click Format & Analyze**: The tool will format your Dockerfile and analyze it
3. **Review Issues**: Check the Issues & Recommendations section for warnings
4. **Copy Result**: Use the copy button to get the formatted output

## Checks Performed

### Error Level (Critical)
| Check | Description | Suggestion |
|-------|-------------|------------|
| Missing FROM | Dockerfile has no FROM instruction | Every Dockerfile must start with FROM |
| Secrets in ENV | Detects password/secret/key/token in ENV | Use Docker secrets or build-time arguments |

### Warning Level
| Check | Description | Suggestion |
|-------|-------------|------------|
| No image tag | Base image without version tag | Always specify a version tag |
| Using :latest | Using the :latest tag | Pin to a specific version for production |
| apt-get without cleanup | apt-get update without rm cleanup | Add `rm -rf /var/lib/apt/lists/*` |
| Running as root | USER root detected | Create and use a non-root user |
| Exposing SSH port | Port 22 exposed | Avoid SSH in containers |

### Info Level (Suggestions)
| Check | Description | Suggestion |
|-------|-------------|------------|
| COPY without --chown | COPY missing ownership flag | Use `COPY --chown=user:group` |
| ADD instead of COPY | ADD used for simple file copy | Use COPY unless you need tar extraction |
| High layer count | More than 10 build layers | Combine RUN commands with && |

## Example

### Before Formatting
```dockerfile
from node:18
workdir /app
copy package.json .
copy package-lock.json .
run npm install
copy . .
run npm run build
expose 3000
cmd ["npm", "start"]
```

### After Formatting
```dockerfile
FROM node:18
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Best Practices (Built-in Tips)

### General
- **Pin versions**: Always use specific image tags, never `:latest`
- **Minimize layers**: Combine RUN commands with `&&` to reduce image size
- **Use .dockerignore**: Exclude unnecessary files from build context
- **Multi-stage builds**: Use multiple FROM statements to reduce final image size

### Security
- **Non-root user**: Always run containers as non-root users
- **No secrets**: Never hardcode secrets in Dockerfiles or images
- **Minimal base images**: Use alpine or distroless for smaller attack surface
- **Scan images**: Regularly scan images with tools like Trivy

## Use Cases

1. **CI/CD Pipeline Integration**: Format Dockerfiles before committing to ensure consistency
2. **Code Review**: Quickly identify potential issues in pull requests
3. **Learning**: Understand Dockerfile best practices through instant feedback
4. **Security Auditing**: Detect common security misconfigurations
5. **Image Optimization**: Identify opportunities to reduce image size

## Technical Details

- **Processing**: 100% client-side, no data sent to servers
- **Privacy**: Your Dockerfile content never leaves your browser
- **Supported Instructions**: FROM, WORKDIR, COPY, ADD, RUN, EXPOSE, CMD, ENV, USER, ARG, LABEL, ENTRYPOINT, VOLUME, HEALTHCHECK
- **Format**: Standard Dockerfile syntax

## Related Tools

- [YAML/JSON Converter](/tools/development/yaml-json) - Convert between YAML and JSON formats
- [SQL Formatter](/tools/development/sql-formatter) - Format SQL queries
- [Code Diff Viewer](/tools/development/code-diff) - Compare code changes

## Changelog

- **2026-01-08**: Initial release with formatting and linting capabilities
