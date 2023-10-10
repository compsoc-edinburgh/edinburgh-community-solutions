import { css } from "@emotion/css";
import React, { useCallback } from "react";
import Panel from "./panel-left";
import { CategoryMetaData } from "../interfaces";

const categoriesHeaderStyle = css`
  & .categories-header-link {
    cursor: pointer;
    color: #000000;
    transition: color 0.3s;
    margin-top: 1.2rem;
    margin-bottom: 1.2rem;
  }
  & .categories-header-link:hover {
    color: #080808;
  }
`;

const categoriesInnerStyle = css`
  & .categories-inner-link {
    cursor: pointer;
    color: #000000;
    transition: color 0.3s;
    margin-bottom: 0.6rem;
  }
  & .categories-inner-link:hover {
    color: #080808;
  }
`;

export interface DisplayOptions {
  displayHiddenPdfSections: boolean;
  displayHiddenAnswerSections: boolean;
  displayHideShowButtons: boolean;
  displayEmptyCutLabels: boolean;
}

interface CourseCategoriesPanelProps {
  isOpen: boolean;
  toggle: () => void;
  metaList:  [string, [string, CategoryMetaData[]][]][] | undefined;
}
const CourseCategoriesPanel: React.FC<CourseCategoriesPanelProps> = ({
  isOpen,
  toggle,
  metaList,
}) => {
  const scrollToTop = useCallback(() => {
    const c = document.documentElement.scrollTop || document.body.scrollTop;
    if (c > 0) {
      window.requestAnimationFrame(scrollToTop);
      window.scrollTo(0, c - c / 10 - 1);
    } else {
      toggle();
    }
  }, [toggle]);

  const slugify = (str: string): string =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  const scrollToDiv = (id: string): void => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <Panel isOpen={isOpen} toggle={toggle}>
      {metaList &&
        metaList.map(([meta1display, meta2]) => (
          <div key={meta1display}>
            <h5 className='my-3'
              style={{
                cursor: 'pointer',
              }} onClick={() => scrollToDiv(slugify(meta1display))}>
              {meta1display}
            </h5>
            {meta2.map(([meta2display, categories]) => (
              <div key={meta2display}>
                <p className='mb-2' style={{
                    cursor: 'pointer',
                  }} onClick={() => scrollToDiv(slugify(meta1display) + slugify(meta2display))}>
                  {meta2display}
                </p>
              </div>
            ))}
          </div>
        ))}
    </Panel>
  );
};
export default CourseCategoriesPanel;
