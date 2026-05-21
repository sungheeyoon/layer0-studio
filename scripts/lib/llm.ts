/**
 * Thin wrapper around the Anthropic SDK for the template generation pipeline.
 *
 * - Model: `claude-opus-4-7` (this codebase's default; matches CLAUDE.md guidance).
 * - Adaptive thinking on; `output_config.effort = 'high'`.
 * - Structured JSON output via `output_config.format` + a json_schema, parsed
 *   with zod for runtime validation.
 * - Errors surface as plain `Error` with a human-actionable message — the
 *   CLI catches them and exits with a clear stderr.
 *
 * Why a tiny wrapper instead of inlining SDK calls per tool: every tool in
 * the pipeline (propose_composition, propose_design_tokens, generate_section,
 * validate_and_capture) makes structurally the same call — system prompt +
 * user message → JSON object validated against a schema. Centralizing keeps
 * model id, retry, and error formatting consistent as new tools land.
 */

import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';

export interface ClaudeJsonOptions<TSchema extends z.ZodType> {
  systemPrompt: string;
  userMessage: string;
  schema: TSchema;
  /** Defaults to claude-opus-4-7. Override for cheaper/faster sub-tools. */
  model?: string;
  /** Defaults to 16000 (non-streaming budget). */
  maxTokens?: number;
  effort?: 'low' | 'medium' | 'high' | 'xhigh' | 'max';
}

let cachedClient: Anthropic | null = null;
function getClient(): Anthropic {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    throw new Error(
      'ANTHROPIC_API_KEY is not set. Add it to .env.local (and load via pnpm tsx --env-file=.env.local), or export it in the shell.',
    );
  }
  cachedClient = new Anthropic({ apiKey });
  return cachedClient;
}

/**
 * Call Claude with a system prompt + user message, expecting a JSON object
 * that conforms to `schema`. Returns the parsed, type-safe result.
 *
 * Throws a clear Error on:
 *   - missing API key (ANTHROPIC_API_KEY env var)
 *   - network / 5xx (wrapped from Anthropic.APIError)
 *   - rate limit / 429
 *   - response not parseable as JSON
 *   - response shape fails schema validation
 */
export async function claudeJSON<TSchema extends z.ZodType>(
  options: ClaudeJsonOptions<TSchema>,
): Promise<z.infer<TSchema>> {
  const client = getClient();
  const model = options.model ?? 'claude-opus-4-7';
  const maxTokens = options.maxTokens ?? 16000;
  const effort = options.effort ?? 'high';
  const jsonSchema = z.toJSONSchema(options.schema);

  let response;
  try {
    response = await client.messages.create({
      model,
      max_tokens: maxTokens,
      thinking: { type: 'adaptive' },
      output_config: {
        effort,
        format: { type: 'json_schema', schema: jsonSchema as Record<string, unknown> },
      },
      system: options.systemPrompt,
      messages: [{ role: 'user', content: options.userMessage }],
    });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      throw new Error(`Claude API auth failed (HTTP 401). Check ANTHROPIC_API_KEY.`);
    }
    if (err instanceof Anthropic.RateLimitError) {
      throw new Error(`Claude API rate-limited (HTTP 429). Retry in a moment.`);
    }
    if (err instanceof Anthropic.APIError) {
      throw new Error(`Claude API error (HTTP ${err.status}): ${err.message}`);
    }
    throw err;
  }

  // Find the first text block in the response (skip any thinking blocks).
  const textBlock = response.content.find(
    (b: Anthropic.ContentBlock): b is Anthropic.TextBlock => b.type === 'text',
  );
  if (!textBlock) {
    throw new Error('Claude returned no text content block. stop_reason: ' + response.stop_reason);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(textBlock.text);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`Claude response is not valid JSON (${msg}). First 500 chars: ${textBlock.text.slice(0, 500)}`);
  }

  const result = options.schema.safeParse(parsed);
  if (!result.success) {
    throw new Error(
      `Claude response did not match expected schema:\n${result.error.message}\nRaw output: ${JSON.stringify(parsed).slice(0, 500)}`,
    );
  }
  return result.data;
}
