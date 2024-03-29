import { Button, Modal } from "@mantine/core";
import React from "react";
interface ModalProps {
  isOpen: boolean;
  toggle: () => void;
  setHidden: () => void;
}
const HideAnswerSectionModal: React.FC<ModalProps> = ({
  isOpen,
  toggle,
  setHidden,
}) => {
  return (
    <Modal size="lg" opened={isOpen} title="Hide section?" onClose={toggle}>
      <Modal.Body>
        <p>All corresponding answers will be deleted, this cannot be undone!</p>

        <div>
          <Button onClick={toggle}>Cancel</Button>
          <Button color="red" onClick={setHidden}>
            Delete Answers
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};
export default HideAnswerSectionModal;
