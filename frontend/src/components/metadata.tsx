import * as React from "react";
import {css} from "glamor";
import {ExamMetaData} from "../interfaces";
import {fetchapi, fetchpost} from "../fetch-utils";
import Colors from "../colors";
import AutocompleteInput from '../components/autocomplete-input';

const stylesForWidth = {
  justWidth: css({
    width: "200px"
  }),
  inlineBlock: css({
    width: "200px",
    margin: "5px",
    display: "inline-block",
  })
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
};

interface Props {
  filename?: string;
  savedMetaData: ExamMetaData;
  onChange: (newMetaData: ExamMetaData) => void;
  onFinishEdit: () => void;
}

interface State {
  currentMetaData: ExamMetaData;
  categories: string[];
  paymentCategories: string[];
  examTypes: string[];
  printonlyFile: Blob;
  solutionFile: Blob;
  error?: string;
}

export default class MetaData extends React.Component<Props, State> {
  state: State = {
    currentMetaData: {...this.props.savedMetaData},
    categories: [],
    paymentCategories: [],
    examTypes: [],
    printonlyFile: new Blob(),
    solutionFile: new Blob(),
  };

  componentDidMount() {
    fetchapi('/api/listcategories/onlyadmin')
      .then(res => {
        this.setState({
          categories: res.value
        });
      })
      .catch(() => undefined);
    fetchapi('/api/listcategories/onlypayment')
      .then(res => {
        this.setState({
          paymentCategories: res.value
        });
      })
      .catch(() => undefined);
    fetchapi('/api/listexamtypes')
      .then(res => {
        this.setState({
          examTypes: res.value
        });
      })
      .catch(() => undefined);
  }

  saveEdit = () => {
    let metadata = {...this.state.currentMetaData};
    metadata.has_solution = this.props.savedMetaData.has_solution;
    metadata.has_printonly = this.props.savedMetaData.has_printonly;
    fetchpost(`/api/exam/${this.props.filename}/metadata`, metadata)
      .then(() => {
        this.props.onChange(metadata);
        this.props.onFinishEdit();
      })
      .catch((err) => this.setState({
        error: err.toString()
      }));
  };

