import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

const router = createRouter({ 
    routeTree,
    defaultNotFoundComponent: () => {
    return (
      <div className=" p-4 bg-slate-800 min-h-screen text-slate-100">
        <h2>404 - Page Not Found</h2>
        <p>The page you are looking for does not exist.</p>
      </div>
    )
  }
});

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

export { router };