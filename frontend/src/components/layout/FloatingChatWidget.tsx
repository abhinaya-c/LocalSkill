import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Send, Maximize2 } from 'lucide-react';
import { useChatStore } from '../../store/useChatStore';
import { useAuthStore } from '../../store/useAuthStore';
import { apiFetch } from '../../api/client';
import { Button } from '../ui/Button';

export const FloatingChatWidget: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const {
    activeConversationPartnerId,
    messages,
    isWidgetOpen,
    socket,
    addMessage,
    setMessages,
    setWidgetOpen
  } = useChatStore();

  const [partnerDetails, setPartnerDetails] = useState<any>(null);
  const [typedMessage, setTypedMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch partner details and conversation history
  useEffect(() => {
    if (!isWidgetOpen || !activeConversationPartnerId) return;

    const loadWidgetData = async () => {
      setIsLoading(true);
      try {
        // Try resolving provider details first
        try {
          const profile = await apiFetch<any>(`/api/profiles/provider/${activeConversationPartnerId}`);
          setPartnerDetails({
            name: profile.user.name,
            avatarUrl: profile.user.avatarUrl,
          });
        } catch {
          // Fallback to generic user details
          const u = await apiFetch<any>(`/api/profiles/user/${activeConversationPartnerId}`);
          setPartnerDetails({
            name: u.name,
            avatarUrl: u.avatarUrl,
          });
        }

        // Fetch conversation history
        const history = await apiFetch<any[]>(`/api/chat/history/${activeConversationPartnerId}`);
        setMessages(history);
      } catch (err) {
        console.error('Failed to load widget conversation:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadWidgetData();
  }, [activeConversationPartnerId, isWidgetOpen]);

  // Auto-scroll to the bottom of message list
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isWidgetOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeConversationPartnerId) return;

    try {
      const payload = {
        receiverId: activeConversationPartnerId,
        content: typedMessage,
      };

      const newMsg = await apiFetch<any>('/api/chat/message', {
        method: 'POST',
        json: payload,
      });

      if (socket) {
        socket.emit('send_message', newMsg);
      }

      addMessage(newMsg);
      setTypedMessage('');
    } catch (err) {
      console.error('Failed to send message via widget:', err);
    }
  };

  const handleMaximize = () => {
    setWidgetOpen(false);
    navigate(`/chat?partnerId=${activeConversationPartnerId}`);
  };

  if (!isWidgetOpen || !activeConversationPartnerId) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 h-96 bg-slate-950/95 border border-gold-royal/45 rounded-2xl shadow-2xl flex flex-col overflow-hidden glass-royal">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-900/60 border-b border-gold-royal/35 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative">
            <img
              src={partnerDetails?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
              alt={partnerDetails?.name || 'User'}
              className="h-7 w-7 rounded-full object-cover border border-gold-royal"
            />
            <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 border border-slate-950 rounded-full" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-200 truncate">{partnerDetails?.name || 'Loading...'}</p>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Online</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleMaximize}
            className="p-1 text-slate-400 hover:text-white transition-colors"
            title="Open in Full Chat"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setWidgetOpen(false)}
            className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
            title="Close Chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {isLoading ? (
          <div className="flex-grow flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-indigo-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-grow flex items-center justify-center text-center text-slate-500 text-[10px] px-4">
            Start the conversation! Type a message below.
          </div>
        ) : (
          messages.map((m) => {
            const isSentByMe = m.senderId === currentUser?.id;
            return (
              <div key={m.id} className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-xl px-3 py-2 text-[11px] shadow-sm leading-normal ${
                    isSentByMe
                      ? 'bg-indigo-650 text-white rounded-br-none shadow-indigo-600/10'
                      : 'bg-slate-800 text-slate-200 rounded-bl-none'
                  }`}
                >
                  <p>{m.content}</p>
                  <span className="text-[8px] text-slate-400 block mt-1 text-right font-medium">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-900 bg-slate-900/25 flex gap-2">
        <input
          type="text"
          placeholder="Type message..."
          value={typedMessage}
          onChange={(e) => setTypedMessage(e.target.value)}
          className="flex-grow bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
        <Button type="submit" size="sm" className="px-3 h-auto py-1.5">
          <Send className="h-3 w-3" />
        </Button>
      </form>
    </div>
  );
};
