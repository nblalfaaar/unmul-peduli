import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail,
  signInWithEmailAndPassword, signOut as fbSignOut, updateProfile as fbUpdateProfile,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db, type Profile } from './firebase'

type Hasil = { error: string | null }

type AuthCtx = {
  user: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<Hasil>
  signUp: (email: string, password: string, nama: string, fakultas: string, nim?: string) => Promise<Hasil>
  resetPassword: (email: string) => Promise<Hasil>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const Ctx = createContext<AuthCtx>({} as AuthCtx)

function mapErr(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use': return 'Email sudah terdaftar. Silakan masuk.'
    case 'auth/invalid-email': return 'Format email tidak valid.'
    case 'auth/weak-password': return 'Kata sandi minimal 6 karakter.'
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found': return 'Email atau kata sandi salah.'
    case 'auth/too-many-requests': return 'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.'
    case 'auth/network-request-failed': return 'Koneksi bermasalah. Periksa internetmu.'
    case 'auth/operation-not-allowed': return 'Metode Email/Password belum diaktifkan di Firebase Console.'
    default: return 'Terjadi kesalahan (' + code + ').'
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null)
        setLoading(false)
        return
      }
      try {
        const snap = await getDoc(doc(db, 'users', fbUser.uid))
        if (snap.exists()) {
          const data = snap.data() as Omit<Profile, 'id'>
          if (data.status_akun === 'nonaktif') {
            await fbSignOut(auth)
            setUser(null)
          } else {
            setUser({ id: fbUser.uid, ...data })
          }
        } else {
          setUser({ id: fbUser.uid, nama: fbUser.displayName || fbUser.email?.split('@')[0] || 'Pengguna', email: fbUser.email ?? '', role: 'mahasiswa' })
        }
      } catch {
        setUser({ id: fbUser.uid, nama: fbUser.displayName || fbUser.email?.split('@')[0] || 'Pengguna', email: fbUser.email ?? '', role: 'mahasiswa' })
      }
      setLoading(false)
    })
  }, [])

  const refreshUser = useCallback(async () => {
    if (!auth.currentUser) return
    const snap = await getDoc(doc(db, 'users', auth.currentUser.uid))
    if (snap.exists()) setUser({ id: auth.currentUser.uid, ...snap.data() } as Profile)
  }, [])

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      loading,
      refreshUser,
      async signIn(email, password) {
        try {
          const cred = await signInWithEmailAndPassword(auth, email.trim(), password)
          const snap = await getDoc(doc(db, 'users', cred.user.uid))
          if (snap.exists() && snap.data().status_akun === 'nonaktif') {
            await fbSignOut(auth)
            return { error: 'Akunmu dinonaktifkan oleh admin. Hubungi pengelola UNMUL Peduli.' }
          }
          return { error: null }
        } catch (e) {
          return { error: mapErr((e as { code?: string }).code ?? 'unknown') }
        }
      },
      async signUp(email, password, nama, fakultas, nim) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
          await fbUpdateProfile(cred.user, { displayName: nama })
          const profil = {
            nama, email: email.trim(), fakultas, role: 'mahasiswa' as const, status_akun: 'aktif' as const, created_at: Date.now(),
            ...(nim ? { nim } : {}),
          }
          await setDoc(doc(db, 'users', cred.user.uid), profil)
          setUser({ id: cred.user.uid, ...profil })
          return { error: null }
        } catch (e) {
          return { error: mapErr((e as { code?: string }).code ?? 'unknown') }
        }
      },
      async resetPassword(email) {
        try {
          await sendPasswordResetEmail(auth, email.trim())
          return { error: null }
        } catch (e) {
          return { error: mapErr((e as { code?: string }).code ?? 'unknown') }
        }
      },
      async signOut() {
        await fbSignOut(auth)
      },
    }),
    [user, loading, refreshUser],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(Ctx)
