export abstract class Config {
	isValid = false;
	validation_messages: string[] = [];

	readonly MODE: string;
	readonly DEV: boolean;
	readonly PROD: boolean;

	constructor(mode: string) {
		this.MODE = mode;
		this.DEV = mode === "development";
		this.PROD = mode === "production";
	}

	require(name: string, value: unknown) {
		if (!value) {
			this.validation_messages.push(
				`required setting '${name}' is missing value`,
			);
		}
	}

	validate() {
		this.validation_messages = [];
		this.validateFields();
		this.isValid = this.validation_messages.length === 0;
	}

	protected abstract validateFields(): void;
}
