import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Cadastro from './Cadastro.jsx'
import Admin from './Admin.jsx'
import Empresario from './Empresario.jsx'
import Motoboy from './Motoboy.jsx'
import Rastreio from './Rastreio.jsx'
import AdminGate from './AdminGate.jsx'
import EmpresarioGate from './EmpresarioGate.jsx'
import MotoboyGate from './MotoboyGate.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Tela inicial — cadastro e login */}
        <Route path="/" element={<Cadastro />} />

        {/* Painel do empresário — protegido temporariamente */}
        <Route path="/empresario" element={<EmpresarioGate><Empresario /></EmpresarioGate>} />

        {/* Painel do motoboy — protegido temporariamente */}
        <Route path="/motoboy" element={<MotoboyGate><Motoboy /></MotoboyGate>} />

        {/* Painel administrativo — protegido por senha */}
        <Route path="/admin" element={<AdminGate><Admin /></AdminGate>} />

        {/* Rastreio público — o cliente final acompanha o pedido, sem login */}
        <Route path="/rastreio" element={<Rastreio />} />

        {/* Qualquer outro link redireciona pra tela inicial */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
