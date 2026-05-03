import { CHAT_BASE, PROFILE_BASE } from "../config/apiBase";
import { formatApiErrorBody } from "../lib/apiError";
import type { Message, PublicProfile, Thread } from "../types";

export type ConversationSummaryJson = {
  id: string;
  otherUserId: string;
  lastMessage?: {
    body: string;
    createdAt: string;
    senderId: string;
  };
  unreadCount?: number;
};

function iso(at: string | undefined): string {
  if (!at) return new Date().toISOString();
  return at;
}

export function mapApiProfile(raw: Record<string, unknown>): PublicProfile {
  const id = String(raw.id ?? "");
  return {
    id,
    username: String(raw.username ?? ""),
    displayName: String(raw.displayName ?? raw.username ?? ""),
    avatarUrl: String(raw.avatarUrl ?? ""),
    bio: String(raw.bio ?? ""),
    link: String(raw.link ?? raw.website ?? ""),
  };
}

export async function fetchConversationSummaries(
  userId: string
): Promise<ConversationSummaryJson[]> {
  const res = await fetch(`${CHAT_BASE}/conversations`, {
    headers: { "X-User-Id": userId },
  });
  if (!res.ok) throw new Error("Failed to load conversations");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function openOrGetConversation(
  currentUserId: string,
  otherUserId: string
): Promise<string> {
  const res = await fetch(`${CHAT_BASE}/conversations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": currentUserId,
    },
    body: JSON.stringify({ otherUserId: Number(otherUserId) }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(formatApiErrorBody(text, res.status));
  }
  const data = (await res.json()) as { conversationId?: string };
  const cid = data.conversationId;
  if (cid == null || cid === "") {
    throw new Error("Invalid response from chat service");
  }
  return String(cid);
}

export async function enrichThreadsForInbox(
  summaries: ConversationSummaryJson[],
  currentUserId: string
): Promise<Thread[]> {
  const meRaw = await fetch(`${PROFILE_BASE}/users/me`, {
    headers: { "X-User-Id": currentUserId },
  }).then((r) => r.json());

  const me = mapApiProfile(meRaw as Record<string, unknown>);

  return Promise.all(
    summaries.map(async (c) => {
      const otherRaw = await fetch(
        `${PROFILE_BASE}/users/public/${c.otherUserId}`
      ).then((r) => r.json());
      const other = mapApiProfile(otherRaw as Record<string, unknown>);

      const lastMessage = c.lastMessage
        ? {
            body: c.lastMessage.body,
            createdAt: iso(c.lastMessage.createdAt),
            senderId: String(c.lastMessage.senderId),
          }
        : {
            body: "",
            createdAt: new Date().toISOString(),
            senderId: me.id,
          };

      return {
        id: c.id,
        participants: [me, other],
        lastMessage,
        unreadCount: c.unreadCount ?? 0,
        messages: [],
      };
    })
  );
}

export async function fetchThreadDetail(
  conversationId: string,
  currentUserId: string
): Promise<Thread> {
  const [summaryRes, msgsRes, meRes] = await Promise.all([
    fetch(`${CHAT_BASE}/conversations/${conversationId}`, {
      headers: { "X-User-Id": currentUserId },
    }),
    fetch(`${CHAT_BASE}/conversations/${conversationId}/messages`, {
      headers: { "X-User-Id": currentUserId },
    }),
    fetch(`${PROFILE_BASE}/users/me`, {
      headers: { "X-User-Id": currentUserId },
    }),
  ]);

  if (!summaryRes.ok) throw new Error("Conversation not found");
  if (!msgsRes.ok) throw new Error("Could not load messages");

  const summary = (await summaryRes.json()) as ConversationSummaryJson;
  const msgsRaw = await msgsRes.json();
  const meRaw = await meRes.json();

  const me = mapApiProfile(meRaw as Record<string, unknown>);
  const otherRaw = await fetch(
    `${PROFILE_BASE}/users/public/${summary.otherUserId}`
  ).then((r) => r.json());
  const other = mapApiProfile(otherRaw as Record<string, unknown>);

  const messages: Message[] = (Array.isArray(msgsRaw) ? msgsRaw : []).map(
    (m: Record<string, unknown>) => ({
      id: String(m.id),
      threadId: conversationId,
      senderId: String(m.senderId),
      body: String(m.body ?? ""),
      createdAt:
        typeof m.createdAt === "string"
          ? m.createdAt
          : new Date(m.createdAt as string).toISOString(),
    })
  );

  let lastMessage: Thread["lastMessage"];
  if (messages.length > 0) {
    const last = messages[messages.length - 1]!;
    lastMessage = {
      body: last.body,
      createdAt: last.createdAt,
      senderId: last.senderId,
    };
  } else if (summary.lastMessage) {
    lastMessage = {
      body: summary.lastMessage.body,
      createdAt: iso(summary.lastMessage.createdAt),
      senderId: String(summary.lastMessage.senderId),
    };
  } else {
    lastMessage = {
      body: "",
      createdAt: new Date().toISOString(),
      senderId: me.id,
    };
  }

  return {
    id: conversationId,
    participants: [me, other],
    lastMessage,
    unreadCount: 0,
    messages,
  };
}

export async function sendChatMessage(
  conversationId: string,
  currentUserId: string,
  body: string
): Promise<void> {
  const res = await fetch(
    `${CHAT_BASE}/conversations/${conversationId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Id": currentUserId,
      },
      body: JSON.stringify({ body }),
    }
  );
  if (!res.ok) throw new Error("Send failed");
}
