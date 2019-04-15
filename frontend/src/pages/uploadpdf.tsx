import * as React from "react";
import {Redirect} from "react-router-dom";
import {css} from "glamor";
import {fetchapi, fetchpost} from '../fetch-utils';
import AutocompleteInput from '../components/autocomplete-input';
import Colors from "../colors";

interface State {
  file: Blob;
  displayName: string;
  category: string;
  categories: string[];
  result?: { filename: string };
  error?: string;
}

const styles = {
  wrapper: css({
    width: "430px",
    margin: "auto",
    padding: "10px",
    background: Colors.cardBackground,
    boxShadow: Colors.cardShadow,
    "& div": {
      width: "100%",
    },
    "& input, & button": {
      width: "415px",
    },
  }),
};

export default class UploadPDF extends React.Component<{}, State> {

  state: State = {
    file: new Blob(),
    displayName: "",
    category: "",
    categories: []
  };

  componentDidMount() {
    fetchapi('/api/listcategories/onlyadmin')
      .then(res => this.setState({
        categories: res.value
      }))
      .catch((e)=>{
        this.setState({error: e.toString()});
      });
    document.title = "Upload Exam - VIS Community Solutions";
  }

  handleUpload = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    fetchpost('/api/uploadpdf/exam', {
      file: this.state.file,
      displayname: this.state.displayName,
      category: this.state.category
    })
      .then((body) => this.setState({
        result: body,
        error: undefined
      }))
      .catch((e) => {
        this.setState({error: e.toString()});
      });
  };

  handleFileChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    if (ev.target.files != null) {
      this.setState({
        file: ev.target.files[0]
      });
    }
  };

  handleDisplayNameChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      displayName: ev.target.value
    });
  };

  handleCategoryChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      category: ev.target.value
    })
  };

  render() {
    if (this.state.result) {
      return <Redirect to={"/exams/" + this.state.result.filename}/>
    } else {
      return (
        <div {...styles.wrapper}>
          <h2>Upload PDF</h2>
          {this.state.error && <p>{this.state.error}</p>}
          <form onSubmit={this.handleUpload}>
            <div>
              <input onChange={this.handleFileChange} type="file" accept="application/pdf"/>
            </div>
            <div>
              <input onChange={this.handleDisplayNameChange} value={this.state.displayName} type="text"
                     placeholder="displayname..." required/>
            </div>
            <div>
              <AutocompleteInput name="category" onChange={this.handleCategoryChange} value={this.state.category}
                                 placeholder="category..." autocomplete={this.state.categories}/>
            </div>
            <div>
              <button type="submit">Upload</button>
            </div>
          </form>
        </div>
      );
    }
  }
};
