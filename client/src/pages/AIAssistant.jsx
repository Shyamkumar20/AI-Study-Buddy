import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { materialService } from "../services/materialService";
import {
  MessageSquare,
  Sparkles,
  Send,
  Trash2,
  Copy,
  Check,
  BookOpen,
  User,
  Bot,
} from "lucide-react";

export const AIAssistant = () => {
  const [searchParams] = useSearchParams();
  const [materials, setMaterials] = useState([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState(
    searchParams.get("material") || ""
  );
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I am your AI Study Assistant powered by Gemini. Select a study document above, and ask me anything about it, or request practice explanations, analogies, and examples.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadMaterials = async () => {
      try {
        const mats = await materialService.getMaterials();
        setMaterials(mats || []);
        if (!selectedMaterialId && mats && mats.length > 0) {
          setSelectedMaterialId(mats[0]._id);
        }
      } catch (err) {
        console.error("Failed to load materials:", err);
      }
    };
    loadMaterials();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    if (!selectedMaterialId) {
      alert("Please upload and select a study material first so I have context to answer your questions!");
      return;
    }

    const userMsg = input.trim();
    setInput("");

    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await materialService.askMaterial(selectedMaterialId, {
        question: userMsg,
        history: newMessages.slice(-6),
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I encountered an issue processing your request: " +
            (err.response?.data?.message || err.message),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (content, index) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Conversation cleared! What else would you like to explore in your study material?",
      },
    ]);
  };

  const promptSuggestions = [
    "Explain the core concept in simple terms",
    "Give me 2 real-world examples of this",
    "What are the most common exam questions on this topic?",
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4">
      {/* Header & Material Context Selector */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              <span>AI Study Assistant</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                Gemini 3.8 Flash
              </span>
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                className="bg-transparent text-xs text-indigo-300 font-medium focus:outline-none cursor-pointer max-w-[200px] sm:max-w-xs truncate"
              >
                {materials.length === 0 ? (
                  <option value="">No materials uploaded</option>
                ) : (
                  materials.map((m) => (
                    <option key={m._id} value={m._id} className="bg-slate-900 text-white">
                      Context: {m.title}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={handleClear}
          title="Clear Conversation"
          className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-slate-800 transition-colors flex items-center gap-1.5 text-xs self-end sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-1">
                <Sparkles className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed relative group ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "bg-slate-900/90 border border-slate-800 text-slate-200"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {msg.role === "assistant" && (
                <button
                  onClick={() => handleCopy(msg.content, idx)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Copy reply"
                >
                  {copiedIndex === idx ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>

            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {promptSuggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => {
              setInput(suggestion);
            }}
            className="px-3 py-1 rounded-full text-[11px] font-medium bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 shrink-0 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="relative shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question, request an analogy, or clarify a concept..."
          className="w-full pl-5 pr-14 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm text-white placeholder-slate-500 outline-none shadow-xl"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-indigo-600/30"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
