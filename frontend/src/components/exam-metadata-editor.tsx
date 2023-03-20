import { useRequest } from "@umijs/hooks";
import {
  Alert,
  Button,
  Checkbox,
  CloseButton,
  Grid,
  Group,
  NativeSelect,
  Stack,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import React from "react";
import { downloadIndirect, fetchGet, fetchPost } from "../api/fetch-utils";
import { loadCategories, loadExamTypes } from "../api/hooks";
import useInitialState from "../hooks/useInitialState";
import { Attachment, ExamMetaData } from "../interfaces";
import { createOptions, options } from "../utils/ts-utils";
import AttachmentsEditor, { EditorAttachment } from "./attachments-editor";
import FileInput from "./file-input";
import useForm from "../hooks/useForm";
import { Icon, ICONS } from "vseth-canine-ui";
const stringKeys = [
  "displayname",
  "category",
  "examtype",
  "legacy_solution",
  "master_solution",
  "resolve_alias",
  "remark",
] as const;
const booleanKeys = [
  "public",
  "finished_cuts",
  "finished_wiki_transfer",
  "needs_payment",
  "solution_printonly",
] as const;

const setMetaData = async (
  filename: string,
  changes: Partial<ExamMetaData>,
) => {
  if (Object.keys(changes).length === 0) return;
  await fetchPost(`/api/exam/setmetadata/${filename}/`, changes);
};
const addAttachment = async (exam: string, displayname: string, file: File) => {
  return (
    await fetchPost("/api/filestore/upload/", {
      exam,
      displayname,
      file,
    })
  ).filename as string;
};
const removeAttachment = async (filename: string) => {
  await fetchPost(`/api/filestore/remove/${filename}/`, {});
};
const setPrintOnly = async (filename: string, file: File) => {
  await fetchPost(`/api/exam/upload/printonly/`, { file, filename });
};
const removePrintOnly = async (filename: string) => {
  await fetchPost(`/api/exam/remove/printonly/${filename}/`, {});
};
const setSolution = async (filename: string, file: File) => {
  await fetchPost(`/api/exam/upload/solution/`, { file, filename });
};
const removeSolution = async (filename: string) => {
  await fetchPost(`/api/exam/remove/solution/${filename}/`, {});
};

export interface ExamMetaDataDraft extends Omit<ExamMetaData, "attachments"> {
  attachments: EditorAttachment[];
}
const applyChanges = async (
  filename: string,
  oldMetaData: ExamMetaData,
  newMetaData: ExamMetaDataDraft,
  printonly: File | true | undefined,
  masterSolution: File | true | undefined,
) => {
  const metaDataDiff: Partial<ExamMetaData> = {};
  for (const key of stringKeys) {
    if (oldMetaData[key] !== newMetaData[key]) {
      metaDataDiff[key] = newMetaData[key];
    }
  }
  for (const key of booleanKeys) {
    if (oldMetaData[key] !== newMetaData[key]) {
      metaDataDiff[key] = newMetaData[key];
    }
  }
  await setMetaData(filename, metaDataDiff);
  const newAttachments: Attachment[] = [];
  for (const attachment of newMetaData.attachments) {
    if (attachment.filename instanceof File) {
      const newFilename = await addAttachment(
        filename,
        attachment.displayname,
        attachment.filename,
      );
      newAttachments.push({
        displayname: attachment.displayname,
        filename: newFilename,
      });
    }
  }
  for (const attachment of oldMetaData.attachments) {
    if (
      newMetaData.attachments.find(
        otherAttachment => otherAttachment.filename === attachment.filename,
      )
    ) {
      newAttachments.push(attachment);
    } else {
      await removeAttachment(attachment.filename);
    }
  }

  if (printonly === undefined && oldMetaData.is_printonly) {
    await removePrintOnly(filename);
    metaDataDiff.is_printonly = false;
  } else if (printonly instanceof File) {
    await setPrintOnly(filename, printonly);
    metaDataDiff.is_printonly = true;
  }
  if (!oldMetaData.is_printonly && printonly instanceof File) {
    const newUrl = await fetchGet(`/api/exam/pdf/printonly/${filename}/`);
    metaDataDiff.printonly_file = newUrl.value;
  }

  if (masterSolution === undefined && oldMetaData.has_solution) {
    await removeSolution(filename);
    metaDataDiff.has_solution = false;
  } else if (masterSolution instanceof File) {
    await setSolution(filename, masterSolution);
    metaDataDiff.has_solution = true;
  }
  if (!oldMetaData.has_solution && masterSolution instanceof File) {
    const newUrl = await fetchGet(`/api/exam/pdf/solution/${filename}/`);
    metaDataDiff.solution_file = newUrl.value;
  }

  return {
    ...oldMetaData,
    ...metaDataDiff,
    attachments: newAttachments,
    category_displayname: newMetaData.category_displayname,
  };
};

interface Props {
  currentMetaData: ExamMetaData;
  toggle: () => void;
  onMetaDataChange: (newMetaData: ExamMetaData) => void;
}
const ExamMetadataEditor: React.FC<Props> = ({
  currentMetaData,
  toggle,
  onMetaDataChange,
}) => {
  const { data: categories } = useRequest(loadCategories);
  const { data: examTypes } = useRequest(loadExamTypes);
  const categoryOptions =
    categories &&
    createOptions(
      Object.fromEntries(
        categories.map(
          category => [category.slug, category.displayname] as const,
        ),
      ) as { [key: string]: string },
    );
  const examTypeOptions =
    examTypes &&
    createOptions(
      Object.fromEntries(
        examTypes.map(examType => [examType, examType] as const),
      ) as { [key: string]: string },
    );
  const {
    loading,
    error,
    run: runApplyChanges,
  } = useRequest(applyChanges, {
    manual: true,
    onSuccess: newMetaData => {
      toggle();
      onMetaDataChange(newMetaData);
    },
  });

  const [printonlyFile, setPrintonlyFile] = useInitialState<
    File | true | undefined
  >(currentMetaData.is_printonly ? true : undefined);
  const [masterFile, setMasterFile] = useInitialState<File | true | undefined>(
    currentMetaData.has_solution ? true : undefined,
  );

  const { registerInput, registerCheckbox, formState, setFormValue, onSubmit } =
    useForm(
      currentMetaData as ExamMetaDataDraft,
      values =>
        runApplyChanges(
          currentMetaData.filename,
          currentMetaData,
          values,
          printonlyFile,
          masterFile,
        ),
      ["category", "category_displayname", "examtype", "remark", "attachments"],
    );

  return (
    <Stack>
      <Group position="apart" pt="sm">
        <Title order={2}>Edit Exam</Title>
        <CloseButton onClick={toggle} />
      </Group>
      {error && <Alert color="danger">{error.toString()}</Alert>}
      <Title order={6}>Metadata</Title>
      <Grid>
        <Grid.Col md={6}>
          <TextInput label="Display name" {...registerInput("displayname")} />
        </Grid.Col>
        <Grid.Col md={6}>
          <TextInput
            label="Resolve Alias"
            {...registerInput("resolve_alias")}
          />
        </Grid.Col>
      </Grid>
      <Grid>
        <Grid.Col md={6}>
          <NativeSelect
            label="Category"
            data={categoryOptions ? (options(categoryOptions) as any) : []}
            value={categoryOptions && categoryOptions[formState.category].value}
            onChange={(e: any) => {
              setFormValue("category", e.value as string);
              setFormValue("category_displayname", e.label as string);
            }}
          />
        </Grid.Col>
        <Grid.Col md={6}>
          <NativeSelect
            label="Exam type"
            data={examTypeOptions ? (options(examTypeOptions) as any) : []}
            value={formState.examtype}
            onChange={(event: any) =>
              setFormValue("examtype", event.currentTarget.value)
            }
          />
        </Grid.Col>
      </Grid>
      <Grid>
        <Grid.Col md={6}>
          <Checkbox
            name="check"
            label="Public"
            {...registerCheckbox("public")}
          />
        </Grid.Col>
        <Grid.Col md={6}>
          <Checkbox
            name="check"
            id="needsPayment"
            label="Needs Payment"
            {...registerCheckbox("needs_payment")}
          />
        </Grid.Col>
      </Grid>
      <Grid>
        <Grid.Col md={6}>
          <Checkbox
            name="check"
            label="Finished Cuts"
            {...registerCheckbox("finished_cuts")}
          />
        </Grid.Col>
        <Grid.Col md={6}>
          <Checkbox
            label="Finished Wiki Transfer"
            name="check"
            {...registerCheckbox("finished_wiki_transfer")}
          />
        </Grid.Col>
      </Grid>
      <Grid>
        <Grid.Col md={6}>
          <TextInput
            type="url"
            {...registerInput("legacy_solution")}
            label="Legacy Solution"
          />
        </Grid.Col>
        <Grid.Col md={6}>
          <TextInput
            type="url"
            {...registerInput("master_solution")}
            label="Master Solution (extern)"
          />
        </Grid.Col>
      </Grid>
      <Grid>
        <Grid.Col md={6}>
          <label className="form-input-label">Print Only File</label>
          {printonlyFile === true ? (
            <div className="form-control">
              <Button
                size="sm"
                className="py-0"
                onClick={() =>
                  downloadIndirect(
                    `/api/exam/pdf/printonly/${currentMetaData.filename}/`,
                  )
                }
              >
                Current File
              </Button>
              <CloseButton onClick={() => setPrintonlyFile(undefined)} />
            </div>
          ) : (
            <FileInput
              value={printonlyFile}
              onChange={e => setPrintonlyFile(e)}
            />
          )}
        </Grid.Col>
        <Grid.Col md={6}>
          <label className="form-input-label">Master Solution</label>
          {masterFile === true ? (
            <div className="form-control">
              <Button
                size="sm"
                className="py-0"
                onClick={() =>
                  downloadIndirect(
                    `/api/exam/pdf/solution/${currentMetaData.filename}/`,
                  )
                }
              >
                Current File
              </Button>
              <CloseButton onClick={() => setMasterFile(undefined)} />
            </div>
          ) : (
            <FileInput value={masterFile} onChange={e => setMasterFile(e)} />
          )}
        </Grid.Col>
      </Grid>
      <Textarea label="Remark" {...registerInput("remark")} />
      <Title order={6}>Attachments</Title>
      <AttachmentsEditor
        attachments={formState.attachments}
        setAttachments={a => setFormValue("attachments", a)}
      />
      <Group position="right">
        <Button leftIcon={<Icon icon={ICONS.CLOSE} />} onClick={toggle}>
          Cancel
        </Button>
        <Button
          leftIcon={<Icon icon={ICONS.SAVE} />}
          color="primary"
          loading={loading}
          onClick={onSubmit}
        >
          Save
        </Button>
      </Group>
    </Stack>
  );
};
export default ExamMetadataEditor;
