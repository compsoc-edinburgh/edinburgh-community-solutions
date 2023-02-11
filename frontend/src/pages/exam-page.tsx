import { useLocalStorageState, useRequest, useSize } from "@umijs/hooks";
import {
  Card,
  Breadcrumbs,
  Anchor,
  Loader,
  Alert,
  Container,
  Grid,
} from "@mantine/core";
import React, { useCallback, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { loadSections } from "../api/exam-loader";
import { fetchPost } from "../api/fetch-utils";
import {
  loadCuts,
  loadExamMetaData,
  loadSplitRenderer,
  markAsChecked,
} from "../api/hooks";
import { UserContext, useUser } from "../auth";
import Exam from "../components/exam";
import ExamMetadataEditor from "../components/exam-metadata-editor";
import ExamPanel from "../components/exam-panel";
import IconButton from "../components/icon-button";
import PrintExam from "../components/print-exam";
import ContentContainer from "../components/secondary-container";
import { TOC, TOCNode } from "../components/table-of-contents";
import useSet from "../hooks/useSet";
import useTitle from "../hooks/useTitle";
import useToggle from "../hooks/useToggle";
import {
  CutUpdate,
  EditMode,
  EditState,
  ExamMetaData,
  PdfSection,
  Section,
  SectionKind,
  ServerCutResponse,
} from "../interfaces";
import PDF from "../pdf/pdf-renderer";
import { getAnswerSectionId } from "../utils/exam-utils";
import { ICONS } from "vseth-canine-ui";

const addCut = async (
  filename: string,
  pageNum: number,
  relHeight: number,
  hidden = false,
  has_answers = true,
) => {
  await fetchPost(`/api/exam/addcut/${filename}/`, {
    pageNum,
    relHeight,
    name: "",
    hidden,
    has_answers,
  });
};

const updateCut = async (cut: string, update: Partial<CutUpdate>) => {
  await fetchPost(`/api/exam/editcut/${cut}/`, update);
};

interface ExamPageContentProps {
  metaData: ExamMetaData;
  sections?: Section[];
  renderer?: PDF;
  reloadCuts: () => void;
  mutateCuts: (mutation: (old: ServerCutResponse) => ServerCutResponse) => void;
  mutateMetaData: (
    x: ExamMetaData | undefined | ((data: ExamMetaData) => ExamMetaData),
  ) => void;
  toggleEditing: () => void;
}
const ExamPageContent: React.FC<ExamPageContentProps> = ({
  metaData,
  sections,
  renderer,
  reloadCuts,
  mutateCuts,
  mutateMetaData,
  toggleEditing,
}) => {
  const { run: runMarkChecked } = useRequest(markAsChecked, {
    manual: true,
    onSuccess() {
      mutateMetaData(metaData => ({
        ...metaData,
        oral_transcript_checked: true,
      }));
    },
  });
  const user = useUser()!;
  const { run: runAddCut } = useRequest(addCut, {
    manual: true,
    onSuccess: reloadCuts,
  });
  const { run: runMoveCut } = useRequest(updateCut, {
    manual: true,
    onSuccess: () => {
      reloadCuts();
      setEditState({ mode: EditMode.None });
    },
  });
  const { run: runUpdate } = useRequest(updateCut, {
    manual: true,
    onSuccess: (_data, [oid, update]) => {
      mutateCuts(oldCuts =>
        Object.keys(oldCuts).reduce((result, key) => {
          result[key] = oldCuts[key].map(cutPosition =>
            cutPosition.oid === oid
              ? { ...cutPosition, ...update }
              : cutPosition,
          );
          return result;
        }, {} as ServerCutResponse),
      );
    },
  });
  const onSectionChange = useCallback(
    async (section: string | [number, number], update: Partial<CutUpdate>) => {
      if (Array.isArray(section)) {
        await runAddCut(
          metaData.filename,
          section[0],
          section[1],
          update.hidden,
          false,
        );
      } else {
        await runUpdate(section, update);
      }
    },
    [runAddCut, metaData, runUpdate],
  );

  const [size, sizeRef] = useSize<HTMLDivElement>();
  const [maxWidth, setMaxWidth] = useLocalStorageState("max-width", 1000);

  const [visibleSplits, addVisible, removeVisible] = useSet<PdfSection>();
  const [panelIsOpen, togglePanel] = useToggle();
  const [editState, setEditState] = useState<EditState>({
    mode: EditMode.None,
  });

  const visibleChangeListener = useCallback(
    (section: PdfSection, v: boolean) =>
      v ? addVisible(section) : removeVisible(section),
    [addVisible, removeVisible],
  );
  const visiblePages = useMemo(() => {
    const s = new Set<number>();
    for (const split of visibleSplits) {
      s.add(split.start.page);
    }
    return s;
  }, [visibleSplits]);

  const width = size.width;
  const [displayOptions, setDisplayOptions] = useState({
    displayHiddenPdfSections: false,
    displayHiddenAnswerSections: false,
    displayHideShowButtons: false,
    displayEmptyCutLabels: false,
  });

  const [expandedSections, expandSections, collapseSections] = useSet<string>();
  const answerSections = useMemo(() => {
    if (sections === undefined) return;
    const answerSections: string[] = [];
    for (const section of sections) {
      if (section.kind === SectionKind.Answer) {
        answerSections.push(section.oid);
      }
    }
    return answerSections;
  }, [sections]);
  const allSectionsExpanded = useMemo(() => {
    if (answerSections === undefined) return true;
    return answerSections.every(section => expandedSections.has(section));
  }, [answerSections, expandedSections]);
  const allSectionsCollapsed = useMemo(() => {
    if (answerSections === undefined) return true;
    return !answerSections.some(section => expandedSections.has(section));
  }, [answerSections, expandedSections]);
  const collapseAllSections = useCallback(() => {
    if (answerSections === undefined) return;
    collapseSections(...answerSections);
  }, [collapseSections, answerSections]);
  const expandAllSections = useCallback(() => {
    if (answerSections === undefined) return;
    expandSections(...answerSections);
  }, [expandSections, answerSections]);

  const toc = useMemo(() => {
    if (sections === undefined) {
      return undefined;
    }
    const rootNode = new TOCNode("[root]", "");
    for (const section of sections) {
      if (section.kind === SectionKind.Answer) {
        if (section.cutHidden) continue;
        const parts = section.name.split(" > ");
        if (parts.length === 1 && parts[0].length === 0) continue;
        const jumpTarget = getAnswerSectionId(section.oid, section.name);
        rootNode.add(parts, jumpTarget);
      }
    }
    if (rootNode.children.length === 0) return undefined;
    return rootNode;
  }, [sections]);

  return (
    <>
      <Container size="xl">
        <div className="d-flex justify-content-between align-items-center">
          <h1>{metaData.displayname}</h1>
          <div className="d-flex">
            <IconButton
              color="white"
              as="a"
              iconName={ICONS.DOWNLOAD}
              target="_blank"
              rel="noopener noreferrer"
              href={metaData.exam_file}
            />
            {user.isCategoryAdmin && (
              <>
                {user.isAdmin &&
                  metaData.is_oral_transcript &&
                  !metaData.oral_transcript_checked && (
                    <IconButton
                      color="white"
                      className="ml-2"
                      tooltip="Mark as checked"
                      iconName={ICONS.CHECK}
                      onClick={() => runMarkChecked(metaData.filename)}
                    />
                  )}
                <IconButton
                  color="white"
                  iconName={ICONS.EDIT}
                  tooltip="Edit"
                  onClick={() => toggleEditing()}
                />
              </>
            )}
          </div>
        </div>
        <Grid>
          {!metaData.canView && (
            <Grid.Col md={6} lg={4}>
              <Card className="m-1">
                {metaData.needs_payment && !metaData.hasPayed ? (
                  <>
                    You have to pay a deposit in order to see oral exams. After
                    submitting a report of your own oral exam you can get your
                    deposit back.
                  </>
                ) : (
                  <>You can not view this exam at this time.</>
                )}
              </Card>
            </Grid.Col>
          )}
          {metaData.is_printonly && (
            <Grid.Col md={6} lg={4}>
              <PrintExam
                title="exam"
                examtype="exam"
                filename={metaData.filename}
              />
            </Grid.Col>
          )}
          {metaData.has_solution && metaData.solution_printonly && (
            <Grid.Col md={6} lg={4}>
              <PrintExam
                title="solution"
                examtype="solution"
                filename={metaData.filename}
              />
            </Grid.Col>
          )}
          {metaData.legacy_solution && (
            <Grid.Col md={6} lg={4}>
              <a
                href={metaData.legacy_solution}
                target="_blank"
                rel="noopener noreferrer"
                className="btn p-3 btn-block btn-secondary text-left"
              >
                Legacy Solution in VISki
              </a>
            </Grid.Col>
          )}
          {metaData.master_solution && (
            <Grid.Col md={6} lg={4}>
              <a
                href={metaData.master_solution}
                target="_blank"
                rel="noopener noreferrer"
                className="btn p-3 btn-block btn-secondary text-left"
              >
                Official Solution (external)
              </a>
            </Grid.Col>
          )}

          {metaData.has_solution && !metaData.solution_printonly && (
            <Grid.Col md={6} lg={4}>
              <a
                href={metaData.solution_file}
                target="_blank"
                rel="noopener noreferrer"
                className="btn p-3 btn-block btn-secondary text-left"
              >
                Official Solution
              </a>
            </Grid.Col>
          )}
          {metaData.attachments.map(attachment => (
            <Grid.Col md={6} lg={4} key={attachment.filename}>
              <a
                href={`/api/filestore/get/${attachment.filename}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn p-3 btn-block btn-secondary text-left"
              >
                {attachment.displayname}
              </a>
            </Grid.Col>
          ))}
        </Grid>
        {toc && (
          <Grid>
            <Grid.Col lg={12}>
              <TOC toc={toc} />
            </Grid.Col>
          </Grid>
        )}
      </Container>

      <ContentContainer className="my-3">
        <div ref={sizeRef} style={{ maxWidth }} className="mx-auto my-3">
          {width && sections && renderer && (
            <Exam
              metaData={metaData}
              sections={sections}
              width={width}
              editState={editState}
              setEditState={setEditState}
              reloadCuts={reloadCuts}
              renderer={renderer}
              onUpdateCut={onSectionChange}
              onAddCut={runAddCut}
              onMoveCut={runMoveCut}
              visibleChangeListener={visibleChangeListener}
              displayHiddenPdfSections={displayOptions.displayHiddenPdfSections}
              displayHiddenAnswerSections={
                displayOptions.displayHiddenAnswerSections
              }
              displayEmptyCutLabels={displayOptions.displayEmptyCutLabels}
              displayHideShowButtons={displayOptions.displayHideShowButtons}
              expandedSections={expandedSections}
              onCollapseSections={collapseSections}
              onExpandSections={expandSections}
            />
          )}
        </div>
      </ContentContainer>
      <ExamPanel
        isOpen={panelIsOpen}
        toggle={togglePanel}
        metaData={metaData}
        renderer={renderer}
        visiblePages={visiblePages}
        allSectionsExpanded={allSectionsExpanded}
        allSectionsCollapsed={allSectionsCollapsed}
        onCollapseAllSections={collapseAllSections}
        onExpandAllSections={expandAllSections}
        maxWidth={maxWidth}
        setMaxWidth={setMaxWidth}
        editState={editState}
        setEditState={setEditState}
        displayOptions={displayOptions}
        setDisplayOptions={setDisplayOptions}
      />
    </>
  );
};

const ExamPage: React.FC<{}> = () => {
  const { filename } = useParams() as { filename: string };
  const {
    error: metaDataError,
    loading: metaDataLoading,
    data: metaData,
    mutate: setMetaData,
  } = useRequest(() => loadExamMetaData(filename), {
    cacheKey: `exam-metaData-${filename}`,
  });
  useTitle(metaData?.displayname ?? filename);
  const {
    error: cutsError,
    loading: cutsLoading,
    data: cuts,
    run: reloadCuts,
    mutate: mutateCuts,
  } = useRequest(() => loadCuts(filename), {
    cacheKey: `exam-cuts-${filename}`,
  });
  const {
    error: pdfError,
    loading: pdfLoading,
    data,
  } = useRequest(
    () => {
      if (metaData === undefined) return Promise.resolve(undefined);
      const examFile = metaData.exam_file;
      if (examFile === undefined) return Promise.resolve(undefined);
      return loadSplitRenderer(examFile);
    },
    { refreshDeps: [metaData === undefined, metaData?.exam_file] },
  );
  const [pdf, renderer] = data ? data : [];
  const sections = useMemo(
    () => (cuts && pdf ? loadSections(pdf.numPages, cuts) : undefined),
    [pdf, cuts],
  );
  const [editing, toggleEditing] = useToggle();
  const error = metaDataError || cutsError || pdfError;
  const user = useUser()!;
  return (
    <div>
      <Container>
        <Breadcrumbs separator=">">
          <Anchor className="text-primary" href="/">
            Home
          </Anchor>
          <Anchor
            href={`/category/${metaData ? metaData.category : ""}`}
            className="text-primary"
          >
            {metaData && metaData.category_displayname}
          </Anchor>
          <Anchor>{metaData && metaData.displayname}</Anchor>
        </Breadcrumbs>
      </Container>
      <div>
        {error && (
          <Container>
            <Alert color="danger">{error.toString()}</Alert>
          </Container>
        )}
        {metaDataLoading && (
          <Container className="position-absolute">
            <Loader />
          </Container>
        )}
        {metaData &&
          (editing ? (
            <Container>
              <ExamMetadataEditor
                currentMetaData={metaData}
                toggle={toggleEditing}
                onMetaDataChange={setMetaData}
              />
            </Container>
          ) : (
            <UserContext.Provider
              value={{
                ...user,
                isExpert: user.isExpert || metaData.isExpert,
                isCategoryAdmin: user.isAdmin || metaData.canEdit,
              }}
            >
              <ExamPageContent
                metaData={metaData}
                sections={sections}
                renderer={renderer}
                reloadCuts={reloadCuts}
                mutateCuts={mutateCuts}
                mutateMetaData={setMetaData}
                toggleEditing={toggleEditing}
              />
            </UserContext.Provider>
          ))}
        {(cutsLoading || pdfLoading) && !metaDataLoading && (
          <Container>
            <Loader />
          </Container>
        )}
      </div>
    </div>
  );
};
export default ExamPage;
