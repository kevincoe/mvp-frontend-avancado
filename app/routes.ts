import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("accounts", "routes/accounts.tsx"),
    route("accounts/new", "routes/accounts.new.tsx"),
    route("accounts/:id", "routes/accounts.detail.tsx"),
    route("accounts/:id/edit", "routes/accounts.edit.tsx"),
    route("investments", "routes/investments.tsx"),
    route("investments/new", "routes/investments.new.tsx"),
    route("investments/:id", "routes/investments.detail.tsx"),
    route("investments/:id/edit", "routes/investments.edit.tsx"),
    route("*", "routes/404.tsx"),
] satisfies RouteConfig;
