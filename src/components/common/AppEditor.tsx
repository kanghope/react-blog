import { useEffect } from "react";
import { useCreateBlockNote } from "@blocknote/react";
// Or, you can use ariakit, shadcn, etc.
import { BlockNoteView } from "@blocknote/mantine";
import { ko } from "@blocknote/core/locales";
// Default styles for the mantine editor
import "@blocknote/mantine/style.css";
// Include the included Inter font
import "@blocknote/core/fonts/inter.css";
import type { Block } from "@blocknote/core";
import { nanoid } from "nanoid";

interface Props {
    props?: Block[];
    setContent?: (content: Block[]) => void;
    readonly?: boolean;
}

export function AppEditor({ props, setContent, readonly }: Props) {
    const locale = ko;
    // Create a new editor instance
    //dictionary 설정 등을 메모이제이션해서 불필요한 에디터 재생성 방지
    const editor = useCreateBlockNote({
        initialContent:
            props && props.length > 0
                ? props
                : [
                      {
                          id: nanoid(),
                          type: "paragraph",
                          props: {
                              textAlignment: "left",
                              textColor: "default",
                              backgroundColor: "default",
                          },
                          content: [
                              {
                                  type: "text",
                                  text: "",
                                  styles: {},
                              },
                          ],
                          children: [],
                      },
                  ], // props가 존재할 경우 초기 콘텐츠로 설정
        dictionary: {
            ...locale,
            placeholders: {
                ...locale.placeholders,
                emptyDocument: "텍스트를 입력하거나 '/' 를 눌러 명령어를 실행하세요.",
            },
        },
    });

    useEffect(() => {
        if (props && props.length > 0) {
            const current = JSON.stringify(editor.document);
            const next = JSON.stringify(props);

            // current 값과 next 값이 같으면 교체를 안함 => 무한 루프를 방지하기 위함
            if (current !== next) {
                editor.replaceBlocks(editor.document, props);
            }
        }
    }, [props, editor]);

    // Render the editor
    return (
        <BlockNoteView
            theme={"dark"}
            editor={editor}
            editable={!readonly}
            onChange={() => {
                if (!readonly) {
                    setContent?.(editor.document);
                }
            }}
        />
    );
}