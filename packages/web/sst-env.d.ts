/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_AUTH_URL: string;
  readonly VITE_API_URL: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_REPLICACHE_LICENSE_KEY: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
