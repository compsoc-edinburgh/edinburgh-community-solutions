import {CategoryExam, CategoryMetaData, MetaCategory, MetaCategoryWithCategories} from "./interfaces";

export function filterMatches(filter: string, name: string): boolean {
  let nameLower = name.replace(/\s/g, '').toLowerCase();
  let filterLower = filter.replace(/\s/g, '').toLowerCase();
  if (filter.length === 0) {
    return true;
  }
  let fpos = 0;
  for(let npos = 0; npos < nameLower.length; npos++) {
    if (filterLower[fpos] === nameLower[npos]) {
      fpos++;
      if (fpos === filterLower.length) {
        return true;
      }
    }
  }
  return false;
}

export function filterCategories(categories: CategoryMetaData[], filter: string): CategoryMetaData[] {
  return categories.filter(cat => filterMatches(filter, cat.category));
}

export function filterExams(exams: CategoryExam[], filter: string): CategoryExam[] {
  return exams.filter(ex => filterMatches(filter, ex.displayname));
}

export function fillMetaCategories(categories: CategoryMetaData[], metaCategories: MetaCategory[]): MetaCategoryWithCategories[] {
  let categoryToMeta = {};
  categories.forEach(cat => {
    categoryToMeta[cat.category] = cat
  });
  return metaCategories.map(meta1 => ({
    ...meta1,
    meta2: meta1.meta2.map(meta2 => ({
      ...meta2,
      categories: meta2.categories
        .filter(cat => categoryToMeta.hasOwnProperty(cat))
        .map(cat => categoryToMeta[cat]),
    }))
      .filter(meta2 => meta2.categories.length > 0),
  }))
    .filter(meta1 => meta1.meta2.length > 0);
}

export function getMetaCategoriesForCategory(metaCategories: MetaCategory[], category: string): MetaCategory[] {
  return metaCategories.map(meta1 => ({
    ...meta1,
    meta2: meta1.meta2.filter(meta2 => meta2.categories.indexOf(category) !== -1),
  })).filter(meta1 => meta1.meta2.length > 0);
}