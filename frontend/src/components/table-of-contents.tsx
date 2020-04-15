import { Link } from "react-router-dom";
import * as React from "react";
import { useState } from "react";
import { Card, CardHeader, CardBody, Button } from "@vseth/components";
import TwoButtons from "./two-buttons";

export class TOCNode {
  name: string;
  jumpTarget: string;
  children: TOCNode[];
  childMap: Map<string, TOCNode>;
  constructor(name: string, jumpTarget: string) {
    this.name = name;
    this.jumpTarget = jumpTarget;
    this.children = [];
    this.childMap = new Map();
  }
  public addChild(newChild: TOCNode) {
    this.children.push(newChild);
    this.childMap.set(newChild.name, newChild);
  }
  public add(rest: string[], jumpTarget: string) {
    if (rest.length === 0) return;
    const child = this.childMap.get(rest[0]);
    if (child !== undefined) {
      child.add(rest.slice(1), jumpTarget);
    } else {
      const newToc = new TOCNode(rest[0], jumpTarget);
      this.addChild(newToc);
      newToc.add(rest.slice(1), jumpTarget);
    }
  }
}

interface NodeCompoennt {
  node: TOCNode;
}
const TOCNodeComponent: React.FC<NodeCompoennt> = ({ node }) => {
  return (
    <li>
      <Link to={`#${node.jumpTarget}`}>{node.name}</Link>
      {node.children.length > 0 && (
        <ul>
          {node.children.map((child, i) => (
            <TOCNodeComponent node={child} key={child.name + i} />
          ))}
        </ul>
      )}
    </li>
  );
};

interface Props {
  toc: TOCNode;
}
export const TOC: React.FC<Props> = ({ toc }) => {
  const [visible, setVisible] = useState(false);
  return visible ? (
    <Card className="m-1">
      <CardHeader>
        <TwoButtons
          left="Contents"
          right={<Button onClick={() => setVisible(false)}>Hide</Button>}
        />
      </CardHeader>
      <CardBody>
        <ul>
          {toc.children.map((child, i) => (
            <TOCNodeComponent node={child} key={child.name + i} />
          ))}
        </ul>
      </CardBody>
    </Card>
  ) : (
    <Card className="m-1">
      <CardHeader>
        <TwoButtons
          left="Contents"
          right={<Button onClick={() => setVisible(true)}>Show</Button>}
        />
      </CardHeader>
    </Card>
  );
};
