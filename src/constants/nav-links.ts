interface Link {
  label: string;
  routeName: string;
}

export const navLinks: Link[] = [
  {
    label: "Dashboard",
    routeName: "dashboard",
  },
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
