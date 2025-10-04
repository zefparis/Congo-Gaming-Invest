import { FormEvent, useState } from 'react';
import { useAuth } from '@/auth/AuthContext';
import { useCountdown } from '@/hooks/useCountdown';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export function LoginModal({ open, onClose }: LoginModalProps) {
  const { requestOtp, verifyOtp } = useAuth();
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [msisdn, setMsisdn] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, resetCountdown] = useCountdown(0);

  if (!open) {
    return null;
  }

  const closeAndReset = () => {
    setStep('request');
    setMsisdn('');
    setCode('');
    setMessage(null);
    setError(null);
    resetCountdown(0);
    onClose();
  };

  const handleRequestOtp = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const response = await requestOtp({ msisdn });
      setStep('verify');
      setMessage(`Code envoyé ! Valide ${Math.floor(response.expiresIn / 60)} min.`);
      resetCountdown(response.expiresIn);
    } catch (err: any) {
      setError(err?.message ?? 'Impossible d’envoyer le code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      await verifyOtp({ msisdn, code });
      setMessage('Authentification réussie.');
      setTimeout(() => {
        closeAndReset();
      }, 800);
    } catch (err: any) {
      setError(err?.message ?? 'Code invalide.');
    } finally {
      setLoading(false);
    }
  };

  const canResend = countdown === 0;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <header className="modal-header">
          <h2>Connexion</h2>
          <button className="close-btn" onClick={closeAndReset}>
            ×
          </button>
        </header>
        <div className="modal-content">
          {step === 'request' ? (
            <form onSubmit={handleRequestOtp} className="form">
              <label>
                Numéro de téléphone (MSISDN)
                <input
                  type="tel"
                  value={msisdn}
                  onChange={e => setMsisdn(e.target.value)}
                  placeholder="Ex: +243900000000"
                  required
                />
              </label>
              <button type="submit" className="btn primary" disabled={loading}>
                {loading ? 'Envoi...' : 'Recevoir un code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="form">
              <label>
                Code reçu par SMS
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="6 chiffres"
                  maxLength={6}
                  pattern="\\d{6}"
                  required
                />
              </label>
              <button type="submit" className="btn primary" disabled={loading}>
                {loading ? 'Vérification...' : 'Se connecter'}
              </button>
              <button
                type="button"
                className="btn secondary"
                disabled={!canResend || loading}
                onClick={handleRequestOtp}
              >
                {canResend ? 'Renvoyer le code' : `Renvoyer (${countdown}s)`}
              </button>
            </form>
          )}

          {message && <div className="info-box success">{message}</div>}
          {error && <div className="info-box error">{error}</div>}
        </div>
      </div>
    </div>
  );
}
