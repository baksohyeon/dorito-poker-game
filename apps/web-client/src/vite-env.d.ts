/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_API_URL: string
  readonly VITE_SOCKET_URL: string
  readonly VITE_MASTER_SERVER_URL: string
  readonly VITE_DEDICATED_SERVER_URL: string
  readonly VITE_AI_SERVER_URL: string
  readonly VITE_ENABLE_DEV_TOOLS: string
  readonly VITE_ENABLE_PERFORMANCE_MONITORING: string
  readonly VITE_ENABLE_ERROR_REPORTING: string
  readonly VITE_DEFAULT_POKER_VARIANT: string
  readonly VITE_MAX_PLAYERS_PER_TABLE: string
  readonly VITE_DEFAULT_ACTION_TIMEOUT: string
  readonly VITE_DEFAULT_THEME: string
  readonly VITE_ENABLE_ANIMATIONS: string
  readonly VITE_ENABLE_SOUND: string
  readonly VITE_MOCK_API: string
  readonly VITE_BYPASS_AUTH: string
  readonly VITE_DEBUG_SOCKET: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}