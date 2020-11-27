import { css } from "emotion";
import React from "react";

const gridStyles = css`
  @media screen and (max-width: 768px) {
    display: flex;
    flex-direction: column;
  }
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  grid-column-gap: 9px;
  grid-row-gap: 9px;
`;
const ExamGrid: React.FC<{}> = ({ children }) => {
  return <div className={gridStyles}>{children}</div>;
};
export default ExamGrid;
