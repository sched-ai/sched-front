import DOMPurify from "dompurify";

const SANITIZE_CONFIG = {
  ALLOWED_TAGS: ["p", "br", "b", "strong", "i", "em", "u", "ul", "ol", "li", "a"],
  ALLOWED_ATTR: ["href", "target", "rel"],
  ALLOW_DATA_ATTR: false,
};

function isLikelyHtml(content: string) {
  return /<\/?[a-z][\s\S]*>/i.test(content);
}

function escapeHtml(text: string) {
  const element = document.createElement("div");
  element.textContent = text;
  return element.innerHTML;
}

function normalizeAnchorHrefs(html: string) {
  if (!html) return "";

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
  const root = doc.body.firstElementChild;

  if (!root) return "";

  root.querySelectorAll("a").forEach((anchor) => {
    const href = normalizeRichTextLink(anchor.getAttribute("href") || anchor.textContent || "");

    if (!href) {
      const textNode = doc.createTextNode(anchor.textContent || "");
      anchor.replaceWith(textNode);
      return;
    }

    anchor.setAttribute("href", href);
    anchor.setAttribute("target", "_blank");
    anchor.setAttribute("rel", "noopener noreferrer nofollow");
  });

  return root.innerHTML.trim();
}

export function normalizeRichTextLink(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "";

  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  return `https://${trimmed}`;
}

export function normalizeRichTextContent(content: string) {
  if (!content) return "";

  const htmlSource = isLikelyHtml(content)
    ? content
    : escapeHtml(content).replace(/\n/g, "<br>");

  const sanitized = DOMPurify.sanitize(htmlSource, SANITIZE_CONFIG);
  return normalizeAnchorHrefs(sanitized);
}

export function richTextToPlainText(content: string) {
  if (!content) return "";

  const normalizedHtml = normalizeRichTextContent(content);
  if (!normalizedHtml) return "";

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${normalizedHtml}</div>`, "text/html");

  return (doc.body.textContent || "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

export function isRichTextContentEmpty(content: string) {
  return richTextToPlainText(content).length === 0;
}