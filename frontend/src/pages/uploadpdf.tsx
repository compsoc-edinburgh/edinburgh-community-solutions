import * as React from "react";
import {Redirect} from "react-router-dom";
import {fetchpost} from '../fetch-utils';
import AutocompleteInput from '../components/autocomplete-input';

interface State {
  file: Blob;
  fileName: string;
  displayName: string;
  category: string;
  categories: string[];
  result?: { href: string };
  error?: string;
}

export default class UploadPDF extends React.Component<{}, State> {

  state: State = {
    file: new Blob(),
    fileName: "",
    displayName: "",
    category: "",
    categories: []
  };

  async componentWillMount() {
    fetch('/api/listcategories')
      .then(res => res.json())
      .then(res => this.setState({
        categories: res.value
      }));
  }

  async componentDidMount() {
    document.title = "VIS Community Solutions: Upload Exam";
  }

  handleUpload = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();

    fetchpost('/api/uploadpdf', {
      file: this.state.file,
      filename: this.state.fileName + ".pdf",
      displayname: this.state.displayName,
      category: this.state.category
    })
      .then((response) => response.json().then((body) => ({body, ok: response.ok})))
      .then(({body, ok}) => ok ? body : Promise.reject(body.err))
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

  handleFileNameChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      fileName: ev.target.value
    });
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
      return <Redirect to={this.state.result.href}/>
    } else {
      return (
        <div>
          {this.state.error && <p>{this.state.error}</p>}
          <form onSubmit={this.handleUpload}>
            <input onChange={this.handleFileChange} type="file" accept="application/pdf"/>
            <input onChange={this.handleFileNameChange} value={this.state.fileName} type="text"
                   placeholder="filename..."/>
            <input onChange={this.handleDisplayNameChange} value={this.state.displayName} type="text"
                   placeholder="displayname..." required/>
            <AutocompleteInput name="category" onChange={this.handleCategoryChange} value={this.state.category}
                               placeholder="category..." autocomplete={this.state.categories}/>
            <button type="submit">Upload</button>
          </form>
        </div>
      );
    }
  }
};
