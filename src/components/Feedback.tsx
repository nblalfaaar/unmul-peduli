import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, HelpCircle, Info, XCircle } from 'lucide-react'

type ToastType = 'ok' | 'err' | 'info'
type ToastItem = { id: number; type: ToastType; title: string; desc?: string }
type ConfirmOpts = { title: string; desc?: string; confirmText?: string; danger?: boolean }
type ReasonOpts = { title: string; desc?: string; label?: string; confirmText?: string }

type Api = {
  toast: (type: ToastType, title: string, desc?: string) => void
  confirm: (o: ConfirmOpts) => Promise<boolean>
  askReason: (o: ReasonOpts) => Promise<string | null>
}

const Ctx = createContext<Api>({} as Api)

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [dlg, setDlg] = useState<
    | { kind: 'confirm'; o: ConfirmOpts; done: (v: boolean) => void }
    | { kind: 'reason'; o: ReasonOpts; done: (v: string | null) => void }
    | null
  >(null)
  const [reason, setReason] = useState('')
  const seq = useRef(0)

  const toast = useCallback((type: ToastType, title: string, desc?: string) => {
    const id = ++seq.current
    setToasts((t) => [...t, { id, type, title, desc }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), type === 'err' ? 6000 : 4000)
  }, [])

  const confirm = useCallback((o: ConfirmOpts) => new Promise<boolean>((done) => setDlg({ kind: 'confirm', o, done })), [])
  const askReason = useCallback((o: ReasonOpts) => {
    setReason('')
    return new Promise<string | null>((done) => setDlg({ kind: 'reason', o, done }))
  }, [])

  const api = useMemo(() => ({ toast, confirm, askReason }), [toast, confirm, askReason])

  function close(result: boolean | string | null) {
    if (!dlg) return
    if (dlg.kind === 'confirm') dlg.done(result === true)
    else dlg.done(typeof result === 'string' ? result : null)
    setDlg(null)
  }

  const Icon = { ok: CheckCircle2, err: XCircle, info: Info }

  return (
    <Ctx.Provider value={api}>
      {children}

      <div className="toasts" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => {
            const I = Icon[t.type]
            return (
              <motion.div
                key={t.id}
                layout
                className={`toast ${t.type}`}
                initial={{ opacity: 0, x: 60, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 60, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}
              >
                <span className="ic"><I size={18} /></span>
                <div>
                  <b>{t.title}</b>
                  {t.desc && <span className="muted" style={{ fontSize: 12.5 }}>{t.desc}</span>}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {dlg && (
          <motion.div className="modal-back" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => e.target === e.currentTarget && close(dlg.kind === 'confirm' ? false : null)}>
            <motion.div className="modal" role="dialog" aria-modal="true" initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.97 }} transition={{ type: 'spring', stiffness: 360, damping: 28 }}>
              {dlg.kind === 'confirm' ? (
                <>
                  <div className={`ic-top ${dlg.o.danger ? 'danger' : ''}`}>{dlg.o.danger ? <AlertTriangle size={26} /> : <HelpCircle size={26} />}</div>
                  <h3>{dlg.o.title}</h3>
                  {dlg.o.desc && <p className="desc" style={{ marginBottom: 0 }}>{dlg.o.desc}</p>}
                  <div className="actions">
                    <button className="btn btn-outline" onClick={() => close(false)}>Batal</button>
                    <button className={`btn ${dlg.o.danger ? 'btn-peach' : 'btn-primary'}`} onClick={() => close(true)} autoFocus>
                      {dlg.o.confirmText ?? 'Ya, lanjutkan'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="ic-top danger"><AlertTriangle size={26} /></div>
                  <h3>{dlg.o.title}</h3>
                  {dlg.o.desc && <p className="desc">{dlg.o.desc}</p>}
                  <div className="field">
                    <label htmlFor="alasan">{dlg.o.label ?? 'Alasan'}</label>
                    <textarea id="alasan" className="textarea" autoFocus value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Tulis alasan yang jelas agar pengaju dapat memperbaikinya" />
                  </div>
                  <div className="actions">
                    <button className="btn btn-outline" onClick={() => close(null)}>Batal</button>
                    <button className="btn btn-peach" disabled={reason.trim().length < 5} onClick={() => close(reason.trim())}>
                      {dlg.o.confirmText ?? 'Kirim'}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useFeedback = () => useContext(Ctx)
