import { useRequest } from "@umijs/hooks";
import {
  Alert,
  Badge,
  Breadcrumb,
  Button,
  Card,
  CardHeader,
  Container,
  ListGroup,
  ListGroupItem,
  Spinner,
  Table,
} from "@vseth/components";
import { BreadcrumbItem } from "@vseth/components/dist/components/Breadcrumb/Breadcrumb";
import React, { useMemo } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import { UserContext, useUser } from "../auth";
import { getMetaCategoriesForCategory } from "../category-utils";
import { fetchapi } from "../fetch-utils";
import useSet from "../hooks/useSet";
import { CategoryExam, CategoryMetaData, MetaCategory } from "../interfaces";

const loadCategoryMetaData = async (slug: string) => {
  return (await fetchapi(`/api/category/metadata/${slug}`))
    .value as CategoryMetaData;
};
const loadMetaCategories = async () => {
  return (await fetchapi("/api/category/listmetacategories"))
    .value as MetaCategory[];
};
const loadList = async (slug: string) => {
  return (await fetchapi(`/api/category/listexams/${slug}`))
    .value as CategoryExam[];
};
const mapExamsToExamType = (exams: CategoryExam[]) => {
  return [
    ...exams
      .reduce((map, exam) => {
        const examtype = exam.examtype ?? "Exams";
        const arr = map.get(examtype);
        if (arr) {
          arr.push(exam);
        } else {
          map.set(examtype, [exam]);
        }
        return map;
      }, new Map<string, CategoryExam[]>())
      .entries(),
  ].sort(([a], [b]) => a.localeCompare(b));
};
const dlSelectedExams = (selectedExams: Set<string>) => {
  const form = document.createElement("form");
  form.action = "/api/exam/zipexport/";
  form.method = "POST";
  form.target = "_blank";
  for (const filename of selectedExams) {
    const input = document.createElement("input");
    input.name = "filenames";
    input.value = filename;
    form.appendChild(input);
  }
  form.style.display = "none";
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

interface ExamTypeCardProps {
  examtype: string;
  exams: CategoryExam[];
  selected: Set<string>;
  onSelect: (...filenames: string[]) => void;
  onDeselect: (...filenames: string[]) => void;
}
const ExamTypeCard: React.FC<ExamTypeCardProps> = ({
  examtype,
  exams,
  selected,
  onSelect,
  onDeselect,
}) => {
  const history = useHistory();
  const allSelected = exams.every(exam => selected.has(exam.filename));
  const someSelected = exams.some(exam => selected.has(exam.filename));
  const checked = someSelected;
  const indeterminate = someSelected && !allSelected;
  const setChecked = (newValue: boolean) => {
    if (newValue) onSelect(...exams.map(exam => exam.filename));
    else onDeselect(...exams.map(exam => exam.filename));
  };
  return (
    <Card style={{ margin: "0.5em" }}>
      <CardHeader tag="h4">{examtype}</CardHeader>
      <Table>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={checked}
                ref={el => el && (el.indeterminate = indeterminate)}
                onChange={e => setChecked(e.currentTarget.checked)}
              />
            </th>
            <th>Name</th>
            <th>Remark</th>
            <th>Answers</th>
          </tr>
        </thead>
        <tbody>
          {exams.map(exam => (
            <tr
              key={exam.filename}
              style={{ cursor: "pointer" }}
              onClick={() => history.push(`/exams/${exam.filename}`)}
            >
              <td
                onClick={e => e.stopPropagation()}
                style={{ cursor: "initial" }}
              >
                <input
                  type="checkbox"
                  checked={selected.has(exam.filename)}
                  onChange={e =>
                    e.currentTarget.checked
                      ? onSelect(exam.filename)
                      : onDeselect(exam.filename)
                  }
                />
              </td>
              <td>
                <Link to={`/exams/${exam.filename}`}>{exam.displayname}</Link>
              </td>
              <td>{exam.remark}</td>
              <td>
                {exam.count_cuts} / {exam.count_cuts}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  );
};

interface ExamListProps {
  metaData: CategoryMetaData;
}
const ExamList: React.FC<ExamListProps> = ({ metaData }) => {
  const { data, loading, error } = useRequest(() => loadList(metaData.slug));
  const examTypeMap = useMemo(
    () => (data ? mapExamsToExamType(data) : undefined),
    [data],
  );
  const [selected, onSelect, onDeselect] = useSet<string>();

  return (
    <>
      <Card style={{ margin: "0.5em" }}>
        <CardHeader>
          <Button
            disabled={selected.size === 0}
            onClick={() => dlSelectedExams(selected)}
          >
            Download selected exams
          </Button>
        </CardHeader>
      </Card>
      {error ? (
        <Alert color="danger">{error}</Alert>
      ) : loading ? (
        <Spinner />
      ) : (
        examTypeMap &&
        examTypeMap.map(([examtype, exams]) => (
          <ExamTypeCard
            examtype={examtype}
            exams={exams}
            key={examtype}
            selected={selected}
            onSelect={onSelect}
            onDeselect={onDeselect}
          />
        ))
      )}
    </>
  );
};

interface CategoryPageContentProps {
  metaData: CategoryMetaData;
}
const CategoryPageContent: React.FC<CategoryPageContentProps> = ({
  metaData,
}) => {
  const { data, loading } = useRequest(loadMetaCategories);
  const offeredIn = useMemo(
    () =>
      data ? getMetaCategoriesForCategory(data, metaData.slug) : undefined,
    [data, metaData],
  );
  return (
    <>
      <Breadcrumb>
        <BreadcrumbItem>
          <Link to="/">Home</Link>
        </BreadcrumbItem>
        <BreadcrumbItem>{metaData.displayname}</BreadcrumbItem>
      </Breadcrumb>
      <h1>{metaData.displayname}</h1>
      <ListGroup style={{ marginBottom: "2em" }}>
        {metaData.semester && (
          <ListGroupItem>
            Semester: <Badge>{metaData.semester}</Badge>
          </ListGroupItem>
        )}
        {metaData.form && (
          <ListGroupItem>
            Form: <Badge>{metaData.form}</Badge>
          </ListGroupItem>
        )}
        {(offeredIn === undefined || offeredIn.length > 0) && (
          <ListGroupItem>
            Offered in:
            <div>
              {loading ? (
                <Spinner />
              ) : (
                <ul>
                  {offeredIn?.map(meta1 =>
                    meta1.meta2.map(meta2 => (
                      <li key={meta1.displayname + meta2.displayname}>
                        {meta2.displayname} in {meta1.displayname}
                      </li>
                    )),
                  )}
                </ul>
              )}
            </div>
          </ListGroupItem>
        )}
        {metaData.more_exams_link && (
          <ListGroupItem>
            <a
              href={metaData.more_exams_link}
              target="_blank"
              rel="noopener noreferrer"
            >
              Additional Exams
            </a>
          </ListGroupItem>
        )}
      </ListGroup>
      <ExamList metaData={metaData} />
    </>
  );
};

const CategoryPage: React.FC<{}> = () => {
  const { slug } = useParams() as { slug: string };
  const { data, loading, error } = useRequest(() => loadCategoryMetaData(slug));
  const user = useUser();
  return (
    <Container>
      {error ? (
        <Alert color="danger">{error.message}</Alert>
      ) : loading ? (
        <Spinner />
      ) : (
        data && (
          <UserContext.Provider
            value={
              user
                ? {
                    ...user,
                    isCategoryAdmin: user.isCategoryAdmin || data.catadmin,
                  }
                : undefined
            }
          >
            <CategoryPageContent metaData={data} />
          </UserContext.Provider>
        )
      )}
    </Container>
  );
};
export default CategoryPage;
