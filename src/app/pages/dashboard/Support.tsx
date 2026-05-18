import { useEffect, useMemo, useState } from "react";
import { Send, MessageCircle, Mail, Phone, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useAppContext } from "../../context/AppContext";
import {
  ConversationSummary,
  ConversationMessage,
  getConversationSummaries,
  getConversationMessages,
  postClientMessage,
} from "../../api/chatApi";

const getUserConversationPrefixes = (userId: number) => [
  `conversation-${userId}-`,
  `conversation_${userId}_`,
];

const isUserConversation = (
  conversation: ConversationSummary,
  userId: number,
) => {
  const prefixes = getUserConversationPrefixes(userId);
  return prefixes.some((prefix) =>
    conversation.conversationId.startsWith(prefix),
  );
};

export function Support() {
  const { currentUser } = useAppContext();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("general");
  const [conversationSummaries, setConversationSummaries] = useState<
    ConversationSummary[]
  >([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const selectedConversation = useMemo(
    () =>
      conversationSummaries.find(
        (conversation) =>
          conversation.conversationId === selectedConversationId,
      ) ||
      conversationSummaries[0] ||
      null,
    [conversationSummaries, selectedConversationId],
  );

  const loadClientConversations = async (showLoading = false) => {
    if (!currentUser) return;
    if (showLoading) setIsLoading(true);

    try {
      const allConversations = await getConversationSummaries();
      const nextConversations = allConversations
        .filter((conversation) =>
          isUserConversation(conversation, currentUser.id),
        )
        .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));

      setConversationSummaries(nextConversations);
      if (nextConversations.length > 0 && !selectedConversationId) {
        setSelectedConversationId(nextConversations[0].conversationId);
      }
      if (
        selectedConversationId &&
        !nextConversations.some(
          (item) => item.conversationId === selectedConversationId,
        )
      ) {
        setSelectedConversationId(nextConversations[0]?.conversationId || null);
      }

      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load conversations.",
      );
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    setIsLoadingMessages(true);
    setErrorMessage("");

    try {
      const nextMessages = await getConversationMessages(conversationId);
      setMessages(
        nextMessages.sort(
          (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt),
        ),
      );
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to load messages.",
      );
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      setConversationSummaries([]);
      setSelectedConversationId(null);
      setMessages([]);
      setIsLoading(false);
      return;
    }

    loadClientConversations(true);
    const interval = window.setInterval(() => {
      loadClientConversations();
    }, 5000);

    return () => window.clearInterval(interval);
  }, [currentUser]);

  useEffect(() => {
    if (!selectedConversationId) return;

    const interval = window.setInterval(() => {
      loadMessages(selectedConversationId);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [selectedConversationId]);

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }

    loadMessages(selectedConversationId);
  }, [selectedConversationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      setErrorMessage("Please log in first.");
      return;
    }

    setIsSending(true);
    setErrorMessage("");
    setStatusMessage("");

    try {
      const conversation = await postClientMessage({
        user: currentUser,
        category,
        subject,
        message,
      });
      await loadClientConversations(true);
      setSelectedConversationId(conversation.id);
      setSubject("");
      setMessage("");
      setCategory("general");
      setStatusMessage("Message sent. Support replies will appear below.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to send message.",
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1
          className="font-heading mb-2"
          style={{ fontSize: "clamp(30px, 9vw, 36px)", color: "#ffffff" }}
        >
          Customer Support
        </h1>
        <p style={{ color: "rgba(255, 255, 255, 0.6)" }}>
          Send us a message and see support replies here
        </p>
      </div>
      {(errorMessage || statusMessage) && (
        <div
          className={`mb-6 rounded-lg border px-4 py-3 text-sm ${
            errorMessage
              ? "border-red-400/30 bg-red-500/10 text-red-100"
              : "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
          }`}
        >
          {errorMessage || statusMessage}
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-3 md:gap-6">
        <div className="space-y-4">
          {[
            {
              title: "Email",
              value: "support@recoverytrustbank.com",
              icon: Mail,
              color: "#c9a84c",
            },
            {
              title: "Phone",
              value: "+1 (210) 549-7025",
              icon: Phone,
              color: "#3b82f6",
            },
            {
              title: "Live Chat",
              value: "Available 24/7",
              icon: MessageCircle,
              color: "#10b981",
            },
          ].map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-5 sm:p-6 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20"
            >
              <div className="w-12 h-12 mb-4 rounded-full bg-white/10 flex items-center justify-center">
                <item.icon className="w-6 h-6" style={{ color: item.color }} />
              </div>
              <h3
                className="font-heading mb-2"
                style={{ fontSize: "20px", color: "#ffffff" }}
              >
                {item.title}
              </h3>
              <p
                style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "14px" }}
              >
                {item.value}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="md:col-span-2 p-5 sm:p-8 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20"
        >
          <h2
            className="font-heading mb-6"
            style={{ fontSize: "24px", color: "#ffffff" }}
          >
            Send Us a Message
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block mb-2"
                style={{ color: "rgba(255, 255, 255, 0.7)" }}
              >
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isSending}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white focus:border-[#c9a84c] focus:outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="general">General Inquiry</option>
                <option value="account">Account Issue</option>
                <option value="transaction">Transaction Problem</option>
                <option value="withdrawal">Withdrawal Request</option>
                <option value="technical">Technical Support</option>
                <option value="feedback">Feedback</option>
              </select>
            </div>

            <div>
              <label
                className="block mb-2"
                style={{ color: "rgba(255, 255, 255, 0.7)" }}
              >
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of your issue"
                required
                disabled={isSending}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all"
              />
            </div>

            <div>
              <label
                className="block mb-2"
                style={{ color: "rgba(255, 255, 255, 0.7)" }}
              >
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please provide details about your inquiry..."
                required
                disabled={isSending}
                rows={6}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-[#c9a84c]/20 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="w-full px-6 py-3 bg-[#c9a84c] text-[#0a0e1a] rounded-lg hover:bg-[#b89640] transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-80 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              {isSending ? "Sending..." : "Send Message"}
            </button>
          </form>
        </motion.div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 p-5 sm:p-8 rounded-xl bg-gradient-to-br from-[#141e32]/60 to-[#0a0e1a]/60 backdrop-blur-xl border border-[#c9a84c]/20"
      >
        <h2
          className="font-heading mb-6"
          style={{ fontSize: "24px", color: "#ffffff" }}
        >
          Conversation History
        </h2>

        <div className="grid gap-4 lg:grid-cols-[320px_1fr] lg:gap-6">
          <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 p-4">
            <h3 className="mb-4 text-sm uppercase tracking-[0.18em] text-white/50">
              Your conversations
            </h3>
            {isLoading ? (
              <div className="flex min-h-[140px] items-center justify-center text-white/60">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : conversationSummaries.length === 0 ? (
              <div className="min-h-[140px] flex items-center justify-center text-white/60">
                No saved conversations yet.
              </div>
            ) : (
              <div className="space-y-3">
                {conversationSummaries.map((conversation) => (
                  <button
                    key={conversation.conversationId}
                    onClick={() =>
                      setSelectedConversationId(conversation.conversationId)
                    }
                    className={`w-full rounded-3xl border px-4 py-4 text-left transition-all ${
                      selectedConversationId === conversation.conversationId
                        ? "border-[#c9a84c] bg-[#c9a84c]/10"
                        : "border-white/10 bg-white/5 hover:border-[#c9a84c]/30 hover:bg-[#c9a84c]/5"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {conversation.lastSenderName}
                        </div>
                        <p className="mt-1 text-sm text-white/70 truncate">
                          {conversation.lastMessage}
                        </p>
                      </div>
                      <div className="text-right text-xs text-white/50">
                        {new Date(conversation.updatedAt).toLocaleTimeString(
                          [],
                          { hour: "2-digit", minute: "2-digit" },
                        )}
                        {conversation.unreadCount > 0 && (
                          <div className="mt-2 inline-flex rounded-full bg-[#10b981] px-2 py-1 text-[11px] font-semibold text-black">
                            {conversation.unreadCount} unread
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6">
            {selectedConversation ? (
              <>
                <div className="mb-6 rounded-3xl bg-[#131b2e]/80 border border-white/10 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.18em] text-white/40">
                        Conversation with
                      </p>
                      <p className="mt-2 text-lg font-semibold text-white">
                        {selectedConversation.lastSenderName}
                      </p>
                    </div>
                    <div className="text-sm text-white/50">
                      Updated{" "}
                      {new Date(
                        selectedConversation.updatedAt,
                      ).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {isLoadingMessages ? (
                    <div className="flex min-h-[240px] items-center justify-center text-white/60">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="min-h-[240px] flex items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 text-white/60">
                      No messages yet for this conversation.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((messageItem) => {
                        const isAdmin =
                          messageItem.senderType.toLowerCase() === "admin";
                        return (
                          <div
                            key={messageItem.id}
                            className={`max-w-[92%] rounded-2xl px-4 py-3 sm:max-w-[80%] sm:rounded-3xl sm:px-5 sm:py-4 ${
                              isAdmin
                                ? "rounded-bl-none bg-white/5 text-white"
                                : "ml-auto rounded-br-none bg-[#c9a84c]/20 text-white"
                            }`}
                          >
                            <div className="mb-2 flex items-center justify-between gap-2 text-xs uppercase tracking-[0.2em] text-white/40">
                              <span>{messageItem.senderName}</span>
                              <span>
                                {new Date(
                                  messageItem.createdAt,
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <p className="whitespace-pre-line text-sm leading-6">
                              {messageItem.message}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="min-h-[240px] flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-white/10 bg-white/5 text-center text-white/60">
                <p className="text-lg">Pick a conversation to view replies</p>
                <p className="max-w-xs text-sm text-white/50">
                  Replies from support will appear here once the conversation is
                  selected.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
