import { useRequest } from "@umijs/hooks";
import { Container } from "@vseth/components";
import React from "react";
import CodeBlock from "./code-block";

interface DocumentCodeProps {
  url: string;
}
const DocumentCode: React.FC<DocumentCodeProps> = ({ url }) => {
  const { data } = useRequest(() => fetch(url).then(r => r.text()));

  return (
    <Container className="py-5">
      {data !== undefined &&
        (data.length > 0 ? (
          <CodeBlock value={data} language="tex" />
        ) : (
          "This document currently doesn't have any content."
        ))}
    </Container>
  );
};

export default DocumentCode;
