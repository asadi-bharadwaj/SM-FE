/** Clears client session and reloads to login. Full navigation resets router auth gate. */
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("profileUsername");
  window.location.href = "/login";
}
