# MCP (Model Context Protocol) Configuration

This project is configured with MCP servers to enhance AI assistant capabilities with external tools and data sources.

## 📋 Overview

The Model Context Protocol (MCP) allows AI assistants to connect to external systems like GitHub, databases, file systems, and more. This enables more powerful and context-aware development assistance.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- GitHub Personal Access Token (for GitHub integration)
- Environment variables configured

### Setup

1. **Set up environment variables** in your shell configuration (`.zshrc`, `.bashrc`, etc.):

```bash
# Required for GitHub integration
export GITHUB_TOKEN="your_github_personal_access_token_here"

# Optional: For Brave Search (if enabled)
export BRAVE_API_KEY="your_brave_api_key"

# Optional: For Slack integration (if enabled)
export SLACK_BOT_TOKEN="xoxb-your-slack-bot-token"
export SLACK_TEAM_ID="your-team-id"
```

2. **Reload your shell**:

```bash
source ~/.zshrc  # or ~/.bashrc
```

3. **Test MCP servers** (they will auto-install on first use):

```bash
npx -y @modelcontextprotocol/server-github --help
```

## 🔧 Enabled Servers

### 1. **GitHub Integration** (`github`)

Access GitHub repositories, issues, pull requests, and actions.

**Capabilities:**

- Create and manage issues
- Review pull requests
- Check CI/CD status
- Search repositories
- Manage branches

**Setup:**

1. Create a GitHub Personal Access Token:
   - Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token with scopes: `repo`, `workflow`, `read:org`
2. Set `GITHUB_TOKEN` environment variable

**Usage:**

```javascript
// Examples of what the AI can do:
;-'Create an issue for the bug we just found' -
  'Show me the status of open pull requests' -
  "What's the latest CI/CD run status?" -
  "List all issues labeled 'bug'"
```

### 2. **Filesystem Access** (`filesystem`)

Read and navigate project files.

**Capabilities:**

- Read file contents
- List directories
- Search files by pattern
- Generate directory trees
- Read multiple files at once

**Allowed Operations:**

- ✅ `read_file`
- ✅ `read_multiple_files`
- ✅ `list_directory`
- ✅ `directory_tree`
- ✅ `search_files`

**Usage:**

```javascript
// Examples:
;-'Read the contents of package.json' -
  'Show me the directory structure' -
  "Find all files containing 'TODO'"
```

### 3. **Git Operations** (`git`)

Execute Git commands and inspect repository state.

**Capabilities:**

- Check git status
- View diffs
- Read commit history
- Branch operations
- Show file changes

**Allowed Operations:**

- ✅ `git_status`
- ✅ `git_diff`
- ✅ `git_log`

**Usage:**

```javascript
// Examples:
;-'What files have I changed?' - 'Show me the diff for this file' - "What's in the last 5 commits?"
```

### 4. **Fetch/HTTP Requests** (`fetch`)

Make HTTP requests to external APIs.

**Capabilities:**

- GET/POST/PUT/DELETE requests
- Custom headers
- Query parameters
- Response parsing

**Usage:**

```javascript
// Examples:
;-'Fetch data from https://api.example.com/data' - 'Make a POST request to this endpoint'
```

### 5. **Memory/Knowledge Graph** (`memory`)

Persistent memory for context across sessions.

**Capabilities:**

- Store entities and relationships
- Search knowledge graph
- Remember context between conversations
- Build project understanding over time

**Allowed Operations:**

- ✅ `create_entities`
- ✅ `create_relations`
- ✅ `search_nodes`
- ✅ `open_nodes`
- ✅ `read_graph`

**Usage:**

```javascript
// Examples:
;-"Remember that we're using React 19" -
  'What did we discuss about the authentication flow?' -
  'Show me what you know about this project'
```

### 6. **Sequential Thinking** (`sequential-thinking`)

Enhanced reasoning with step-by-step problem solving.

**Capabilities:**

- Break down complex problems
- Multi-step reasoning
- Planning and execution
- Debugging assistance

**Usage:**

```javascript
// Examples:
;-'Help me debug this complex issue step by step' - 'Plan out how to implement this feature'
```

## 🔒 Disabled Servers (Available for Activation)

### 7. **Brave Search** (`brave-search`) - DISABLED

Web search capabilities using Brave Search API.

**To Enable:**

