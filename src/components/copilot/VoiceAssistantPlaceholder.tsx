import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Globe, 
  Send, 
  Keyboard, 
  CornerDownLeft,
  CheckCircle2,
  X,
  Zap
} from 'lucide-react';
import { AILanguage } from '../../types/copilot';

interface VoiceAssistantPlaceholderProps {
  onTranscriptReceived?: (text: string) => void;
  onSendMessage?: (text: string) => void;
}

export const VoiceAssistantPlaceholder: React.FC<VoiceAssistantPlaceholderProps> = ({
  onTranscriptReceived,
  onSendMessage,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inputText, setInputText] = useState('');
  const [language, setLanguage] = useState<AILanguage>('English');
  const [recognition, setRecognition] = useState<any>(null);
  const [inputMode, setInputMode] = useState<'both' | 'voice' | 'typing'>('both');
  const [isTyping, setIsTyping] = useState(false);

  const typingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;

      rec.onresult = (event: any) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript;
        }
        setInputText(currentText);
        if (event.results[0].isFinal) {
          if (onTranscriptReceived) onTranscriptReceived(currentText);
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, [onTranscriptReceived]);

  const toggleListening = () => {
    if (!recognition) {
      alert('Web Speech API is not supported in this browser environment. You can use direct keyboard typing instead!');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setInputText('');
      recognition.lang = language === 'Urdu' ? 'ur-PK' : 'en-US';
      recognition.start();
      setIsListening(true);
    }
  };

  const speakText = (textToSpeak: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const text = textToSpeak || inputText || 'Teethly AI Voice and Typing Assistant active and ready.';
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'Urdu' ? 'ur-PK' : 'en-US';
        utterance.onend = () => setIsSpeaking(false);
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    setIsTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const handleSubmit = () => {
    if (!inputText.trim()) return;
    const textToSend = inputText.trim();
    if (onSendMessage) {
      onSendMessage(textToSend);
    } else if (onTranscriptReceived) {
      onTranscriptReceived(textToSend);
    }
    setInputText('');
    setIsTyping(false);
    if (isListening && recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const quickTypeChips = [
    { label: 'Draft SOAP Note', prompt: 'Draft a clinical SOAP note for today\'s consultation.' },
    { label: 'Check Patient Trajectory', prompt: 'Summarize active treatment plan and tray progress.' },
    { label: 'Verify Unpaid Invoices', prompt: '/invoice Show outstanding balances and pending copays.' },
    { label: 'Restock Supply Notice', prompt: 'Check stock levels for aligner trays and surgical gloves.' },
  ];

  return (
    <div className="w-full rounded-2xl bg-slate-900 border border-blue-500/20 shadow-xl overflow-hidden my-3 transition-all">
      {/* TOP DECK BAR */}
      <div className="p-3.5 bg-gradient-to-r from-slate-900 via-blue-950/80 to-slate-900 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl transition-all shadow-sm ${
            isListening 
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse' 
              : isTyping 
                ? 'bg-[#1d5bd8]/20 text-blue-400 border border-blue-500/30' 
                : 'bg-[#1d5bd8] text-white'
          }`}>
            <Mic className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                <span>AI Clinical Voice & Typing Station</span>
              </h4>
              <span className="px-2 py-0.5 rounded-full bg-[#1d5bd8]/20 text-blue-300 border border-[#1d5bd8]/40 text-[10px] font-bold">
                {isListening ? '● Live Dictation' : isTyping ? '⌨ Typing...' : 'Ready'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Hands-free voice speech dictation or instant keyboard command typing for dentists & staff.
            </p>
          </div>
        </div>

        {/* CONTROLS & LANGUAGE */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700/60 text-[10px]">
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            {(['English', 'Urdu', 'Roman Urdu'] as AILanguage[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2 py-0.5 font-bold rounded-lg transition-all cursor-pointer ${
                  language === lang
                    ? 'bg-[#1d5bd8] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          <button
            onClick={() => speakText(inputText)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 transition-colors cursor-pointer"
            title="Read Text Aloud"
          >
            {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* COMBINED INTERACTIVE INPUT FIELD & VOICE DICTATION ROW */}
      <div className="p-3.5 bg-slate-950/90 space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={
                isListening
                  ? '🎤 Listening to your voice... (say command or edit text here)'
                  : '⌨ Type clinical command or click mic to dictate speech...'
              }
              className={`w-full py-2.5 pl-3.5 pr-10 bg-slate-900 border rounded-xl text-xs font-medium text-white placeholder-slate-500 focus:outline-none transition-all ${
                isListening
                  ? 'border-rose-500/60 ring-2 ring-rose-500/20'
                  : 'border-slate-800 focus:border-[#1d5bd8] focus:ring-2 focus:ring-[#1d5bd8]/30'
              }`}
            />

            {inputText && (
              <button
                onClick={() => setInputText('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* VOICE MIC TOGGLE */}
          <button
            onClick={toggleListening}
            className={`px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer ${
              isListening
                ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700'
            }`}
            title={isListening ? 'Stop Voice Recording' : 'Start Voice Dictation'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span className="hidden sm:inline">{isListening ? 'Listening...' : 'Voice'}</span>
          </button>

          {/* SEND BUTTON */}
          <button
            onClick={handleSubmit}
            disabled={!inputText.trim()}
            className="px-4 py-2.5 rounded-xl bg-[#1d5bd8] hover:bg-[#154dbf] disabled:opacity-40 disabled:hover:bg-[#1d5bd8] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send Prompt</span>
          </button>
        </div>

        {/* QUICK TYPING SUGGESTIONS CHIPS */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 text-[11px]">
          <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider shrink-0 flex items-center gap-1">
            <Zap className="w-3 h-3 text-[#1d5bd8]" /> Quick Type:
          </span>
          {quickTypeChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(chip.prompt);
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-[#1d5bd8]/20 text-slate-300 hover:text-blue-300 border border-slate-800 hover:border-[#1d5bd8]/40 transition-colors shrink-0 font-medium cursor-pointer"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
