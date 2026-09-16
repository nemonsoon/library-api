import { Skeleton, Stack } from "@mantine/core";
import { useReducedMotion } from "@mantine/hooks";
import { SKELETON_ROW_COUNT, SKELETON_ROW_HEIGHT } from "../constants";

export function BookListSkeleton() {
	// Mantine の Skeleton は動きを減らす設定を見ないので、ここで止める。
	const reducedMotion = useReducedMotion();
	const rows = Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => index);

	return (
		<Stack gap="sm" aria-busy="true" aria-label="蔵書を読み込んでいる">
			{rows.map((row) => (
				<Skeleton
					key={row}
					height={SKELETON_ROW_HEIGHT}
					radius="sm"
					animate={!reducedMotion}
				/>
			))}
		</Stack>
	);
}
