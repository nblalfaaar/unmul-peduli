import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import PublicLayout from './components/PublicLayout'
import AppLayout from './components/AppLayout'
import { PageLoader, ProtectedRoute } from './components/ProtectedRoute'
import Landing from './pages/Landing'
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const LupaPassword = lazy(() => import('./pages/LupaPassword'))
const DaftarBantuan = lazy(() => import('./pages/DaftarBantuan'))
const Penawaran = lazy(() => import('./pages/Penawaran'))
const DetailPengajuan = lazy(() => import('./pages/DetailPengajuan'))
const DetailPenawaran = lazy(() => import('./pages/DetailPenawaran'))
const FormPengajuan = lazy(() => import('./pages/FormPengajuan'))
const TawarkanBantuan = lazy(() => import('./pages/TawarkanBantuan'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const PengajuanSaya = lazy(() => import('./pages/PengajuanSaya'))
const Notifikasi = lazy(() => import('./pages/Notifikasi'))
const Profil = lazy(() => import('./pages/Profil'))
const DashboardVerifikator = lazy(() => import('./pages/DashboardVerifikator'))
const DashboardAdmin = lazy(() => import('./pages/DashboardAdmin'))
const ManajemenUser = lazy(() => import('./pages/ManajemenUser'))
const NotFound = lazy(() => import('./pages/NotFound'))

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/bantuan" element={<DaftarBantuan />} />
        <Route path="/bantuan/:id" element={<DetailPengajuan />} />
        <Route path="/penawaran" element={<Penawaran />} />
        <Route path="/penawaran/:id" element={<DetailPenawaran />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/lupa-password" element={<LupaPassword />} />

      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/ajukan" element={<FormPengajuan />} />
        <Route path="/ajukan/:id/edit" element={<FormPengajuan />} />
        <Route path="/tawarkan" element={<TawarkanBantuan />} />
        <Route path="/pengajuan-saya" element={<PengajuanSaya />} />
        <Route path="/notifikasi" element={<Notifikasi />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/verifikasi" element={<ProtectedRoute roles={['verifikator', 'admin']}><DashboardVerifikator /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><DashboardAdmin /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><ManajemenUser /></ProtectedRoute>} />
      </Route>
    </Routes>
    </Suspense>
  )
}
