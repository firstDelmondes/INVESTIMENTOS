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

    // Remover qualquer classe dark do documento para garantir modo claro
    document.documentElement.classList.remove("dark");
    localStorage.removeItem("darkMode");
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
