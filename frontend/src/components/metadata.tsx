import * as React from "react";
import { css } from "glamor";
import {
  Attachment,
  CategoryMetaDataMinimal,
  ExamMetaData,
} from "../interfaces";
import { fetchapi, fetchpost } from "../fetch-utils";
import Colors from "../colors";
import AutocompleteInput from "../components/autocomplete-input";
import Attachments from "./attachments";

const stylesForWidth = {
  justWidth: css({
    width: "200px",
  }),
  inlineBlock: css({
    width: "200px",
    margin: "5px",
    display: "inline-block",
  }),
};
const styles = {
  wrapper: css({
    width: "430px",
    margin: "auto",
    marginBottom: "20px",
    padding: "10px",
    background: Colors.cardBackground,
    boxShadow: Colors.cardShadow,
    "& input[type=text]": stylesForWidth.justWidth,
    "& input[type=file]": stylesForWidth.justWidth,
    "& label": stylesForWidth.inlineBlock,
    "& button": stylesForWidth.justWidth,
  }),
  title: css({
    paddingLeft: "5px",
  }),
};

interface Props {
  filename?: string;
  savedMetaData: ExamMetaData;
  onChange: (newMetaData: ExamMetaData) => void;
  onFinishEdit: () => void;
}

interface State {
  currentMetaData: ExamMetaData;
  categories: CategoryMetaDataMinimal[];
  examTypes: string[];
  printonlyFile: Blob;
  solutionFile: Blob;
  error?: string;
}

export default class MetaData extends React.Component<Props, State> {
  state: State = {
    currentMetaData: { ...this.props.savedMetaData },
    categories: [],
    examTypes: [],
    printonlyFile: new Blob(),
    solutionFile: new Blob(),
  };

  componentDidMount() {
    fetchapi("/api/category/listonlyadmin/")
      .then(res => {
        this.setState({
          categories: res.value,
        });
      })
      .catch(() => undefined);
    fetchapi("/api/listexamtypes")
      .then(res => {
        this.setState({
          examTypes: res.value,
        });
      })
      .catch(() => undefined);
  }

  saveEdit = () => {
    let metadata = { ...this.state.currentMetaData };
    metadata.has_solution = this.props.savedMetaData.has_solution;
    metadata.is_printonly = this.props.savedMetaData.is_printonly;
    fetchpost(`/api/exam/${this.props.filename}/metadata`, metadata)
      .then(() => {
        this.props.onChange(metadata);
        this.props.onFinishEdit();
      })
      .catch(err =>
        this.setState({
          error: err.toString(),
        }),
      );
  };

  cancelEdit = () => {
    this.setState({
      currentMetaData: { ...this.props.savedMetaData },
    });
    this.props.onFinishEdit();
  };

  valueChanged = (key: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = event.target.value;
    this.setState(prevState => {
      prevState.currentMetaData[key] = newVal;
      return prevState;
    });
  };

  checkboxValueChanged = (
    key: string,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newVal = event.target.checked;
    this.setState(prevState => {
      prevState.currentMetaData[key] = newVal;
      return prevState;
    });
  };

  handleFileChangePrintonly = (ev: React.ChangeEvent<HTMLInputElement>) => {
    if (ev.target.files != null) {
      this.setState({
        printonlyFile: ev.target.files[0],
      });
    }
  };

  handleFileChangeSolution = (ev: React.ChangeEvent<HTMLInputElement>) => {
    if (ev.target.files != null) {
      this.setState({
        solutionFile: ev.target.files[0],
      });
    }
  };

  uploadFilePrintonly = () => {
    fetchpost("/api/exam/upload/printonly/", {
      file: this.state.printonlyFile,
      filename: this.state.currentMetaData.filename,
    })
      .then(() => {
        let newMeta = { ...this.props.savedMetaData };
        newMeta.is_printonly = true;
        this.props.onChange(newMeta);
      })
      .catch(err =>
        this.setState({
          error: err.toString(),
        }),
      );
  };

  removeFilePrintonly = () => {
    fetchpost("/api/exam/remove/printonly/", {
      filename: this.state.currentMetaData.filename,
    })
      .then(() => {
        let newMeta = { ...this.props.savedMetaData };
        newMeta.is_printonly = false;
        this.props.onChange(newMeta);
      })
      .catch(err =>
        this.setState({
          error: err.toString(),
        }),
      );
  };

  uploadFileSolution = () => {
    fetchpost("/api/exam/upload/solution/", {
      file: this.state.solutionFile,
      filename: this.state.currentMetaData.filename,
    })
      .then(() => {
        let newMeta = { ...this.props.savedMetaData };
        newMeta.has_solution = true;
        this.props.onChange(newMeta);
      })
      .catch(err =>
        this.setState({
          error: err.toString(),
        }),
      );
  };

  removeFileSolution = () => {
    fetchpost("/api/exam/remove/solution/", {
      filename: this.state.currentMetaData.filename,
    })
      .then(() => {
        let newMeta = { ...this.props.savedMetaData };
        newMeta.has_solution = false;
        this.props.onChange(newMeta);
      })
      .catch(err =>
        this.setState({
          error: err.toString(),
        }),
      );
  };

