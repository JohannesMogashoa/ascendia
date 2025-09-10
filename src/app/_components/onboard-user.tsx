"use client";

import React from "react";
import Toast from "./toast";
import { api } from "~/trpc/react";
import { integrationFormSchema } from "~/shared/schemas/integration.schema";
import { useForm } from "@tanstack/react-form";

function OnboardUserComponent() {
	const [showToast, setShowToast] = React.useState(false);
	const [toastMessage, setToastMessage] = React.useState("");

	const connectToInvestec = api.user.updateUserIntegration.useMutation({
		onSuccess: (data) => {
			console.log("Successfully connected to Investec:", data);
			setToastMessage("Successfully connected to Investec");
			setShowToast(true);
		},
		onError: (error) => {
			console.error("Error connecting to Investec:", error);
			setToastMessage(`Error: ${error.message}`);
			setShowToast(true);
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
		<>
			{showToast && <Toast type="success" message={toastMessage} />}
			<div className="card shadow-sm w-96">
				<div className="card-body">
					<h1>Investec Integration</h1>
					<p className="text-sm font-light">
						We will need the following information in order to
						integrate with your Investec account.
					</p>
					<form
						className="flex flex-col gap-5"
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit(e);
						}}
					>
						<div>
							<form.Field
								name="clientId"
								children={(field) => (
									<>
										<label
											className="label"
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
												field.handleChange(
													e.target.value
												)
											}
											className="input"
											required
										/>
									</>
								)}
							/>
						</div>
						<div>
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
												field.handleChange(
													e.target.value
												)
											}
											className="input"
											required
										/>
									</>
								)}
							/>
						</div>
						<div>
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
												field.handleChange(
													e.target.value
												)
											}
											className="input"
											required
										/>
									</>
								)}
							/>
						</div>
						<form.Subscribe
							selector={(state) => [
								state.canSubmit,
								state.isSubmitting,
							]}
							children={([canSubmit, isSubmitting]) => (
								<button
									className="btn w-64 rounded-full mt-3"
									type="submit"
									disabled={!canSubmit}
								>
									{isSubmitting
										? "Submitting..."
										: "Connect to Investec"}
								</button>
							)}
						/>
					</form>
				</div>
			</div>
		</>
	);
}

export default OnboardUserComponent;
