"use client";

import { useLanguage } from "@/lib/language-context";
import { Language } from "@/lib/i18n";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "id" ? "en" : "id");
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
      title={`Switch to ${language === "id" ? "English" : "Bahasa Indonesia"}`}>
      <Globe className="h-4 w-4" />
      <span>{language === "id" ? "EN" : "ID"}</span>
    </button>
  );
}
