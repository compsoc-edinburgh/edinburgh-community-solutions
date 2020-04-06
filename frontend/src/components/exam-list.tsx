import { useRequest } from "@umijs/hooks";
import { Alert, FormGroup, Spinner } from "@vseth/components";
import React, { useMemo, useState } from "react";
import { loadList } from "../api/hooks";
import { useUser } from "../auth";
import { CategoryMetaData } from "../interfaces";
import {
  dlSelectedExams,
  filterMatches,
  mapExamsToExamType,
} from "../utils/category-utils";
import ExamTypeCard from "./exam-type-card";
import IconButton from "./icon-button";
import TwoButtons from "./two-buttons";
import useSet from "../hooks/useSet";

interface ExamListProps {
  metaData: CategoryMetaData;
}
const ExamList: React.FC<ExamListProps> = ({ metaData }) => {
  const { data, loading, error, run: reload } = useRequest(
    () => loadList(metaData.slug),
    { cacheKey: `exam-list-${metaData.slug}` },
  );
  const [filter, setFilter] = useState("");
  const { isCategoryAdmin } = useUser()!;
  const viewableExams = useMemo(
    () =>
      data &&
      data
        .filter(exam => exam.public || isCategoryAdmin)
        .filter(exam => filterMatches(filter, exam.displayname)),
    [data, isCategoryAdmin, filter],
  );
  const examTypeMap = useMemo(
    () => (viewableExams ? mapExamsToExamType(viewableExams) : undefined),
    [viewableExams],
  );
  const [selected, onSelect, onDeselect] = useSet<string>();

  return (
    <>
      <TwoButtons
        fill="right"
        left={
          <FormGroup style={{ margin: "0.1em" }}>
            <IconButton
              disabled={selected.size === 0}
              onClick={() => dlSelectedExams(selected)}
              block
              icon="DOWNLOAD"
            >
              Download selected exams
            </IconButton>
          </FormGroup>
        }
        right={
          <FormGroup style={{ margin: "0.1em" }}>
            <div className="search" style={{ marginBottom: 0 }}>
              <input
                type="text"
                className="search-input"
                placeholder="Filter..."
                value={filter}
                onChange={e => setFilter(e.currentTarget.value)}
              />
              <div className="search-icon-wrapper">
                <div className="search-icon" />
              </div>
            </div>
          </FormGroup>
        }
      />
      {error ? (
        <Alert color="danger">{error}</Alert>
      ) : loading ? (
        <Spinner />
      ) : (
        examTypeMap &&
        examTypeMap.map(
          ([examtype, exams]) =>
            exams.length > 0 && (
              <ExamTypeCard
                examtype={examtype}
                exams={exams}
                key={examtype}
                selected={selected}
                onSelect={onSelect}
                onDeselect={onDeselect}
                reload={reload}
              />
            ),
        )
      )}
    </>
  );
};
export default ExamList;
