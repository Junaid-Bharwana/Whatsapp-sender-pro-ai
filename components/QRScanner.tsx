
import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { io } from 'socket.io-client';

interface QRScannerProps {
  onConnected: () => void;
  onCancel: () => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onConnected, onCancel }) => {
  const [qrValue, setQrValue] = useState<string>('');
  const [connectionState, setConnectionState] = useState<'starting' | 'qr' | 'linking' | 'error'>('starting');
  const [serverUrl, setServerUrl] = useState<string>(`http://${window.location.hostname}:3001`);

  useEffect(() => {
    // Connect to the Baileys Backend
    const socket = io(serverUrl);

    socket.on('connect', () => {
      console.log('Connected to backend');
      setConnectionState('starting');
    });

    socket.on('qr', (qr: string) => {
      console.log('Received real QR from Baileys');
      setQrValue(qr);
      setConnectionState('qr');
    });

    socket.on('status', (status: string) => {
      if (status === 'connected') {
        setConnectionState('linking');
        setTimeout(onConnected, 2000);
      }
    });

    socket.on('connect_error', () => {
      setConnectionState('error');
    });

    return () => {
      socket.disconnect();
    };
  }, [onConnected, serverUrl]);

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Info */}
        <div className="p-8 md:w-1/2 bg-slate-50 border-r border-slate-100">
          <button onClick={onCancel} className="mb-8 text-slate-400 hover:text-slate-600 flex items-center gap-2 text-sm font-medium transition-colors">
            <i className="fa-solid fa-arrow-left"></i> Close
          </button>
          
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Real Baileys Link</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 font-bold">1</div>
              <p className="text-sm text-slate-600">Open <strong>WhatsApp</strong></p>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 font-bold">2</div>
              <p className="text-sm text-slate-600">Go to <strong>Linked Devices</strong></p>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 font-bold">3</div>
              <p className="text-sm text-slate-600">Scan this code</p>
            </div>
          </div>
          
          <div className="mt-8">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Backend Server URL</label>
            <input 
              type="text" 
              value={serverUrl} 
              onChange={(e) => setServerUrl(e.target.value)}
              className="w-full text-xs p-2 bg-white border border-slate-200 rounded mt-1"
            />
          </div>
        </div>

        {/* Right Side: QR Code Area */}
        <div className="p-8 md:w-1/2 flex flex-col items-center justify-center relative bg-white min-h-[350px]">
          {connectionState === 'starting' && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-slate-100 border-t-emerald-500 rounded-full animate-spin"></div>
              <p className="text-slate-400 font-medium animate-pulse text-sm">Connecting to Socket...</p>
            </div>
          )}

          {connectionState === 'qr' && (
            <div className="flex flex-col items-center">
              <div className="relative p-6 bg-white rounded-2xl shadow-xl border border-slate-100">
                <div className="scanner-line"></div>
                <QRCodeCanvas 
                  value={qrValue} 
                  size={200}
                  level="H"
                  includeMargin={true}
                  imageSettings={{
                    src: "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg",
                    height: 30,
                    width: 30,
                    excavate: true,
                  }}
                />
              </div>
              <p className="mt-6 text-emerald-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <i className="fa-solid fa-signal animate-pulse"></i>
                Live QR Streaming
              </p>
            </div>
          )}

          {connectionState === 'linking' && (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white text-3xl shadow-lg animate-bounce">
                <i className="fa-solid fa-check"></i>
              </div>
              <h3 className="text-lg font-bold text-slate-800">Success!</h3>
              <p className="text-sm text-slate-500">Handshake complete.</p>
            </div>
          )}

          {connectionState === 'error' && (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 text-3xl">
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <h3 className="text-lg font-bold text-slate-800">Offline</h3>
              <p className="text-xs text-slate-500">Could not reach Baileys server at {serverUrl}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
