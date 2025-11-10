/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string; // add other VITE_ keys here if you have them
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}