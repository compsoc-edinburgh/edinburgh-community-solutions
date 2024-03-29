import { css } from "@emotion/css";
import ReactMarkdown, { Components, defaultUrlTransform }  from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from 'rehype-katex';
// Import mchem plugin to register macros for chemical equations in katex.
// The plugin registers macros when it is imported. We do this after we import "rehype-katex"
// which transitively imports katex such that the global variables which katex uses are set up.
import "katex/contrib/mhchem/mhchem";
import "katex/dist/katex.min.css";
import * as React from "react";
import { useMemo } from "react";
import CodeBlock from "./code-block";
import { Alert, createStyles, Table } from "@mantine/core";
import ErrorBoundary from "./error-boundary";

const useStyles = createStyles(theme => ({
  blockquoteStyle: {
    [`& blockquote`]: {
      padding: "0.3rem 0 0.3rem 0.6rem",
      borderLeftStyle: "solid",
      borderLeftWidth: "3px",
      borderLeftColor: theme.colors.gray[7],
      color: theme.colors.gray[7],
      fill: theme.colors.gray[7],
    },
  },
}));

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
  // Undo effect of .overlay class defined in the theme css
  & .overlay {
    padding: unset;
  }
`;

const transformImageUri = (uri: string) => {
  if (uri.includes("/")) {
    return uri;
  } else {
    return `/api/image/get/${uri}/`;
  }
};

const createComponents = (
  regex: RegExp | undefined,
): Components => ({
  table: ({ children }) => {
    return <Table>{children}</Table>;
  },
  p: ({ children }) => {
    if (regex === undefined) return <span>{children}</span>;
    const arr = [];
    const value = String(children)
    const m = regex.test(value);
    if (!m) return <span>{children}</span>;
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
  code({node, className, children, ...props}) {
    const match = /language-(\w+)/.exec(className || '')
    return match ? (
      <CodeBlock language={match ? match[1] : undefined} value={String(children).replace(/\n$/, '')} {...props} />
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    )
  },
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
  /**
   * If defined, local links will be prefixed with this string. Use for showing
   * Markdown from a different domain.
   */
  localLinkBase?: string;
}

// Example that triggers the error: $\begin{\pmatrix}$
const errorMessage = <Alert color="red" title="Rendering error">An error ocurred when rendering this content. This is likely caused by invalid LaTeX syntax.</Alert>;

const MarkdownText: React.FC<Props> = ({ value, regex, localLinkBase }) => {
  const macros = {}; // Predefined macros. Will be edited by KaTex while rendering!
  const renderers = useMemo(() => createComponents(regex), [regex]);
  const { classes, cx } = useStyles();
  if (value.length === 0) {
    return <div />;
  }
  return (
    <div className={cx(wrapperStyle, classes.blockquoteStyle)}>
      <ErrorBoundary fallback={errorMessage}>
        <ReactMarkdown
          children={value}
          urlTransform={(uri: string, key, node) => {
            if (node.tagName === "img") {
              return transformImageUri(uri);
            } else if (localLinkBase && uri.startsWith("/")) {
              return localLinkBase + defaultUrlTransform(uri);
            }
            return defaultUrlTransform(uri);
          }}
          remarkPlugins={[remarkMath, remarkGfm]}
          rehypePlugins={[[rehypeKatex, {macros}]]}
          components={renderers}
        />
      </ErrorBoundary>
    </div>
  );
};

export default MarkdownText;
