import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { PageTop } from '../components/PageTop'
import { EmptyState } from '../components/ui'
import { useTitle } from '../lib/hooks'

export default function NotFound() {
  useTitle('Halaman tidak ditemukan')
  return (
    <>
      <PageTop title="Halaman tidak ditemukan" desc="Tautan yang kamu buka tidak tersedia atau sudah dipindahkan." />
      <div className="container page-body">
        <EmptyState icon={Compass} title="Kamu tersesat?" desc="Kembali ke beranda atau jelajahi daftar bantuan." action={<Link to="/" className="btn btn-primary">Ke beranda</Link>} />
      </div>
    </>
  )
}
