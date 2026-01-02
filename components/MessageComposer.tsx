
import React, { useState } from 'react';
import { generateWhatsAppMessage } from '../services/geminiService.ts';

interface MessageComposerProps {
  onSend: (recipient: string, message: string) => void;
  isConnecting: boolean;
}

const MessageComposer: React.FC<MessageComposerProps> = ({ onSend, isConnecting }) => {
  const [recipient, setRecipient] = useState('');
  const [content, setContent] = useState('');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [tone, setTone] = useState<'professional' | 'casual' | 'urgent'>('professional');

  const handleAICompose = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    const result = await generateWhatsAppMessage(prompt, tone);
    setContent(result);
    setIsGenerating(false);
  };

  const handleSend = () => {
    if (!recipient || !content) return;
    onSend(recipient, content);
    setContent('');
    setPrompt('');
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <i className="fa-solid fa-pen-nib"></i>
            </div>
            <h3 className="text-lg font-bold text-slate-800">Draft Campaign</h3>
        </div>
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
            {(['professional', 'casual', 'urgent'] as const).map((t) => (
                <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                        tone === t 
                        ? 'bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                    {t}
                </button>
            ))}
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
            <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Target Numbers</label>
                <textarea
                    placeholder="+123456789, +987654321..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all resize-none text-sm font-medium"
                    value={recipient}
                    rows={1}
                    onChange={(e) => setRecipient(e.target.value)}
                ></textarea>
                <p className="text-[10px] text-slate-400 mt-2 italic flex items-center gap-1">
                    <i className="fa-solid fa-info-circle"></i>
                    Separate multiple numbers with commas for bulk delivery
                </p>
            </div>

            <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">AI Smart Compose</label>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Tell AI what to write..."
                        className="w-full pl-4 pr-24 py-3 bg-emerald-50/30 border border-emerald-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all text-sm font-medium"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAICompose()}
                    />
                    <button
                        onClick={handleAICompose}
                        disabled={isGenerating || !prompt}
                        className="absolute right-2 top-2 px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-emerald-200 flex items-center gap-2"
                    >
                        {isGenerating ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-wand-sparkles"></i>}
                        {isGenerating ? 'Drafting' : 'Gen'}
                    </button>
                </div>
            </div>
        </div>

        <div className="relative">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Message Content</label>
          <textarea
            rows={5}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all resize-none text-slate-700 leading-relaxed font-medium"
            placeholder="Payload data..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          ></textarea>
          <div className="absolute bottom-4 right-4 text-[10px] font-bold text-slate-300">
            {content.length} characters
          </div>
        </div>

        <button
          onClick={handleSend}
          disabled={isConnecting || !recipient || !content}
          className="group w-full relative h-16 bg-slate-900 rounded-3xl overflow-hidden hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:scale-100 disabled:bg-slate-300"
        >
          <div className="absolute inset-0 bg-emerald-500 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
          <div className="relative h-full flex items-center justify-center gap-3 text-white">
            <i className={`fa-brands fa-whatsapp text-2xl ${isConnecting ? 'animate-pulse' : 'group-hover:rotate-12 transition-transform'}`}></i>
            <span className="text-lg font-black tracking-tight uppercase">
                {isConnecting ? 'Authenticating Bridge...' : 'Fire Outbound Message'}
            </span>
            <i className="fa-solid fa-chevron-right text-xs opacity-50 group-hover:translate-x-2 transition-transform"></i>
          </div>
        </button>
      </div>
    </div>
  );
};

export default MessageComposer;
