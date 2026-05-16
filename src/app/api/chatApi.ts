import { UserType } from "../context/AppContext";

const CHAT_API_URL =
  "https://my-backend-wapg.onrender.com/api/chat/conversations";

export interface ChatMessage {
  id: string;
  sender: "client" | "admin";
  text: string;
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  userId: number;
  userApiId?: string;
  userName: string;
  email: string;
  category: string;
  subject: string;
  status: "Pending" | "Replied" | "Resolved";
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ConversationSummary {
  conversationId: string;
  lastMessage: string;
  lastSenderType: string;
  lastSenderName: string;
  unreadCount: number;
  updatedAt: string;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  senderType: string;
  senderName: string;
  senderId: string;
  message: string;
  readByAdmin: boolean;
  readByClient: boolean;
  createdAt: string;
  updatedAt: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const getValue = (source: unknown, keys: string[]) => {
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
  const message = getValue(data, ["message", "error", "detail"]);
  return typeof message === "string" && message.trim() ? message : fallback;
};

class ChatApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const requestChat = async (
  url: string,
  options: RequestInit,
  fallbackError: string,
) => {
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
    throw new ChatApiError(
      getErrorMessage(data, fallbackError),
      response.status,
    );
  }

  return data;
};

const toString = (value: unknown, fallback = "") => {
  return typeof value === "string" && value.trim() ? value : fallback;
};

const toDateString = (value: unknown, fallback = new Date().toISOString()) => {
  return typeof value === "string" && value.trim() ? value : fallback;
};

const normalizeStatus = (value: unknown): ChatConversation["status"] => {
  const status = String(value || "Pending").toLowerCase();
  if (status === "resolved" || status === "closed") return "Resolved";
  if (status === "replied" || status === "answered") return "Replied";
  return "Pending";
};

const getConversationArray = (data: unknown): unknown[] => {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];

  const record = data as Record<string, unknown>;
  const conversations = getValue(record, [
    "conversations",
    "data",
    "items",
    "chats",
  ]);
  return Array.isArray(conversations) ? conversations : [];
};

const normalizeMessage = (
  data: unknown,
  fallbackSender: ChatMessage["sender"],
  fallbackText = "",
): ChatMessage => {
  const record =
    data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const sender = String(
    getValue(record, ["sender", "senderType", "role", "from"]) ||
      fallbackSender,
  ).toLowerCase();

  return {
    id: String(
      getValue(record, ["id", "_id", "messageId"]) || crypto.randomUUID(),
    ),
    sender: sender === "admin" || sender === "support" ? "admin" : "client",
    text: toString(
      getValue(record, ["text", "message", "body", "content"]),
      fallbackText,
    ),
    createdAt: toDateString(
      getValue(record, ["createdAt", "created_at", "date"]),
    ),
  };
};

export const normalizeConversation = (data: unknown): ChatConversation => {
  const record =
    data && typeof data === "object" ? (data as Record<string, unknown>) : {};
  const user = getValue(record, ["user", "customer", "client"]);
  const userRecord =
    user && typeof user === "object" ? (user as Record<string, unknown>) : {};
  const rawMessages = getValue(record, ["messages", "replies", "thread"]);
  const initialMessage = toString(
    getValue(record, ["message", "body", "content"]),
  );
  const adminReply = toString(
    getValue(record, ["reply", "adminReply", "response"]),
  );
  const createdAt = toDateString(
    getValue(record, ["createdAt", "created_at", "date"]),
  );
  const messages = Array.isArray(rawMessages)
    ? rawMessages.map((message) => normalizeMessage(message, "client"))
    : [
        ...(initialMessage
          ? [normalizeMessage(record, "client", initialMessage)]
          : []),
        ...(adminReply
          ? [
              normalizeMessage(
                {
                  id: `${String(getValue(record, ["id", "_id"]) || "conversation")}-reply`,
                  message: adminReply,
                  sender: "admin",
                  createdAt:
                    getValue(record, ["updatedAt", "updated_at"]) || createdAt,
                },
                "admin",
                adminReply,
              ),
            ]
          : []),
      ];

  return {
    id: String(
      getValue(record, ["id", "_id", "conversationId"]) || crypto.randomUUID(),
    ),
    userId: Number(
      getValue(record, ["userId", "clientId"]) ||
        getValue(userRecord, ["id", "userId"]) ||
        0,
    ),
    userApiId: String(
      getValue(record, ["userApiId", "clientId", "userId"]) ||
        getValue(userRecord, ["_id", "id", "userId"]) ||
        "",
    ),
    userName: toString(
      getValue(record, ["userName", "user", "name"]) ||
        getValue(userRecord, ["name", "fullName"]),
      "Customer",
    ),
    email: toString(
      getValue(record, ["email", "userEmail"]) ||
        getValue(userRecord, ["email"]),
    ),
    category: toString(getValue(record, ["category"]), "General"),
    subject: toString(
      getValue(record, ["subject", "title"]),
      "Support request",
    ),
    status: normalizeStatus(getValue(record, ["status"])),
    messages,
    createdAt,
    updatedAt: toDateString(
      getValue(record, ["updatedAt", "updated_at"]),
      createdAt,
    ),
  };
};

