"use server";

import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { NVIDIA_MODEL } from "~/shared/utils/ai-models";
import OpenAI from "openai";
import type { Transaction } from "~/sandbox-transactions";
import { env } from "~/env";

const openai = new OpenAI({
	baseURL: "https://openrouter.ai/api/v1",
	apiKey: env.OPEN_ROUTER_KEY,
	// defaultHeaders: {
	// 	"HTTP-Referer": "<YOUR_SITE_URL>", // Optional. Site URL for rankings on openrouter.ai.
	// 	"X-Title": "<YOUR_SITE_NAME>", // Optional. Site title for rankings on openrouter.ai.
	// },
});

export async function analyseTransactionsWithAI(transactions: Transaction[]) {
	const systemMessage: ChatCompletionMessageParam = {
		role: "system",
		content:
			"You are a financial assistant. You help users analyze their bank transactions and provide insights and suggestions based on their spending habits.",
	};

	const userMessage: ChatCompletionMessageParam = {
		role: "user",
		content: `Here are my recent bank transactions:\n\n${transactions
			.map(
				(tx) =>
					`- ${tx.postingDate}: ${
						tx.description
					} - $${tx.amount.toFixed(2)}`
			)
			.join(
				"\n"
			)}\n\nCan you provide insights on my spending habits and suggest ways I can save money?`,
	};

	return await GetCompletion([systemMessage, userMessage]);
}

async function GetCompletion(
	messages: ChatCompletionMessageParam[]
): Promise<{ error: string | null; data: string | null }> {
	const completion = await openai.chat.completions.create({
		model: NVIDIA_MODEL,
		messages,
	});

	if (!completion || !completion.choices || completion.choices.length === 0) {
		return {
			error: "No completion choices returned",
			data: null,
		};
	}

	if (
		!completion.choices[0] ||
		!completion.choices[0].message ||
		!completion.choices[0].message.content
	) {
		return {
			error: "No message content was returned",
			data: null,
		};
	}

	return {
		error: null,
		data: completion.choices[0].message.content,
	};
}
