# agentic-qa-pipeline

A fully local, free 3-agent QA automation pipeline built with TypeScript, Playwright, and Ollama. Feed it a user story — it generates a test plan, runs real browser tests, and writes a plain-English report. No cloud. No API costs. No vendor lock-in.

Built and running on an M2 Mac in one afternoon.

---

## How it works

```
User Story (.txt)
      │
      ▼
┌─────────────────┐
│  Planner Agent  │  reads story → calls local AI → generates structured JSON test plan
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    UI Agent     │  reads plan → opens real browsers → runs scenarios → captures screenshots
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Report Agent   │  reads results → calls local AI → writes plain-English summary for Slack/Jira
└─────────────────┘
```

---

## Tech stack

| Tool | Purpose |
|---|---|
| TypeScript + ts-node | Agent logic |
| Playwright (Chromium) | Real browser UI execution |
| Ollama (`gemma3:1b`) | Local AI for planning and reporting |
| Node.js | Runtime |

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Ollama](https://ollama.com/) installed and running
- `gemma3:1b` model pulled

```bash
ollama pull gemma3:1b
ollama serve
```

---

## Installation

```bash
git clone https://github.com/rijojon121/agentic-qa-pipeline.git
cd agentic-qa-pipeline
npm install
```

---

## Usage

### Step 1 — Run the Planner Agent

```bash
npx ts-node agents/planner.ts
```

Reads `stories/login-story.txt`, calls Ollama, and generates a structured JSON test plan saved to `output/plan.json`.

Example output:
```json
{
  "feature": "Online Banking Login",
  "scenarios": [
    {
      "id": "TC-001",
      "name": "Successful Login with Valid Credentials",
      "type": "UI",
      "priority": "high",
      "steps": ["Navigate to login page", "Enter valid credentials", "Click Login"],
      "expected_result": "User is redirected to dashboard"
    }
  ]
}
```

### Step 2 — Run the UI Agent

```bash
npx ts-node agents/ui-agent.ts
```

Reads `output/plan.json`, launches a real Chromium browser via Playwright, executes each UI scenario, captures screenshots, and saves results to `output/results.json`.

### Step 3 — Run the Report Agent

```bash
npx ts-node agents/report-agent.ts
```

Reads `output/results.json`, calls Ollama to generate a plain-English summary, and saves the report to `output/report.md` — ready to paste into Slack or Jira.

---

## Project structure

```
agentic-qa-pipeline/
├── agents/
│   ├── planner.ts          # Agent 1: user story → JSON test plan
│   ├── ui-agent.ts         # Agent 2: test plan → browser execution + screenshots
│   └── report-agent.ts     # Agent 3: results → plain-English AI summary
├── stories/
│   └── login-story.txt     # Input: user story in plain text
├── output/                 # Generated at runtime (gitignored)
│   ├── plan.json
│   ├── results.json
│   ├── report.md
│   └── screenshots/
├── package.json
├── tsconfig.json
└── .gitignore
```

---

## Writing your own user story

Edit or replace `stories/login-story.txt` with any user story in plain text. Follow this format:

```
As a [user type],
I want to [goal],
So that [reason].

Acceptance Criteria:
- Criterion 1
- Criterion 2
```

The Planner Agent will generate test scenarios automatically based on your story.

---

## Example report output

```
========================================
TEST EXECUTION REPORT
========================================
Feature:  Online Banking Login
Total:    7
Passed:   7
Failed:   0
----------------------------------------
AI SUMMARY:
All 7 test scenarios passed successfully. The login flow handled valid credentials,
invalid inputs, and edge cases correctly. No failures detected. No action required —
ready to merge.
========================================
```

---

## Roadmap

- [ ] Add API scenario execution (currently UI only)
- [ ] Multi-story batch processing
- [ ] HTML report with embedded screenshots
- [ ] GitHub Actions integration for CI runs
- [ ] Support for additional Ollama models (llama3, mistral)
- [ ] Slack/Jira webhook integration for automatic posting

---

## Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create your branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request

---

## License

MIT

---

## Author

Built by [Rijo Johnson](https://github.com/rijojon121) — QA Automation Engineer based in Toronto.  
Connect on [LinkedIn](https://www.linkedin.com/in/rijojohnson)
