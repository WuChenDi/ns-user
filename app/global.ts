/* eslint-disable */

import { createStorage } from 'unstorage'

const isDebug = process.env.NODE_ENV === 'dev' ? true : false

interface SimpleLogger {
  debug: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
}

declare global {
  var storage: ReturnType<typeof createStorage>
  var logger: SimpleLogger
  var isDebug: boolean
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

globalThis.storage = storage as any
globalThis.logger = logger
globalThis.isDebug = isDebug
