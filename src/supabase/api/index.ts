const TableName = {
  posts: "posts",
  profiles: "profiles",
  gallery: "gallery",
  documents: "documents",
} as const;

const JunctionTableName = {
  posts_documents: "posts_documents",
  posts_gallery: "posts_gallery",
} as const;

const BucketsName = {
  gallery: "gallery",
  documents: "Pdfs",
} as const;

type TableType = keyof typeof TableName;
type JunctionTableType = keyof typeof JunctionTableName;
type BucketsType = keyof typeof BucketsName;

export { TableName, BucketsName, JunctionTableName };
export type { TableType, BucketsType, JunctionTableType };
