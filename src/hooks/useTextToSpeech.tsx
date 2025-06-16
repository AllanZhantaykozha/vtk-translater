import { useState, useEffect } from "react";

type LanguageCode = "en-US" | "ru-RU";
type SupportedLanguages = Record<LanguageCode, string>;

interface TextToSpeech {
  isSpeaking: boolean;
  language: LanguageCode;
  error: string | null;
  supportedLanguages: SupportedLanguages;
  voices: SpeechSynthesisVoice[];
  changeLanguage: (lang: LanguageCode) => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
}

interface SpeechSynthesisVoice {
  voiceURI: string;
  name: string;
  lang: string;
  localService: boolean;
  default: boolean;
}

const useTextToSpeech = (defaultLang: LanguageCode = "ru-RU"): TextToSpeech => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [language, setLanguage] = useState<LanguageCode>(defaultLang);
  const [error, setError] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] =
    useState<SpeechSynthesisVoice | null>(null);

  const supportedLanguages: SupportedLanguages = {
    "en-US": "English",
    "ru-RU": "Русский",
  };

  useEffect(() => {
    const synth = window.speechSynthesis;
    let voiceLoadAttempts = 0;
    const maxVoiceLoadAttempts = 5;

    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      if (
        availableVoices.length > 0 ||
        voiceLoadAttempts >= maxVoiceLoadAttempts
      ) {
        setVoices(availableVoices);
        const voice = availableVoices.find((v) => v.lang === language) || null;
        setSelectedVoice(voice);
        if (!voice) {
          setError(
            `Голос для языка ${supportedLanguages[language]} не найден.`
          );
        }
      } else {
        voiceLoadAttempts++;
        setTimeout(loadVoices, 100);
      }
    };

    loadVoices();
    synth.addEventListener("voiceschanged", loadVoices);

    return () => {
      synth.removeEventListener("voiceschanged", loadVoices);
    };
  }, [language]);

  const changeLanguage = (lang: LanguageCode): void => {
    if (supportedLanguages[lang]) {
      setLanguage(lang);
      setError(null);
      const voice = voices.find((v) => v.lang === lang) || null;
      setSelectedVoice(voice);
      if (!voice) {
        setError(`Голос для языка ${supportedLanguages[lang]} не найден.`);
      }
    }
  };

  const speak = (text: string): void => {
    if (!window.speechSynthesis) {
      setError("Озвучивание текста не поддерживается в вашем браузере.");
      return;
    }

    if (!selectedVoice) {
      setError(`Голос для языка ${supportedLanguages[language]} не найден.`);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.lang = language;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      setError(`Ошибка воспроизведения: ${event.error}`);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = (): void => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return {
    isSpeaking,
    language,
    error,
    supportedLanguages,
    voices,
    changeLanguage,
    speak,
    stopSpeaking,
  };
};

export default useTextToSpeech;
