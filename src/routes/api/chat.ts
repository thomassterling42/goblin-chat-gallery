import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, type UIMessage } from "ai";
import { getGoblin } from "@/lib/goblins";
import { goblinInstructions } from "@/lib/goblin-prompt.server";
import { createResponsesCall } from "@/lib/ai/responses.server";

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) return new Response("AI is not configured", { status: 500 });
        const { messages, goblin } = (await request.json()) as { messages: UIMessage[]; goblin: number };
        const me = getGoblin(Number(goblin));
        if (!me) return new Response("Unknown goblin", { status: 400 });
        const call = createResponsesCall(
          request,
          { baseURL: "https://ai.gateway.lovable.dev/v1", apiKey, model: "openai/gpt-6-astra" },
          await convertToModelMessages(messages.slice(-40)),
          goblinInstructions(me),
        );
        return call.response();
      },
    },
  },
});
