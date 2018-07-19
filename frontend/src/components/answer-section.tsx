import * as React from "react";
import { AnswerSection } from "../interfaces";
import { loadAnswerSection } from "../exam-loader";
import { css } from "glamor";
import Answer from "./answer";

interface Props {
  filename: string;
  oid: string;
  width: number;
}

interface State {
  section?: AnswerSection
}

const styles = {
  wrapper: css({
    border: "1px solid green",
  }),
};

export default class AnswerSectionComponent extends React.Component<Props, State> {

  async componentWillMount() {
    loadAnswerSection(this.props.filename, this.props.oid)
      .then((res) => this.setState({section: res}));
  }

  render() {
    const { section } = this.state;
    if (!section) {
      return <div>Loading...</div>
    }
    return (
      <div {...styles.wrapper}>
        <div>
          <b>Answer section</b>
        </div>
        <div>Removed: {section.removed.toString()}</div>
        <button>Remove</button>
        <div>Marked by {section.asker}</div>
        <div>{section.answers.map(e => <Answer key={e.oid} answer={e} />)}</div>
        <button>Add Answer</button>
      </div>
    );
  }
}
