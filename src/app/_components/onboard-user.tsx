"use client";

import React from "react";
import Toast from "./toast";
import { api } from "~/trpc/react";
import { integrationFormSchema } from "~/shared/schemas/integration.schema";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";

function OnboardUserComponent() {
	const router = useRouter();

	const connectToInvestec = api.investec.connect.useMutation({
		onSuccess: (data) => {
			if (data.success) {
				alert(`Success: ${data.message}`);
				router.push("/dashboard");
			} else {
				alert(`Error: ${data.message}`);
			}
		},
		onError: (error) => {
			console.error("Error connecting to Investec:", error);
		},
	});
	const form = useForm({
		defaultValues: {
			clientId: "",
			clientSecret: "",
			apiKey: "",
		},
		validators: {
			onChange: integrationFormSchema,
		},
		onSubmit: async ({ value }) => {
			connectToInvestec.mutate(value);
		},
	});

	return (
		<div className="card shadow-sm w-96">
			<div className="card-body">
				<h1>Investec Integration</h1>
				<p className="text-sm font-light">
					We will need the following information in order to integrate
					with your Investec account.
				</p>
				<form
					className="flex flex-col gap-5 items-center"
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit(e);
					}}
				>
					<div className="w-full">
						<form.Field
							name="clientId"
							children={(field) => (
								<>
									<label
										className="label block"
										htmlFor={field.name}
									>
										Client ID:
									</label>
									<input
										type="text"
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) =>
											field.handleChange(e.target.value)
										}
										className="input"
										required
									/>
								</>
							)}
						/>
					</div>
					<div className="w-full">
						<form.Field
							name="clientSecret"
							children={(field) => (
								<>
									<label
										className="label"
										htmlFor={field.name}
									>
										Client Secret:
									</label>
									<input
										type="text"
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) =>
											field.handleChange(e.target.value)
										}
										className="input"
										required
									/>
								</>
							)}
						/>
					</div>
					<div className="w-full">
						<form.Field
							name="apiKey"
							children={(field) => (
								<>
									<label
										className="label"
										htmlFor={field.name}
									>
										API Key:
									</label>
									<input
										type="text"
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) =>
											field.handleChange(e.target.value)
										}
										className="input"
										required
									/>
								</>
							)}
						/>
					</div>
					<button
						className="btn w-64 rounded-full mt-3"
						type="submit"
						disabled={connectToInvestec.isPending}
					>
						{connectToInvestec.isPending
							? "Submitting..."
							: "Connect to Investec"}
					</button>
				</form>
			</div>
		</div>
	);
}

export default OnboardUserComponent;
