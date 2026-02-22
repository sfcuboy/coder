import { render } from "@testing-library/react";
import { ThemeOverride } from "contexts/ThemeProvider";
import type { FC, PropsWithChildren } from "react";
import themes, { DEFAULT_THEME } from "theme";
import { Markdown } from "./Markdown";

const Wrapper: FC<PropsWithChildren> = ({ children }) => (
	<ThemeOverride theme={themes[DEFAULT_THEME]}>{children}</ThemeOverride>
);

function renderMarkdown(content: string) {
	return render(
		<Wrapper>
			<Markdown>{content}</Markdown>
		</Wrapper>,
	);
}

describe("Markdown GFM Alerts", () => {
	it("renders a plain-text alert", () => {
		const { container } = renderMarkdown(`
> [!NOTE]
> Useful information that users should know.
		`);

		const aside = container.querySelector("aside");
		expect(aside).toBeInTheDocument();
		expect(aside).toHaveTextContent("Note");
		expect(aside).toHaveTextContent(
			"Useful information that users should know.",
		);
	});

	it("renders all five alert types", () => {
		const { container } = renderMarkdown(`
> [!NOTE]
> Note content

> [!TIP]
> Tip content

> [!IMPORTANT]
> Important content

> [!WARNING]
> Warning content

> [!CAUTION]
> Caution content
		`);

		const asides = container.querySelectorAll("aside");
		expect(asides).toHaveLength(5);
		expect(asides[0]).toHaveTextContent("Note");
		expect(asides[1]).toHaveTextContent("Tip");
		expect(asides[2]).toHaveTextContent("Important");
		expect(asides[3]).toHaveTextContent("Warning");
		expect(asides[4]).toHaveTextContent("Caution");
	});

	it("renders alert with inline bold formatting", () => {
		const { container } = renderMarkdown(`
> [!IMPORTANT]
> Larger **instances** cost more.
		`);

		const aside = container.querySelector("aside");
		expect(aside).toBeInTheDocument();
		expect(aside).toHaveTextContent("Important");
		expect(aside).toHaveTextContent("Larger instances cost more.");

		const strong = aside?.querySelector("strong");
		expect(strong).toHaveTextContent("instances");
	});

	it("renders alert with inline italic formatting", () => {
		const { container } = renderMarkdown(`
> [!TIP]
> Use *caution* when proceeding.
		`);

		const aside = container.querySelector("aside");
		expect(aside).toBeInTheDocument();
		expect(aside).toHaveTextContent("Tip");
		expect(aside).toHaveTextContent("Use caution when proceeding.");

		const em = aside?.querySelector("em");
		expect(em).toHaveTextContent("caution");
	});

	it("renders alert with inline code", () => {
		const { container } = renderMarkdown(`
> [!NOTE]
> Run \`npm install\` to get started.
		`);

		const aside = container.querySelector("aside");
		expect(aside).toBeInTheDocument();
		expect(aside).toHaveTextContent("Run npm install to get started.");

		const code = aside?.querySelector("code");
		expect(code).toHaveTextContent("npm install");
	});

	it("renders alert with a link", () => {
		const { container } = renderMarkdown(`
> [!TIP]
> Check out [the docs](https://example.com) for more info.
		`);

		const aside = container.querySelector("aside");
		expect(aside).toBeInTheDocument();
		expect(aside).toHaveTextContent("Check out the docs for more info.");

		const link = aside?.querySelector("a");
		expect(link).toHaveAttribute("href", "https://example.com");
		expect(link).toHaveAttribute("target", "_blank");
	});

	it("preserves line breaks across multiple continuation lines", () => {
		const { container } = renderMarkdown(`
> [!IMPORTANT]
> First line of content.
> Second line of content.
		`);

		const aside = container.querySelector("aside");
		expect(aside).toBeInTheDocument();
		expect(aside).toHaveTextContent("First line of content.");
		expect(aside).toHaveTextContent("Second line of content.");

		const brs = aside?.querySelectorAll("br");
		expect(brs?.length).toBeGreaterThanOrEqual(1);
	});

	it("preserves line breaks with inline formatting across lines", () => {
		const { container } = renderMarkdown(`
> [!WARNING]
> **Bold** on line one.
> _Italic_ on line two.
		`);

		const aside = container.querySelector("aside");
		expect(aside).toBeInTheDocument();
		expect(aside).toHaveTextContent("Bold on line one.");
		expect(aside).toHaveTextContent("Italic on line two.");

		expect(aside?.querySelector("strong")).toHaveTextContent("Bold");
		expect(aside?.querySelector("em")).toHaveTextContent("Italic");

		const brs = aside?.querySelectorAll("br");
		expect(brs?.length).toBeGreaterThanOrEqual(1);
	});

	it("does not treat a regular blockquote as an alert", () => {
		const { container } = renderMarkdown(`
> This is just a regular blockquote.
		`);

		expect(container.querySelector("aside")).not.toBeInTheDocument();
		expect(container.querySelector("blockquote")).toBeInTheDocument();
		expect(container.querySelector("blockquote")).toHaveTextContent(
			"This is just a regular blockquote.",
		);
	});

	it("does not treat an unknown alert type as an alert", () => {
		const { container } = renderMarkdown(`
> [!UNKNOWN]
> This should be a regular blockquote.
		`);

		expect(container.querySelector("aside")).not.toBeInTheDocument();
		expect(container.querySelector("blockquote")).toBeInTheDocument();
	});

	it("handles alert type case-insensitively", () => {
		const { container } = renderMarkdown(`
> [!note]
> Lowercase note.
		`);

		const aside = container.querySelector("aside");
		expect(aside).toBeInTheDocument();
		expect(aside).toHaveTextContent("Note");
	});

	it("renders alert with only bold text after marker", () => {
		const { container } = renderMarkdown(`
> [!IMPORTANT]
> **All bold text here**
		`);

		const aside = container.querySelector("aside");
		expect(aside).toBeInTheDocument();
		expect(aside).toHaveTextContent("Important");
		expect(aside).toHaveTextContent("All bold text here");

		const strong = aside?.querySelector("strong");
		expect(strong).toHaveTextContent("All bold text here");
	});

	it("renders alert with mixed formatting across multiple lines", () => {
		const { container } = renderMarkdown(`
> [!CAUTION]
> This has **bold**, *italic*, and \`code\`.
> Plus a [link](https://example.com) on line two.
		`);

		const aside = container.querySelector("aside");
		expect(aside).toBeInTheDocument();
		expect(aside).toHaveTextContent("Caution");
		expect(aside?.querySelector("strong")).toHaveTextContent("bold");
		expect(aside?.querySelector("em")).toHaveTextContent("italic");
		expect(aside?.querySelector("code")).toHaveTextContent("code");
		expect(aside?.querySelector("a")).toHaveAttribute(
			"href",
			"https://example.com",
		);
	});

	it("renders alert with three continuation lines (plain text)", () => {
		const { container } = renderMarkdown(`
> [!NOTE]
> Line one.
> Line two.
> Line three.
		`);

		const aside = container.querySelector("aside");
		expect(aside).toBeInTheDocument();
		expect(aside).toHaveTextContent("Line one.");
		expect(aside).toHaveTextContent("Line two.");
		expect(aside).toHaveTextContent("Line three.");

		const brs = aside?.querySelectorAll("br");
		expect(brs?.length).toBeGreaterThanOrEqual(2);
	});

	it("renders alert with single content line (no extra line breaks)", () => {
		const { container } = renderMarkdown(`
> [!NOTE]
> Just one line.
		`);

		const aside = container.querySelector("aside");
		expect(aside).toBeInTheDocument();
		expect(aside).toHaveTextContent("Just one line.");

		const brs = aside?.querySelectorAll("br");
		expect(brs?.length ?? 0).toBe(0);
	});

	it("renders alert with no content after marker", () => {
		const { container } = renderMarkdown(`
> [!NOTE]
		`);

		const aside = container.querySelector("aside");
		expect(aside).toBeInTheDocument();
		expect(aside).toHaveTextContent("Note");
	});

	it("renders non-alert content alongside alert content", () => {
		const { container } = renderMarkdown(`
Some regular text.

> [!NOTE]
> Alert content here.

More regular text.
		`);

		const aside = container.querySelector("aside");
		expect(aside).toBeInTheDocument();
		expect(aside).toHaveTextContent("Alert content here.");

		const paragraphs = container.querySelectorAll("p");
		const paragraphTexts = Array.from(paragraphs).map((p) => p.textContent);
		expect(paragraphTexts).toContain("Some regular text.");
		expect(paragraphTexts).toContain("More regular text.");
	});
});
