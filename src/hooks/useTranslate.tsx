import { useState, useCallback } from "react";

interface TranslationResult {
  translatedText: string | null;
  isLoading: boolean;
  error: string | null;
}

interface TranslateOptions {
  text: string;
  targetLang: string;
}

export const useTranslate = () => {
  const [result, setResult] = useState<TranslationResult>({
    translatedText: null,
    isLoading: false,
    error: null,
  });

  const authKey = "231849e1-6c06-4751-b3d6-a762caadcc79:fx";

  const translate = useCallback(
    async ({ text, targetLang }: TranslateOptions) => {
      if (!text || !targetLang) {
        setResult({
          translatedText: null,
          isLoading: false,
          error: "Текст и целевой язык обязательны",
        });
        return;
      }

      setResult((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch("/api/deepl/v2/translate", {
          method: "POST",
          headers: {
            Authorization: `DeepL-Auth-Key ${authKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            text,
            target_lang: targetLang.toUpperCase(),
          }),
        });

        const data = await response.json();

        if (response.ok && data.translations && data.translations[0]) {
          setResult({
            translatedText: data.translations[0].text,
            isLoading: false,
            error: null,
          });
        } else {
          throw new Error(data.message || "Перевод не удался");
        }
      } catch (error) {
        setResult({
          translatedText: null,
          isLoading: false,
          error: error instanceof Error ? error.message : "Неизвестная ошибка",
        });
      }
    },
    [authKey]
  );

  return { ...result, translate };
};
