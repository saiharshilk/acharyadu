import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="max-w-md text-center">
        <h1
          className="font-[var(--font-abc-gravity)] text-[274px] leading-[0.74] tracking-[-0.02em] uppercase gradient-display"
        >
          404
        </h1>
        <h2 className="mt-6 text-lg font-medium text-graphite" style={{ fontFamily: "var(--font-die-grotesk-b)" }}>
          Page not found
        </h2>
        <div className="mt-6">
          <Link to="/" className="pill-btn inline-flex">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="max-w-md text-center">
        <h1
          className="text-xl font-medium tracking-tight text-graphite"
          style={{ fontFamily: "var(--font-die-grotesk-b)" }}
        >
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-stone">{error.message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="pill-btn"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Acharyudu — Reach Professors That Matter" },
      {
        name: "description",
        content:
          "Find professors, draft AI-personalized cold emails, and copy them to your own mailbox.",
      },
      { name: "robots", content: "noindex" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,500&family=JetBrains+Mono:wght@500;600&family=Bebas+Neue&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen text-graphite" style={{ fontFamily: "var(--font-die-grotesk-b)" }}>
        {/* Navigation */}
        <header className="sticky top-2 z-40 mx-auto max-w-[1200px] px-4">
          <div className="flex items-center justify-between gap-[6px] py-3">
            <Link
              to="/"
              className="text-[21px] font-medium tracking-[-0.02em] text-graphite no-underline"
              style={{ fontFamily: "var(--font-die-grotesk-b)" }}
            >
              Acharyudu
            </Link>
            <div className="flex items-center gap-[6px]">
            <Link
              to="/"
              activeOptions={{ exact: true }}
              className="pill-nav"
              activeProps={{ className: "pill-nav active" }}
            >
              <span className="text-[12px] mr-1">•</span> Search
            </Link>
            <Link
              to="/profile"
              className="pill-nav"
              activeProps={{ className: "pill-nav active" }}
            >
              <span className="text-[12px] mr-1">+</span> My Info
            </Link>
            <Link
              to="/sent"
              className="pill-nav"
              activeProps={{ className: "pill-nav active" }}
            >
              <span className="text-[12px] mr-1">+</span> Sent Log
            </Link>
            </div>
          </div>
        </header>

        <main>
          <Outlet />
        </main>
      </div>
    </QueryClientProvider>
  );
}
