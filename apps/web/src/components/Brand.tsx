import { Text } from "@mantine/core";
import { Library } from "lucide-react";
import { ICON_STROKE } from "../constants";
import classes from "../styles/Brand.module.css";

export function Brand() {
	return (
		<div className={classes.brand}>
			<Library size={20} strokeWidth={ICON_STROKE} aria-hidden="true" />
			<Text fw={600}>Library API</Text>
		</div>
	);
}
