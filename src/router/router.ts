import {
  createWebHistory,
  createRouter,
  type RouteRecordRaw,
} from "vue-router";
import { LoginForm, RegisterForm, Page404, PageLayout } from "../pages";
import { useAuth } from "../composable";

const protectedRoutes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    redirect: { name: "dashboard" },
    component: PageLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "dashboard",
        name: "dashboard",
        component: () => import("../pages/Dashboard.vue"),
      },

      {
        path: "posts",
        name: "posts",
        component: () => import("../pages/Posts.vue"),
      },

      {
        path: "new-post",
        name: "new-post",
        component: () => import("../pages/NewPost.vue"),
      },

      {
        path: "post/:id",
        name: "post-view",
        component: () => import("../pages/PostDetail.vue"),
      },

      {
        path: "gallery",
        name: "gallery",
        component: () => import("../pages/Gallery.vue"),
      },

      {
        path: "gallery/:id",
        name: "image-view",
        component: () => import("../pages/PostDetail.vue"),
      },

      {
        path: "new-image",
        name: "new-image",
        component: () => import("../pages/NewPost.vue"),
      },

      {
        path: "documents",
        name: "documents",
        component: () => import("../pages/Documents.vue"),
      },

      {
        path: "document/:id",
        name: "document-view",
        component: () => import("../pages/DocumentViewer.vue"),
      },

      {
        path: "profile",
        name: "profile",
        component: () => import("../pages/ProfileDetail.vue"),
      },
    ],
  },
];

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "base",
    redirect: { name: "home" },
    meta: { requiresAuth: false },
    component: PageLayout,
    children: [
      { path: "/", redirect: "login" },

      { path: "/login", name: "login", component: LoginForm },
      {
        path: "/register",
        name: "register",
        component: RegisterForm,
      },

      { path: "/:catchAll(.*)", name: "not-found", component: Page404 },

      //Create a new page / view or use Page404 and pass props
      { path: "/404/:resource", name: "404Resource", component: Page404 },
      //Create a new page / view or use Page404 and pass props
      { path: "/network-error", name: "NetworkError", component: Page404 },
      ...protectedRoutes,
    ],
  },
];

const router = createRouter({
  routes,
  history: createWebHistory(),
});

router.beforeEach((to, from, next) => {
  const { isAuth } = useAuth();

  if (to.meta.requiresAuth && !isAuth.value) {
    return next({ name: "login" });
  }

  if (isAuth.value && (to.name === "login" || to.name === "register")) {
    return next({ name: "dashboard" });
  }

  next();
});
export default router;
