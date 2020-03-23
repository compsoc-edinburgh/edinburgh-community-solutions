import { useRequest } from "@umijs/hooks";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Form,
  FormGroup,
  InputField,
  ListGroup,
  ListGroupItem,
  Row,
  Select,
  Spinner,
} from "@vseth/components";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { loadCategories, uploadPdf } from "../hooks/api";

const LoginCard: React.FC<{}> = () => {
  const history = useHistory();
  const {
    error: categoriesError,
    loading: categoriesLoading,
    data: categories,
  } = useRequest(loadCategories);
  const {
    error: uploadError,
    loading: uploadLoading,
    run: upload,
  } = useRequest(uploadPdf, {
    manual: true,
    onSuccess: filename => history.push(`/exams/${filename}`),
  });
  const [validationError, setValidationError] = useState("");
  const error = categoriesError || uploadError || validationError;
  const loading = categoriesLoading || uploadLoading;

  const options = categories?.map(category => ({
    value: category.slug,
    label: category.displayname,
  }));

  const [file, setFile] = useState<File | undefined>();
  const [displayname, setDisplayname] = useState("");
  const [category, setCategory] = useState<string | undefined>();
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (file && category) {
      upload(file, displayname, category);
    } else if (file === undefined) {
      setValidationError("No file selected");
    } else {
      setValidationError("No category selected");
    }
  };

  return (
    <Card>
      <CardHeader>Upload PDF</CardHeader>
      <CardBody>
        <Form onSubmit={onSubmit}>
          {error && <Alert color="danger">{error.toString()}</Alert>}
          <InputField
            type="file"
            label="PDF"
            onChange={e => {
              setFile((e.currentTarget.files || [])[0]);
              e.currentTarget.value = "";
            }}
          />
          {file && (
            <ListGroup>
              <ListGroupItem>
                {file.name}
                <Badge>{file.type}</Badge> <Badge>{file.size}</Badge>
              </ListGroupItem>
            </ListGroup>
          )}
          <InputField
            label="Name"
            type="text"
            placeholder="Name"
            value={displayname}
            onChange={e => setDisplayname(e.currentTarget.value)}
            required
          />
          <FormGroup>
            <label className="form-input-label">Category</label>
            <Select
              options={options}
              onChange={(e: any) => setCategory(e.value as string)}
              isLoading={categoriesLoading}
              required
            />
          </FormGroup>
          <Row form>
            <Col md={4}>
              <FormGroup>
                <Button color="primary" type="submit" disabled={loading}>
                  {uploadLoading ? <Spinner /> : "Submit"}
                </Button>
              </FormGroup>
            </Col>
          </Row>
        </Form>
      </CardBody>
    </Card>
  );
};
export default LoginCard;
