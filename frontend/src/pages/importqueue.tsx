import * as React from "react";
import {CategoryExam, CategoryPaymentExam} from "../interfaces";
import {css} from "glamor";
import {fetchapi, fetchpost} from "../fetch-utils";
import {Link} from "react-router-dom";
import colors from "../colors";
import GlobalConsts from "../globalconsts";
import * as moment from 'moment';

const styles = {
  wrapper: css({
    maxWidth: "900px",
    margin: "auto",
  }),
  unviewableExam: css({
    color: colors.inactiveElement,
  }),
  queueTable: css({
    width: "100%",
    marginBottom: "15px",
  }),
};

interface Props {
  username: string;
  isAdmin: boolean;
}

interface State {
  exams: CategoryExam[];
  paymentExams: CategoryPaymentExam[];
  includeHidden: boolean;
  error?: string;
}

export default class ImportQueue extends React.Component<Props, State> {

  state: State = {
    exams: [],
    paymentExams: [],
    includeHidden: false,
  };

  componentDidMount() {
    this.loadExams();
    this.loadPaymentExams();
    document.title = "Import Queue - VIS Community Solutions";
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>): void {
    if (prevState.includeHidden !== this.state.includeHidden) {
      this.loadExams();
    }
    if (this.props.isAdmin && !prevProps.isAdmin) {
      this.loadPaymentExams();
    }
  }

  loadExams = () => {
    fetchapi('/api/listimportexams' + (this.state.includeHidden ? '?includehidden=1' : ''))
      .then(res => {
        this.setState({
          exams: res.value
        });
      })
      .catch(()=>undefined);
  };

  loadPaymentExams = () => {
    if (!this.props.isAdmin) {
      return;
    }
    fetchapi('/api/listpaymentcheckexams')
      .then(res => {
        this.setState({
          paymentExams: res.value
        });
      })
      .catch(()=>undefined);
  };

  setIncludeHidden = (hidden: boolean) => {
    this.setState({
      includeHidden: hidden
    });
  };

  hasValidClaim = (exam: CategoryExam) => {
    if (exam.import_claim !== "") {
      if (moment().diff(moment(exam.import_claim_time, GlobalConsts.momentParseString)) < 4 * 60 * 60 * 1000) {
        return true;
      }
    }
    return false;
  };

  claimExam = (exam: CategoryExam, claim: boolean) => {
    fetchpost(`/api/exam/${exam.filename}/claim`, {
      claim: claim ? 1 : 0
    })
      .then(() => {
        this.loadExams();
        if (claim) {
          window.open("/exams/" + exam.filename);
        }
      })
      .catch(err => {
        this.setState({
          error: err
        });
        this.loadExams();
      });
  };

  render() {
    if (!this.state.exams) {
      return <div>Loading...</div>;
    }
    return (<div {...styles.wrapper}>
      {this.state.paymentExams.length > 0 && <div>
        <h1>Transcripts</h1>
        <table>
          <thead>
          <tr>
            <th>Category</th>
            <th>Name</th>
            <th>Uploader</th>
          </tr>
          </thead>
          <tbody>
          {this.state.paymentExams.map(exam => (
            <tr key={exam.filename}>
              <td>
                {exam.category}
              </td>
              <td>
                <Link to={'/exams/' + exam.filename} target="_blank">{exam.displayname}</Link>
              </td>
              <td>
                <Link to={'/user/' + exam.payment_uploader}>{exam.payment_uploader_displayname}</Link>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>}
      <h1>Import Queue</h1>
      {this.state.error && <div>{this.state.error}</div>}
      <table {...styles.queueTable}>
        <thead>
          <tr>
            <th>Category</th>
            <th>Name</th>
            <th>Remark</th>
            <th>Public</th>
            <th>Import State</th>
            <th>Claim</th>
          </tr>
        </thead>
        <tbody>
          {this.state.exams.map(exam => (
            <tr key={exam.filename}>
              <td>
                {exam.category}
              </td>
              <td>
                <Link to={'/exams/' + exam.filename} target="_blank">{exam.displayname}</Link>
              </td>
              <td>
                {exam.remark}
              </td>
              <td>{exam.public ? "Public": "Hidden"}</td>
              <td>
                {exam.finished_cuts ? (exam.finished_wiki_transfer ? "All done" : "Needs Wiki Import") : "Needs Cuts"}
              </td>
              <td>
                {(!exam.finished_cuts || !exam.finished_wiki_transfer) ? (
                  this.hasValidClaim(exam) ? (
                      exam.import_claim === this.props.username ?
                        <button onClick={() => this.claimExam(exam, false)}>Release Claim</button> :
                        <span>Claimed by {exam.import_claim_displayname}</span>
                    ) :
                    <button onClick={() => this.claimExam(exam, true)}>Claim Exam</button>
                ) : <span>-</span>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <button onClick={() => this.setIncludeHidden(!this.state.includeHidden)}>{this.state.includeHidden ? 'Hide' : 'Show'} Complete Hidden Exams</button>
      </div>
    </div>);
  }
}