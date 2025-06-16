import React, { useState, useEffect, useCallback } from "react";
import useVoiceInput from "./hooks/useVoiceInput";
import useTextToSpeech from "./hooks/useTextToSpeech";
import { useTranslate } from "./hooks/useTranslate";

const languageCodeMap: { [key: string]: string } = {
  "ru-RU": "RU",
  "en-US": "EN",
};

const Translate: React.FC = () => {
  const [inputText, setInputText] = useState<string>("");
  const [hasSpoken, setHasSpoken] = useState<boolean>(false);

  const {
    transcript,
    isListening,
    language: inputLang,
    supportedLanguages: inputLanguages,
    changeLanguage: changeInputLang,
    toggleListening,
  } = useVoiceInput("ru-RU");

  const {
    translatedText,
    isLoading: translateLoading,
    translate,
  } = useTranslate();

  const {
    isSpeaking,
    language: outputLang,
    supportedLanguages: outputLanguages,
    changeLanguage: changeOutputLang,
    speak,
    stopSpeaking,
  } = useTextToSpeech("ru-RU");

  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

  useEffect(() => {
    if (inputText && !isListening) {
      const targetLang =
        languageCodeMap[outputLang] || outputLang.split("-")[0].toUpperCase();
      translate({ text: inputText, targetLang });
    }
  }, [inputText, isListening, outputLang, translate]);

  useEffect(() => {
    if (translatedText && !translateLoading && !isSpeaking && !hasSpoken) {
      const timer = setTimeout(() => {
        speak(translatedText);
        setHasSpoken(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [translatedText, translateLoading, isSpeaking, hasSpoken, speak]);

  const handleToggleListening = useCallback(() => {
    if (!isListening) {
      setInputText("");
      setHasSpoken(false);
      stopSpeaking();
      translate({
        text: "",
        targetLang:
          languageCodeMap[outputLang] || outputLang.split("-")[0].toUpperCase(),
      });
    }
    toggleListening();
  }, [isListening, outputLang, stopSpeaking, toggleListening, translate]);

  const handleReplay = useCallback(() => {
    if (translatedText && !isSpeaking) {
      speak(translatedText);
    }
  }, [translatedText, isSpeaking, speak]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-[600px] transition-all duration-300 hover:shadow-xl">
        <div className="mb-6">
          <label className="block mb-2 text-sm font-semibold text-gray-800">
            Язык ввода голоса
          </label>
          <select
            value={inputLang}
            onChange={(e) =>
              changeInputLang(e.target.value as keyof typeof inputLanguages)
            }
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors duration-200 bg-gray-50 text-gray-700"
          >
            {Object.entries(inputLanguages).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Output Language Selection */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-semibold text-gray-800">
            Язык перевода и озвучивания
          </label>
          <select
            value={outputLang}
            onChange={(e) =>
              changeOutputLang(e.target.value as keyof typeof outputLanguages)
            }
            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors duration-200 bg-gray-50 text-gray-700"
          >
            {Object.entries(outputLanguages).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleToggleListening}
          className={`w-full py-3 px-6 rounded-lg font-semibold text-white shadow-md transition-all duration-200 transform hover:scale-105 ${
            isListening
              ? "bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300"
              : "bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
          }`}
        >
          {isListening ? (
            <span className="flex items-center justify-center">
              <svg
                className="w-5 h-5 mr-2 animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Остановить запись
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
              Начать запись
            </span>
          )}
        </button>

        <div className="mb-6 mt-6">
          <label className="block mb-2 text-sm font-semibold text-gray-800">
            Распознанный текст
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Текст будет отображаться здесь"
            className="w-full p-4 min-h-[120px] border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-colors duration-200 bg-gray-50 text-gray-700 resize-none"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-sm font-semibold text-gray-800">
            Переведенный текст
          </label>
          <div
            className={`p-4 rounded-lg bg-gray-50 text-gray-700 font-medium text-lg transition-all duration-200 ${
              translateLoading ? "animate-pulse bg-gray-100" : ""
            }`}
          >
            {translateLoading ? (
              <span className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2 animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Перевод...
              </span>
            ) : translatedText ? (
              translatedText
            ) : (
              "Ожидание перевода"
            )}
          </div>
        </div>

        <div className="grid gap-2 md:space-x-4 md:flex">
          <button
            onClick={handleReplay}
            disabled={!translatedText || isSpeaking || translateLoading}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white shadow-md transition-all duration-200 transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed ${
              !translatedText || isSpeaking || translateLoading
                ? "bg-gray-300"
                : "bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-300"
            }`}
          >
            <span className="flex items-center justify-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15.536 8.464a5 5 0 010 7.072m-7.072 0a5 5 0 010-7.072M13 12H7"
                />
              </svg>
              Повторить
            </span>
          </button>
          <button
            onClick={stopSpeaking}
            disabled={!isSpeaking}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white shadow-md transition-all duration-200 transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed ${
              isSpeaking
                ? "bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300"
                : "bg-gray-300"
            }`}
          >
            <span className="flex items-center justify-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 10h6"
                />
              </svg>
              Остановить
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Translate;
