import { config } from "../config";

const ConfigError = () => {
	return (
		<div>
			{config.validation_messages.map((msg) => (
				<li key={msg}>{msg}</li>
			))}
		</div>
	);
};

export default ConfigError;
