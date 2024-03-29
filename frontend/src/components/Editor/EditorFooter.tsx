import { css } from "@emotion/css";
import { Button, Group, Modal } from "@mantine/core";
import * as React from "react";
import { useCallback, useState } from "react";
import { ImageHandle } from "./utils/types";
import EditorHelp from "./EditorHelp";

const rowStyle = css`
  text-align: right;
  margin-left: -0.5rem;
`;
interface Props {
  onOpenOverlay: () => void;
  attachments: ImageHandle[];
  onDelete: (handle: ImageHandle) => void;
}
const EditorFooter: React.FC<Props> = ({
  attachments,
  onDelete,
  onOpenOverlay,
}) => {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const toggleHelp = useCallback(() => setIsHelpOpen(prev => !prev), []);
  return (
    <div>
      <Group position="right" className={rowStyle}>
        <Button.Group>
          <Button variant="default" size="sm" onClick={toggleHelp}>
            Supported Functions
          </Button>
          <Button variant="default" size="sm" onClick={onOpenOverlay}>
            Browse Images
          </Button>
        </Button.Group>
      </Group>
      <Modal
        title="Help with Editor"
        opened={isHelpOpen}
        onClose={toggleHelp}
        size="min(90vw, 1500px)"
      >
        <Modal.Body>
          <EditorHelp />
        </Modal.Body>
      </Modal>
    </div>
  );
};
export default EditorFooter;
