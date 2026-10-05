import type { ChangeEventHandler } from "react";

interface ToggleSwitchProps {
	id?: string;
	checked: boolean;
	onToggleChange:
		| ChangeEventHandler<HTMLInputElement, HTMLInputElement>
		| (() => void);
}

const ToggleSwitch = ({ id, checked, onToggleChange }: ToggleSwitchProps) => {
	return (
		<label className="toggle-switch" htmlFor={id}>
			<input
				checked={checked}
				type="checkbox"
				id={id}
				onChange={onToggleChange}
			/>
			<span className="slider round"></span>
		</label>
	);
};

export default ToggleSwitch;
