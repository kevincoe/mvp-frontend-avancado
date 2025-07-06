import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import { ThemeConfig } from "./theme";
import "./app.css";

export function links() {
  return [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "anonymous",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap",
    },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/icon?family=Material+Icons",
    },
  ];
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Sistema de Gerenciamento Bancário - Gerencie contas e investimentos com facilidade" />
        <meta name="keywords" content="banco, gerenciamento, contas, investimentos, financeiro" />
        <title>Gerente Bancário - Sistema de Gestão Financeira</title>
        <Meta />
        <Links />
      </head>
      <body>
        <ThemeConfig>
          {children}
        </ThemeConfig>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: { error: any }) {
  let message = "Oops!";
  let details = "Ocorreu um erro inesperado.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Erro";
    details =
      error.status === 404
        ? "A página solicitada não foi encontrada."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <ThemeConfig>
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>{message}</h1>
        <p>{details}</p>
        {stack && (
          <pre style={{ 
            width: '100%', 
            padding: '1rem', 
            overflow: 'auto',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            textAlign: 'left'
          }}>
            <code>{stack}</code>
          </pre>
        )}
      </main>
    </ThemeConfig>
  );
}
