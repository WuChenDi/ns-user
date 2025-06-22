/* eslint-disable */

import { createStorage } from 'unstorage'

const isDebug = process.env.NODE_ENV === 'dev' ? true : false

interface SimpleLogger {
  debug: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
}

// 在 Workers 环境中，我们需要一个简单的模板渲染函数
interface TemplateRenderer {
  (templatePath: string, data?: any): string;
}

declare global {
  var storage: ReturnType<typeof createStorage>
  var logger: SimpleLogger
  var isDebug: boolean
  var render: TemplateRenderer
}

// logger
const logger = {
  debug: (message: string, ...args: any[]) => {
    if (isDebug) console.log(`[DEBUG] ${message}`, ...args);
  },
  info: (message: string, ...args: any[]) => {
    console.log(`[INFO] ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
};

// storage
const storage = createStorage(/* opts */)

// 简单的模板渲染函数，用于替代 pug.renderFile
const render: TemplateRenderer = (templatePath: string, data: any = {}) => {
  // 在 Workers 环境中，我们需要预编译模板或使用字符串模板
  // 这里提供一个基础的 HTML 模板
  const baseTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title || 'Auth System'}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'system-ui', 'sans-serif'],
          }
        }
      }
    }
  </script>
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
        <div class="bg-white shadow-lg rounded-lg p-8">
          <h2 class="text-2xl font-bold text-gray-900 text-center mb-4">${data.title || 'Page'}</h2>
          <p class="text-center text-gray-600">Template rendering is not fully implemented in Workers environment.</p>
          <p class="text-center text-gray-600 mt-2">Please use JSX components or pre-compiled templates.</p>
        </div>
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
</html>`;

  return baseTemplate;
};

globalThis.storage = storage as any
globalThis.logger = logger
globalThis.isDebug = isDebug
globalThis.render = render
