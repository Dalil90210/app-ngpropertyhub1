import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, Link, createRootRouteWithContext, useRouter,
  HeadContent, Scripts, useLocation,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/use-auth";
import { Navbar } from "@/components/Navbar";
import { BottomNav } from "@/components/BottomNav";
import { Footer } from "@/components/Footer";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-navy">404</h1>
        <p className="mt-2 text-muted-foreground">This page doesn't exist.</p>
        <Link to="/" className="mt-6 inline-flex items-center justify-center rounded-md bg-navy text-white px-4 py-2 text-sm font-medium hover:bg-navy/90">Go home</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-6 rounded-md bg-navy text-white px-4 py-2 text-sm">Try again</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#0B2545" },
      { title: "NGPropertyHub — The #1 U.S. Real Estate Platform" },
      { name: "description", content: "Browse verified listings, get AI valuations, and close deals with smart escrow across all 50 US states." },
      { property: "og:site_name", content: "NGPropertyHub" },
      { property: "og:title", content: "NGPropertyHub — The #1 U.S. Real Estate Platform" },
      { property: "og:description", content: "Browse verified listings, get AI valuations, and close deals with smart escrow across all 50 US states." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://us-property-grid.lovable.app/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "NGPropertyHub — The #1 U.S. Real Estate Platform" },
      { name: "twitter:description", content: "Browse verified listings, get AI valuations, and close deals with smart escrow across all 50 US states." },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://us-property-grid.lovable.app/#org",
              name: "NGPropertyHub",
              url: "https://us-property-grid.lovable.app/",
              description: "Secure U.S. real estate marketplace covering all 50 states.",
            },
            {
              "@type": "WebSite",
              "@id": "https://us-property-grid.lovable.app/#website",
              url: "https://us-property-grid.lovable.app/",
              name: "NGPropertyHub",
              publisher: { "@id": "https://us-property-grid.lovable.app/#org" },
              potentialAction: {
                "@type": "SearchAction",
                target: "https://us-property-grid.lovable.app/properties?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

const NO_CHROME = ["/splash", "/auth", "/role-select", "/admin-login"];

function Chrome() {
  const { pathname } = useLocation();
  const hideChrome = NO_CHROME.some((p) => pathname.startsWith(p)) || pathname.startsWith("/admin");
  if (hideChrome) return <Outlet />;
  return (
    <>
      <Navbar />
      <main className="min-h-screen pb-16 lg:pb-0"><Outlet /></main>
      <Footer />
      <BottomNav />
    </>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Chrome />
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
