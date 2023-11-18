import {
  Alert,
  Card,
  FileInput,
  Stack,
  Text,
  Title,
  Select,
} from "@mantine/core";
import { useRequest } from "@umijs/hooks";
import { Button } from "@mantine/core";
import React, { useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { Icon, ICONS } from "vseth-canine-ui";
import { loadPaymentCategories, uploadTranscript } from "../api/hooks";

const UploadTranscriptCard: React.FC<{}> = () => {
  const history = useHistory();
  const {
    error: categoriesError,
    loading: categoriesLoading,
    data: categories,
  } = useRequest(loadPaymentCategories);
  const {
    error: uploadError,
    loading: uploadLoading,
    run: upload,
  } = useRequest(uploadTranscript, {
    manual: true,
    onSuccess: filename => history.push(`/exams/${filename}`),
  });
  const [validationError, setValidationError] = useState("");
  const error = categoriesError || uploadError || validationError;
  const loading = categoriesLoading || uploadLoading;

  const options = useMemo(
    () =>
      categories?.map(category => ({
        value: category.slug,
        label: category.displayname,
      })) ?? [],
    [categories],
  );

  const [file, setFile] = useState<File | null>();
  const [category, setCategory] = useState<string | undefined>();
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (file && category) {
      upload(file, category);
    } else if (file === undefined) {
      setValidationError("No file selected");
    } else {
      setValidationError("No category selected");
    }
  };

  return (
    <Card withBorder shadow="md">
      <Card.Section withBorder p="md" bg="gray.0">
        <Title order={4}>Submit Transcript for Oral Exam</Title>
      </Card.Section>
      <Stack mt="sm">
        <Text>Please use the following template:</Text>
        <Button
          leftIcon={<Icon icon={ICONS.DOWNLOAD} />}
          onClick={() => window.open("/static/transcript_template.tex")}
        >
          Download template
        </Button>
        <form onSubmit={onSubmit}>
          <Stack>
            {error && <Alert color="red">{error.toString()}</Alert>}
            <FileInput
              label="File"
              placeholder="Click to choose file..."
              icon={<Icon icon={ICONS.CLOUD_UP} />}
              value={file}
              onChange={setFile}
              accept="application/pdf"
            />
            <Select
              label="Category"
              placeholder="Choose category..."
              data={options}
              searchable
              nothingFound="No category found"
              onChange={(value: string) => setCategory(value)}
            />
            <Button variant="brand" type="submit" loading={loading}>
              Submit
            </Button>
          </Stack>
        </form>
      </Stack>
    </Card>
  );
};
export default UploadTranscriptCard;
