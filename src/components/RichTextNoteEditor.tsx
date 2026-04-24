import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";
import { Bold, Italic, Link2, List, ListOrdered, Underline as UnderlineIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { isRichTextContentEmpty, normalizeRichTextContent, normalizeRichTextLink } from "@/util/richText";

type RichTextNoteEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeightClassName?: string;
  disabled?: boolean;
  autoFocus?: boolean;
};

const LINK_REL = "noopener noreferrer nofollow";

export function RichTextNoteEditor({
  value,
  onChange,
  placeholder = "Adicione uma observação...",
  className,
  minHeightClassName = "min-h-[220px]",
  disabled = false,
  autoFocus = false,
}: RichTextNoteEditorProps) {
  const [isLinkInputOpen, setIsLinkInputOpen] = useState(false);
  const [linkValue, setLinkValue] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        blockquote: false,
        code: false,
        codeBlock: false,
        dropcursor: false,
        gapcursor: false,
        heading: false,
        horizontalRule: false,
        strike: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          target: "_blank",
          rel: LINK_REL,
        },
      }),
    ],
    content: normalizeRichTextContent(value) || "<p></p>",
    editable: !disabled,
    autofocus: autoFocus ? "end" : false,
    onUpdate: ({ editor: nextEditor }) => {
      onChange(nextEditor.isEmpty ? "" : normalizeRichTextContent(nextEditor.getHTML()));
    },
  });

  useEffect(() => {
    if (!editor) return;

    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor) return;

    const normalizedExternalValue = normalizeRichTextContent(value);
    const normalizedEditorValue = editor.isEmpty ? "" : normalizeRichTextContent(editor.getHTML());

    if (normalizedExternalValue !== normalizedEditorValue) {
      editor.commands.setContent(normalizedExternalValue || "<p></p>", false);
    }
  }, [editor, value]);

  const isEmpty = useMemo(() => isRichTextContentEmpty(value), [value]);

  const runCommand = useCallback(
    (callback: () => void) => {
      if (!editor || disabled) return;

      callback();
      editor.commands.focus();
    },
    [disabled, editor]
  );

  const handleOpenLinkInput = useCallback(() => {
    if (!editor || disabled) return;

    const currentHref = editor.getAttributes("link").href || "";
    setLinkValue(currentHref);
    setIsLinkInputOpen(true);
  }, [disabled, editor]);

  const handleApplyLink = useCallback(() => {
    if (!editor || disabled) return;

    const normalizedHref = normalizeRichTextLink(linkValue);

    if (!normalizedHref) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setIsLinkInputOpen(false);
      setLinkValue("");
      return;
    }

    if (editor.state.selection.empty) {
      editor
        .chain()
        .focus()
        .insertContent({
          type: "text",
          text: normalizedHref,
          marks: [
            {
              type: "link",
              attrs: {
                href: normalizedHref,
                target: "_blank",
                rel: LINK_REL,
              },
            },
          ],
        })
        .run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({
          href: normalizedHref,
          target: "_blank",
          rel: LINK_REL,
        })
        .run();
    }

    setIsLinkInputOpen(false);
    setLinkValue("");
  }, [disabled, editor, linkValue]);

  return (
    <div className={cn("rounded-lg border border-slate-200 bg-slate-50 px-4 py-3", className)}>
      <div className="flex items-center gap-2 text-slate-700 mb-2">
        <span className="text-sm">Anotação</span>
      </div>

      <div className="rounded-lg border border-slate-300 bg-white p-2">
        <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-2 mb-2">
          <button
            type="button"
            onClick={() =>
              runCommand(() => {
                editor?.chain().focus().toggleBold().run();
              })
            }
            disabled={disabled}
            className={cn(
              "w-8 h-8 rounded-md border flex items-center justify-center transition-colors",
              editor?.isActive("bold")
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
            )}
            title="Negrito"
            aria-label="Negrito"
          >
            <Bold className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              runCommand(() => {
                editor?.chain().focus().toggleItalic().run();
              })
            }
            disabled={disabled}
            className={cn(
              "w-8 h-8 rounded-md border flex items-center justify-center transition-colors",
              editor?.isActive("italic")
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
            )}
            title="Itálico"
            aria-label="Itálico"
          >
            <Italic className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              runCommand(() => {
                editor?.chain().focus().toggleUnderline().run();
              })
            }
            disabled={disabled}
            className={cn(
              "w-8 h-8 rounded-md border flex items-center justify-center transition-colors",
              editor?.isActive("underline")
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
            )}
            title="Sublinhado"
            aria-label="Sublinhado"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-200 mx-1" />

          <button
            type="button"
            onClick={() =>
              runCommand(() => {
                editor?.chain().focus().toggleBulletList().run();
              })
            }
            disabled={disabled}
            className={cn(
              "w-8 h-8 rounded-md border flex items-center justify-center transition-colors",
              editor?.isActive("bulletList")
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
            )}
            title="Lista"
            aria-label="Lista"
          >
            <List className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              runCommand(() => {
                editor?.chain().focus().toggleOrderedList().run();
              })
            }
            disabled={disabled}
            className={cn(
              "w-8 h-8 rounded-md border flex items-center justify-center transition-colors",
              editor?.isActive("orderedList")
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
            )}
            title="Lista numerada"
            aria-label="Lista numerada"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-200 mx-1" />

          <button
            type="button"
            onClick={handleOpenLinkInput}
            disabled={disabled}
            className={cn(
              "w-8 h-8 rounded-md border flex items-center justify-center transition-colors",
              editor?.isActive("link")
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
            )}
            title="Adicionar link"
            aria-label="Adicionar link"
          >
            <Link2 className="w-4 h-4" />
          </button>
        </div>

        {isLinkInputOpen && (
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={linkValue}
              onChange={(event) => setLinkValue(event.target.value)}
              placeholder="Cole ou digite a URL"
              className="flex-1 h-9 rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              type="button"
              onClick={handleApplyLink}
              className="h-9 px-3 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors"
            >
              Aplicar
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLinkInputOpen(false);
                setLinkValue("");
              }}
              className="w-9 h-9 rounded-md border border-slate-300 text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-colors"
              aria-label="Fechar campo de link"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="relative">
          {isEmpty && <span className="absolute left-4 top-3 text-sm text-slate-400 pointer-events-none">{placeholder}</span>}

          <EditorContent
            editor={editor}
            className={cn(
              "w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 hover:border-slate-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 outline-none transition",
              minHeightClassName,
              disabled && "opacity-70",
              "[&_.ProseMirror]:min-h-[inherit] [&_.ProseMirror]:outline-none [&_.ProseMirror]:text-sm [&_.ProseMirror]:leading-relaxed",
              "[&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_li]:my-1",
              "[&_.ProseMirror_a]:text-blue-600 [&_.ProseMirror_a]:underline"
            )}
          />
        </div>
      </div>
    </div>
  );
}

export default RichTextNoteEditor;
