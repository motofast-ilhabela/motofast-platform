import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Cadastro from './Cadastro.jsx'
import Admin from './Admin.jsx'
import Empresario from './Empresario.jsx'
import Motoboy from './Motoboy.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Tela inicial — cadastro e login */}
        <Route path="/" element={<Cadastro />} />

        {/* Painel do empresário */}
        <Route path="/empresario" element={<Empresario />} />

        {/* Painel do motoboy */}
        <Route path="/motoboy" element={<Motoboy />} />

        {/* Painel administrativo (privado — só você acessa) */}
        <Route path="/admin" element={<Admin />} />

        {/* Qualquer outro link redireciona pra tela inicial */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
