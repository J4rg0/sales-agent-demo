# Mock sales agent lab

An independent learning project with **fictional** records. It shows the difference between a conventional CLI, an MCP data connection, and an agent skill. It is not a West Four deployment or a copy of their systems.

## Quick start in a Codespace or local terminal

Requires Node.js 20 or later. There are no npm dependencies.

```bash
node --version
npm run demo
```

Try `help`, `inventory door`, `customer C-101`, `pipeline`, and `brief O-502`. Type `exit` to leave. The CLI is a conventional command interface: it retrieves records deterministically and does not talk to an AI model.

## Ask Codex to use the data tools

From the repo root, add this local MCP server in Codex CLI (replace the path with the absolute path to your checkout):

```bash
codex mcp add mock-sales-data -- node /absolute/path/to/west-four-mock-agent/src/mcp.js
codex mcp list
codex
```

In a Codespace, run `pwd` from this repo to get the path. Start a fresh Codex session after adding the server. Codex IDE and CLI share MCP configuration. Ask: **“Use mock-sales-data to prepare a follow-up brief for O-502. Show any stock shortage and what we need to confirm.”** Then try O-501 and compare. If the CLI add syntax differs in your installed version, run `codex mcp add --help` and use the equivalent stdio server command. You can instead read the JSON files directly in Codex before configuring MCP.

The server implements a small subset of MCP over stdio, exposing `search_inventory`, `get_customer`, `get_opportunity`, `list_opportunities`, and `prepare_brief`. It has no write tools. It sends JSON-RPC only on stdout. For an actual business integration, use an established MCP SDK, proper authentication and authorization, input limits, error handling, monitoring, and real API clients.

## Understand the layers

| File | Responsibility |
| --- | --- |
| `data/*.json` | Fictional source records; edit these to explore edge cases. |
| `src/data.js` | Reusable lookup logic shared by CLI and MCP. |
| `src/cli.js` | Direct terminal commands, without an AI agent. |
| `src/mcp.js` | Tools the agent can call to read records. |
| `AGENTS.md` | Always-on project expectations for Codex. |
| `.agents/skills/sales-brief/SKILL.md` | Procedure for one repeatable task. |

Codex can read files without MCP. The MCP exercise shows how a live data source would be exposed once the records move outside the repo. The same MCP protocol could be connected to another compatible client, but each client has its own configuration and authentication flow.

## Learning exercises

1. Ask for O-502. Its requested exterior-door quantity exceeds the fictional stock. See whether the agent flags the shortage without promising delivery.
2. Change a record in `data/inventory.json` and rerun the CLI, then ask Codex again. Observe which layer supplies the new fact.
3. Adjust the skill's headings or required questions; compare two briefs. Observe that the skill changes the procedure, not the data.
4. Sketch a real integration on paper: where each record lives, who may read it, how it stays current, and which operations should require explicit approval.

Do not put actual customer data, API keys, or company credentials in this repo. A future team-owned version should be built with their participation and approved access to their systems.