  addAttachment = (att: Attachment) => {
    let metadata = { ...this.props.savedMetaData };
    metadata.attachments.push(att);
    this.props.onChange(metadata);
  };

  removeAttachment = (att: Attachment) => {
    let metadata = { ...this.props.savedMetaData };
    metadata.attachments = metadata.attachments.filter(a => a !== att);
    this.props.onChange(metadata);
  };

  render() {
    return (
      <div {...styles.wrapper}>
        <div>
          <input
            type="text"
            placeholder="display name"
            title="display name"
            value={this.state.currentMetaData.displayname}
            onChange={ev => this.valueChanged("displayname", ev)}
          />
          <input
            type="text"
            placeholder="resolve alias"
            title="resolve alias"
            value={this.state.currentMetaData.resolve_alias}
            onChange={ev => this.valueChanged("resolve_alias", ev)}
          />
        </div>
        <div>
          <AutocompleteInput
            value={this.state.currentMetaData.category}
            onChange={ev => this.valueChanged("category", ev)}
            placeholder="category"
            title="category"
            autocomplete={this.state.categories.map(cat => cat.displayname)}
            name="category"
          />
          <AutocompleteInput
            value={this.state.currentMetaData.examtype}
            onChange={ev => this.valueChanged("examtype", ev)}
            placeholder="examtype"
            title="examtype"
            autocomplete={this.state.examTypes}
            name="examtype"
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="legacy solution"
            title="legacy solution"
            value={this.state.currentMetaData.legacy_solution}
            onChange={ev => this.valueChanged("legacy_solution", ev)}
          />
          <input
            type="text"
            placeholder="master solution (extern)"
            title="master solution (extern)"
            value={this.state.currentMetaData.master_solution}
            onChange={ev => this.valueChanged("master_solution", ev)}
          />
        </div>
        <div>
          <input
            type="text"
            placeholder="remark"
            title="remark"
            value={this.state.currentMetaData.remark}
            onChange={ev => this.valueChanged("remark", ev)}
          />
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={this.state.currentMetaData.public}
              onChange={ev => this.checkboxValueChanged("public", ev)}
            />
            Public
          </label>
          <label>
            <input
              type="checkbox"
              checked={this.state.currentMetaData.needs_payment}
              onChange={ev => this.checkboxValueChanged("needs_payment", ev)}
            />
            Needs Payment
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={this.state.currentMetaData.finished_cuts}
              onChange={ev => this.checkboxValueChanged("finished_cuts", ev)}
            />
            Finished Cuts
          </label>
          <label>
            <input
              type="checkbox"
              checked={this.state.currentMetaData.finished_wiki_transfer}
              onChange={ev =>
                this.checkboxValueChanged("finished_wiki_transfer", ev)
              }
            />
            Finished Wiki Transfer
          </label>
        </div>
        <hr />
        <div>
          <label>
            Print Only File
            <input
              type="file"
              accept="application/pdf"
              onChange={this.handleFileChangePrintonly}
            />
          </label>
          <button onClick={this.uploadFilePrintonly}>Upload</button>
        </div>
        {this.props.savedMetaData.is_printonly && (
          <div>
            <a
              {...stylesForWidth.inlineBlock}
              href={
                "/api/exam/pdf/printonly/" +
                this.props.savedMetaData.filename +
                "/"
              }
              target="_blank"
            >
              Current File
            </a>
            <button onClick={this.removeFilePrintonly}>Remove File</button>
          </div>
        )}
        <div>
          <label>
            Master Solution
            <input
              type="file"
              accept="application/pdf"
              onChange={this.handleFileChangeSolution}
            />
          </label>
          <button onClick={this.uploadFileSolution}>Upload</button>
        </div>
        {this.props.savedMetaData.has_solution && (
          <div>
            <a
              {...stylesForWidth.inlineBlock}
              href={
                "/api/exam/pdf/solution/" +
                this.props.savedMetaData.filename +
                "/"
              }
              target="_blank"
            >
              Current File
            </a>
            <button onClick={this.removeFileSolution}>Remove File</button>
          </div>
        )}
        {this.props.savedMetaData.has_solution && (
          <div>
            <label>
              <input
                type="checkbox"
                checked={this.state.currentMetaData.solution_printonly}
                onChange={ev =>
                  this.checkboxValueChanged("solution_printonly", ev)
                }
              />
              Solution Print Only
            </label>
          </div>
        )}
        <hr />
        <div {...styles.title}>
          <b>Attachments</b>
        </div>
        <Attachments
          attachments={this.props.savedMetaData.attachments}
          additionalArgs={{ exam: this.props.filename }}
          onAddAttachment={this.addAttachment}
          onRemoveAttachment={this.removeAttachment}
        />
        <hr />
        {this.state.error && <div>{this.state.error}</div>}
        <div>
          <button onClick={this.saveEdit}>Save</button>
          <button onClick={this.cancelEdit}>Cancel</button>
        </div>
      </div>
    );
  }
}
