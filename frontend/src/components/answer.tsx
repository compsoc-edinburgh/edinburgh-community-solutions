import * as React from "react";
import {Answer, AnswerSection} from "../interfaces";
import {dateStr2Str} from "../date-utils";
import Comment from "./comment";
import {css} from "glamor";
import MathText from "./math-text";
import {fetchpost} from '../fetch-utils'

interface Props {
  filename: string;
  sectionId: string;
  answer: Answer;
  onSectionChanged: (res: {value: {answersection: AnswerSection}}) => void;
}

interface State {
  editing: boolean;
  text: string;
  savedText: string;
  commentDraft: string;
}

const styles = {
  wrapper: css({
    background: "#eeeeee",
    paddingTop: "10px",
    paddingLeft: "10px",
    paddingRight: "10px",
    paddingBottom: "20px",
    marginBottom: "20px",
    boxShadow: "0 4px 8px 0 grey"
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
  header: css({
    fontSize: "24px",
    marginBottom: "10px"
  }),
  answer: css({
    margin: "5px"
  }),
  answerInput: css({
    marginLeft: "5px",
    marginRight: "5px"
  }),
  answerTexHint: css({
    marginBottom: "10px",
    marginLeft: "5px",
    marginRight: "5px"
  }),
  comments: css({
    marginLeft: "25px",
    marginTop: "10px",
    marginRight: "25px"
  }),
  addComment: css({
    marginTop: "20px",
    marginLeft: "25px",
    marginRight: "25px"
  }),
  textareaInput: css({
    width: "100%",
    resize: "none",
    marginTop: "10px",
    marginBottom: "5px",
    padding: "5px",
    boxSizing: "border-box"
  })
};

export default class AnswerComponent extends React.Component<Props, State> {

  state: State = {
    editing: this.props.answer.text.length === 0,
    savedText: this.props.answer.text,
    text: this.props.answer.text,
    commentDraft: ""
  };

  removeAnswer = async () => {
    const confirmation = confirm("Remove answer?");
    if (confirmation) {
      fetchpost(`/api/exam/${this.props.filename}/removeanswer/${this.props.sectionId}`, {})
        .then((res) => res.json())
        .then((res) => {
          this.props.onSectionChanged(res);
        });
    }
  };

  saveAnswer = async () => {
    fetchpost(`/api/exam/${this.props.filename}/setanswer/${this.props.sectionId}`, {text: this.state.text})
      .then((res) => res.json())
      .then((res) => {
      this.setState(prevState => ({
        editing: false,
        savedText: prevState.text
      }));
      this.props.onSectionChanged(res);
    });
  };

  cancelEdit = async () => {
    this.setState(prevState => ({
      editing: false,
      text: prevState.savedText
    }));
  };

  startEdit = async () => {
    this.setState({editing: true});
  };

  answerTextareaChange = (event: React.FormEvent<HTMLTextAreaElement>) => {
    this.setState({text: event.currentTarget.value});
  };

  commentTextareaChange = (event: React.FormEvent<HTMLTextAreaElement>) => {
    this.setState({commentDraft: event.currentTarget.value});
  };

  toggleAnswerUpvote = async () => {
    fetchpost(`/api/exam/${this.props.filename}/setlike/${this.props.sectionId}/${this.props.answer.oid}`, {like: this.props.answer.isUpvoted ? 0 : 1})
      .then((res) => res.json())
      .then((res) => {
        this.props.onSectionChanged(res);
      });
  };

  addComment = async () => {
    fetchpost(`/api/exam/${this.props.filename}/addcomment/${this.props.sectionId}/${this.props.answer.oid}`, {text: this.state.commentDraft})
      .then((res) => res.json())
      .then((res) => {
        this.props.onSectionChanged(res);
      });
    this.setState({commentDraft: ""});
  };

  render() {
    const {answer} = this.props;
    return (
      <div {...styles.wrapper}>
        <div {...styles.header}>
          <b>{answer.authorId}</b> @ {dateStr2Str(answer.time)} (+{answer.upvotes})
        </div>
        <div {...styles.answer}><MathText value={this.state.text}/></div>
        {this.state.editing && <div>
          <div {...styles.answerInput}>
            <textarea {...styles.textareaInput} onChange={this.answerTextareaChange} cols={120} rows={20} value={this.state.text}/>
          </div>
          <div {...styles.answerTexHint}>
            You can use latex math notation in your answer. Use \[ ... \] and \( ... \) or alternatively $$ ... $$ and ` ... ` to format the enclosed text as (inline) math. Using ` ... ` you can also use AsciiMath.
          </div>
        </div>}
        <div {...styles.threebuttons}>
          <div {...styles.leftButton}>{!this.state.editing && <button onClick={this.toggleAnswerUpvote}>{answer.isUpvoted && "Remove Upvote" || "Upvote"}</button>}</div>
          <div>{this.state.editing && <button onClick={this.saveAnswer}>Save Answer</button> || (answer.canEdit && <button onClick={this.startEdit}>Edit Answer</button>)}</div>
          <div {...styles.rightButton}>{this.state.editing && <button onClick={this.cancelEdit}>Cancel</button> || (answer.canEdit && <button onClick={this.removeAnswer}>Delete Answer</button>)}</div>
        </div>
        <div {...styles.comments}>{answer.comments.map(e =>
          <Comment key={e.oid} comment={e} filename={this.props.filename} sectionId={this.props.sectionId} answerId={answer.oid} onSectionChanged={this.props.onSectionChanged}/>
        )}</div>
        {this.state.savedText.length > 0 && <div {...styles.addComment}>
          <div><b>Add comment</b></div>
          <div><MathText value={this.state.commentDraft} /></div>
          <div>
            <textarea {...styles.textareaInput} onChange={this.commentTextareaChange} cols={80} rows={5} value={this.state.commentDraft} />
          </div>
          <div>
            <button onClick={this.addComment} disabled={this.state.commentDraft.length === 0}>Submit Comment</button>
          </div>
        </div>}
      </div>
    );
  }
};
