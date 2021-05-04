import { useRequest } from "@umijs/hooks";
import { Container } from "@vseth/components";
import React from "react";
import MarkdownText from "./markdown-text";

interface DocumentMarkdownProps {
  url: string;
}
const DocumentMarkdown: React.FC<DocumentMarkdownProps> = ({ url }) => {
  const { error: mdError, loading: mdLoading, data } = useRequest(() =>
    fetch(url).then(r => r.text()),
  );

  return (
    <Container className="py-5">
      {data !== undefined &&
        (data.length > 0 ? (
          <MarkdownText value={data} />
        ) : (
          "This document currently doesn't have any content."
        ))}
    </Container>
  );
};

export default DocumentMarkdown;