import { Button, Paper, Stack, Text, TextInput } from "@mantine/core";
import { BookPlus } from "lucide-react";
import { type FormEvent, useState } from "react";
import { ICON_SIZE, ICON_STROKE } from "../constants";

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
		<Paper withBorder radius="md" p="md">
			<form onSubmit={handleSubmit}>
				<Stack gap="sm">
					<Text fw={600} size="sm">
						書籍の登録
					</Text>
					<TextInput
						label="題名"
						placeholder="Clean Architecture"
						value={title}
						onChange={(event) => setTitle(event.currentTarget.value)}
					/>
					<Button
						type="submit"
						loading={pending}
						disabled={trimmed === ""}
						leftSection={
							<BookPlus
								size={ICON_SIZE}
								strokeWidth={ICON_STROKE}
								aria-hidden="true"
							/>
						}
					>
						登録する
					</Button>
				</Stack>
			</form>
		</Paper>
	);
}
