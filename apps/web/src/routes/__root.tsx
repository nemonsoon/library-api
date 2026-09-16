import { Anchor } from "@mantine/core";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Inbox } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { StateMessage } from "../components/StateMessage";
import { ICON_STROKE } from "../constants";

function NotFound() {
	return (
		<AppShell aside={null}>
			<StateMessage
				icon={<Inbox size={32} strokeWidth={ICON_STROKE} aria-hidden="true" />}
				title="この場所には何もない"
				description="蔵書の一覧から探し直す。"
			/>
			<Anchor href="/">蔵書の一覧へ</Anchor>
		</AppShell>
	);
}

export const Route = createRootRoute({
	component: Outlet,
	notFoundComponent: NotFound,
});
