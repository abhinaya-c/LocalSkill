import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  bookingId?: string | null;
  content: string;
  createdAt: string;
}

interface ChatState {
  socket: Socket | null;
  activeConversationPartnerId: string | null;
  messages: Message[];
  unreadCount: number;
  isWidgetOpen: boolean;
  connectSocket: (userId: string) => void;
  disconnectSocket: () => void;
  setActivePartner: (partnerId: string | null) => void;
  addMessage: (msg: Message) => void;
  setMessages: (msgs: Message[]) => void;
  setWidgetOpen: (isOpen: boolean) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  socket: null,
  activeConversationPartnerId: null,
  messages: [],
  unreadCount: 0,
  isWidgetOpen: false,

  connectSocket: (userId: string) => {
    // Prevent duplicate connections
    if (get().socket) return;

    const socketUrl = window.location.origin === 'http://localhost:5173'
      ? 'http://localhost:5000'
      : window.location.origin;

    const socket = io(socketUrl, {
      auth: { token: userId },
      query: { userId },
    });

    socket.on('connect', () => {
      console.log('Realtime chat socket connected. Registered rooms for:', userId);
    });

    socket.on('receive_message', (msg: Message) => {
      // If the message is from our active partner, add it to the message feed
      if (
        get().activeConversationPartnerId === msg.senderId ||
        get().activeConversationPartnerId === msg.receiverId
      ) {
        get().addMessage(msg);
      } else {
        // Increment unread count
        set((state) => ({ unreadCount: state.unreadCount + 1 }));
      }
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  setActivePartner: (partnerId) => {
    set({ activeConversationPartnerId: partnerId });
  },

  addMessage: (msg) => {
    set((state) => ({
      messages: [...state.messages, msg],
    }));
  },

  setMessages: (messages) => {
    set({ messages });
  },

  setWidgetOpen: (isOpen) => {
    set({ isWidgetOpen: isOpen });
  },
}));
