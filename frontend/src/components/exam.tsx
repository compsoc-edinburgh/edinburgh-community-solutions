import React, { useState } from "react";
import {
  ExamMetaData,
  Section,
  SectionKind,
  EditMode,
  EditState,
  CutVersions,
  PdfSection,
} from "../interfaces";
import AnswerSectionComponent from "./answer-section";
import PdfSectionCanvas from "../pdf/pdf-section-canvas";
import { useRequest } from "@umijs/hooks";
import { loadCutVersions } from "../api/hooks";
import useSet from "../hooks/useSet";
import PDF from "../pdf/pdf-renderer";

interface Props {
  metaData: ExamMetaData;
  sections: Section[];
  width: number;
  editState: EditState;
  setEditState: (newEditState: EditState) => void;
  reloadCuts: () => void;
  renderer: PDF;
  onCutNameChange: (oid: string, name: string) => void;
  onAddCut: (filename: string, page: number, height: number) => void;
  onMoveCut: (
    filename: string,
    cut: string,
    page: number,
    height: number,
  ) => void;
  visibleChangeListener: (section: PdfSection, v: boolean) => void;
}
const Exam: React.FC<Props> = React.memo(
  ({
    metaData,
    sections,
    width,
    editState,
    setEditState,
    reloadCuts,
    renderer,
    onCutNameChange,
    onAddCut,
    onMoveCut,
    visibleChangeListener,
  }) => {
    console.log("rerender exam");
    const [visible, show, hide] = useSet<string>();
    const [cutVersions, setCutVersions] = useState<CutVersions>({});
    useRequest(() => loadCutVersions(metaData.filename), {
      manual: true,
      pollingInterval: 60_000,
      onSuccess: response => {
        setCutVersions(oldVersions => ({ ...oldVersions, ...response }));
      },
    });
    const snap =
      editState.mode === EditMode.Add || editState.mode === EditMode.Move
        ? editState.snap
        : true;
    let pageCounter = 0;
    return (
      <>
        {sections.map(section =>
          section.kind === SectionKind.Answer ? (
            <AnswerSectionComponent
              key={section.oid}
              isExpert={metaData.isExpert}
              filename={metaData.filename}
              oid={section.oid}
              width={width}
              canDelete={metaData.canEdit}
              onSectionChange={reloadCuts}
              onToggleHidden={() =>
                visible.has(section.oid) ? hide(section.oid) : show(section.oid)
              }
              cutName={section.name}
              onCutNameChange={(newName: string) =>
                onCutNameChange(section.oid, newName)
              }
              hidden={!visible.has(section.oid)}
              cutVersion={cutVersions[section.oid] || section.cutVersion}
              setCutVersion={newVersion =>
                setCutVersions(oldVersions => ({
                  ...oldVersions,
                  [section.oid]: newVersion,
                }))
              }
              onCancelMove={() => setEditState({ mode: EditMode.None })}
              onMove={() =>
                setEditState({ mode: EditMode.Move, cut: section.oid, snap })
              }
              isBeingMoved={
                editState.mode === EditMode.Move &&
                editState.cut === section.oid
              }
            />
          ) : (
            <React.Fragment key={section.key}>
              {pageCounter < section.start.page && ++pageCounter && (
                <div id={`page-${pageCounter}`} />
              )}
              {renderer && (
                <PdfSectionCanvas
                  section={section}
                  renderer={renderer}
                  targetWidth={width}
                  onVisibleChange={v => visibleChangeListener(section, v)}
                  addCutText={
                    editState.mode === EditMode.Add
                      ? "Add Cut"
                      : editState.mode === EditMode.Move
                      ? "Move Cut"
                      : undefined
                  }
                  snap={snap}
                  onAddCut={(height: number) =>
                    editState.mode === EditMode.Add
                      ? onAddCut(metaData.filename, section.start.page, height)
                      : editState.mode === EditMode.Move
                      ? onMoveCut(
                          metaData.filename,
                          editState.cut,
                          section.start.page,
                          height,
                        )
                      : undefined
                  }
                />
              )}
            </React.Fragment>
          ),
        )}
      </>
    );
  },
);
export default Exam;
