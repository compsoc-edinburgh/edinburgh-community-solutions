import * as React from "react";
import Exam from "./pages/exam";
import UploadPDF from "./pages/uploadpdf";
import Category from "./pages/category";
import Home from "./pages/home";
import { Route, Switch } from "react-router";
import Header from "./components/header";
import { css } from "glamor";
import Feedback from "./pages/feedback";
import Colors from "./colors";
import { fetchapi, getCookie } from "./fetch-utils";
import Scoreboard from "./pages/scoreboard";
import UserInfoComponent from "./pages/userinfo";
import ModQueue from "./pages/modqueue";
import SubmitTranscript from "./pages/submittranscript";
import colors from "./colors";
import globalcss from "./globalcss";
import LoginForm from "./components/loginform";
import HashLocationHandler from "./components/hash-location-handler";
import TutorialPage from "./pages/tutorial";
import FAQ from "./pages/faq";

css.global("body", {
  fontFamily:
    '"Avenir Next","Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
  background: colors.pageBackground,
});
css.global("h1", {
  fontFamily:
    'Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
  marginBlockStart: "0.4em",
  marginBlockEnd: "0.4em",
});
css.global("h2", {
  fontFamily:
    'Roboto,"Helvetica Neue",Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"',
  marginBlockStart: "0.3em",
  marginBlockEnd: "0.3em",
});
css.global("a", {
  textDecoration: "none",
});
css.global("a:link", {
  color: Colors.link,
});
css.global("a:visited", {
  color: Colors.linkVisited,
});
css.global("a:hover", {
  color: Colors.linkHover,
});
css.global("button", globalcss.button);
css.global("input", {
  margin: "5px",
  padding: "7px",
  border: "1px solid " + Colors.inputBorder,
  borderRadius: "2px",
  boxSizing: "border-box",
});
css.global("button[disabled]", {
  background: Colors.buttonBackgroundDisabled,
});
css.global("button:hover", {
  background: Colors.buttonBackgroundHover,
});
css.global("button[disabled]:hover", {
  cursor: "not-allowed",
});
css.global(".primary", {
  background: Colors.buttonPrimary,
});
css.global(".primary:hover", {
  background: Colors.buttonPrimaryHover,
});
css.global("table", {
  borderCollapse: "collapse",
  boxShadow: Colors.tableShadow,
  textAlign: "left",
});
css.global("table td, table th", {
  border: "none",
  padding: "8px",
});
css.global("table th", {
  background: Colors.tableHeader,
});
css.global("thead tr", {
  borderBottom: "1px solid " + Colors.tableHeaderBorder,
});
css.global("table tr:nth-child(even)", {
  background: Colors.tableEven,
});
css.global("table tr:nth-child(odd)", {
  background: Colors.tableOdd,
});

const styles = {
  inner: css({
    padding: "15px",
  }),
};

interface State {
  loadedSessionData: boolean;
  loggedin: boolean;
  username: string;
  displayname: string;
  isAdmin: boolean;
  isCategoryAdmin: boolean;
}

export default class App extends React.Component<{}, State> {
  state: State = {
    loadedSessionData: false,
    loggedin: false,
    username: "",
    displayname: "",
    isAdmin: false,
    isCategoryAdmin: false,
  };

  componentDidMount() {
    this.loadCsrfCookie();
    this.loadMe();
  }

  loadMe = () => {
    fetchapi("/api/auth/me/")
      .then(res =>
        this.setState({
          loadedSessionData: true,
          loggedin: res.loggedin,
          username: res.username,
          displayname: res.displayname,
          isAdmin: res.adminrights,
          isCategoryAdmin: res.adminrightscat,
        }),
      )
      .catch(() =>
        this.setState({
          loadedSessionData: true,
        }),
      );
  };

  loadCsrfCookie = () => {
    if (getCookie("csrftoken") == null) {
      fetchapi("/api/can_i_haz_csrf_cookie/").then(r => {});
    }
  };

  render() {
    return (
      <div>
        <Route component={HashLocationHandler} />
        <Header
          username={this.state.username}
          displayName={this.state.displayname || "loading..."}
        />
        <div {...styles.inner}>
          {!this.state.loadedSessionData && "loading..."}
          {this.state.loadedSessionData && !this.state.loggedin && (
            <LoginForm userinfoChanged={this.loadMe} />
          )}
          {this.state.loggedin && (
            <Switch>
              <Route
                path="/exams/:filename"
                render={props => (
                  <Exam
                    {...props}
                    isAdmin={this.state.isAdmin}
                    filename={props.match.params.filename}
                  />
                )}
              />
              <Route
                path="/user/:username"
                render={props => (
                  <UserInfoComponent
                    {...props}
                    isMyself={
                      this.state.username === props.match.params.username
                    }
                    isAdmin={this.state.isAdmin}
                    username={props.match.params.username}
                    userinfoChanged={this.loadMe}
                  />
                )}
              />
              <Route
                path="/category/:category"
                render={props => (
                  <Category
                    categorySlug={props.match.params.category}
                    username={this.state.username}
                    isAdmin={this.state.isAdmin}
                  />
                )}
              />
              <Route path="/uploadpdf" component={UploadPDF} />
              <Route path="/submittranscript" component={SubmitTranscript} />
              <Route
                path="/scoreboard"
                render={props => <Scoreboard username={this.state.username} />}
              />
              <Route
                path="/modqueue"
                render={props => (
                  <ModQueue
                    isAdmin={this.state.isAdmin}
                    username={this.state.username}
                  />
                )}
              />
              <Route
                path="/feedback"
                render={props => (
                  <Feedback {...props} isAdmin={this.state.isAdmin} />
                )}
              />
              <Route
                path="/faq"
                render={props => (
                  <FAQ {...props} isAdmin={this.state.isAdmin} />
                )}
              />
              <Route path="/tutorial" render={_props => <TutorialPage />} />
              <Route
                render={props => (
                  <Home
                    {...props}
                    isAdmin={this.state.isAdmin}
                    isCategoryAdmin={this.state.isCategoryAdmin}
                  />
                )}
              />
            </Switch>
          )}
        </div>
      </div>
    );
  }
}
