import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import DaftarBantuan from './pages/DaftarBantuan'
import Penawaran from './pages/Penawaran'
import DetailPengajuan from './pages/DetailPengajuan'
import DetailPenawaran from './pages/DetailPenawaran'
import AjukanBantuan from './pages/AjukanBantuan'
import TawarkanBantuan from './pages/TawarkanBantuan'
import DashboardVerifikator from './pages/DashboardVerifikator'
import DashboardAdmin from './pages/DashboardAdmin'
import Notifikasi from './pages/Notifikasi'
import { ProtectedRoute } from './components/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/bantuan" element={<DaftarBantuan />} />
      <Route path="/penawaran" element={<Penawaran />} />
      <Route path="/bantuan/:id" element={<DetailPengajuan />} />
      <Route path="/penawaran/:id" element={<DetailPenawaran />} />
      <Route path="/ajukan" element={<ProtectedRoute><AjukanBantuan /></ProtectedRoute>} />
      <Route path="/tawarkan" element={<ProtectedRoute><TawarkanBantuan /></ProtectedRoute>} />
      <Route path="/notifikasi" element={<ProtectedRoute><Notifikasi /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute role="admin"><DashboardAdmin /></ProtectedRoute>} />
      <Route path="/verifikasi" element={<ProtectedRoute role="verifikator"><DashboardVerifikator /></ProtectedRoute>} />
    </Routes>
  )
}