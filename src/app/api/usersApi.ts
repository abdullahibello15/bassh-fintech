import { UserType } from "../context/AppContext";

const USERS_API_URL = "https://my-backend-wapg.onrender.com/api/users";

type UsersPayload = Record<string, unknown>;

const BALANCE_KEYS = ["balance", "initialBalance"];
const USER_ID_KEYS = ["_id", "id", "userId"];

class UsersApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// ✅ Validates a real MongoDB ObjectId — 24 hex characters
const isMongoId = (value: unknown): boolean => {
  return typeof value === "string" && /^[a-f\d]{24}$/i.test(value);
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

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

const getErrorMessage = (data: unknown, fallback: string) => {
  const message = getNestedValue(data, ["message", "error", "detail"]);
  return typeof message === "string" && message.trim() ? message : fallback;
};

const toNumber = (value: unknown, fallback: number) => {
  const normalizedValue =
    typeof value === "string" ? value.replace(/[$,\s]/g, "") : value;
  const numericValue = Number(normalizedValue);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};

const findDeepValue = (source: unknown, keys: string[]): unknown => {
  if (!source || typeof source !== "object") return undefined;
  const record = source as Record<string, unknown>;
  const directValue = getNestedValue(record, keys);
  if (directValue !== undefined && directValue !== null) return directValue;
  for (const value of Object.values(record)) {
    if (!value || typeof value !== "object") continue;
    const nestedValue = findDeepValue(value, keys);
    if (nestedValue !== undefined && nestedValue !== null) return nestedValue;
  }
  return undefined;
};

const toStableId = (value: unknown, fallback: number) => {
  const numericValue = Number(value);
  if (Number.isFinite(numericValue)) return numericValue;
  if (typeof value !== "string" || !value.trim()) return fallback;
  return value.split("").reduce((hash, character) => {
    return (hash * 31 + character.charCodeAt(0)) >>> 0;
  }, 0);
};

// ✅ Only returns an id if it's a real MongoDB ObjectId
const getApiId = (
  user: Record<string, unknown>,
  fallback?: Partial<UserType>,
): string | undefined => {
  const backendId = getNestedValue(user, ["_id", "id", "userId"]);
  if (isMongoId(backendId)) return String(backendId);
  if (isMongoId(fallback?.apiId)) return fallback!.apiId;
  if (isMongoId(fallback?._id)) return fallback!._id;
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
  if (
    nestedData &&
    typeof nestedData === "object" &&
    !Array.isArray(nestedData)
  ) {
    const nestedUser = findUserRecord(nestedData);
    if (nestedUser) return nestedUser;
  }

  if (record.email || record.name || record.fullName || record.firstName) {
    return record;
  }

  return undefined;
};

const findUsersArray = (data: unknown): unknown[] => {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  const record = data as Record<string, unknown>;
  const users = getNestedValue(record, [
    "users",
    "accounts",
    "customers",
    "items",
  ]);
  if (Array.isArray(users)) return users;
  return findUsersArray(record.data);
};

const matchesUser = (user: unknown, fallback?: Partial<UserType>) => {
  if (!fallback) return false;
  const record = findUserRecord(user) || {};
  const rawId = getNestedValue(record, USER_ID_KEYS);
  const email = String(getNestedValue(record, ["email"]) || "")
    .trim()
    .toLowerCase();
  const fallbackIds = [
    fallback.apiId,
    fallback._id,
    fallback.id === undefined ? undefined : String(fallback.id),
  ].filter(Boolean);

  return (
    (rawId !== undefined &&
      rawId !== null &&
      fallbackIds.includes(String(rawId))) ||
    (!!email && !!fallback.email && email === fallback.email.toLowerCase())
  );
};

const findUserData = (data: unknown, fallback?: Partial<UserType>) => {
  const users = findUsersArray(data);
  if (users.length > 0) {
    return users.find((user) => matchesUser(user, fallback)) || users[0];
  }
  return data;
};

const normalizeStatus = (value: unknown): UserType["status"] => {
  return String(value || "Active").toLowerCase() === "suspended"
    ? "Suspended"
    : "Active";
};

const normalizeUser = (
  data: unknown,
  fallback?: Partial<UserType>,
): UserType => {
  const userData = findUserData(data, fallback);
  const user = findUserRecord(userData) || {};

  const apiId = getApiId(user, fallback);
  const rawId = apiId || getNestedValue(user, USER_ID_KEYS);

  const firstName = String(
    getNestedValue(user, ["firstName", "first_name"]) || "",
  ).trim();
  const lastName = String(
    getNestedValue(user, ["lastName", "last_name"]) || "",
  ).trim();
  const fallbackName = fallback?.name || "User";
  const name =
    String(
      getNestedValue(user, ["name", "fullName", "username"]) || "",
    ).trim() ||
    [firstName, lastName].filter(Boolean).join(" ") ||
    fallbackName;

  const balance = toNumber(
    findDeepValue(userData, BALANCE_KEYS),
    fallback?.balance || 0,
  );

  return {
    id: toStableId(rawId, fallback?.id || Date.now()),
    _id: apiId,
    apiId,
    name,
    email:
      String(getNestedValue(user, ["email"]) || fallback?.email || "")
        .trim()
        .toLowerCase() || "unknown@example.com",
    password: fallback?.password,
    phone: String(
      getNestedValue(user, ["phone", "phoneNumber"]) || fallback?.phone || "",
    ),
    balance,
    status: normalizeStatus(
      getNestedValue(user, ["status", "accountStatus"]) || fallback?.status,
    ),
    joined: String(
      getNestedValue(user, ["joined", "createdAt", "created_at"]) ||
        fallback?.joined ||
        new Date().toISOString().split("T")[0],
    ).split("T")[0],
    accountType: String(
      getNestedValue(user, ["accountType", "account_type"]) ||
        fallback?.accountType ||
        "Standard",
    ),
  };
};

const requestUsers = async (
  url: string,
  options: RequestInit,
  fallbackError: string,
) => {
  console.log("Requesting URL:", url);

  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    console.error(`Request failed [${response.status}]:`, url, data);
    throw new UsersApiError(
      getErrorMessage(data, fallbackError),
      response.status,
    );
  }

  return data;
};

