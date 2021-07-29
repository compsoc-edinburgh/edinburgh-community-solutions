import TeX from "@matejmazur/react-katex";
import { css } from "@emotion/css";
import "katex/dist/katex.min.css";
import * as React from "react";
import { useMemo } from "react";
import ReactMarkdown, { ReactMarkdownProps } from "react-markdown";
import * as RemarkMathPlugin from "remark-math";
import CodeBlock from "./code-block";
import RemarkGfm from "remark-gfm";

const wrapperStyle = css`
  overflow-x: auto;
  overflow-y: hidden;
  & p:first-child {
    margin-block-start: 0;
  }
  & p:last-child {
    margin-block-end: 0;
  }
  & img {
    max-width: 100%;
  }
  @media (max-width: 699px) {
    & p {
      margin-block-start: 0.5em;
      margin-block-end: 0.5em;
    }
  }
  & .katex {
    font-size: 1rem;
  }
`;

const transformImageUri = (uri: string) => {
  if (uri.includes("/")) {
    return uri;
  } else {
    return `/api/image/get/${uri}/`;
  }
};

const markdownPlugins = [RemarkMathPlugin, RemarkGfm];

const createRenderers = (
  regex: RegExp | undefined,
): ReactMarkdownProps["renderers"] => ({
  table: ({ children }) => {
    return <table className="table">{children}</table>;
  },
  text: ({ value }: { value: string }) => {
    if (regex === undefined) return <span>{value}</span>;
    const arr: React.ReactChild[] = [];
    const m = regex.test(value);
    if (!m) return <span>{value}</span>;
    let i = 0;
    while (i < value.length) {
      const rest = value.substring(i);
      const m = rest.match(regex);
      if (m) {
        const start = m.index || 0;
        arr.push(<span key={start}>{rest.substring(0, start)}</span>);
        arr.push(<mark key={`${start}match`}>{m[0]}</mark>);

        i += start + m[0].length;
      } else {
        arr.push(<span key="rest">{rest}</span>);
        break;
      }
    }
    return <>{arr}</>;
  },
  math: (props: { value: string }) => <TeX math={props.value} block />,
  inlineMath: (props: { value: string }) => <TeX math={props.value} />,
  code: (props: { value: string; language: string }) => (
    <CodeBlock language={props.language} value={props.value} />
  ),
});

interface Props {
  /**
   * The markdown string that should be rendered.
   */
  value: string;
  /**
   * A regex which should be used for highlighting. If undefined no text will
   * be highlighted.
   */
  regex?: RegExp;
}
const MarkdownText: React.FC<Props> = ({ value, regex }) => {
  const renderers = useMemo(() => createRenderers(regex), [regex]);
  if (value.length === 0) {
    return <div />;
  }
  return (
    <div className={wrapperStyle}>
      <ReactMarkdown
        source={value}
        transformImageUri={transformImageUri}
        plugins={markdownPlugins}
        renderers={renderers}
      />
    </div>
  );
};

export default MarkdownText;
