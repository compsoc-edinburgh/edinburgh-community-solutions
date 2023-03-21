import { useRequest } from "@umijs/hooks";
import { Button, Card, Group, Title, Text } from "@mantine/core";
import moment from "moment";
import * as React from "react";
import { fetchPost } from "../api/fetch-utils";
import GlobalConsts from "../globalconsts";
import { FeedbackEntry } from "../interfaces";

const setFlag = async (oid: string, flag: "done" | "read", value: boolean) => {
  await fetchPost(`/api/feedback/flags/${oid}/`, {
    [flag]: value,
  });
};
const wrapText = (text: string) => {
  const textSplit = text.split("\n");
  return textSplit.map(t => <Text pt="xs" key={t}>{t}</Text>);
};

interface Props {
  entry: FeedbackEntry;
  entryChanged: () => void;
}
const FeedbackEntryComponent: React.FC<Props> = ({ entry, entryChanged }) => {
  const { run: runSetFlag } = useRequest(
    (flag: "done" | "read", value: boolean) => setFlag(entry.oid, flag, value),
    { manual: true, onSuccess: entryChanged },
  );
  return (
    <Card my="xs" withBorder>
      <Card.Section bg="gray.2" withBorder inheritPadding>
        <Group py="md" position="apart">
          <Title order={5}>
            {entry.authorDisplayName} •{" "}
            {moment(entry.time, GlobalConsts.momentParseString).format(
              GlobalConsts.momentFormatString,
            )}
          </Title>
          <Button.Group>
            <Button
              color={entry.done ? "secondary" : "primary"}
              onClick={() => runSetFlag("done", !entry.done)}
            >
              {entry.done ? "Set Undone" : "Set Done"}
            </Button>
            <Button
              color={entry.read ? "secondary" : "primary"}
              onClick={() => runSetFlag("read", !entry.read)}
            >
              {entry.read ? "Set Unread" : "Set Read"}
            </Button>
          </Button.Group>
        </Group>
      </Card.Section>
      {wrapText(entry.text)}
    </Card >
  );
};
export default FeedbackEntryComponent;
