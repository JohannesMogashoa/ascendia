import { EyeIcon } from "@heroicons/react/24/outline";
import Markdown from "react-markdown";
import React from "react";
import type { TransactionAnalysis } from "@prisma/client";
import { api } from "~/trpc/server";
import remarkGfm from "remark-gfm";

function AnalysisModal({ analysis }: { analysis: TransactionAnalysis[] }) {
	return (
		<>
			<div>
				{analysis.map((item, index) => (
					<section
						key={item.id}
						className="collapse border border-base-300 bg-base-100 rounded-box"
					>
						<input type="checkbox" />
						<div className="collapse-title font-semibold">
							<EyeIcon className="h-5 w-5 inline-block mr-2" />
							<span className="text-lg font-medium inline-block mr-2">
								Analysis {index + 1} -{" "}
								{item.createdAt.toLocaleDateString()}
							</span>
						</div>
						<div className="collapse-content">
							<Markdown remarkPlugins={[remarkGfm]}>
								{item.analysis}
							</Markdown>
						</div>
					</section>
				))}
			</div>
		</>
	);
}

export default async function AnalysisPage() {
	const analysis = await api.analysis.getAnalyses();

	return (
		<section className="container mx-auto">
			<h1 className="text-3xl font-bold my-4">Analysis Page</h1>
			{analysis.length === 0 ? (
				<p>No analysis found. Please perform an analysis first.</p>
			) : (
				<AnalysisModal analysis={analysis} />
			)}
		</section>
	);
}
