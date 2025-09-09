interface Link {
  label: string;
  routeName: string;
}

export const navLinks: Link[] = [
  {
    label: "Posts",
    routeName: "posts",
  },
  {
    label: "Gallery",
    routeName: "gallery",
  },
  {
    label: "Documents",
    routeName: "documents",
  },
];
