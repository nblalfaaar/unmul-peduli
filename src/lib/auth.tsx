import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut as fbSignOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, type Profile } from "./firebase";

type AuthCtx = {
  user: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, nama: string, fakultas: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const snap = await getDoc(doc(db, "users", fbUser.uid));
        if (snap.exists()) {
          setUser({ id: fbUser.uid, ...snap.data() } as Profile);
        } else {
          setUser({
            id: fbUser.uid,
            nama: fbUser.email?.split("@")[0] ?? "User",
            email: fbUser.email ?? "",
            role: "mahasiswa",
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function signIn(email: string, password: string) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (e: any) {
      return { error: mapErr(e.code) };
    }
  }

  async function signUp(email: string, password: string, nama: string, fakultas: string) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", cred.user.uid), {
        nama,
        email,
        fakultas,
        role: "mahasiswa",
        status_akun: "aktif",
        created_at: Date.now(),
      });
      return { error: null };
    } catch (e: any) {
      return { error: mapErr(e.code) };
    }
  }

  async function signOut() {
    await fbSignOut(auth);
  }

  return <Ctx.Provider value={{ user, loading, signIn, signUp, signOut }}>{children}</Ctx.Provider>;
}

function mapErr(code: string): string {
  switch (code) {
    case "auth/email-already-in-use":
      return "Email sudah terdaftar";
    case "auth/invalid-email":
      return "Format email salah";
    case "auth/weak-password":
      return "Password minimal 6 karakter";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email atau password salah";
    default:
      return "Terjadi kesalahan: " + code;
  }
}

export const useAuth = () => useContext(Ctx);