export const getConversations = async () => {
  const data = await requestChat(
    CHAT_API_URL,
    { method: "GET" },
    "Unable to load conversations.",
  );
  const apiConversations = getConversationArray(data).map(
    normalizeConversation,
  );
  return apiConversations.sort(
    (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
  );
};

const normalizeConversationSummary = (data: unknown): ConversationSummary => {
  const record =
    data && typeof data === "object" ? (data as Record<string, unknown>) : {};

  return {
    conversationId: String(
      getValue(record, ["conversationId", "id", "_id"]) || "",
    ),
    lastMessage: toString(
      getValue(record, ["lastMessage", "message", "text"]),
      "",
    ),
    lastSenderType: toString(
      getValue(record, ["lastSenderType", "senderType", "sender"]),
      "client",
    ),
    lastSenderName: toString(
      getValue(record, ["lastSenderName", "senderName", "sender"]),
      "Customer",
    ),
    unreadCount: Number(getValue(record, ["unreadCount"])) || 0,
    updatedAt: toDateString(
      getValue(record, ["updatedAt", "updated_at", "date"]),
    ),
  };
};

const normalizeConversationMessage = (data: unknown): ConversationMessage => {
  const record =
    data && typeof data === "object" ? (data as Record<string, unknown>) : {};

  return {
    id: String(
      getValue(record, ["_id", "id", "messageId"]) || crypto.randomUUID(),
    ),
    conversationId: String(getValue(record, ["conversationId"]) || ""),
    senderType: toString(
      getValue(record, ["senderType", "sender", "from"]),
      "client",
    ),
    senderName: toString(getValue(record, ["senderName", "name"]), "Customer"),
    senderId: String(
      getValue(record, ["senderId", "userId", "clientId"]) || "",
    ),
    message: toString(getValue(record, ["message", "text", "body"]), ""),
    readByAdmin: Boolean(getValue(record, ["readByAdmin", "read_by_admin"])),
    readByClient: Boolean(getValue(record, ["readByClient", "read_by_client"])),
    createdAt: toDateString(
      getValue(record, ["createdAt", "created_at", "date"]),
    ),
    updatedAt: toDateString(getValue(record, ["updatedAt", "updated_at"])),
  };
};

export const getConversationSummaries = async () => {
  const data = await requestChat(
    CHAT_API_URL,
    { method: "GET" },
    "Unable to load conversations.",
  );
  const conversations = Array.isArray(data) ? data : [];
  return conversations.map(normalizeConversationSummary);
};

export const getConversationMessages = async (conversationId: string) => {
  const data = await requestChat(
    `${CHAT_API_URL}/${encodeURIComponent(conversationId)}/messages`,
    { method: "GET" },
    "Unable to load conversation messages.",
  );

  const messages = Array.isArray(data) ? data : [];
  return messages.map(normalizeConversationMessage);
};

export const postClientMessage = async (input: {
  user: UserType;
  category: string;
  subject: string;
  message: string;
}) => {
  const payload = {
    conversationId: `conversation-${input.user.id}-${Date.now()}`,
    message: input.message,
    senderName: input.user.name,
    clientId: input.user.apiId || String(input.user.id),
    subject: input.subject,
    category: input.category,
  };

  const data = await requestChat(
    CHAT_API_URL,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    "Unable to send message.",
  );

  return normalizeConversation(data);
};

export const replyToConversation = async (
  conversationId: string,
  reply: string,
) => {
  const payload = {
    message: reply,
    senderName: "Admin",
  };

  const data = await requestChat(
    `${CHAT_API_URL}/${encodeURIComponent(conversationId)}/reply`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    "Unable to send reply.",
  );

  return normalizeConversation(data);
};

export const updateConversationStatus = async (
  conversationId: string,
  status: ChatConversation["status"],
) => {
  const data = await requestChat(
    `${CHAT_API_URL}/${encodeURIComponent(conversationId)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
    "Unable to update conversation.",
  );

  return normalizeConversation(data);
};
