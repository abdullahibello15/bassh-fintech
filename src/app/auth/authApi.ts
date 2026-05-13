import { UserType } from "../context/AppContext";

const AUTH_API_BASE_URL = "https://my-backend-wapg.onrender.com/api/auth";

type AuthPayload = Record<string, unknown>;

interface AuthResult {
  user: UserType;
  token?: string;
  role?: string;
  isAdmin: boolean;
}

const getNestedValue = (source: unknown, keys: string[]) => {
  if (!source || typeof source !== "object") return undefined;

  const record = source as Record<string, unknown>;
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null) {
      return record[key];
    }
  }

  return undefined;
};

const findUserRecord = (data: unknown): Record<string, unknown> | undefined => {
  if (!data || typeof data !== "object") return undefined;

  const record = data as Record<string, unknown>;
  const directUser = getNestedValue(record, ["user", "account", "customer"]);
  if (directUser && typeof directUser === "object") {
    return directUser as Record<string, unknown>;
  }

  const nestedData = record.data;
  if (nestedData && typeof nestedData === "object") {
    const nestedUser = findUserRecord(nestedData);
    if (nestedUser) return nestedUser;
  }

  if (record.email || record.name || record.fullName) {
    return record;
  }

  return undefined;
};

const findToken = (data: unknown): string | undefined => {
  if (!data || typeof data !== "object") return undefined;

  const record = data as Record<string, unknown>;
  const token = getNestedValue(record, [
    "token",
    "accessToken",
    "access_token",
    "jwt",
  ]);

  if (typeof token === "string") return token;

  return findToken(record.data);
};

const findRole = (data: unknown): string | undefined => {
  if (!data || typeof data !== "object") return undefined;

  const record = data as Record<string, unknown>;
  const role = getNestedValue(record, [
    "role",
    "userRole",
    "accountType",
    "account_type",
    "type",
  ]);

  if (typeof role === "string") return role;

  return findRole(record.data);
};

const findAdminFlag = (data: unknown): boolean => {
  if (!data || typeof data !== "object") return false;

  const record = data as Record<string, unknown>;
  const isAdmin = getNestedValue(record, ["isAdmin", "admin"]);

  if (typeof isAdmin === "boolean") return isAdmin;
  if (typeof isAdmin === "string") return isAdmin.toLowerCase() === "true";

  return findAdminFlag(record.data);
};

const getErrorMessage = (data: unknown, fallback: string) => {
  const message = getNestedValue(data, ["message", "error", "detail"]);
  return typeof message === "string" && message.trim() ? message : fallback;
};

const toNumber = (value: unknown, fallback: number) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};

const toStableId = (value: unknown, fallback: number) => {
  const numericValue = Number(value);
  if (Number.isFinite(numericValue)) return numericValue;

  if (typeof value !== "string" || !value.trim()) return fallback;

  return value.split("").reduce((hash, character) => {
    return (hash * 31 + character.charCodeAt(0)) >>> 0;
  }, 0);
};

const normalizeUser = (
  data: unknown,
  fallback: {
    name: string;
    email: string;
    phone?: string;
    password?: string;
  }
): UserType => {
  const user = findUserRecord(data);

  return {
    id: toStableId(getNestedValue(user, ["id", "_id", "userId"]), Date.now()),
    name:
      String(getNestedValue(user, ["name", "fullName", "username"]) || fallback.name).trim() ||
      fallback.name,
    email:
      String(getNestedValue(user, ["email"]) || fallback.email)
        .trim()
        .toLowerCase() || fallback.email,
    phone: String(getNestedValue(user, ["phone", "phoneNumber"]) || fallback.phone || ""),
    password: fallback.password,
    balance: toNumber(getNestedValue(user, ["initialBalance", "balance", "accountBalance"]), 0),
    status:
      String(getNestedValue(user, ["status", "accountStatus"]) || "Active").toLowerCase() === "suspended"
        ? "Suspended"
        : "Active",
    joined: String(
      getNestedValue(user, ["joined", "createdAt", "created_at"]) ||
        new Date().toISOString().split("T")[0]
    ).split("T")[0],
    accountType: String(getNestedValue(user, ["accountType", "account_type"]) || "Basic"),
  };
};

const requestAuth = async (
  path: "login" | "signup",
  payload: AuthPayload,
  fallbackUser: Parameters<typeof normalizeUser>[1]
): Promise<AuthResult> => {
  const response = await fetch(`${AUTH_API_BASE_URL}/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(getErrorMessage(data, "Authentication failed. Please try again."));
  }

  const role = findRole(data);

  return {
    user: normalizeUser(data, fallbackUser),
    token: findToken(data),
    role,
    isAdmin: findAdminFlag(data) || role?.toLowerCase() === "admin",
  };
};

export const loginUser = (email: string, password: string) =>
  requestAuth(
    "login",
    { email, password },
    {
      name: email.split("@")[0] || "User",
      email,
      password,
    }
  );

export const signupUser = (input: {
  name: string;
  email: string;
  phone: string;
  password: string;
}) =>
  requestAuth(
    "signup",
    {
      name: input.name,
      fullName: input.name,
      email: input.email,
      phone: input.phone,
      password: input.password,
    },
    {
      name: input.name,
      email: input.email,
      phone: input.phone,
      password: input.password,
    }
  );

export const persistAuthToken = (token?: string) => {
  if (token) {
    localStorage.setItem("authToken", token);
  } else {
    localStorage.removeItem("authToken");
  }
};
