import {
  Button,
  List,
  TextInput,
  Modal,
  Flex,
  Switch,
  Title,
  Text,
  Stack,
  Group,
  Select,
  Grid,
} from "@mantine/core";
import { useRequest } from "@umijs/hooks";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Icon, ICONS } from "vseth-canine-ui";
import { imageHandler } from "../api/fetch-utils";
import {
  loadAdminCategories,
  loadDocumentTypes,
  Mutate,
  useDeleteDocument,
  useRegenerateDocumentAPIKey,
  useUpdateDocument,
} from "../api/hooks";
import useToggle from "../hooks/useToggle";
import { Document } from "../interfaces";
import { createOptions, options } from "../utils/ts-utils";
import CreateDocumentFileModal from "./create-document-file-modal";
import DocumentFileItem from "./document-file-item";
import Editor from "./Editor";
import { UndoStack } from "./Editor/utils/undo-stack";
import IconButton from "./icon-button";
import MarkdownText from "./markdown-text";

interface Props {
  data: Document;
  mutate: Mutate<Document>;
}

const DocumentSettings: React.FC<Props> = ({ data, mutate }) => {
  const history = useHistory();
  const { data: categories } = useRequest(loadAdminCategories);
  const categoryOptions =
    categories &&
    createOptions(
      Object.fromEntries(
        categories.map(
          category => [category.slug, category.displayname] as const,
        ),
      ) as { [key: string]: string },
    );

  const { data: documentTypes } = useRequest(loadDocumentTypes);

  const [documentTypeOptions, setDocumentTypeOptions] = useState<string[]>([]);
  useEffect(() => {
    setDocumentTypeOptions(documentTypes ?? []);
  }, [documentTypes]);

  const [loading, updateDocument] = useUpdateDocument(
    data.slug,
    result => {
      mutate(s => ({ ...s, ...result }));
      setDisplayName(undefined);
      setCategory(undefined);
      setDocumentType(undefined);
      if (result.slug !== data.slug) {
        history.replace(`/document/${result.slug}`);
      }
    },
  );
  const [regenerateLoading, regenerate] = useRegenerateDocumentAPIKey(
    data.slug,
    result => mutate(s => ({ ...s, ...result })),
  );
  const [_, deleteDocument] = useDeleteDocument(
    data.slug,
    () => data && history.push(`/category/${data.category}`),
  );
  const [deleteModalIsOpen, toggleDeleteModalIsOpen] = useToggle();

  const [displayName, setDisplayName] = useState<string | undefined>();
  const [category, setCategory] = useState<string | undefined>();
  const [documentType, setDocumentType] = useState<string | undefined>();
  const [descriptionDraftText, setDescriptionDraftText] = useState<
    string | undefined
  >(undefined);
  const [descriptionUndoStack, setDescriptionUndoStack] = useState<UndoStack>({
    prev: [],
    next: [],
  });
  const [anonymised, setAnonymised] = useState<boolean | undefined>(undefined);

  const [addModalIsOpen, toggleAddModalIsOpen] = useToggle(false);
  return (
    <>
      <Modal
        title="Add File"
        opened={addModalIsOpen}
        onClose={toggleAddModalIsOpen}
      >
        <CreateDocumentFileModal
          toggle={toggleAddModalIsOpen}
          document={data}
          mutate={mutate}
        />
      </Modal>
      {data.can_edit && (
        <Stack>
          <TextInput
            label="Display Name"
            value={displayName ?? data.display_name}
            onChange={e => setDisplayName(e.currentTarget.value)}
          />
          <Grid>
            <Grid.Col span={6}>
              <Select
                label="Category"
                data={categoryOptions ? (options(categoryOptions) as any) : []}
                value={
                  categoryOptions &&
                  (category ? categoryOptions[category].value : data.category)
                }
                onChange={(value: string) => {
                  setCategory(value);
                }}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Document type"
                creatable
                searchable
                getCreateLabel={query =>
                  `+ Create new document type "${query}"`
                }
                onCreate={query => {
                  setDocumentType(query);
                  setDocumentTypeOptions([...(documentTypes ?? []), query]);
                  return query;
                }}
                data={documentTypeOptions}
                value={
                  documentTypeOptions &&
                  (documentType ? documentType : data.document_type)
                }
                onChange={(value: string) => {
                  setDocumentType(value);
                }}
              />
            </Grid.Col>
          </Grid>
          <div>
            <Text size="sm">Description</Text>
            <Editor
              value={descriptionDraftText ?? data.description}
              onChange={setDescriptionDraftText}
              imageHandler={imageHandler}
              preview={value => <MarkdownText value={value} />}
              undoStack={descriptionUndoStack}
              setUndoStack={setDescriptionUndoStack}
            />
          </div>
          <div>
            <Text size="sm">Anonymise</Text>
            <Switch
              checked={anonymised ?? data.anonymised}
              onChange={e => setAnonymised(e.currentTarget.checked)}
              label="Check this to hide the author UUN from normal users. Yourself, BI admins, and category admins will still be able to see the original UUN."
            />
          </div>
          <Flex justify="end">
            <Button
              loading={loading}
              leftIcon={<Icon icon={ICONS.SAVE} />}
              onClick={() =>
                updateDocument({
                  display_name: displayName,
                  category,
                  document_type: documentType,
                  description: descriptionDraftText,
                  anonymised,
                })
              }
              disabled={displayName?.trim() === ""}
            >
              Save
            </Button>
          </Flex>
        </Stack>
      )}
      <Title order={3}>Files</Title>
      {data.api_key && (
        <Flex align="center" my="sm" gap="sm">
          API Key:
          <pre>{data.api_key}</pre>
          <IconButton
            loading={regenerateLoading}
            onClick={regenerate}
            size="sm"
            iconName={ICONS.REPEAT}
            tooltip="Regenerating the API token will invalidate the old one and generate a new one"
          />
        </Flex>
      )}
      <List mb="md">
        {data.files.map(file => (
          <DocumentFileItem
            key={file.oid}
            document={data}
            file={file}
            mutate={mutate}
          />
        ))}
      </List>
      <Flex justify="end">
        <Button
          leftIcon={<Icon icon={ICONS.PLUS} />}
          onClick={toggleAddModalIsOpen}
        >
          Add
        </Button>
      </Flex>
      {data.can_delete && (
        <>
          <Title order={3}>Red Zone</Title>
          <Flex wrap="wrap" justify="space-between" align="center" my="md">
            <Flex direction="column">
              <Title order={4}>Delete this document</Title>
              <div>
                Deleting the document will delete all associated files and all
                comments. <b>This cannot be undone.</b>
              </div>
            </Flex>

            <Button
              leftIcon={<Icon icon={ICONS.DELETE} />}
              color="red"
              onClick={toggleDeleteModalIsOpen}
            >
              Delete
            </Button>
          </Flex>
        </>
      )}
      <Modal
        opened={deleteModalIsOpen}
        title="Are you absolutely sure?"
        onClose={toggleDeleteModalIsOpen}
      >
        <Modal.Body>
          Deleting the document will delete all associated files and all
          comments. <b>This cannot be undone.</b>
          <Group position="right" mt="md">
            <Button onClick={toggleDeleteModalIsOpen}>Not really</Button>
            <Button onClick={deleteDocument} color="red">
              Delete this document
            </Button>
          </Group>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default DocumentSettings;
