import {
  Card,
  CardBody,
  CardTitle,
  LikeFilledIcon,
  LikeIcon,
  Modal,
  PlusIcon,
} from "@vseth/components";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDocuments } from "../api/hooks";
import CreateDocumentForm from "./create-document-modal";
import Grid from "./grid";
import TooltipButton from "./TooltipButton";

interface Props {
  slug: string;
}

const DocumentList: React.FC<Props> = ({ slug }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [error, loading, documents] = useDocuments(slug);
  return (
    <>
      <Modal isOpen={isOpen} toggle={() => setIsOpen((r) => !r)}>
        <CreateDocumentForm
          categorySlug={slug}
          toggle={() => setIsOpen((r) => !r)}
        />
      </Modal>

      <Grid>
        {documents &&
          documents.map((document) => (
            <Card key={document.slug}>
              <CardBody>
                <Link to={`/user/${document.author}/document/${document.slug}`}>
                  <CardTitle tag="h6">{document.display_name}</CardTitle>
                </Link>
                <div>
                  <Link to={`/user/${document.author}`} className="text-muted">
                    @{document.author}
                  </Link>
                  {document.liked ? (
                    <span className="text-danger ml-2">
                      <LikeFilledIcon className="mr-1" /> {document.like_count}
                    </span>
                  ) : (
                    <span className="text-muted ml-2">
                      <LikeIcon className="mr-1" /> {document.like_count}
                    </span>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        <Card style={{ minHeight: "4em" }}>
          <TooltipButton
            tooltip="Add a new document"
            onClick={() => setIsOpen(true)}
            className="position-cover w-100"
          >
            <PlusIcon size={40} className="m-auto" />
          </TooltipButton>
        </Card>
      </Grid>
    </>
  );
};
export default DocumentList;
