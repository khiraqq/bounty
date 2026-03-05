import { Html, Head, Main, NextScript } from 'next/document';
export default function Document() {
  return (
    <Html lang="en-US" className="dark">
      <Head>
        <script src="https://cdn.tailwindcss.com" />
        <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js" />
        <link href="https://fonts.googleapis.com/css2?family=Doto:wght@400;700&display=swap" rel="stylesheet" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
