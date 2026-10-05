import { useNavigate } from "@tanstack/react-router";
import { type MouseEventHandler, useActionState, useState } from "react";
import FormSubmitButton from "../../../components/FormSubmitButton";
import {
	type Note,
	type NoteFormDetails,
	NoteFormSchema,
} from "../../../schema/Note";
import { noteService } from "../services/noteService";

interface NoteForm {
	isNew?: boolean;
	disabled?: boolean;
	note?: Note;
}

const NoteForm = (props: NoteForm) => {
	const [viewOnly, setViewOnly] = useState(props.disabled ?? false);
	const isNew = props.isNew ?? false;
	const { note } = props;
	const navigation = useNavigate();

	const noteFormAction = async (prev: NoteFormDetails, formData: FormData) => {
		if (!viewOnly) {
			const data = Object.fromEntries(formData.entries());
			const parsedData = NoteFormSchema.safeParse(data);
			if (parsedData.success) {
				try {
					const savedNote = await noteService.save({
						...note,
						...parsedData.data,
					});
					if (isNew) {
						navigation({
							from: "/notes/$noteId",
							params: { noteId: savedNote._id },
						});
					} else {
						// show a toast success message
					}
				} catch (error) {
					console.log(error);
				}
				return parsedData.data;
			} else {
				// handle error
				console.log(parsedData.error);
			}
		}
		return prev;
	};

	const [state, formAction] = useActionState(noteFormAction, {
		title: note?.title ?? "",
		content: note?.content ?? "",
	});

	const deleteHandler: MouseEventHandler<HTMLButtonElement> = async (event) => {
		event.preventDefault();
		const confirmation = window.confirm("Are you sure you want to delete");
		if (!confirmation) {
			return;
		}

		try {
			const deleteId = note?._id ?? "";
			const success = await noteService.delete(deleteId);
			if (success) {
				navigation({ to: "/notes" });
			}
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<form action={formAction} className="note-form">
			<div className="note-form-actions">
				<button
					type="button"
					className="btn"
					onClick={() => setViewOnly((prev) => !prev)}
				>
					{viewOnly ? "Edit" : "View Only"}
				</button>
				{!viewOnly && (
					<>
						{!isNew && (
							<button type="button" className="btn" onClick={deleteHandler}>
								delete
							</button>
						)}
						<FormSubmitButton waitingText="Saving.." actionText="Save" />
					</>
				)}
			</div>
			<div className="fields-container">
				<div className="input-field">
					<label htmlFor="title">Title</label>
					<input
						type="text"
						id="title"
						name="title"
						placeholder="Note Title"
						maxLength={70}
						autoComplete="off"
						disabled={viewOnly}
						defaultValue={state.title}
						required
					/>
				</div>
				<div className="input-field">
					<label htmlFor="content">Content</label>
					<textarea
						id="content"
						name="content"
						rows={40}
						placeholder="Content/Description"
						autoComplete="off"
						defaultValue={state.content}
						disabled={viewOnly}
					></textarea>
				</div>
			</div>
		</form>
	);
};

export default NoteForm;