1. Get API key from [brave.com/search/api](https://brave.com/search/api/)
2. Set `BRAVE_API_KEY` environment variable
3. Change `"disabled": true` to `"disabled": false`

### 8. **PostgreSQL** (`postgres`) - DISABLED

Database operations for projects using PostgreSQL.

**To Enable:**

1. Update connection string in `mcp.json`
2. Ensure PostgreSQL is running
3. Change `"disabled": false`

### 9. **Puppeteer** (`puppeteer`) - DISABLED

Browser automation and web scraping.

**To Enable:**

1. Change `"disabled": false`
2. Useful for: testing, screenshots, web scraping

### 10. **Slack** (`slack`) - DISABLED

Slack workspace integration.

**To Enable:**

1. Create a Slack App
2. Set bot token and team ID
3. Change `"disabled": false`

## 🎯 Common Use Cases

### Development Workflow

1. **Code Review Assistant:**

```
"Check GitHub for open PRs and review the changes"
"What's the CI status on the latest commit?"
```

2. **Issue Management:**

```
"Create a GitHub issue for improving test coverage"
"Show me all open bugs in the repository"
```

3. **Code Analysis:**

```
"Find all files using useState hook"
"Show me the git diff for uncommitted changes"
"Read all test files and summarize coverage"
```

4. **Documentation:**

```
"Read all markdown files and identify outdated sections"
"Search for TODO comments across the project"
```

### CI/CD Integration

1. **Check Build Status:**

```
"What's the status of the latest GitHub Actions run?"
"Show me failed CI jobs from today"
```

2. **Deployment Monitoring:**

```
"Check if the deploy workflow succeeded"
"Get logs from the latest production deployment"
```

## 🔐 Security Best Practices

1. **Environment Variables:**
   - Never commit tokens to version control
   - Use `.env` files (already in `.gitignore`)
   - Rotate tokens regularly

2. **Access Control:**
   - Use minimal required scopes for GitHub tokens
   - Review `alwaysAllow` permissions carefully
   - Disable unused servers

3. **Token Permissions:**
   - GitHub: Only grant necessary scopes
   - Review token usage regularly in GitHub settings

## 🛠️ Configuration

### Location

- Configuration file: `.mcp/mcp.json`
- Can also be placed in: `~/.config/mcp/mcp.json` (global)

### Custom Server Configuration

To add a custom MCP server:

```json
{
  "mcpServers": {
    "your-server-name": {
      "command": "node",
      "args": ["path/to/your/server.js"],
      "env": {
        "CUSTOM_VAR": "${YOUR_ENV_VAR}"
      },
      "disabled": false,
      "alwaysAllow": ["operation1", "operation2"]
    }
  }
}
```

### ESLint Integration (via Filesystem)

While there's no dedicated ESLint MCP server, you can:

1. **Use filesystem server to read ESLint configs:**

```
"Read .eslintrc and show me the current rules"
"Check if there are any ESLint errors in the codebase"
```

2. **Combine with command execution:**

```
"Run pnpm lint and show me the results"
```

## 📊 Monitoring & Debugging

### Check Server Status

```bash
# Test GitHub server
npx -y @modelcontextprotocol/server-github

# Test filesystem server
npx -y @modelcontextprotocol/server-filesystem $(pwd)
```

### Common Issues

**Issue: "Command not found"**

- Solution: Ensure npx is available (`npm -v`)

**Issue: "Authentication failed" (GitHub)**

- Solution: Check `GITHUB_TOKEN` is set correctly
- Verify token has required scopes

**Issue: "Permission denied" (Filesystem)**

- Solution: Check file paths in configuration
- Ensure read permissions on project directory

## 🔄 Updates

MCP servers are automatically updated when using `npx -y`. To force update:

```bash
# Clear npx cache
npx clear-npx-cache

# Or manually update specific package
npm install -g @modelcontextprotocol/server-github@latest
```

## 📚 Additional Resources

- [MCP Documentation](https://modelcontextprotocol.io)
- [MCP GitHub Repository](https://github.com/modelcontextprotocol)
- [Available MCP Servers](https://github.com/modelcontextprotocol/servers)

## 🤝 Contributing

To add new MCP servers to this project:

1. Research available MCP servers
2. Add configuration to `.mcp/mcp.json`
3. Document usage in this file
4. Test the integration
5. Submit a PR

## 📝 Notes

- MCP servers run as separate processes
- They communicate via JSON-RPC
- Auto-installed on first use via npx
- No manual installation required for enabled servers
- Servers are sandboxed for security

---

**Last Updated:** October 25, 2025
**MCP Version:** 1.0.0
**Project:** SuperTool - Modern Developer Toolkit
