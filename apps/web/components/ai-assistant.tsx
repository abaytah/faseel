'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2, BookOpen, Sparkles } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { cn } from '@/lib/cn';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  source?: string | null;
  relatedQuestions?: string[];
  timestamp: Date;
}

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const askMutation = trpc.assistant.ask.useMutation({
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: (data) => {
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.answer,
        source: data.source,
        relatedQuestions: data.relatedQuestions,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    },
    onError: () => {
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'حدث خطأ أثناء معالجة سؤالك. يرجى المحاولة مرة أخرى.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsTyping(false);
    },
  });

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  function handleSend() {
    const question = input.trim();
    if (!question || askMutation.isPending) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Detect language from input
    const isArabic = /[\u0600-\u06FF]/.test(question);
    askMutation.mutate({ question, language: isArabic ? 'ar' : 'en' });
  }

  function handleSuggestionClick(question: string) {
    setInput(question);
    const isArabic = /[\u0600-\u06FF]/.test(question);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    askMutation.mutate({ question, language: isArabic ? 'ar' : 'en' });
    setInput('');
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const welcomeSuggestions = [
    'من يدفع تكاليف السباكة؟',
    'هل يمكن زيادة الإيجار أثناء العقد؟',
    'ما هي غرامات عدم التسجيل في إيجار؟',
    'من المسؤول عن صيانة التكييف؟',
  ];

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 start-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all',
          'from-brand-500 to-brand-600 hover:shadow-brand-500/25 bg-gradient-to-br text-white hover:shadow-xl',
          isOpen && 'pointer-events-none opacity-0',
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="فتح المساعد الذكي"
      >
        <MessageCircle className="h-6 w-6" />
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 start-6 z-50 flex h-[520px] w-[380px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl sm:h-[560px] dark:border-gray-700 dark:bg-gray-900"
          >
            {/* Header */}
            <div className="from-brand-500 to-brand-600 flex items-center justify-between border-b border-gray-100 bg-gradient-to-l px-4 py-3 dark:border-gray-700">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">مساعد فسيل</h3>
                  <p className="text-[10px] text-white/70">مساعدك في الأنظمة العقارية</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center">
                  <div className="bg-brand-50 dark:bg-brand-900/20 mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
                    <Bot className="text-brand-500 h-8 w-8" />
                  </div>
                  <p className="mb-1 text-center text-sm font-bold text-gray-900 dark:text-gray-100">
                    مرحباً! أنا مساعد فسيل الذكي
                  </p>
                  <p className="mb-5 text-center text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                    اسألني عن إدارة العقارات، حقوق المستأجرين والملاك، والأنظمة السعودية
                  </p>
                  <div className="grid w-full grid-cols-1 gap-2">
                    {welcomeSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 dark:hover:border-brand-700 dark:hover:bg-brand-900/20 dark:hover:text-brand-400 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-start text-xs text-gray-700 transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex gap-2',
                        msg.role === 'user' ? 'flex-row-reverse' : 'flex-row',
                      )}
                    >
                      {/* Avatar */}
                      <div
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                          msg.role === 'user'
                            ? 'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400'
                            : 'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400',
                        )}
                      >
                        {msg.role === 'user' ? (
                          <User className="h-3.5 w-3.5" />
                        ) : (
                          <Bot className="h-3.5 w-3.5" />
                        )}
                      </div>

                      {/* Message Bubble */}
                      <div
                        className={cn(
                          'max-w-[80%] rounded-2xl px-3.5 py-2.5',
                          msg.role === 'user'
                            ? 'bg-brand-500 text-white'
                            : 'border border-gray-100 bg-gray-50 text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200',
                        )}
                      >
                        <p className="text-xs leading-relaxed">{msg.content}</p>

                        {/* Source Citation */}
                        {msg.source && (
                          <div className="mt-2 flex items-center gap-1 border-t border-gray-200/50 pt-1.5 dark:border-gray-600/50">
                            <BookOpen className="text-brand-500 h-3 w-3" />
                            <span className="text-brand-600 dark:text-brand-400 text-[10px]">
                              المصدر: {msg.source}
                            </span>
                          </div>
                        )}

                        {/* Related Questions */}
                        {msg.relatedQuestions && msg.relatedQuestions.length > 0 && (
                          <div className="mt-2 space-y-1 border-t border-gray-200/50 pt-2 dark:border-gray-600/50">
                            <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
                              أسئلة ذات صلة:
                            </p>
                            {msg.relatedQuestions.map((q, i) => (
                              <button
                                key={i}
                                onClick={() => handleSuggestionClick(q)}
                                className="text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-900/20 block w-full rounded-lg bg-white/50 px-2 py-1 text-start text-[10px] transition-colors dark:bg-gray-700/50"
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex gap-2">
                      <div className="bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg">
                        <Bot className="h-3.5 w-3.5" />
                      </div>
                      <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex gap-1">
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-100 bg-white px-3 py-3 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 pe-2 ps-3 dark:border-gray-700 dark:bg-gray-800">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="اكتب سؤالك هنا..."
                  className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  disabled={askMutation.isPending}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || askMutation.isPending}
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all',
                    input.trim()
                      ? 'bg-brand-500 hover:bg-brand-600 text-white'
                      : 'text-gray-300 dark:text-gray-600',
                  )}
                >
                  {askMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
