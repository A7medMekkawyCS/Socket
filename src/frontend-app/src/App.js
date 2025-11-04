import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

function App() {
  const [joined, setJoined] = useState(false);
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("عام");
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [notif, setNotif] = useState("");
  const [typing, setTyping] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!joined) return;
    socket.emit('join', { name: username, toRoom: room });
    socket.on('allMessages', (msgs) => {
      setMessages(msgs.map(m => `👤 ${m.sender || '??'}: ${m.body}`));
    });
    socket.on('message', (msg) => {
      setMessages(prev => [...prev, `👤 ${msg.sender || '??'}: ${msg.body}`]);
    });
    socket.on('notif', (txt) => setNotif(txt));
    socket.on('typing', ({ username: u, typing }) => {
      setTyping(typing ? `${u} يكتب...` : "");
    });
    return () => {
      socket.off('allMessages');
      socket.off('message');
      socket.off('notif');
      socket.off('typing');
    };
  }, [joined, username, room]);

  useEffect(() => {
    if (messagesEndRef.current)
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function sendMessage(e) {
    e.preventDefault();
    if (!message.trim()) return;
    socket.emit('message', message);
    setMessage("");
    socket.emit('typing', false);
  }

  function handleTyping(e) {
    setMessage(e.target.value);
    socket.emit('typing', !!e.target.value);
  }

  if (!joined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-950 direction-rtl">
        <form onSubmit={e=>{e.preventDefault(); if(username.trim()) setJoined(true);}} className="bg-white/10 rounded-2xl shadow-2xl flex flex-col gap-5 p-8 min-w-[320px] w-full max-w-sm">
          <h2 className="text-center text-cyan-400 text-2xl font-bold">🔑 دخول الشات</h2>
          <input placeholder="اسم المستخدم" value={username} onChange={e=>setUsername(e.target.value)} className="p-3 rounded-lg border-none text-lg focus:ring-2 focus:ring-cyan-400" required />
          <input placeholder="الغرفة (اختياري: عام/أصدقاء/عمل)" value={room} onChange={e=>setRoom(e.target.value)} className="p-3 rounded-lg border-none text-lg focus:ring-2 focus:ring-cyan-400" />
          <button type="submit" className="py-3 bg-cyan-400 text-black font-bold rounded-lg hover:bg-cyan-300 text-lg ">ادخل</button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen direction-rtl bg-blue-950">
      <div className="w-full max-w-md bg-white/10 rounded-2xl p-5 shadow-2xl flex flex-col min-h-[420px]">
        <h2 className="text-center text-cyan-400 text-2xl font-bold mb-1">غرفة: <span className="text-yellow-400">{room}</span></h2>
        <div className="font-bold text-yellow-100 mb-2 h-6 flex items-center">{notif}</div>
        <div className="flex-1 overflow-y-auto bg-black/10 rounded-lg mb-3 p-3 min-h-[240px]">
          {messages.map((m, i) => (
            <div key={i} className="mb-1.5 bg-white/20 rounded-lg p-2 text-base">{m}</div>
          ))}
          <div ref={messagesEndRef}></div>
        </div>
        <div className="h-4 text-yellow-400 text-right mb-1 text-sm">{typing}</div>
        <form onSubmit={sendMessage} className="flex gap-2 mt-2">
          <input placeholder="اكتب رسالتك..." value={message} onChange={handleTyping} className="flex-1 p-3 rounded-lg border-none outline-none text-base focus:ring-2 focus:ring-cyan-400" />
          <button type="submit" className="px-4 py-2 bg-cyan-400 text-black font-bold rounded-lg hover:bg-cyan-300">إرسال</button>
        </form>
      </div>
    </div>
  );
}

export default App;
