import { TextContent, TextContentItem } from "pdfjs-dist";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import PDF from "../pdf/pdf-renderer";

const useTextLayer = (
  shouldRender: boolean,
  renderer: PDF,
  pageNumber: number,
  start: number,
  end: number,
): TextContent | null => {
  const [textContent, setTextContent] = useState<TextContent | null>(null);
  const runningRef = useRef(false);
  useEffect(() => {
    runningRef.current = true;
    if (shouldRender) {
      (async () => {
        const text = await renderer.renderText(pageNumber);
        if (!runningRef.current) return;
        setTextContent(text);
      })();
    }
    return () => {
      runningRef.current = false;
    };
  }, [shouldRender, pageNumber, renderer]);
  return textContent;
};

interface TextElementProps {
  item: TextContentItem;
  // tslint:disable-next-line: no-any
  styles: any;
  view: number[];
  scale: number;
}
const PdfTextElement: React.FC<TextElementProps> = ({
  item,
  styles,
  view,
  scale,
}) => {
  const [fontHeightPx, , , offsetY, x, y] = item.transform;
  const [xMin, , , yMax] = view;
  const top = yMax - (y + offsetY);
  const left = x - xMin;
  const style = styles[item.fontName] || {};
  const fontName = style.fontFamily || "";
  const fontFamily = `${fontName}, sans-serif`;
  const divRef = (ref: HTMLDivElement | null) => {
    if (ref === null) return;
    const [width, height] = [ref.clientWidth, ref.clientHeight];
    const targetWidth = item.width * scale;
    const targetHeight = item.height * scale;
    const xScale = targetWidth / width;
    const yScale = targetHeight / height;
    ref.style.transform = `scaleX(${xScale}) scaleY(${yScale})`;
  };
  return (
    <div
      style={{
        position: "absolute",
        top: `${top * scale}px`,
        left: `${left * scale}px`,
        fontSize: `${fontHeightPx * scale}px`,
        whiteSpace: "pre",
        fontFamily,
        color: "transparent",
        transformOrigin: "left bottom",
      }}
      ref={divRef}
    >
      {item.str}
    </div>
  );
};

interface Props {
  page: number;
  start: number;
  end: number;
  renderer: PDF;
  view?: number[];
  scale: number;
  translateY: number;
}
const PdfSectionText: React.FC<Props> = ({
  page,
  start,
  end,
  renderer,
  view,
  scale,
  translateY,
}) => {
  const textContent = useTextLayer(true, renderer, page, start, end);
  return (
    <div
      className="position-absolute position-top-left"
      style={{
        transform: `translateY(-${translateY}px) scale(${scale})`,
        transformOrigin: "top left",
        display: view ? "block" : "none",
      }}
    >
      {textContent &&
        textContent.items.map((item, index) => (
          <PdfTextElement
            key={index}
            item={item}
            styles={textContent.styles}
            view={view || [0, 0, 0, 0]}
            scale={1.0}
          />
        ))}
    </div>
  );
};
export default PdfSectionText;