import {
  Button,
  Badge,
  MantineProvider,
  Box,
  Affix,
  rem,
  MantineThemeOverride,
  Indicator,
  Tuple,
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import { Route, Switch, useLocation } from "react-router-dom";
import tinycolor from "tinycolor2";
import { fetchGet, getCookie } from "./api/fetch-utils";
import { notLoggedIn, SetUserContext, User, UserContext } from "./auth";
import UserRoute from "./auth/UserRoute";
import { DebugContext, defaultDebugOptions } from "./components/Debug";
import DebugModal from "./components/Debug/DebugModal";
import HashLocationHandler from "./components/hash-location-handler";
import useToggle from "./hooks/useToggle";
import CategoryPage from "./pages/category-page";
import DisclaimerPage from "./pages/disclaimer-page";
import DocumentPage from "./pages/document-page";
import ExamPage from "./pages/exam-page";
import FAQ from "./pages/faq-page";
import FeedbackPage from "./pages/feedback-page";
import HomePage from "./pages/home-page";
import LoginPage from "./pages/login-page";
import ModQueue from "./pages/modqueue-page";
import NotFoundPage from "./pages/not-found-page";
import PrivacyPolicyPage from "./pages/privacypolicy-page";
import Scoreboard from "./pages/scoreboard-page";
import SearchPage from "./pages/search-page";
import UploadPdfPage from "./pages/uploadpdf-page";
import UserPage from "./pages/userinfo-page";
import { useRequest } from "@umijs/hooks";
import TopHeader from "./components/Navbar/TopHeader";
import BottomHeader from "./components/Navbar/BottomHeader";
import MobileHeader from "./components/Navbar/MobileHeader";
import Footer from "./components/footer";
import {
  defaultConfigOptions,
  ConfigOptions,
} from "./components/Navbar/constants";

function calculateShades(primaryColor: string) {
  var baseHSLcolor = tinycolor(primaryColor).toHsl();
  var darkerRatio = (0.95 - baseHSLcolor.l) / 7.0;
  var shadesArray = new Array(10);
  for (var i = 0; i < 7; i++) {
    shadesArray[i] = tinycolor({
      h: baseHSLcolor.h,
      s: baseHSLcolor.s,
      l: 0.95 - i * darkerRatio,
    }).toString("hex6");
  }
  shadesArray[7] = primaryColor;
  shadesArray[8] = tinycolor({
    h: baseHSLcolor.h,
    s: baseHSLcolor.s,
    l: 0.05 + (baseHSLcolor.l - 0.05) / 2.0,
  }).toString("hex6");
  shadesArray[9] = tinycolor({
    h: baseHSLcolor.h,
    s: baseHSLcolor.s,
    l: 0.05,
  }).toString("hex6");
  return shadesArray;
}

const App: React.FC<{}> = () => {
  useEffect(() => {
    // We need to manually get the csrf cookie when the frontend is served using
    // `yarn start` as only certain pages will set the csrf cookie.
    // Technically the application won't work until the promise resolves, but we just
    // hope that the user doesn't do anything in that time.
    if (getCookie("csrftoken") === null) {
      fetchGet("/api/can_i_haz_csrf_cookie/");
    }
  }, []);
  const [user, setUser] = useState<User | undefined>(undefined);
  useEffect(() => {
    let cancelled = false;
    if (user === undefined) {
      fetchGet("/api/auth/me/").then(
        res => {
          if (cancelled) return;
          setUser({
            loggedin: res.loggedin,
            username: res.username,
            displayname: res.displayname,
            isAdmin: res.adminrights,
            isCategoryAdmin: res.adminrightscat,
          });
        },
        () => {
          setUser(notLoggedIn);
        },
      );
    }
    return () => {
      cancelled = true;
    };
  }, [user]);
  const [debugPanel, toggleDebugPanel] = useToggle(false);
  const [debugOptions, setDebugOptions] = useState(defaultDebugOptions);

  const loadUnreadCount = async () => {
    return (await fetchGet("/api/notification/unreadcount/")).value as number;
  };
  const { data: unreadCount } = useRequest(loadUnreadCount, {
    pollingInterval: 300_000,
  });

  // Retrieve the config options (such as the logo, global menu items, etc) from
  // the global configOptions variable if set (in index.html). The defaults are
  // for VSETH and are not to be used for Edinburgh CompSoc.
  const configOptions = (window as any).configOptions as ConfigOptions;

  // CompSoc theme
  var compsocTheme: MantineThemeOverride = {
    colors: {
      compsocMain: calculateShades("#b89c7c") as Tuple<string, 10>,
      compsocGray: new Array(10).fill("rgb(144, 146, 150)") as Tuple<
        string,
        10
      >,
    },
    primaryColor: "compsocMain",
    primaryShade: 7,
    fontFamily:
      '"Source Sans Pro",Lato,Arial,Helvetica,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol',
    lineHeight: 1.5,
  };

  compsocTheme.colorScheme = "light";
  compsocTheme.components = {
    Anchor: {
      defaultProps: {
        color: "dark",
      },
    },
    Progress: {
      defaultProps: {
        color: "dark",
      },
    },
    Alert: {
      defaultProps: {
        color: "gray",
      },
    },
    Badge: {
      defaultProps: {
        color: "gray",
      },
    },
    Button: {
      variants: {
        brand: theme => ({
          root: {
            backgroundColor: theme.colors[theme.primaryColor][7],
            color: theme.colors.gray[8],
            ...theme.fn.hover({
              backgroundColor: theme.fn.darken(
                theme.colors[theme.primaryColor][7],
                0.1,
              ),
            }),
          },
        }),
      },
      defaultProps: {
        color: "dark",
      },
    },
  };

  const adminItems = [
    { title: "Upload Exam", href: "/uploadpdf" },
    { title: "Mod Queue", href: "/modqueue" },
  ];

  const bottomHeaderNav = [
    { title: "Home", href: "/" },
    { title: "Search", href: "/search" },
    {
      title: "More",
      childItems: [
        { title: "FAQ", href: "/faq" },
        { title: "Feedback", href: "/feedback" },
        ...(typeof user === "object" && user.isCategoryAdmin ? adminItems : []),
      ],
    },
    {
      title: (
        <Indicator
          disabled={unreadCount === undefined || unreadCount === 0}
          label={unreadCount}
        >
          Account
        </Indicator>
      ),
      href: `/user/${user?.username}`,
    },
  ];

  return (
    <MantineProvider theme={compsocTheme} withGlobalStyles withNormalizeCSS>
      <Route component={HashLocationHandler} />
      <DebugContext.Provider value={debugOptions}>
        <UserContext.Provider value={user}>
          <SetUserContext.Provider value={setUser}>
            <div>
              <div>
                <TopHeader
                  logo={configOptions.org_logo ?? defaultConfigOptions.org_logo}
                  size="xl"
                  organizationNav={
                    configOptions.externalNav ??
                    defaultConfigOptions.externalNav
                  }
                  selectedLanguage={"en"}
                  onLanguageSelect={() => {}}
                />
                <BottomHeader
                  lang={"en"}
                  appNav={bottomHeaderNav}
                  title={"File Collection"}
                  size="xl"
                  activeHref={useLocation().pathname}
                  icon={configOptions.logo}
                />
                <MobileHeader
                  signet={
                    configOptions.org_signet ?? defaultConfigOptions.org_signet
                  }
                  selectedLanguage={"en"}
                  onLanguageSelect={() => {}}
                  appNav={bottomHeaderNav}
                  title={"File Collection"}
                />
                <Box component="main" mt="2em">
                  <Switch>
                    <UserRoute exact path="/" component={HomePage} />
                    <Route exact path="/login" component={LoginPage} />
                    <UserRoute
                      exact
                      path="/uploadpdf"
                      component={UploadPdfPage}
                    />
                    <UserRoute exact path="/faq" component={FAQ} />
                    <Route
                      exact
                      path="/disclaimer"
                      component={DisclaimerPage}
                    />
                    <Route
                      exact
                      path="/privacy"
                      component={PrivacyPolicyPage}
                    />
                    <UserRoute
                      exact
                      path="/feedback"
                      component={FeedbackPage}
                    />
                    <UserRoute
                      exact
                      path="/category/:slug"
                      component={CategoryPage}
                    />
                    <UserRoute
                      exact
                      path="/document/:slug"
                      component={DocumentPage}
                    />
                    <UserRoute
                      exact
                      path="/exams/:filename"
                      component={ExamPage}
                    />
                    <UserRoute
                      exact
                      path="/user/:username"
                      component={UserPage}
                    />
                    <UserRoute exact path="/user/" component={UserPage} />
                    <UserRoute exact path="/search/" component={SearchPage} />
                    <UserRoute
                      exact
                      path="/scoreboard"
                      component={Scoreboard}
                    />
                    <UserRoute exact path="/modqueue" component={ModQueue} />
                    <Route component={NotFoundPage} />
                  </Switch>
                </Box>
              </div>
              <Footer
                logo={
                  configOptions.org_signet ?? defaultConfigOptions.org_signet
                }
                disclaimer={
                  configOptions.disclaimer ?? defaultConfigOptions.disclaimer
                }
                privacy={configOptions.privacy ?? defaultConfigOptions.privacy}
              />
            </div>
          </SetUserContext.Provider>
        </UserContext.Provider>
      </DebugContext.Provider>
      {process.env.NODE_ENV === "development" && (
        <>
          <Affix position={{ top: rem(10), left: rem(10) }}>
            <Button variant="brand" onClick={toggleDebugPanel}>
              DEBUG
            </Button>
          </Affix>
          <DebugModal
            isOpen={debugPanel}
            toggle={toggleDebugPanel}
            debugOptions={debugOptions}
            setDebugOptions={setDebugOptions}
          />
        </>
      )}
    </MantineProvider>
  );
};
export default App;
