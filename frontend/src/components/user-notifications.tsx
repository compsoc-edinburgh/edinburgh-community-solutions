import { Alert, Button, Spinner } from "@vseth/components";
import React, { useState } from "react";
import { useNotifications } from "../api/hooks";
import NotificationComponent from "./notification";

interface UserNotificationsProps {
  username: string;
}
const UserNotifications: React.FC<UserNotificationsProps> = ({ username }) => {
  const [showRead, setShowRead] = useState(false);
  const [notificationsError, notificationsLoading, notifications] =
    useNotifications(showRead ? "all" : "unread");
  const error = notificationsError;
  return (
    <>
      <h3>Notifications</h3>
      {error && <Alert color="danger">{error.toString()}</Alert>}
      <div className="my-3">
        <Button onClick={() => setShowRead(prev => !prev)}>
          {showRead ? "Show unread" : "Show all"}
        </Button>
      </div>
      {(!notifications || notifications.length === 0) && (
        <Alert color="secondary">No notifications</Alert>
      )}
      {notificationsLoading && <Spinner />}
      {notifications &&
        notifications.map(notification => (
          <NotificationComponent
            notification={notification}
            key={notification.oid}
          />
        ))}
    </>
  );
};
export default UserNotifications;
