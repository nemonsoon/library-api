import { Button, Stack, Text, TextInput } from "@mantine/core";
import { BookPlus } from "lucide-react";
import { type FormEvent, useState } from "react";
import { ICON_SIZE, ICON_STROKE } from "../constants";
import classes from "../styles/Panel.module.css";

type Props = {
	onCreate: (title: string) => Promise<boolean>;
};

export function CreateBookForm({ onCreate }: Props) {
	const [title, setTitle] = useState("");
	const [pending, setPending] = useState(false);
	const trimmed = title.trim();

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (trimmed === "") {
			return;
		}
		setPending(true);
		try {
			if (await onCreate(trimmed)) {
				setTitle("");
			}
		} finally {
			setPending(false);
		}
	}

	return (
		<div className={classes.panel}>
			<div className={classes.head}>
				<div className={classes.headLeft}>
					<BookPlus
						size={ICON_SIZE}
						strokeWidth={ICON_STROKE}
						className={classes.headIcon}
						aria-hidden="true"
					/>
					<Text className={classes.heading}>本を登録する</Text>
				</div>
			</div>
			<form onSubmit={handleSubmit} className={classes.body}>
				<Stack gap="sm">
					<TextInput
						label="題名"
						placeholder="銀河鉄道の夜"
						value={title}
						onChange={(event) => setTitle(event.currentTarget.value)}
					/>
					{/* 見出しに同じアイコンが出ているので、押す側には置かない。 */}
					<Button type="submit" loading={pending} disabled={trimmed === ""}>
						登録する
					</Button>
				</Stack>
			</form>
		</div>
	);
}
