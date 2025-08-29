const TableName = {
  posts: "Posts",
  profiles: "Profiles",
  gallery: "Gallery",
  documents: "Documents",
} as const;

const BucketsName = {
  gallery: "gallery",
  documents: "Pdfs",
} as const;

type TableType = keyof typeof TableName;
type BucketsType = keyof typeof BucketsName;

export { TableName, BucketsName };
export type { TableType, BucketsType };
