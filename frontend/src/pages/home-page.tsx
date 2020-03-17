import React, { useMemo, useState, useCallback } from "react";
import {
  Container,
  Card,
  CardHeader,
  CardBody,
  Row,
  Input,
  Form,
  Col,
  FormGroup,
  Select,
  Alert,
  Spinner,
  CardFooter,
  Button,
} from "@vseth/components";
import { useRequest, useLocalStorageState } from "@umijs/hooks";
import { fetchapi } from "../fetch-utils";
import { CategoryMetaData, MetaCategory } from "../interfaces";
import Grid from "../components/grid";
import { Link } from "react-router-dom";
import { useUser, User } from "../auth";

const loadCategories = async () => {
  return (await fetchapi("/api/listcategories/withmeta"))
    .value as CategoryMetaData[];
};
const loadMetaCategories = async () => {
  return (await fetchapi("/api/listmetacategories")).value as MetaCategory[];
};
const loadCategoryData = async () => {
  return await Promise.all([loadCategories(), loadMetaCategories()]);
};
const mapToCategories = (
  categories: CategoryMetaData[],
  meta1: MetaCategory[],
) => {
  const categoryMap = new Map<string, CategoryMetaData>();
  for (const category of categories)
    categoryMap.set(category.category, category);
  const meta1Map: Map<string, Array<[string, CategoryMetaData[]]>> = new Map();
  for (const { displayname: meta1display, meta2 } of meta1) {
    const meta2Map: Map<string, CategoryMetaData[]> = new Map();
    for (const { displayname: meta2display, categories } of meta2) {
      meta2Map.set(
        meta2display,
        categories.map(name => categoryMap.get(name)!),
      );
    }
    meta1Map.set(
      meta1display,
      [...meta2Map.entries()].sort(([a], [b]) => a.localeCompare(b)),
    );
  }
  return [...meta1Map.entries()].sort(([a], [b]) => a.localeCompare(b));
};

const Category: React.FC<{ category: CategoryMetaData }> = ({ category }) => {
  return (
    <Card>
      <Link to={`category/${category.slug}`} style={{ color: "black" }}>
        <CardHeader tag="h6">{category.category}</CardHeader>
        <CardBody>
          <div>
            Exams:{" "}
            {`${category.examcountanswered} / ${category.examcountpublic}`}
          </div>
          <div>Answers: {(category.answerprogress * 100).toString()} %</div>
        </CardBody>
      </Link>
    </Card>
  );
};
const AddCategory: React.FC<{ onAddCategory: (name: string) => void }> = ({
  onAddCategory,
}) => {
  const [categoryName, setCategoryName] = useState("");
  const onSubmit = () => {
    setCategoryName("");
    onAddCategory(categoryName);
  };
  return (
    <Card>
      <CardHeader tag="h6">Add Category</CardHeader>
      <CardBody>
        <Input
          type="text"
          placeholder="Category Name"
          value={categoryName}
          onChange={e => setCategoryName(e.currentTarget.value)}
        />
      </CardBody>
      <CardFooter>
        <Button onClick={onSubmit}>Add Category</Button>
      </CardFooter>
    </Card>
  );
};

enum Mode {
  Alphabetical,
  BySemester,
}
const options = [
  { value: Mode.Alphabetical.toString(), label: "Alphabetical" },
  { value: Mode.BySemester.toString(), label: "By Semester" },
];
const HomePage: React.FC<{}> = () => {
  const [mode, setMode] = useLocalStorageState<Mode>("mode", Mode.Alphabetical);
  const [filter, setFilter] = useState("");
  const { data, error, loading } = useRequest(loadCategoryData);
  const [categories, metaCategories] = data ? data : [];
  const metaCategoryMap = useMemo(
    () =>
      categories && metaCategories
        ? mapToCategories(categories, metaCategories)
        : undefined,
    [categories, metaCategories],
  );
  const { isAdmin } = useUser() as User;
  const onAddCategory = useCallback((categoryName: string) => {
    console.log(categoryName);
  }, []);

  return (
    <Container>
      <Form>
        <Row form>
          <Col md={4}>
            <FormGroup>
              <Select
                options={[options[Mode.Alphabetical], options[Mode.BySemester]]}
                defaultValue={options[mode]}
                onChange={(e: any) => setMode(e.value | 0)}
              />
            </FormGroup>
          </Col>
          <Col md={8}>
            <FormGroup>
              <Input
                type="search"
                placeholder="Filter..."
                value={filter}
                onChange={e => setFilter(e.currentTarget.value)}
              />
            </FormGroup>
          </Col>
        </Row>
      </Form>
      {error ? (
        <Alert>{error.message}</Alert>
      ) : loading ? (
        <Spinner />
      ) : mode === Mode.Alphabetical ? (
        categories && (
          <Grid>
            {categories.map(category => (
              <Category category={category} key={category.slug} />
            ))}
            {isAdmin && <AddCategory onAddCategory={onAddCategory} />}
          </Grid>
        )
      ) : (
        metaCategoryMap && (
          <>
            {metaCategoryMap.map(([meta1display, meta2]) => (
              <div key={meta1display}>
                <h4>{meta1display}</h4>
                {meta2.map(([meta2display, categories]) => (
                  <div key={meta2display}>
                    <h5>{meta2display}</h5>
                    <Grid>
                      {categories.map(category => (
                        <Category category={category} key={category.slug} />
                      ))}
                    </Grid>
                  </div>
                ))}
              </div>
            ))}
            {isAdmin && (
              <>
                <h4>New Category</h4>
                <Grid>
                  <AddCategory onAddCategory={onAddCategory} />
                </Grid>
              </>
            )}
          </>
        )
      )}
    </Container>
  );
};
export default HomePage;
