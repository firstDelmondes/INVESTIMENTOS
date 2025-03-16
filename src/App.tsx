import { Suspense, useEffect } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/home";
import routes from "tempo-routes";
import RecommendationForm from "./components/recommendation/RecommendationForm";
import HistoryManager from "./components/history/HistoryManager";
import ReportGenerator from "./components/report/ReportGenerator";
import SettingsPage from "./components/settings/SettingsPage";
import AnalysisPage from "./components/analysis/AnalysisPage";
import { inicializarDB } from "./lib/db";
import { Toaster } from "./components/ui/toaster";

function App() {
  useEffect(() => {
    // Inicializa o banco de dados local ao carregar o aplicativo
    inicializarDB().catch(console.error);

    // Verificar se o modo escuro está ativado no localStorage ou na preferência do sistema
    const storedDarkMode = localStorage.getItem("darkMode");
    const isDarkMode =
      storedDarkMode === "true" ||
      (storedDarkMode === null &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      // Salvar a preferência se foi determinada pelo sistema
      if (storedDarkMode === null) {
        localStorage.setItem("darkMode", "true");
      }
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Adicionar listener para mudanças de tema em outros componentes
    const handleThemeChange = (e: CustomEvent) => {
      const { darkMode } = e.detail;
      if (darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };

    window.addEventListener("themeChange", handleThemeChange as EventListener);
    return () =>
      window.removeEventListener(
        "themeChange",
        handleThemeChange as EventListener,
      );
  }, []);

  return (
    <Suspense fallback={<p>Carregando...</p>}>
      <>
        {/* Tempo routes */}
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recommendation/new" element={<RecommendationForm />} />
          <Route path="/history" element={<HistoryManager />} />
          <Route path="/report/new" element={<ReportGenerator />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />

          {/* Add this before the catchall route */}
          {import.meta.env.VITE_TEMPO === "true" && (
            <Route path="/tempobook/*" />
          )}

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        <Toaster />
      </>
    </Suspense>
  );
}

export default App;
