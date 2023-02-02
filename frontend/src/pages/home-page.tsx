import {
  Alert,
  Button,
  Card,
  Container,
  Flex,
  Loader,
  Modal,
  SegmentedControl,
  Stack,
  TextInput,
} from "@mantine/core";
import { useLocalStorageState, useRequest } from "@umijs/hooks";
import React, { useCallback, useMemo, useState } from "react";
import { Icon, ICONS } from "vseth-canine-ui";
import { fetchGet, fetchPost } from "../api/fetch-utils";
import { loadMetaCategories } from "../api/hooks";
import { User, useUser } from "../auth";
import CategoryCard from "../components/category-card";
import Grid from "../components/grid";
import LoadingOverlay from "../components/loading-overlay";
import ContentContainer from "../components/secondary-container";
import TooltipButton from "../components/TooltipButton";
import useSearch from "../hooks/useSearch";
import useTitle from "../hooks/useTitle";
import { CategoryMetaData, MetaCategory } from "../interfaces";

const displayNameGetter = (data: CategoryMetaData) => data.displayname;

const loadCategories = async () => {
  return (await fetchGet("/api/category/listwithmeta/"))
    .value as CategoryMetaData[];
};
const loadCategoryData = async () => {
  const [categories, metaCategories] = await Promise.all([
    loadCategories(),
    loadMetaCategories(),
  ]);
  return [
    categories.sort((a, b) => a.displayname.localeCompare(b.displayname)),
    metaCategories,
  ] as const;
};
const addCategory = async (category: string) => {
  await fetchPost("/api/category/add/", { category });
};

const mapToCategories = (
  categories: CategoryMetaData[],
  meta1: MetaCategory[],
) => {
  const categoryMap = new Map<string, CategoryMetaData>();
  const assignedCategories = new WeakSet<CategoryMetaData>();
  for (const category of categories) categoryMap.set(category.slug, category);
  const meta1Map: Map<string, Array<[string, CategoryMetaData[]]>> = new Map();
  for (const { displayname: meta1display, meta2 } of meta1) {
    const meta2Map: Map<string, CategoryMetaData[]> = new Map();
    for (const {
      displayname: meta2display,
      categories: categoryNames,
    } of meta2) {
      const categories = categoryNames
        .map(name => categoryMap.get(name)!)
        .filter(a => a !== undefined);
      for (const category of categories) assignedCategories.add(category);
      if (categories.length === 0) continue;
      meta2Map.set(meta2display, categories);
    }
    if (meta2Map.size === 0) continue;
    meta1Map.set(
      meta1display,
      [...meta2Map.entries()].sort(([a], [b]) => a.localeCompare(b)),
    );
  }
  const metaList = [...meta1Map.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  );
  const unassignedList = categories.filter(c => !assignedCategories.has(c));
  return [metaList, unassignedList] as const;
};

const AddCategory: React.FC<{ onAddCategory: () => void }> = ({
  onAddCategory,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { loading, run } = useRequest(addCategory, {
    manual: true,
    onSuccess: () => {
      setCategoryName("");
      setIsOpen(false);
      onAddCategory();
    },
  });
  const [categoryName, setCategoryName] = useState("");
  const onSubmit = () => {
    run(categoryName);
  };

  return (
    <>
      <Modal opened={isOpen} onClose={() => setIsOpen(false)} title="Add Category">
        <Stack>
          <TextInput
            label="Category Name"
            type="text"
            value={categoryName}
            onChange={e => setCategoryName(e.currentTarget.value)}
          />
          <Button
            onClick={onSubmit}
            disabled={categoryName.length === 0 || loading}
          >
            {loading ? <Loader /> : "Add Category"}
          </Button>
        </Stack>
      </Modal>
      <Card style={{ minHeight: "10em" }}>
        <TooltipButton
          tooltip="Add a new category"
          onClick={() => setIsOpen(true)}
          className="position-cover w-100 h-100"
        >
          <Icon icon={ICONS.PLUS} size={40} className="m-auto" />
        </TooltipButton>
      </Card>
    </>
  );
};

const HomePage: React.FC<{}> = () => {
  useTitle("Home");
  return (
    <>
      <Container size="xl">
        <h1 className="mb-3">Community Solutions</h1>
      </Container>
      <CategoryList />
    </>
  );
};
export const CategoryList: React.FC<{}> = () => {
  const { isAdmin } = useUser() as User;
  const [mode, setMode] = useLocalStorageState("mode", "alphabetical");
  const [filter, setFilter] = useState("");
  const { data, error, loading, run } = useRequest(loadCategoryData, {
    cacheKey: "category-data",
  });
  const [categoriesWithDefault, metaCategories] = data ? data : [];

  const categories = useMemo(
    () =>
      categoriesWithDefault
        ? categoriesWithDefault.filter(
          ({ slug }) => slug !== "default" || isAdmin,
        )
        : undefined,
    [categoriesWithDefault, isAdmin],
  );
  const searchResult = useSearch(
    categories ?? [],
    filter,
    Math.min(filter.length * 2, 12),
    displayNameGetter,
  );
  const [metaList, unassignedList] = useMemo(
    () =>
      metaCategories && categories
        ? mapToCategories(categories, metaCategories)
        : [undefined, undefined],
    [categories, metaCategories],
  );

  const onAddCategory = useCallback(() => {
    run();
  }, [run]);

  return (
    <>
      <Container size="xl">
        <Flex direction="row" justify="space-between" className="px-2">
          <SegmentedControl
            value={mode}
            onChange={setMode}
            data={[
              { label: 'Alphabetical', value: 'alphabetical' },
              { label: 'By Semester', value: 'bySemester' },
            ]}
          />
          <TextInput
            placeholder="Filter..."
            value={filter}
            autoFocus
            onChange={e => setFilter(e.currentTarget.value)}
            icon={<Icon icon={ICONS.SEARCH} size={14} />}
          />
        </Flex>
      </Container>
      <ContentContainer className="position-relative my-3">
        <LoadingOverlay loading={loading} />
        <Container size="xl">
          {error ? (
            <Alert color="danger">{error.toString()}</Alert>
          ) : mode === "alphabetical" || filter.length > 0 ? (
            <>
              <Grid>
                {searchResult.map(category => (
                  <CategoryCard category={category} key={category.slug} />
                ))}
                {isAdmin && <AddCategory onAddCategory={onAddCategory} />}
              </Grid>
            </>
          ) : (
            <>
              {metaList &&
                metaList.map(([meta1display, meta2]) => (
                  <div key={meta1display}>
                    <h4 className="my-4">{meta1display}</h4>
                    {meta2.map(([meta2display, categories]) => (
                      <div key={meta2display}>
                        <h5 className="my-3">{meta2display}</h5>
                        <Grid>
                          {categories.map(category => (
                            <CategoryCard
                              category={category}
                              key={category.slug}
                            />
                          ))}
                        </Grid>
                      </div>
                    ))}
                  </div>
                ))}
              {unassignedList && (
                <>
                  <h4 className="my-4">Unassigned Categories</h4>
                  <Grid>
                    {unassignedList.map(category => (
                      <CategoryCard category={category} key={category.slug} />
                    ))}
                  </Grid>
                </>
              )}
              {isAdmin && (
                <>
                  <h4 className="my-4">New Category</h4>
                  <Grid>
                    <AddCategory onAddCategory={onAddCategory} />
                  </Grid>
                </>
              )}
            </>
          )}
        </Container>
      </ContentContainer>
    </>
  );
};
export default HomePage;
