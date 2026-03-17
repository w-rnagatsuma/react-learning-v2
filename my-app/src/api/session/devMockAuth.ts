import type { CurrentUser } from "@/hooks/api/useCurrentUser";

const DEV_LOGIN_EMAIL = "test@test";
const DEV_LOGIN_PASSWORD = "test";
const DEV_USER_STORAGE_KEY = "dev_mock_auth_user";

const DEV_USER: CurrentUser = {
  id: "dev-user-1",
  name: "Demo User",
  email: DEV_LOGIN_EMAIL,
};

export function isDevMode() {
  return import.meta.env.DEV;
}

export function getDevCredentials() {
  return {
    email: DEV_LOGIN_EMAIL,
    password: DEV_LOGIN_PASSWORD,
  };
}

export function tryDevLogin(email: string, password: string) {
  if (!isDevMode()) {
    return false;
  }

  if (email === DEV_LOGIN_EMAIL && password === DEV_LOGIN_PASSWORD) {
    localStorage.setItem(DEV_USER_STORAGE_KEY, JSON.stringify(DEV_USER));
    return true;
  }

  return false;
}

export function getDevLoggedInUser(): CurrentUser | null {
  if (!isDevMode()) {
    return null;
  }

  const raw = localStorage.getItem(DEV_USER_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as CurrentUser;
  } catch {
    localStorage.removeItem(DEV_USER_STORAGE_KEY);
    return null;
  }
}
