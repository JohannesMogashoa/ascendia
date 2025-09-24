import { z } from "zod";

export const integrationFormSchema = z.object({
	clientId: z.string().min(1, "Client ID is required"),
	clientSecret: z.string().min(1, "Client Secret is required"),
	apiKey: z.string().min(1, "API Key is required"),
});

export type IntegrationFormData = z.infer<typeof integrationFormSchema>;
