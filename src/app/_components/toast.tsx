import React from "react";

type Props = {
	type: "success" | "error" | "info";
	message: string;
};

const Toast = ({ type, message }: Props) => {
	return (
		<div className="toast toast-top toast-end">
			<div className={`alert alert-${type}`}>
				<span>{message}</span>
			</div>
		</div>
	);
};

export default Toast;
