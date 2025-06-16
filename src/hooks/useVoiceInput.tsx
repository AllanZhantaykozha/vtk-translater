import { useState, useEffect } from "react";

type LanguageCode = "en-US" | "ru-RU";
type SupportedLanguages = Record<LanguageCode, string>;

interface VoiceInput {
  transcript: string;
  isListening: boolean;
  language: LanguageCode;
  error: string | null;
  supportedLanguages: SupportedLanguages;
  changeLanguage: (lang: LanguageCode) => void;
  toggleListening: () => void;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onspeechend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechAlternative;
}

interface SpeechAlternative {
  transcript: string;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

const SpeechRecognition = (window.SpeechRecognition ||
  window.webkitSpeechRecognition) as
  | {
      new (): SpeechRecognition;
    }
  | undefined;
const recognition = SpeechRecognition ? new SpeechRecognition() : undefined;

const useVoiceInput = (defaultLang: LanguageCode = "ru-RU"): VoiceInput => {
  const [transcript, setTranscript] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [language, setLanguage] = useState<LanguageCode>(defaultLang);
  const [error, setError] = useState<string | null>(null);

  const supportedLanguages: SupportedLanguages = {
    "en-US": "English",
    "ru-RU": "Русский",
  };

  useEffect(() => {
    if (!recognition) return;

    recognition.lang = language;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const last = event.results.length - 1;
      const text = event.results[last][0].transcript;
      setTranscript(text);
    };

    recognition.onspeechend = () => {
      recognition.stop();
      setIsListening(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(`Ошибка распознавания: ${event.error}`);
      setIsListening(false);
    };

    return () => {
      recognition.onresult = null;
      recognition.onspeechend = null;
      recognition.onerror = null;
    };
  }, [language]);

  const changeLanguage = (lang: LanguageCode): void => {
    if (supportedLanguages[lang]) {
      setLanguage(lang);
      setTranscript("");
      setError(null);
    }
  };

  const toggleListening = (): void => {
    if (!recognition) {
      setError("Голосовой ввод не поддерживается в вашем браузере.");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
      setError(null);
    }
  };

  return {
    transcript,
    isListening,
    language,
    error,
    supportedLanguages,
    changeLanguage,
    toggleListening,
  };
};

export default useVoiceInput;
