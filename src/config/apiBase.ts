/** Base URLs for split Spring Boot services (override with Vite env in production). */
export const AUTH_BASE =
  import.meta.env.VITE_AUTH_URL ?? "http://localhost:8081";
export const PROFILE_BASE =
  import.meta.env.VITE_PROFILE_URL ?? "http://localhost:8082";
export const SOCIAL_BASE =
  import.meta.env.VITE_SOCIAL_URL ?? "http://localhost:8083";
export const CONTENT_BASE =
  import.meta.env.VITE_CONTENT_URL ?? "http://localhost:8086";
export const CHAT_BASE =
  import.meta.env.VITE_CHAT_URL ?? "http://localhost:8085";
