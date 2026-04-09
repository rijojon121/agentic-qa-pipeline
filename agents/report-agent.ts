import fs from "fs";
import path from "path";

const OLLAMA_URL = "http://localhost:11434/api/chat";
const MODEL = "gemma3:1b";

async function callOllama(prompt: string): Promise<string> {
  const response = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as { message: { content: string } };
  return data.message.content;
}

async function runReportAgent() {
  const resultsPath = path.resolve("output/results.json");
  if (!fs.existsSync(resultsPath)) {
    console.error("❌ No results.json found. Run ui-agent.ts first.");
    process.exit(1);
  }

  const results = JSON.parse(fs.readFileSync(resultsPath, "utf-8"));

  console.log("\n📝 Report Agent starting...");
  console.log(`📋 Feature: ${results.feature}`);
  console.log(`📊 Total: ${results.total} | Passed: ${results.passed} | Failed: ${results.failed}`);
  console.log("\n🤖 Calling Ollama for summary...\n");

  const prompt = `
You are a QA lead writing a test execution summary for a development team.
Given the following test results, write a clear plain-English summary.

Include:
1. Overall pass/fail count
2. Which scenarios passed and which failed
3. For any failures: likely root cause based on the error message
4. A recommended next action for the team

Keep it concise — this goes into a Slack message or Jira comment.
Use plain text only, no markdown formatting.

Results:
${JSON.stringify(results, null, 2)}
`;

  const summary = await callOllama(prompt);

  const report = `
========================================
TEST EXECUTION REPORT
========================================
Feature:  ${results.feature}
Total:    ${results.total}
Passed:   ${results.passed}
Failed:   ${results.failed}
----------------------------------------
AI SUMMARY:
${summary}
========================================
`;

  // Print to terminal
  console.log(report);

  // Save to file
  const reportPath = path.resolve("output/report.md");
  fs.writeFileSync(reportPath, report);
  console.log(`📁 Report saved to: ${reportPath}`);
}

runReportAgent().catch(console.error);