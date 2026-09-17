import { Text } from "@mantine/core";
import { BookCopy } from "lucide-react";
import { ICON_SIZE_BRAND, ICON_STROKE } from "../constants";
import classes from "../styles/Brand.module.css";

export function Brand() {
	return (
		<div className={classes.brand}>
			<BookCopy
				size={ICON_SIZE_BRAND}
				strokeWidth={ICON_STROKE}
				aria-hidden="true"
			/>
			<div>
				<Text className={classes.name}>Library API</Text>
				<Text className={classes.tagline}>本の貸出と返却を扱う</Text>
			</div>
		</div>
	);
}