  cancelEdit = () => {
    this.setState({
      currentMetaData: {...this.props.savedMetaData},
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

  checkboxValueChanged = (key: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = event.target.checked;
    this.setState(prevState => {
      prevState.currentMetaData[key] = newVal;
      return prevState;
    });
  };

  handleFileChangePrintonly = (ev: React.ChangeEvent<HTMLInputElement>) => {
    if (ev.target.files != null) {
      this.setState({
        printonlyFile: ev.target.files[0]
      });
    }
  };

  handleFileChangeSolution = (ev: React.ChangeEvent<HTMLInputElement>) => {
    if (ev.target.files != null) {
      this.setState({
        solutionFile: ev.target.files[0]
      });
    }
  };

  uploadFilePrintonly = () => {
    fetchpost('/api/uploadpdf/printonly', {
      file: this.state.printonlyFile,
      filename: this.state.currentMetaData.filename,
      replace: this.state.currentMetaData.has_printonly,
    })
      .then(() => {
        let newMeta = {...this.props.savedMetaData};
        newMeta.has_printonly = true;
        this.props.onChange(newMeta);
      })
      .catch((err) => this.setState({
        error: err.toString()
      }));
  };

  removeFilePrintonly = () => {
    fetchpost('/api/removepdf/printonly', {
      filename: this.state.currentMetaData.filename
    })
      .then(() => {
        let newMeta = {...this.props.savedMetaData};
        newMeta.has_printonly = false;
        this.props.onChange(newMeta);
      })
      .catch((err) => this.setState({
        error: err.toString()
      }));
  };

  uploadFileSolution = () => {
    fetchpost('/api/uploadpdf/solution', {
      file: this.state.solutionFile,
      filename: this.state.currentMetaData.filename,
      replace: this.state.currentMetaData.has_solution,
    })
      .then(() => {
        let newMeta = {...this.props.savedMetaData};
        newMeta.has_solution = true;
        this.props.onChange(newMeta);
      })
      .catch((err) => this.setState({
        error: err.toString()
      }));
  };

  removeFileSolution = () => {
    fetchpost('/api/removepdf/solution', {
      filename: this.state.currentMetaData.filename
    })
      .then(() => {
        let newMeta = {...this.props.savedMetaData};
        newMeta.has_solution = false;
        this.props.onChange(newMeta);
      })
      .catch((err) => this.setState({
        error: err.toString()
      }));
  };

  render() {
    return (<div {...styles.wrapper}>
      <div>
        <input type="text" placeholder="display name" value={this.state.currentMetaData.displayname} onChange={(ev) => this.valueChanged("displayname", ev)}/>
        <input type="text" placeholder="resolve alias" value={this.state.currentMetaData.resolve_alias} onChange={(ev) => this.valueChanged("resolve_alias", ev)}/>
      </div>
      <div>
        <AutocompleteInput value={this.state.currentMetaData.category} onChange={ev => this.valueChanged("category", ev)}
                           placeholder="category" autocomplete={this.state.categories} name="category"/>
        <AutocompleteInput value={this.state.currentMetaData.examtype} onChange={ev => this.valueChanged("examtype", ev)}
                           placeholder="examtype" autocomplete={this.state.examTypes} name="examtype"/>
      </div>
      <div>
        <input type="text" placeholder="legacy solution" value={this.state.currentMetaData.legacy_solution} onChange={(ev) => this.valueChanged("legacy_solution", ev)}/>
        <input type="text" placeholder="master solution (extern)" value={this.state.currentMetaData.master_solution} onChange={(ev) => this.valueChanged("master_solution", ev)}/>
      </div>
      <div>
        <AutocompleteInput value={this.state.currentMetaData.payment_category} onChange={ev => this.valueChanged("payment_category", ev)}
                           placeholder="payment_category" autocomplete={this.state.paymentCategories} name="payment_category"/>
        <input type="text" placeholder="remark" value={this.state.currentMetaData.remark} onChange={(ev) => this.valueChanged("remark", ev)}/>
      </div>
      <div>
        <label>
          <input type="checkbox" checked={this.state.currentMetaData.public} onChange={(ev) => this.checkboxValueChanged("public", ev)}/>
          Public
        </label>
      </div>
      <div>
        <label>
          <input type="checkbox" checked={this.state.currentMetaData.finished_cuts} onChange={(ev) => this.checkboxValueChanged("finished_cuts", ev)}/>
          Finished Cuts
        </label>
        <label>
          <input type="checkbox" checked={this.state.currentMetaData.finished_wiki_transfer} onChange={(ev) => this.checkboxValueChanged("finished_wiki_transfer", ev)}/>
          Finished Wiki Transfer
        </label>
      </div>
      {this.state.error && <div>{this.state.error}</div>}
      <div>
        <button onClick={this.saveEdit}>Save</button>
        <button onClick={this.cancelEdit}>Cancel</button>
      </div>
      <hr/>
      <div>
        <label>
          Print Only File
          <input type="file" accept="application/pdf" onChange={this.handleFileChangePrintonly}/>
        </label>
        <button onClick={this.uploadFilePrintonly}>Upload</button>
      </div>
      {this.props.savedMetaData.has_printonly && <div>
        <a {...stylesForWidth.inlineBlock} href={"/api/pdf/printonly/" + this.props.savedMetaData.filename} target="_blank">Current File</a>
        <button onClick={this.removeFilePrintonly}>Remove File</button>
      </div>}
      <div>
        <label>
          Master Solution
          <input type="file" accept="application/pdf" onChange={this.handleFileChangeSolution}/>
        </label>
        <button onClick={this.uploadFileSolution}>Upload</button>
      </div>
      {this.props.savedMetaData.has_solution && <div>
        <a {...stylesForWidth.inlineBlock} href={"/api/pdf/solution/" + this.props.savedMetaData.filename} target="_blank">Current File</a>
        <button onClick={this.removeFileSolution}>Remove File</button>
      </div>}
    </div>);
  }
}