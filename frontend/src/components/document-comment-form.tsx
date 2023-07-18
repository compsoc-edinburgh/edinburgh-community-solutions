import { Flex, Loader } from "@mantine/core";
import React, { useState } from "react";
import { Icon, ICONS } from "vseth-canine-ui";
import { imageHandler } from "../api/fetch-utils";
import { Mutate, useCreateDocumentComment } from "../api/hooks";
import { Document } from "../interfaces";
import Editor from "./Editor";
import { UndoStack } from "./Editor/utils/undo-stack";
import MarkdownText from "./markdown-text";
import TooltipButton from "./TooltipButton";

interface Props {
  documentAuthor: string;
  documentSlug: string;
  mutate: Mutate<Document>;
}
const DocumentCommentForm: React.FC<Props> = ({
  documentAuthor,
  documentSlug,
  mutate,
}) => {
  const [draftText, setDraftText] = useState("");
  const [undoStack, setUndoStack] = useState<UndoStack>({
    prev: [],
    next: [],
  });
  const [loading, createDocumentComment] = useCreateDocumentComment(
    documentAuthor,
    documentSlug,
    document => {
      mutate(data => ({ ...data, comments: [...data.comments, document] }));
      setDraftText("");
      setUndoStack({
        prev: [],
        next: [],
      });
    },
  );

  return (
    <div>
      <Editor
        value={draftText}
        onChange={setDraftText}
        imageHandler={imageHandler}
        preview={value => <MarkdownText value={value} />}
        undoStack={undoStack}
        setUndoStack={setUndoStack}
      />
      <Flex justify="end" mt="xs">
        <TooltipButton
          color="primary"
          disabled={loading || draftText.length === 0}
          onClick={() => createDocumentComment(draftText)}
        >
          Submit{" "}
          {loading ? (
            <Loader className="ml-2" size="sm" />
          ) : (
            <Icon icon={ICONS.SEND} className="ml-2" />
          )}
        </TooltipButton>
      </Flex>
    </div>
  );
};

export default DocumentCommentForm;
