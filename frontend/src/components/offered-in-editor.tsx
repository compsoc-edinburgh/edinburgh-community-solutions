import {
  Alert,
  Button,
  Grid,
  Group,
  NativeSelect,
} from "@mantine/core";
import React, { useMemo, useState } from "react";
import { Icon, ICONS } from "vseth-canine-ui";
import { useMetaCategories } from "../api/hooks";

interface OfferedInEditorProps {
  offeredIn: Array<readonly [string, string]>;
  setOfferedIn: (newOfferedIn: Array<readonly [string, string]>) => void;
}
const OfferedInEditor: React.FC<OfferedInEditorProps> = ({
  offeredIn,
  setOfferedIn,
}) => {
  const [newMeta1, setNewMeta1] = useState("");
  const meta1Value = useMemo(
    () => (newMeta1),
    [newMeta1],
  );
  const [newMeta2, setNewMeta2] = useState("");
  const meta2Value = useMemo(
    () => (newMeta2),
    [newMeta2],
  );
  const [error, loading, data] = useMetaCategories();
  const meta1Options: string[] = useMemo(
    () =>
      (data && data.map(d => (d.displayname))) ?? [],
    [data],
  );
  const meta2Options: string[] = useMemo(
    () =>
      data && newMeta1.length > 0
        ? data
          .find(m => m.displayname === newMeta1)
          ?.meta2.map(m => (m.displayname)) ?? []
        : [],
    [data, newMeta1],
  );
  const onAdd = () => {
    setNewMeta1("");
    setNewMeta2("");
    setOfferedIn([...offeredIn, [newMeta1, newMeta2]]);
  };
  const onRemove = (meta1: string, meta2: string) => {
    setOfferedIn(
      offeredIn.filter(
        ([meta1s, meta2s]) => meta1s !== meta1 || meta2s !== meta2,
      ),
    );
  };
  return (
    <>
      {error && <Alert color="danger">{error.toString()}</Alert>}
      <Group>
        {offeredIn.map(([meta1, meta2]) => (
          <p key={`${meta1}-${meta2}`}>
            <Button leftIcon={<Icon icon={ICONS.CLOSE} />} variant="default" onClick={() => onRemove(meta1, meta2)}>
              {meta1} {meta2}
            </Button>
          </p>
        ))}
      </Group>
      <form
        onSubmit={e => {
          e.preventDefault();
          onAdd();
        }}
      >
        <Grid className="mt-2">
          <Grid.Col>
            {data && (
              <NativeSelect
                label="Meta 1"
                data={meta1Options}
                value={meta1Value}
                onChange={(event) => {
                  setNewMeta1(event.currentTarget.value);
                  setNewMeta2("");
                }}
              />
            )}
          </Grid.Col>
          <Grid.Col>
            {data && (
              <NativeSelect
                label="Meta 2"
                data={meta2Options}
                value={meta2Value}
                onChange={(event) => setNewMeta2(event.currentTarget.value)}
              />
            )}
          </Grid.Col>
          <Grid.Col md={2}>
            <Button fullWidth type="submit">
              Add
            </Button>
          </Grid.Col>
        </Grid>
      </form>
    </>
  );
};
export default OfferedInEditor;
