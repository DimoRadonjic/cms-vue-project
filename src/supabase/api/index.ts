const TableName = {
  posts: "Posts",
  profiles: "Profiles",
  gallery: "Gallery",
  documents: "Documents",
} as const;

type TableType = keyof typeof TableName;

export { TableName };
export type { TableType };
