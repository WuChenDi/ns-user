import type { FC, PropsWithChildren } from 'hono/jsx';

interface LayoutProps {
  title?: string;
}

export const Layout: FC<PropsWithChildren<LayoutProps>> = ({ title = 'Auth System', children }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              theme: {
                extend: {
                  fontFamily: {
                    sans: ['Inter', 'system-ui', 'sans-serif'],
                  }
                }
              }
            }
          `
        }} />
      </head>
      <body class="bg-gray-50 min-h-screen font-sans">
        <div class="min-h-screen flex flex-col">
          <header class="bg-white shadow-sm border-b border-gray-200">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="flex justify-between items-center h-16">
                <div class="flex items-center">
                  <h1 class="text-xl font-bold text-gray-900">Auth System</h1>
                </div>
                <nav class="hidden md:flex space-x-8">
                  <a class="text-gray-600 hover:text-gray-900 transition-colors" href="/">Home</a>
                </nav>
              </div>
            </div>
          </header>
          
          <main class="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div class="max-w-md w-full space-y-8">
              {children}
            </div>
          </main>
          
          <footer class="bg-white border-t border-gray-200 py-8">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div class="text-center text-sm text-gray-500">
                <p>© 2025 Auth System. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
};
