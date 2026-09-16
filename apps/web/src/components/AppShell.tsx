import { Anchor } from "@mantine/core";
import { Code, ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import {
	ICON_SIZE,
	ICON_STROKE,
	REPOSITORY_LABEL,
	REPOSITORY_URL,
} from "../constants";
import classes from "../styles/AppShell.module.css";
import brandClasses from "../styles/Brand.module.css";
import { Brand } from "./Brand";

type Props = {
	aside: ReactNode;
	children: ReactNode;
};

export function AppShell({ aside, children }: Props) {
	return (
		<div className={classes.shell}>
			<header className={classes.topbar}>
				<div className={classes.topbarInner}>
					<Brand />
					<Anchor
						className={brandClasses.repositoryLink}
						href={REPOSITORY_URL}
						target="_blank"
						rel="noreferrer"
						size="sm"
					>
						<Code
							size={ICON_SIZE}
							strokeWidth={ICON_STROKE}
							aria-hidden="true"
						/>
						{REPOSITORY_LABEL}
						<ExternalLink
							size={ICON_SIZE}
							strokeWidth={ICON_STROKE}
							aria-hidden="true"
						/>
					</Anchor>
				</div>
			</header>
			<div className={classes.body}>
				<div className={classes.content}>
					<main>{children}</main>
					<aside className={classes.aside} aria-label="全体の状況と書籍の詳細">
						{aside}
					</aside>
				</div>
			</div>
		</div>
	);
}
