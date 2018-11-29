import * as React from "react";
import {AnswerSection, Comment} from "../interfaces";
import * as moment from 'moment';
import {css} from "glamor";
import MarkdownText from "./markdown-text";
import {fetchpost} from "../fetch-utils";

interface Props {
  filename: string;
  sectionId: string;
  answerId: string;
  comment: Comment;
  onSectionChanged: (res: {value: {answersection: AnswerSection}}) => void;
}

interface State {
  editing: boolean;
  text: string;
  savedText: string;
}

const styles = {
  wrapper: css({
    marginBottom: "10px"
  }),
  header: css({
    marginBottom: "5px"
  }),
  threebuttons: css({
    textAlign: "center",
    display: "flex",
    justifyContent: "space-between",
    "& div": {
      width: "200px"
    }
  }),
  leftButton: css({
    textAlign: "left"
  }),
  rightButton: css({
    textAlign: "right"
  }),
  textareaInput: css({
    width: "100%",
    resize: "vertical",
    marginTop: "10px",
    marginBottom: "5px",
    padding: "5px",
    boxSizing: "border-box"
  })
};

export default class CommentComponent extends React.Component<Props, State> {

  state: State = {
    editing: false,
    savedText: this.props.comment.text,
    text: this.props.comment.text
  };

  removeComment = async () => {
    const confirmation = confirm("Remove comment?");
    if (confirmation) {
      fetchpost(`/api/exam/${this.props.filename}/removecomment/${this.props.sectionId}/${this.props.answerId}`, {commentoid: this.props.comment.oid})
        .then((res) => res.json())
        .then((res) => {
          this.props.onSectionChanged(res);
        });
    }
  };

  startEdit = async () => {
    this.setState({editing: true});
  };

  cancelEdit = async () => {
    this.setState(prevState => ({
      editing: false,
      text: prevState.savedText
    }));
  };

  saveComment = async () => {
    fetchpost(`/api/exam/${this.props.filename}/setcomment/${this.props.sectionId}/${this.props.answerId}`, {commentoid: this.props.comment.oid, text: this.state.text})
      .then((res) => res.json())
      .then((res) => {
        this.setState(prevState => ({
          editing: false,
          savedText: prevState.text
        }));
        this.props.onSectionChanged(res);
      });
  };

  commentTextareaChange = (event: React.FormEvent<HTMLTextAreaElement>) => {
    this.setState({text: event.currentTarget.value});
  };

  render() {
    const {comment} = this.props;
    return (
      <div {...styles.wrapper}>
        <div {...styles.header}>
          <b>{comment.authorDisplayName}</b> @ {moment(comment.time, "YYYY-MM-DDTHH:mm:ss.SSSSSSZZ").format("DD.MM.YYYY HH:mm")}
        </div>
        <div><MarkdownText value={this.state.text}/></div>
        {this.state.editing && <div>
          <div>
            <textarea {...styles.textareaInput} onChange={this.commentTextareaChange} cols={80} rows={5} value={this.state.text} />
          </div>
          <div {...styles.threebuttons}>
            <div {...styles.leftButton}/>
            <div><button onClick={this.saveComment}>Save Comment</button></div>
            <div {...styles.rightButton}><button onClick={this.cancelEdit}>Cancel</button></div>
          </div>
        </div>}
        {comment.canEdit && !this.state.editing && <div {...styles.threebuttons}>
          <div {...styles.leftButton}/>
          <div><button onClick={this.startEdit}>Edit Comment</button></div>
          <div {...styles.rightButton}><button onClick={this.removeComment}>Delete Comment</button></div>
        </div>}
      </div>
    );
  }
};