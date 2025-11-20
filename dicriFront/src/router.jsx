import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import App from "./App";
import Expedientes from "./pages/Expedientes";
import Indicios from "./pages/Indicios";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<Login />} />

        <Route path="/" element={<App />}>
          <Route index element={<Dashboard />} />
          <Route path="expedientes" element={<Expedientes />} />
          <Route path="indicios" element={<Indicios />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
