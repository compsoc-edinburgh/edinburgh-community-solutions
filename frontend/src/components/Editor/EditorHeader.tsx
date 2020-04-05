import { EditorMode } from "./utils/types";
import * as React from "react";
import TabBar from "./TabBar";
import { css } from "emotion";
import { Bold, Italic, Link, Code, DollarSign } from "react-feather";

const iconButtonStyle = css`
  margin: 0;
  border: none;
  cursor: pointer;
  background-color: transparent;
  padding: 6px;
  color: rgba(0, 0, 0, 0.4);
  transition: color 0.1s;
  &:hover {
    color: rgba(0, 0, 0, 0.8);
  }
`;
const headerStyle = css`
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: row;
  align-items: flex-end;
`;
const spacer = css`
  flex-grow: 1;
`;

interface Props {
  activeMode: EditorMode;
  onActiveModeChange: (newMode: EditorMode) => void;

  onMathClick: () => void;
  onCodeClick: () => void;
  onLinkClick: () => void;
  onItalicClick: () => void;
  onBoldClick: () => void;
}
const EditorHeader: React.FC<Props> = ({
  activeMode,
  onActiveModeChange,
  ...handlers
}) => {
  const iconSize = 15;
  return (
    <div className={headerStyle}>
      <TabBar
        items={[
          {
            title: "Write",
            active: activeMode === "write",
            onClick: () => onActiveModeChange("write"),
          },
          {
            title: "Preview",
            active: activeMode === "preview",
            onClick: () => onActiveModeChange("preview"),
          },
        ]}
      />
      <div className={spacer} />
      {activeMode === "write" && (
        <>
          <button
            className={iconButtonStyle}
            onClick={handlers.onMathClick}
            type="button"
          >
            <DollarSign size={iconSize} />
          </button>
          <button
            className={iconButtonStyle}
            onClick={handlers.onCodeClick}
            type="button"
          >
            <Code size={iconSize} />
          </button>
          <button
            className={iconButtonStyle}
            onClick={handlers.onLinkClick}
            type="button"
          >
            <Link size={iconSize} />
          </button>
          <button
            className={iconButtonStyle}
            onClick={handlers.onItalicClick}
            type="button"
          >
            <Italic size={iconSize} />
          </button>
          <button
            className={iconButtonStyle}
            onClick={handlers.onBoldClick}
            type="button"
          >
            <Bold size={iconSize} />
          </button>
        </>
      )}
    </div>
  );
};
export default EditorHeader;