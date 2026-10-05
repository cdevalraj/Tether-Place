import { useFormStatus } from "react-dom";

interface SubmitButtonProps {
	waitingText: string;
	actionText: string;
}

const FormSubmitButton = (props: SubmitButtonProps) => {
	const statusDetails = useFormStatus();

	return (
		<button
			type="submit"
			disabled={statusDetails.pending}
			className={`btn ${props.actionText.toLowerCase()}`}
		>
			{statusDetails.pending ? props.waitingText : props.actionText}
		</button>
	);
};

export default FormSubmitButton;
