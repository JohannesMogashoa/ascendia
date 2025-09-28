"use server";

import { db } from "../db";

export const validateInvestecConnection = async (id: string) => {
	const integration = await db.investecIntegration.findFirst({
		where: {
			userId: id,
		},
	});

	if (!integration) return false;

	return true;
};
