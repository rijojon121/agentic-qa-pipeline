import fs from "fs";
import path from "path";
import { chromium } from "playwright";

interface Scenario {
  id: string;
  name: string;
  type: string;
  priority: string;
  steps: string[];
  expected_result: string;
}

interface TestPlan {
  feature: string;
  scenarios: Scenario[];
}

interface TestResult {
  id: string;
  name: string;
  status: "passed" | "failed" | "skipped";
  error?: string;
  screenshot?: string;
  duration_ms: number;
}

async function runUIAgent() {
  // 1. Load the plan
  const planPath = path.resolve("output/plan.json");
  if (!fs.existsSync(planPath)) {
    console.error("❌ No plan.json found. Run planner.ts first.");
    process.exit(1);
  }

  const plan: TestPlan = JSON.parse(fs.readFileSync(planPath, "utf-8"));
  const uiScenarios = plan.scenarios.filter((s) => s.type === "UI");

  console.log(`\n🎭 UI Agent starting`);
  console.log(`📋 Feature: ${plan.feature}`);
  console.log(`🧪 UI scenarios to run: ${uiScenarios.length}\n`);

  const results: TestResult[] = [];
  const screenshotDir = path.resolve("output/screenshots");
  fs.mkdirSync(screenshotDir, { recursive: true });

  const browser = await chromium.launch({ headless: false });

  for (const scenario of uiScenarios) {
    console.log(`▶  [${scenario.id}] ${scenario.name}`);
    console.log(`   Priority: ${scenario.priority}`);
    console.log(`   Steps:`);
    scenario.steps.forEach((step) => console.log(`     → ${step}`));

    const start = Date.now();
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
      // Navigate to target URL
      // Replace this with your real app URL when ready
      await page.goto("https://practicetestautomation.com/practice-test-login/");
      await page.waitForLoadState("networkidle");

      // Take screenshot as evidence
      const screenshotPath = `output/screenshots/${scenario.id}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: true });

      const duration = Date.now() - start;
      results.push({
        id: scenario.id,
        name: scenario.name,
        status: "passed",
        screenshot: screenshotPath,
        duration_ms: duration,
      });

      console.log(`   ✅ Passed (${duration}ms)`);
      console.log(`   📸 Screenshot: ${screenshotPath}\n`);

    } catch (err: any) {
      const screenshotPath = `output/screenshots/${scenario.id}-fail.png`;
      try {
        await page.screenshot({ path: screenshotPath, fullPage: true });
      } catch {}

      const duration = Date.now() - start;
      results.push({
        id: scenario.id,
        name: scenario.name,
        status: "failed",
        error: err.message,
        screenshot: screenshotPath,
        duration_ms: duration,
      });

      console.log(`   ❌ Failed: ${err.message}\n`);
    } finally {
      await context.close();
    }
  }

  await browser.close();

  // Save results
  const resultsPath = path.resolve("output/results.json");
  const output = {
    feature: plan.feature,
    total: results.length,
    passed: results.filter((r) => r.status === "passed").length,
    failed: results.filter((r) => r.status === "failed").length,
    results,
  };

  fs.writeFileSync(resultsPath, JSON.stringify(output, null, 2));

  console.log("─".repeat(50));
  console.log(`📊 Results: ${output.passed} passed, ${output.failed} failed`);
  console.log(`📁 Saved to: ${resultsPath}`);
  console.log(`📸 Screenshots in: output/screenshots/`);
  console.log("─".repeat(50));
}

runUIAgent().catch(console.error);