const userEndpointById = (userId: string | number) =>
  `${USERS_API_URL}/${encodeURIComponent(String(userId))}`;

// ✅ Guards against sending a hashed numeric id to the backend
const userEndpoint = (user: UserType): string => {
  const id = user.apiId || user._id;

  if (!id || !isMongoId(id)) {
    console.error(
      "userEndpoint: no valid MongoDB id found for user — request will fail:",
      user,
    );
  }

  return userEndpointById(id || String(user.id));
};

const withoutUndefined = (payload: UsersPayload) => {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  );
};

const buildUserPayload = (updates: Partial<UserType>) => {
  const [firstName, ...lastNameParts] = updates.name?.trim().split(/\s+/) || [];

  return withoutUndefined({
    name: updates.name,
    fullName: updates.name,
    firstName,
    lastName: lastNameParts.length > 0 ? lastNameParts.join(" ") : undefined,
    balance: updates.balance,
    initialBalance: updates.balance,
    status: updates.status,
    accountStatus: updates.status,
    phoneNumber: updates.phone,
    phone: updates.phone,
    accountType: updates.accountType,
    account_type: updates.accountType,
    email: updates.email,
  });
};

export const fetchUsers = async () => {
  const data = await requestUsers(
    USERS_API_URL,
    { method: "GET" },
    "Unable to load users.",
  );
  return findUsersArray(data).map((user) => normalizeUser(user));
};

export const fetchUser = async (user: UserType) => {
  const id = user.apiId || user._id;

  // ✅ Block the request entirely if no valid MongoDB id
  if (!id || !isMongoId(id)) {
    console.error(
      "fetchUser: no valid MongoDB id — skipping request for user:",
      user,
    );
    return user;
  }

  return fetchUserById(id, user);
};

export const fetchUserById = async (
  userId: string | number,
  fallback?: Partial<UserType>,
) => {
  // ✅ Block if not a real MongoDB id
  if (!isMongoId(userId)) {
    console.error("fetchUserById: invalid MongoDB id — skipping:", userId);
    return fallback as UserType;
  }

  const data = await requestUsers(
    userEndpointById(userId),
    { method: "GET" },
    "Unable to load user.",
  );
  return normalizeUser(data, fallback);
};

export const createUser = async (input: {
  name: string;
  email: string;
  phone?: string;
  password: string;
  balance: number;
  status: UserType["status"];
  accountType: string;
}) => {
  const [firstName, ...lastNameParts] = input.name.split(" ");
  const payload: UsersPayload = {
    name: input.name,
    fullName: input.name,
    firstName,
    lastName: lastNameParts.join(" "),
    email: input.email,
    phone: input.phone,
    phoneNumber: input.phone,
    password: input.password,
    balance: input.balance,
    initialBalance: input.balance,
    status: input.status,
    accountStatus: input.status,
    accountType: input.accountType,
  };

  const data = await requestUsers(
    USERS_API_URL,
    { method: "POST", body: JSON.stringify(payload) },
    "Unable to add user.",
  );

  return normalizeUser(data, {
    ...input,
    joined: new Date().toISOString().split("T")[0],
  });
};

export const saveUser = async (user: UserType, updates: Partial<UserType>) => {
  const payload = buildUserPayload(updates);

  const makeRequest = (method: "PATCH" | "PUT") =>
    requestUsers(
      userEndpoint(user),
      { method, body: JSON.stringify(payload) },
      "Unable to update user.",
    );

  try {
    const data = await makeRequest("PATCH");
    return normalizeUser(data, { ...user, ...updates });
  } catch (error) {
    if (
      !(error instanceof UsersApiError) ||
      (error.status !== 404 && error.status !== 405)
    ) {
      throw error;
    }
    const data = await makeRequest("PUT");
    return normalizeUser(data, { ...user, ...updates });
  }
};

export const updateUserStatus = async (
  user: UserType,
  status: UserType["status"],
) => {
  const payload = buildUserPayload({ status });

  const makeStatusRequest = () =>
    requestUsers(
      `${userEndpoint(user)}/status`,
      { method: "PATCH", body: JSON.stringify(payload) },
      "Unable to update user status.",
    );

  try {
    const data = await makeStatusRequest();
    return normalizeUser(data, { ...user, status });
  } catch (error) {
    if (
      !(error instanceof UsersApiError) ||
      (error.status !== 404 && error.status !== 405)
    ) {
      throw error;
    }
    return saveUser(user, { status });
  }
};

export const removeUser = async (user: UserType) => {
  await requestUsers(
    userEndpoint(user),
    { method: "DELETE" },
    "Unable to delete user.",
  );
};
