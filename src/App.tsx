import { Suspense, useEffect } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/home";
import routes from "tempo-routes";
import RecommendationForm from "./components/recommendation/RecommendationForm";
import HistoryManager from "./components/history/HistoryManager";
import ReportGenerator from "./components/report/ReportGenerator";
import { inicializarDB } from "./lib/db";

function App() {
  useEffect(() => {
    // Inicializa o banco de dados local ao carregar o aplicativo
    inicializarDB().catch(console.error);
  }, []);

  return (
    <Suspense fallback={<p>Carregando...</p>}>
      <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recommendation/new" element={<RecommendationForm />} />
          <Route path="/history" element={<HistoryManager />} />
          <Route path="/report/new" element={<ReportGenerator />} />
          <Route path="/settings" element={<Navigate to="/" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </>
    </Suspense>
  );
}

export default App;
