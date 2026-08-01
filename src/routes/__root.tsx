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
import { ClientOnly } from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { VantaBackground } from "../components/VantaBackground";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
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
        {/* SVG filter used by .glass-refract for a subtle liquid refraction */}
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
          <filter id="lg-distortion" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.008 0.012"
              numOctaves="2"
              seed="7"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="10"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </svg>
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
      <ClientOnly fallback={null}>
        <VantaBackground />
      </ClientOnly>
      <div className="min-h-screen text-foreground font-serif">
        <header className="sticky top-2 z-40 mx-auto max-w-5xl px-4">
          <div className="glass rounded-2xl px-4 py-2 flex items-center justify-between gap-2">
            <Link to="/" className="text-lg font-bold tracking-tight italic whitespace-nowrap">
              Acharyudu
            </Link>
            <nav className="flex gap-1 text-sm flex-1 justify-center">
              <Link
                to="/"
                activeOptions={{ exact: true }}
                className="px-3 py-1.5 rounded-full hover:bg-white/40 dark:hover:bg-white/10 transition"
                activeProps={{ className: "px-3 py-1.5 rounded-full glass-panel font-bold" }}
              >
                Search & Send
              </Link>
              <Link
                to="/profile"
                className="px-3 py-1.5 rounded-full hover:bg-white/40 dark:hover:bg-white/10 transition"
                activeProps={{ className: "px-3 py-1.5 rounded-full glass-panel font-bold" }}
              >
                My Info
              </Link>
              <Link
                to="/sent"
                className="px-3 py-1.5 rounded-full hover:bg-white/40 dark:hover:bg-white/10 transition"
                activeProps={{ className: "px-3 py-1.5 rounded-full glass-panel font-bold" }}
              >
                Sent Log
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-4">
          <Outlet />
        </main>
      </div>
    </QueryClientProvider>
  );
}
