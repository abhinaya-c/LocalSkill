import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, MessageSquare } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { apiFetch } from '../api/client';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const Chat: React.FC = () => {
  const currentUser = useAuthStore((state) => state.user);
  const { socket, messages, setMessages, addMessage, activeConversationPartnerId, setActivePartner } = useChatStore();

  const [searchParams, setSearchParams] = useSearchParams();
  const queryPartnerId = searchParams.get('partnerId');

  const [partners, setPartners] = useState<any[]>([]);
  const [partnerDetails, setPartnerDetails] = useState<any>(null);
  const [typedMessage, setTypedMessage] = useState('');
  const [isLoadingPartners, setIsLoadingPartners] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load active chat inbox partners
  const loadChatPartners = async () => {
    setIsLoadingPartners(true);
    try {
      const inboxList = await apiFetch<any[]>('/api/chat/inbox');
      
      // Map partners list
      const partnersList = inboxList.map((item) => {
        const partner = item.partner;
        return {
          id: partner.id,
          name: partner.name,
          avatarUrl: partner.avatarUrl,
          lastMsg: item.lastMessage?.content || '',
          time: item.lastMessage?.createdAt || new Date().toISOString(),
        };
      });

      // De-duplicate partner IDs
      const uniquePartners: any[] = [];
      const map = new Map();
      for (const item of partnersList) {
        if (!map.has(item.id)) {
          map.set(item.id, true);
          uniquePartners.push(item);
        }
      }

      // Check if queryPartnerId is not in uniquePartners, fetch and append
      if (queryPartnerId && !map.has(queryPartnerId)) {
        try {
          // Try to fetch as provider profile first
          const profile = await apiFetch<any>(`/api/profiles/provider/${queryPartnerId}`);
          uniquePartners.unshift({
            id: profile.user.id,
            name: profile.user.name,
            avatarUrl: profile.user.avatarUrl,
            lastMsg: 'New conversation initiated',
            time: new Date().toISOString(),
          });
        } catch {
          // Fetch as standard user
          try {
            const u = await apiFetch<any>(`/api/profiles/user/${queryPartnerId}`);
            uniquePartners.unshift({
              id: u.id,
              name: u.name,
              avatarUrl: u.avatarUrl,
              lastMsg: 'New conversation initiated',
              time: new Date().toISOString(),
            });
          } catch (err) {
            console.error('Failed to resolve conversation partner:', err);
          }
        }
      }

      setPartners(uniquePartners);

      // Select active partner
      if (queryPartnerId) {
        setActivePartner(queryPartnerId);
      } else if (uniquePartners.length > 0) {
        setActivePartner(uniquePartners[0].id);
      }

    } catch (err) {
      console.error('Failed to load chat history partners:', err);
    } finally {
      setIsLoadingPartners(false);
    }
  };

  useEffect(() => {
    loadChatPartners();
  }, [queryPartnerId]);

  // Listen for real-time incoming messages to reload the inbox list
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = () => {
      loadChatPartners();
    };

    socket.on('receive_message', handleReceiveMessage);
    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket]);

  // Fetch message thread when active partner changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeConversationPartnerId) return;
      try {
        // Find partner details in list
        const currentDetails = partners.find((p) => p.id === activeConversationPartnerId);
        if (currentDetails) {
          setPartnerDetails(currentDetails);
        }

        const data = await apiFetch<any[]>(`/api/chat/history/${activeConversationPartnerId}`);
        setMessages(data);
      } catch (err) {
        console.error('Failed to load messages thread:', err);
      }
    };

    fetchMessages();
  }, [activeConversationPartnerId, partners]);

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeConversationPartnerId) return;

    try {
      const payload = {
        receiverId: activeConversationPartnerId,
        content: typedMessage,
      };

      // 1. Post to API
      const newMsg = await apiFetch('/api/chat/message', {
        method: 'POST',
        json: payload,
      });

      // 2. Emit via socket
      if (socket) {
        socket.emit('send_message', newMsg);
      }

      // 3. Append to state
      addMessage(newMsg);
      setTypedMessage('');

    } catch (err) {
      console.error('Failed to dispatch message:', err);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 h-[82vh] flex gap-6">
      {/* Inbox list */}
      <div className="w-full md:w-80 flex flex-col gap-4 bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden p-4">
        <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-3 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-indigo-400" /> Active Inbox
        </span>

        {isLoadingPartners ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500" />
          </div>
        ) : partners.length === 0 ? (
          <div className="flex-1 flex flex-col justify-center items-center text-center p-6 text-slate-500">
            <span className="text-2xl">💬</span>
            <p className="text-xs mt-2 font-medium">Your inbox is empty.</p>
          </div>
        ) : (
          <div className="flex-grow overflow-y-auto flex flex-col gap-2">
            {partners.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setActivePartner(p.id);
                  setSearchParams({ partnerId: p.id });
                }}
                className={`flex items-start gap-3 p-3.5 rounded-lg text-left transition-all ${
                  activeConversationPartnerId === p.id
                    ? 'bg-indigo-650/15 border border-indigo-500/25'
                    : 'bg-slate-950/20 border border-transparent hover:bg-slate-850/40'
                }`}
              >
                <img
                  src={p.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                  alt={p.name}
                  className="h-9 w-9 rounded-full object-cover border border-slate-850"
                />
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-bold text-slate-200 truncate">{p.name}</p>
                  <p className="text-[10px] text-slate-400 truncate mt-1 leading-normal">
                    {p.lastMsg}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Message Feed Area */}
      <div className="flex-grow bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between">
        {activeConversationPartnerId && partnerDetails ? (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={partnerDetails.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                  alt={partnerDetails.name}
                  className="h-9 w-9 rounded-full object-cover"
                />
                <div>
                  <p className="text-xs font-bold text-slate-200">{partnerDetails.name}</p>
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Active Session
                  </span>
                </div>
              </div>
            </div>

            {/* Bubble Feeds */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
              {messages.length === 0 ? (
                <div className="text-center py-20 text-slate-500 text-xs">
                  Say hello! Start your conversation now.
                </div>
              ) : (
                messages.map((m) => {
                  const isSentByMe = m.senderId === currentUser?.id;
                  return (
                    <div
                      key={m.id}
                      className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-xl px-4 py-2.5 text-xs shadow-md leading-normal ${
                          isSentByMe
                            ? 'bg-indigo-650 text-white rounded-br-none shadow-indigo-600/10'
                            : 'bg-slate-800 text-slate-200 rounded-bl-none'
                        }`}
                      >
                        <p>{m.content}</p>
                        <span className="text-[8px] text-slate-400 block mt-1.5 text-right font-medium">
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Send Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 bg-slate-950/20 flex gap-3">
              <Input
                type="text"
                placeholder="Type your message here..."
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                className="flex-grow py-2.5"
              />
              <Button type="submit" className="px-5">
                <Send className="h-4.5 w-4.5" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500">
            <span className="text-4xl">💬</span>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mt-4">Select Conversation</h3>
            <p className="text-xs text-slate-500 mt-1 leading-normal max-w-xs">
              Pick an active contact or select 'Message Provider' from their listing bio page.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
