export type Section = AnswerSection | PdfSection;

export enum SectionKind {
  Answer,
  Pdf,
}

export interface AnswerSection {
  oid: string; // unique id within answer sections
  kind: SectionKind.Answer;
  answers: Answer[];
  asker: string; // username of person who created section
  askerDisplayName: string; // display name of asker
  allow_new_answer: boolean; // whether the current user can add an answer
  allow_new_legacy_answer: boolean; // whether a legacy answer can be posted
}

export interface Answer {
  oid: string; // unique id within answers
  upvotes: string[]; // usernames of people who upvoted
  authorId: string; // username
  authorDisplayName: string; // display name of author
  canEdit: boolean; // whether the current user can edit the answer
  isUpvoted: boolean; // whether the current user upvoted the answer
  comments: Comment[];
  text: string;
  time: string; // ISO 8601, creation time
}

export interface Comment {
  oid: string; // unique id within comments
  text: string;
  authorId: string; // username
  authorDisplayName: string; // display name of author
  canEdit: boolean; // whether the current user can edit the comment
  time: string; // ISO 8601, creation time
}

export interface PdfSection {
  key: React.Key;
  kind: SectionKind.Pdf;
  start: CutPosition;
  end: CutPosition;
}

export interface CutPosition {
  page: number; // the first page is 1
  position: number;
}

export interface ServerCutPosition {
  relHeight: number;
  oid: string;
}

export interface Exam {
  displayname: string; // Name of exam which should be displayed
  filename: string; // unique filename
}

export interface Category {
  name: string; // Name of category
  exams: Exam[]; // Exams belonging to category
  childCategories?: Category[]; // Categories which are children of this category in category tree
}

export interface ExamMetaData {
  canEdit: boolean;
  filename: string;
  displayname: string;
  category: string;
  legacy_solution: string;
}

export interface FeedbackEntry {
  oid: string;
  text: string;
  authorId: string;
  authorDisplayName: string;
  time: string;
  read: boolean;
  done: boolean;
}