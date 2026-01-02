
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ConnectionStatus, Message, DashboardStats } from './types.ts';
import { SAMPLE_CONTACTS } from './constants.tsx';
import QRScanner from './components/QRScanner.tsx';
import MessageComposer from './components/MessageComposer.tsx';

const App: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showQR, setShowQR] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalSent: 0,
    pending: 0,
    failed: 0,
    activeSessions: 0
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  // Default to port 3001 for backend communication
  const BACKEND_URL = `http://${window.location.hostname}:3001`;

  const handleConnect = () => {
    setShowQR(true);
  };

  const onQRConnected = useCallback(() => {
    setStatus(ConnectionStatus.CONNECTED);
    setShowQR(false);
    setStats(prev => ({ ...prev, activeSessions: 1 }));
  }, []);

  const handleSendMessage = useCallback(async (recipient: string, content: string) => {
    const recipients = recipient.split(',').map(r => r.trim()).filter(r => r.length > 0);
    
    for (const num of recipients) {
      const msgId = Math.random().toString(36).substr(2, 9);
      const newMessage: Message = {
        id: msgId,
        recipient: num,
        content,
        status: 'pending',
        timestamp: new Date()
      };

      setMessages(prev => [newMessage, ...prev]);
      setStats(prev => ({ ...prev, pending: prev.pending + 1 }));

      try {
        const response = await fetch(`${BACKEND_URL}/send-message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ number: num, message: content })
        });

        const data = await response.json();
        
        if (data.success) {
          setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status: 'sent' } : m));
          setStats(prev => ({ 
            ...prev, 
            pending: Math.max(0, prev.pending - 1),
            totalSent: prev.totalSent + 1 
          }));
        } else {
          throw new Error(data.error || 'Unknown error from backend');
        }
      } catch (err) {
        console.error('Send message failed:', err);
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, status: 'failed' } : m));
        setStats(prev => ({ 
          ...prev, 
          pending: Math.max(0, prev.pending - 1),
          failed: prev.failed + 1 
        }));
      }
    }
  }, [BACKEND_URL]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-80 bg-white border-r border-slate-200 flex flex-col sticky top-0 md:h-screen z-40">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
            <i className="fa-brands fa-whatsapp text-white text-2xl"></i>
          </div>
          <div>
            <h1 className="font-bold text-slate-800 tracking-tight">Baileys API</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Enterprise v4.5</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/30">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 overflow-hidden">
                    {status === ConnectionStatus.CONNECTED ? (
                        <img src="https://ui-avatars.com/api/?name=WA+User&background=25D366&color=fff" alt="Profile" />
                    ) : (
                        <i className="fa-solid fa-user text-xl"></i>
                    )}
                </div>
                <div>
                    <p className="font-bold text-sm text-slate-800">{status === ConnectionStatus.CONNECTED ? 'Active User' : 'Guest Account'}</p>
                    <p className="text-[10px] text-slate-400">{status === ConnectionStatus.CONNECTED ? 'Linked' : 'Not Linked'}</p>
                </div>
             </div>
             <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
               status === ConnectionStatus.CONNECTED ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
             }`}>
               {status === ConnectionStatus.CONNECTED ? '● Connected' : 'Disconnected'}
             </span>
          </div>

          <p className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-6">Recent Activity</p>
          {SAMPLE_CONTACTS.map((contact) => (
            <div key={contact.id} className="group p-3 rounded-xl hover:bg-white hover:shadow-sm cursor-pointer transition-all">
              <p className="font-semibold text-sm text-slate-700">{contact.name}</p>
              <p className="text-xs text-slate-500 truncate">{contact.lastMessage}</p>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 space-y-6 overflow-y-auto max-h-screen">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Messaging Dashboard</h2>
            <p className="text-slate-500 text-sm">Real Baileys v4 Multi-Device Hub</p>
          </div>
          <button 
            onClick={handleConnect}
            disabled={status === ConnectionStatus.CONNECTED}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-all flex items-center gap-2 ${
              status === ConnectionStatus.CONNECTED ? 'bg-white text-slate-400 border border-slate-200' : 'bg-emerald-500 text-white hover:bg-emerald-600'
            }`}
          >
            <i className="fa-solid fa-qrcode"></i> 
            {status === ConnectionStatus.CONNECTED ? 'Active Session' : 'Scan to Connect'}
          </button>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-slate-400 text-xs font-bold uppercase mb-1">Sent</p>
            <p className="text-3xl font-black text-slate-800">{stats.totalSent}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-slate-400 text-xs font-bold uppercase mb-1">Queue</p>
            <p className="text-3xl font-black text-slate-800">{stats.pending}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-slate-400 text-xs font-bold uppercase mb-1">Failed</p>
            <p className="text-3xl font-black text-slate-800">{stats.failed}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-slate-400 text-xs font-bold uppercase mb-1">Uptime</p>
            <p className="text-3xl font-black text-emerald-500">{status === ConnectionStatus.CONNECTED ? 'LIVE' : 'OFF'}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <MessageComposer onSend={handleSendMessage} isConnecting={status !== ConnectionStatus.CONNECTED} />
            
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Transaction Logs</h3>
                </div>
                <div ref={scrollRef} className="max-h-[400px] overflow-y-auto divide-y divide-slate-100">
                    {messages.map((msg) => (
                        <div key={msg.id} className="p-4 flex items-center justify-between">
                            <div className="flex gap-4">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                                    msg.status === 'sent' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                }`}>
                                    {msg.status === 'sent' ? 'OK' : '...'}
                                </div>
                                <div>
                                    <p className="font-bold text-sm">{msg.recipient}</p>
                                    <p className="text-xs text-slate-400 truncate max-w-xs">{msg.content}</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">{msg.status.toUpperCase()}</span>
                        </div>
                    ))}
                    {messages.length === 0 && (
                        <div className="p-10 text-center text-slate-400 text-sm italic">
                            No logs yet...
                        </div>
                    )}
                </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-3xl text-white">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-server text-emerald-500"></i> Server Info
                </h4>
                <div className="text-[10px] font-mono space-y-2 opacity-80">
                    <p>STATUS: {status}</p>
                    <p>ENDPOINT: {BACKEND_URL}</p>
                    <p>ENGINE: @whiskeysockets/baileys</p>
                </div>
            </div>
          </div>
        </div>
      </main>

      {showQR && (
        <QRScanner 
          onConnected={onQRConnected} 
          onCancel={() => setShowQR(false)} 
        />
      )}
    </div>
  );
};

export default App;
