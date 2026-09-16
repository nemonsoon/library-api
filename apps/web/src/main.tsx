import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "./styles/tokens.css";
import "./styles/global.css";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { routeTree } from "./routeTree.gen";

const router = createRouter({ routeTree, defaultPreload: "intent" });

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const container = document.getElementById("root");
if (container === null) {
	throw new Error("描画先の #root が見つからない。");
}

createRoot(container).render(
	<StrictMode>
		<MantineProvider forceColorScheme="light">
			<Notifications position="bottom-right" />
			<RouterProvider router={router} />
		</MantineProvider>
	</StrictMode>,
);
