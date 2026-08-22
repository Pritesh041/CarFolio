import { Client, type IMessage } from "@stomp/stompjs";
import { API_BASE_URL, tokenStore } from "./api";

const WS_URL = API_BASE_URL.replace(/^http/, "ws").replace(/\/api\/v1\/?$/, "") + "/ws";

let client: Client | null = null;
let isReady = false;
let readyResolvers: Array<() => void> = [];

function markReady() {
  isReady = true;
  readyResolvers.forEach((resolve) => resolve());
  readyResolvers = [];
}

function whenReady(): Promise<void> {
  if (isReady && client?.connected) return Promise.resolve();
  return new Promise((resolve) => readyResolvers.push(resolve));
}

export function connectChat() {
  const token = tokenStore.getAccessToken();
  if (!token || client) return;

  isReady = false;
  client = new Client({
    brokerURL: WS_URL,
    connectHeaders: { Authorization: `Bearer ${token}` },
    reconnectDelay: 3000,
  });
  client.onConnect = () => markReady();
  client.activate();
}

export function disconnectChat() {
  client?.deactivate();
  client = null;
  isReady = false;
  readyResolvers = [];
}

export async function subscribeToConversation(conversationId: string, onMessage: (raw: unknown) => void) {
  await whenReady();
  const sub = client!.subscribe(`/topic/conversations/${conversationId}`, (frame: IMessage) => {
    onMessage(JSON.parse(frame.body));
  });
  return () => sub.unsubscribe();
}

export async function subscribeToInbox(onPing: (raw: unknown) => void) {
  await whenReady();
  const sub = client!.subscribe("/user/queue/inbox", (frame: IMessage) => {
    onPing(JSON.parse(frame.body));
  });
  return () => sub.unsubscribe();
}

export async function subscribeToNotifications(onNotification: (raw: unknown) => void) {
  await whenReady();
  const sub = client!.subscribe("/user/queue/notifications", (frame: IMessage) => {
    onNotification(JSON.parse(frame.body));
  });
  return () => sub.unsubscribe();
}

export async function publishMessage(conversationId: string, content: string) {
  await whenReady();
  client!.publish({
    destination: `/app/conversations/${conversationId}/messages`,
    body: JSON.stringify({ content }),
  });
}
