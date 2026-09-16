import { Button, Text } from "@mantine/core";
import type { ReactNode } from "react";
import classes from "../styles/StateMessage.module.css";

type Props = {
	icon: ReactNode;
	title: string;
	description: string;
	action?: { label: string; onClick: () => void };
};

export function StateMessage({ icon, title, description, action }: Props) {
	return (
		<div className={classes.message}>
			{icon}
			<Text fw={600}>{title}</Text>
			<Text size="sm" c="dimmed">
				{description}
			</Text>
			{action === undefined ? null : (
				<Button variant="default" size="xs" mt="xs" onClick={action.onClick}>
					{action.label}
				</Button>
			)}
		</div>
	);
}
