import { createTheme, type MantineColorsTuple } from "@mantine/core";

/*
 * 色は意味ごとに1組だけ持つ。
 * 藍が貸出中、朱が返却期限の超過、緑が返却、墨が文字と中立。
 * Mantine の既定の青・赤・緑をそのまま使わないのは、どの画面でも同じ色になり、
 * 何を扱うサービスなのかが色から伝わらないためである。
 */

// 藍。貸出中であること、および操作の既定色。
const ai: MantineColorsTuple = [
	"#eff4f9",
	"#dce8f2",
	"#b7cde3",
	"#8fb1d2",
	"#6d99c3",
	"#4e80b0",
	"#2f5d8c",
	"#285078",
	"#214264",
	"#1a3450",
];

// 朱。返却期限を過ぎていることだけに使う。超過が無い日は画面に出ない。
const shu: MantineColorsTuple = [
	"#fdf0ee",
	"#f9ddd9",
	"#f2b9b1",
	"#e99287",
	"#e17264",
	"#d4523f",
	"#c0392b",
	"#a32f24",
	"#86271e",
	"#6b1f18",
];

// 緑。返却という、状態が解消される向きの操作に使う。
const midori: MantineColorsTuple = [
	"#eef7f3",
	"#daede5",
	"#b2daca",
	"#86c5ac",
	"#5fb292",
	"#3f9a78",
	"#2e7d62",
	"#276a53",
	"#205744",
	"#1a4636",
];

// 墨。文字、罫線、貸出可という「何も起きていない」状態。
const sumi: MantineColorsTuple = [
	"#f5f6f8",
	"#ebedf0",
	"#d8dce2",
	"#bfc5ce",
	"#a4acb8",
	"#8a94a2",
	"#6f7a8a",
	"#566070",
	"#3e4756",
	"#16202b",
];

export const theme = createTheme({
	colors: { ai, shu, midori, gray: sumi },
	primaryColor: "ai",
	black: "#16202b",
	defaultRadius: "sm",
	fontFamily: "var(--app-font-body)",
	fontFamilyMonospace: "var(--app-font-mono)",
	headings: { fontFamily: "var(--app-font-body)" },
});
