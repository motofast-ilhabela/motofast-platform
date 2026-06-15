import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Cadastro from './Cadastro.jsx'
import Admin from './Admin.jsx'
import Empresario from './Empresario.jsx'
import Motoboy from './Motoboy.jsx'
import Rastreio from './Rastreio.jsx'

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

        {/* Painel administrativo */}
        <Route path="/admin" element={<Admin />} />

        {/* Rastreio público — o cliente final acompanha o pedido, sem login */}
        <Route path="/rastreio" element={<Rastreio />} />

        {/* Qualquer outro link redireciona pra tela inicial */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
