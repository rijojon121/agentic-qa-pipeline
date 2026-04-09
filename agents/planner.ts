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

async function runPlanner() {
  const storyPath = path.resolve("stories/login-story.txt");
  const story = fs.readFileSync(storyPath, "utf-8");

  console.log("📋 User story loaded:\n", story);
  console.log("\n🤖 Calling Ollama planner...\n");

  const prompt = `
You are a senior QA automation engineer. 
Given the following user story, produce a structured test plan in valid JSON only.
No explanation. No markdown. No backticks. Just raw JSON.

The JSON must follow this exact shape:
{
  "feature": "short feature name",
  "scenarios": [
    {
      "id": "TC-001",
      "name": "descriptive test name",
      "type": "UI",
      "priority": "high",
      "steps": [
        "step 1 description",
        "step 2 description"
      ],
      "expected_result": "what should happen if test passes"
    }
  ]
}

Type must be either "UI" or "API".
Priority must be "high", "medium", or "low".
Generate between 3 and 6 scenarios covering happy path, edge cases, and negative tests.

User Story:
${story}
`;

  const raw = await callOllama(prompt);

  let plan;
  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    plan = JSON.parse(cleaned);
  } catch (err) {
    console.error("❌ Failed to parse JSON from Ollama response.");
    console.error("Raw response was:\n", raw);
    process.exit(1);
  }

  fs.mkdirSync("output", { recursive: true });
  const outputPath = path.resolve("output/plan.json");
  fs.writeFileSync(outputPath, JSON.stringify(plan, null, 2));

  console.log("✅ Test plan generated:\n");
  console.log(JSON.stringify(plan, null, 2));
  console.log(`\n📁 Saved to: ${outputPath}`);
  console.log("\n⏸️  Review the plan above. Reply 'done' when ready for the UI agent.");
}

runPlanner().catch(console.error);
