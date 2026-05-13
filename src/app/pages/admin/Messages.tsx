import { useEffect, useState } from "react";
import { Clock, Loader2, MessageCircle, Send } from "lucide-react";
import { motion } from "motion/react";
import {
  ConversationSummary,
  ConversationMessage,
  getConversationSummaries,
  getConversationMessages,
  replyToConversation,
} from "../../api/chatApi";

export function Messages() {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationSummary | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [replyText, setReplyText] = useState("");
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const loadConversations = async (showLoading = false) => {
    if (showLoading) setIsLoadingList(true);

    try {
      const nextConversations = await getConversationSummaries();
      setConversations(nextConversations);
      setSelectedConversation((current) =>
        current
          ? nextConversations.find(
              (conversation) =>
                conversation.conversationId === current.conversationId,
            ) || current
          : current,
      );
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load conversations.",
      );
    } finally {
      if (showLoading) setIsLoadingList(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    setIsLoadingMessages(true);
    setErrorMessage("");

    try {
      const nextMessages = await getConversationMessages(conversationId);
      setMessages(nextMessages);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to load messages.",
      );
    } finally {
      setIsLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadConversations(true);
    const interval = window.setInterval(() => loadConversations(), 5000);
    return () => window.clearInterval(interval);
  }, []);

  const handleConversationClick = async (conversation: ConversationSummary) => {
    setSelectedConversation(conversation);
    await loadMessages(conversation.conversationId);
  };

  const handleSendReply = async () => {
    if (!selectedConversation || !replyText.trim() || isSendingReply) return;
    setIsSendingReply(true);
    setErrorMessage("");

    try {
      await replyToConversation(
        selectedConversation.conversationId,
        replyText.trim(),
      );
      setReplyText("");
      await loadMessages(selectedConversation.conversationId);
      await loadConversations();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to send reply.",
      );
    } finally {
      setIsSendingReply(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1
          className="font-heading mb-2"
          style={{ fontSize: "36px", color: "#ffffff" }}
        >
          Admin Chat Portal
        </h1>
        <p style={{ color: "rgba(255, 255, 255, 0.6)" }}>
          Review conversations and inspect all messages in real time.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="rounded-3xl bg-[#0b1221]/80 border border-white/10 p-4 shadow-xl shadow-black/20 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-heading text-2xl text-white">
                Conversations
              </h2>
              <p className="text-sm text-white/60">
                Auto-refreshes every 5 seconds
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-xs text-white/70">
              <Clock className="w-4 h-4" /> live
            </div>
          </div>

          {isLoadingList ? (
            <div className="flex min-h-[220px] items-center justify-center text-white/60">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="min-h-[220px] flex items-center justify-center text-white/60">
              No conversations found.
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conversation) => (
                <button
                  key={conversation.conversationId}
                  onClick={() => handleConversationClick(conversation)}
                  className={`w-full rounded-3xl border px-4 py-4 text-left transition-all ${
                    selectedConversation?.conversationId ===
                    conversation.conversationId
                      ? "border-[#c9a84c] bg-[#c9a84c]/10"
                      : "border-white/10 bg-white/5 hover:border-[#c9a84c]/40 hover:bg-[#c9a84c]/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {conversation.lastSenderName}
                      </p>
                      <p className="mt-1 text-sm text-white/70">
                        {conversation.lastMessage}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="block text-xs text-white/50">
                        {new Date(conversation.updatedAt).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                      {conversation.unreadCount > 0 && (
                        <span className="mt-2 inline-flex rounded-full bg-[#10b981] px-2 py-1 text-[11px] font-semibold text-black">
                          {conversation.unreadCount} unread
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl bg-[#0b1221]/80 border border-white/10 p-6 shadow-xl shadow-black/20 backdrop-blur-xl">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-heading text-2xl text-white">Messages</h2>
              <p className="text-sm text-white/60">
                Select a conversation to view all messages.
              </p>
            </div>
            <div className="hidden sm:inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-xs text-white/70">
              <MessageCircle className="w-4 h-4" /> chat feed
            </div>
          </div>

          {!selectedConversation ? (
            <div className="min-h-[360px] flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-white/10 bg-white/5 text-center text-white/60">
              <p className="text-lg">No conversation selected</p>
              <p className="max-w-xs text-sm text-white/50">
                Click a conversation from the left to load messages from the
                backend.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 rounded-3xl bg-[#131b2e]/80 border border-white/10 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.18em] text-white/40">
                      Conversation
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {selectedConversation.lastSenderName}
                    </p>
                  </div>
                  <div className="text-right text-sm text-white/50">
                    Updated{" "}
                    {new Date(selectedConversation.updatedAt).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {isLoadingMessages ? (
                  <div className="flex min-h-[260px] items-center justify-center text-white/60">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="min-h-[260px] flex items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 text-white/60">
                    No messages available for this conversation.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => {
                      const isAdmin =
                        message.senderType.toLowerCase() === "admin";
                      return (
                        <div
                          key={message.id}
                          className={`max-w-[80%] rounded-3xl px-5 py-4 ${
                            isAdmin
                              ? "ml-auto rounded-br-none bg-[#c9a84c]/20 text-white"
                              : "rounded-bl-none bg-white/5 text-white"
                          }`}
                        >
                          <div className="mb-2 flex items-center justify-between gap-2 text-xs uppercase tracking-[0.2em] text-white/40">
                            <span>{message.senderName}</span>
                            <span>
                              {new Date(message.createdAt).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </span>
                          </div>
                          <p className="whitespace-pre-line text-sm leading-6">
                            {message.message}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-[#131b2e]/80 p-4">
                <p className="mb-3 text-sm uppercase tracking-[0.18em] text-white/40">
                  Reply to client
                </p>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your reply here..."
                  rows={4}
                  disabled={isSendingReply}
                  className="w-full rounded-3xl border border-white/10 bg-[#0b1221]/90 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#c9a84c] focus:outline-none"
                />
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleSendReply}
                    disabled={isSendingReply || !replyText.trim()}
                    className="inline-flex items-center gap-2 rounded-full bg-[#c9a84c] px-5 py-3 text-sm font-semibold text-[#0a0e1a] transition hover:bg-[#b89640] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSendingReply ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Send reply
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
