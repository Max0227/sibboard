import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import AdDetail from "../pages/ad-detail/page";
import Dashboard from "../pages/dashboard/page";
import PostPage from "../pages/post/page";
import AuthPage from "../pages/auth/page";
import SearchPage from "../pages/search/page";
import MessagesPage from "../pages/messages/page";

const routes: RouteObject[] = [
  { path: "/", element: <Home /> },
  { path: "/ads/:id", element: <AdDetail /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/post", element: <PostPage /> },
  { path: "/auth", element: <AuthPage /> },
  { path: "/search", element: <SearchPage /> },
  { path: "/messages", element: <MessagesPage /> },
  { path: "/messages/:chatId", element: <MessagesPage /> },
  { path: "*", element: <NotFound /> },
];

export default routes;
