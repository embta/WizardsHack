import Anthropic from "@anthropic-ai/sdk";
import { mockCallClaude, mockCallClaudeJSON } from "./mock-claude";

const USE_MOCK = process.env.USE_MOCK_CLAUDE === "true" || !process.env.ANTHROPIC_API_KEY;

function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY environment variable is not set");
  }
  return new Anthropic({ apiKey });
}

export async function callClaude(
  systemPrompt: string,
  userMessage: string
): Promise<string> {
  if (USE_MOCK) return mockCallClaude(systemPrompt, userMessage);

  const anthropic = getAnthropicClient();
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }
  return textBlock.text;
}

export async function callClaudeJSON<T>(
  systemPrompt: string,
  userMessage: string
): Promise<T> {
  if (USE_MOCK) return mockCallClaudeJSON<T>(systemPrompt, userMessage);

  const text = await callClaude(systemPrompt, userMessage);

  // Extract JSON from the response (handle markdown code blocks)
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : text.trim();

  try {
    return JSON.parse(jsonStr) as T;
  } catch {
    throw new Error(`Failed to parse Claude response as JSON: ${text.slice(0, 200)}`);
  }
}
