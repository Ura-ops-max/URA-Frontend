import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { assistantChatFn } from '@/lib/api';

type Message = { from: 'bot' | 'user'; text: string; time: string };

const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const GREETING: Message = {
  from: 'bot',
  text: 'Hello! I am the Ura assistant. How can I help you today? You can ask about accounts, payments, buyer protection, selling, and more.',
  time: now(),
};

// ─── Knowledge base ───
// Each intent matches on keywords and returns a helpful answer.
const KB: { keywords: string[]; answer: string }[] = [
  {
    keywords: ['account', 'sign up', 'register', 'create'],
    answer:
      'To create an account, click "Get Started" or "Join Now", fill in your details, and verify your email. It only takes a minute!',
  },
  {
    keywords: ['login', 'sign in', 'password', 'forgot', 'reset'],
    answer:
      'You can sign in from the login page. Forgot your password? Use the "Forgot Password?" link and we\'ll email you a reset link.',
  },
  {
    keywords: ['pay', 'payment', 'checkout', 'card', 'transfer'],
    answer:
      'Payments are handled securely through our partner Payluk. You can pay instantly or use Buyer-Protected Payment so your money is only released once you confirm your order.',
  },
  {
    keywords: ['escrow', 'protect', 'buyer protection'],
    answer:
      'Buyer-Protected Payment holds your payment safely until you confirm you received your order as described — protecting both buyers and sellers from fraud.',
  },
  {
    keywords: ['wallet', 'fund', 'balance', 'deposit', 'top up', 'top-up'],
    answer:
      'Open your Wallet and click "Fund Wallet". A one-time virtual bank account is generated for you — transfer any amount and your balance updates once confirmed.',
  },
  {
    keywords: ['sell', 'seller', 'business', 'list', 'product', 'convert'],
    answer:
      'To start selling, go to Settings and choose "Convert to Business". You can then list products and receive payments directly to your wallet.',
  },
  {
    keywords: ['verify', 'verification', 'email not verified'],
    answer:
      'Business verification and email verification build trust. Check your inbox for the verification link, or resend it from the banner at the top of your dashboard.',
  },
  {
    keywords: ['delivery', 'shipping', 'deliver', 'ship'],
    answer:
      'Delivery is arranged with the seller — many offer fast local delivery right within your community. You can add shipping details at checkout.',
  },
  {
    keywords: ['refund', 'dispute', 'problem', 'not received'],
    answer:
      'If something goes wrong with a buyer-protected order, you can open a dispute from your Wallet under "Respond to Dispute". Our team helps resolve it fairly.',
  },
  {
    keywords: ['safe', 'secure', 'privacy', 'data'],
    answer:
      'Your data is encrypted and never sold. See our Privacy Policy for full details on how we handle your information.',
  },
];

const CONTACT_KEYS = ['human', 'agent', 'support', 'contact', 'talk to', 'representative'];

function getBotResponse(text: string): { text: string; navigateTo?: string } {
  const q = text.toLowerCase();

  if (/(^|\b)(hi|hello|hey|good (morning|afternoon|evening))\b/.test(q)) {
    return { text: 'Hi there! 👋 What can I help you with — accounts, payments, selling, or something else?' };
  }
  if (/(thank|thanks|cheers)/.test(q)) {
    return { text: "You're welcome! Is there anything else I can help you with?" };
  }
  if (CONTACT_KEYS.some((k) => q.includes(k))) {
    return {
      text: 'Sure you can reach our team via the Contact page or email info@ura.com.ng. Opening the contact page for you now.',
      navigateTo: '/contact',
    };
  }

  const match = KB.find((entry) => entry.keywords.some((k) => q.includes(k)));
  if (match) return { text: match.answer };

  return {
    text:
      "I'm not fully sure about that one. You can check our FAQ for detailed answers, or reach our team via the Contact page and we'll be happy to help.",
  };
}

const quickReplies = [
  'How do I create an account?',
  'Payment issues',
  'Business verification',
  'How does buyer protection work?',
  'Contact human agent',
];

const ChatBot: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text?: string) => {
    const messageText = (text ?? input).trim();
    if (!messageText || isTyping) return;

    // Build the conversation history for the AI (before adding the new turn).
    const history = messages.map((m) => ({
      role: m.from === 'user' ? ('user' as const) : ('assistant' as const),
      content: m.text,
    }));
    history.push({ role: 'user', content: messageText });

    setMessages((prev) => [...prev, { from: 'user', text: messageText, time: now() }]);
    setInput('');
    setIsTyping(true);

    try {
      // Ask the AI assistant (Claude, via our backend).
      const reply = await assistantChatFn(history);
      setMessages((prev) => [...prev, { from: 'bot', text: reply, time: now() }]);
    } catch {
      // Fall back to the built-in rule-based answers if the AI is unavailable.
      const { text: reply, navigateTo } = getBotResponse(messageText);
      setMessages((prev) => [...prev, { from: 'bot', text: reply, time: now() }]);
      if (navigateTo) window.setTimeout(() => navigate(navigateTo), 800);
    } finally {
      setIsTyping(false);
    }
  };

  const resetChat = () => {
    setMessages([{ ...GREETING, time: now() }]);
    setIsTyping(false);
  };

  if (!isOpen)
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-orange-500 p-4 text-white shadow-lg transition hover:bg-orange-600"
        aria-label="Open chat"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 overflow-hidden rounded-xl border border-orange-100 bg-white shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between bg-orange-500 px-4 py-3 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white font-semibold text-orange-500">
            UA
          </div>
          <div>
            <p className="font-medium">Ura Assistant</p>
            <p className="text-xs text-green-200">Online</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={resetChat} className="transition hover:opacity-80" aria-label="Restart chat">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button onClick={() => setIsOpen(false)} className="transition hover:opacity-80" aria-label="Close chat">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div ref={scrollRef} className="h-80 space-y-4 overflow-y-auto bg-gray-50 p-4">
        {messages.map((msg, i) => (
          <div key={i} className={cn('flex flex-col', msg.from === 'user' && 'items-end')}>
            <div
              className={cn(
                'max-w-[80%] rounded-lg px-4 py-2 text-sm',
                msg.from === 'bot' ? 'bg-gray-200 text-gray-800' : 'bg-orange-500 text-white',
              )}
            >
              {msg.text}
            </div>
            <span className="mt-1 text-xs text-gray-400">{msg.time}</span>
          </div>
        ))}

        {isTyping && (
          <div className="flex w-fit items-center gap-1 rounded-lg bg-gray-200 px-4 py-3">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500" />
          </div>
        )}

        {/* Quick replies — only before the user has asked anything */}
        {messages.length <= 1 && !isTyping && (
          <div className="flex flex-wrap gap-2 pt-2">
            {quickReplies.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="rounded-full border border-orange-400 px-3 py-1 text-xs text-orange-500 transition hover:bg-orange-50"
              >
                {q}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 border-t border-gray-200 p-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') sendMessage();
          }}
          placeholder="Ask anything..."
          className="flex-1 border-none bg-orange-50 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <button
          onClick={() => sendMessage()}
          className="text-orange-500 transition hover:text-orange-600 disabled:opacity-40"
          disabled={isTyping}
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatBot;
