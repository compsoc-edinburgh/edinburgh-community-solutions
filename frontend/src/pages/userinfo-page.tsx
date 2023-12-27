import { css } from "@emotion/css";
import {
  Container,
  Alert,
  Tabs,
  LoadingOverlay,
} from "@mantine/core";
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useUserInfo } from "../api/hooks";
import { useUser } from "../auth";
import UserAnswers from "../components/user-answers";
import UserComments from "../components/user-comments";
import UserNotifications from "../components/user-notifications";
import UserNotificationsSettings from "../components/user-notification-settings";
import UserDocuments from "../components/user-documents";
import UserScoreCard from "../components/user-score-card";
import useTitle from "../hooks/useTitle";

const navStyle = css`
  width: 100%;
  margin-top: 2rem;
  margin-bottom: 2rem;
  justify-content: space-between;
  .nav-item {
    margin: 0;
  }
  .nav-item .nav-link p {
    font-size: x-large;
  }
`;

const UserPage: React.FC<{}> = () => {
  const user = useUser()!;
  const { username = user.username } = useParams() as { username: string };
  useTitle(username);
  const isMyself = user.username === username;
  const [userInfoError, userInfoLoading, userInfo] = useUserInfo(username);
  const error = userInfoError;
  const loading = userInfoLoading;
  const [activeTab, setActiveTab] = useState<string | null>("overview");
  return (
    <>
      <Container size="xl">
        <UserScoreCard
          username={username}
          isMyself={isMyself}
          userInfo={userInfo}
        />
        {error && <Alert color="red">{error.toString()}</Alert>}
        <Tabs
          color="primary"
          value={activeTab}
          onTabChange={setActiveTab}
          className={navStyle}
          pos="relative"
        >
          <LoadingOverlay visible={loading} />
          <Tabs.List grow>
            <Tabs.Tab value="overview">Overview</Tabs.Tab>
            <Tabs.Tab value="answers">Answers</Tabs.Tab>
            <Tabs.Tab value="comments">Comments</Tabs.Tab>
            <Tabs.Tab value="documents">Documents</Tabs.Tab>
            {isMyself && <Tabs.Tab value="settings">Settings</Tabs.Tab>}
          </Tabs.List>
          <Tabs.Panel value="overview" pt="sm">
            {!isMyself && !user.isAdmin && (
              <Alert color="gray">There's nothing here</Alert>
            )}
            {isMyself && <UserNotifications username={username} />}
          </Tabs.Panel>
          <Tabs.Panel value="answers" pt="sm">
            <UserAnswers username={username} />
          </Tabs.Panel>
          <Tabs.Panel value="comments" pt="sm">
            <UserComments username={username} />
          </Tabs.Panel>
          <Tabs.Panel value="documents" pt="sm">
            <UserDocuments username={username} userInfo={userInfo} />
          </Tabs.Panel>
          <Tabs.Panel value="settings" pt="sm">
            {isMyself && <UserNotificationsSettings username={username} />}
          </Tabs.Panel>
        </Tabs>
      </Container>
    </>
  );
};
export default UserPage;
