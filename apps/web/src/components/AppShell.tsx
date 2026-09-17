import { Anchor } from "@mantine/core";
import { ExternalLink } from "lucide-react";
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
	summary?: ReactNode;
	banner?: ReactNode;
	aside: ReactNode;
	children: ReactNode;
};

export function AppShell({ summary, banner, aside, children }: Props) {
	return (
		<div className={classes.shell}>
			{/* 見出しは固定しない。読むのは一覧と返却予定なので、上端を常に占有させない。 */}
			<header className={classes.header}>
				<div className={classes.headerInner}>
					<Brand />
					{summary}
				</div>
			</header>
			<div className={classes.body}>
				<div className={classes.container}>
					{banner}
					<div className={classes.content}>
						<main>{children}</main>
						<aside className={classes.aside} aria-label="本の詳細と登録">
							{aside}
						</aside>
					</div>
				</div>
			</div>
			<footer className={classes.footer}>
				<div className={classes.footerInner}>
					<Anchor
						className={brandClasses.repositoryLink}
						href={REPOSITORY_URL}
						target="_blank"
						rel="noreferrer"
						size="xs"
					>
						{REPOSITORY_LABEL}
						<ExternalLink
							size={ICON_SIZE}
							strokeWidth={ICON_STROKE}
							aria-hidden="true"
						/>
					</Anchor>
				</div>
			</footer>
		</div>
	);
}
