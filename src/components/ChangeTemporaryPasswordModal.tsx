import React, { useState } from 'react';
import {
  Lock,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import { validateNewPermanentPassword } from '../utils/security';
import { updateUserPermanentPassword } from '../services/firestoreService';
import { useAuth } from '../context/AuthContext';

interface ChangeTemporaryPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  tempPasswordPreFill?: string;
  userEmail?: string;
  userRole?: string;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const ChangeTemporaryPasswordModal: React.FC<ChangeTemporaryPasswordModalProps> = ({
  isOpen,
  onClose,
  tempPasswordPreFill = '',
  userEmail = '',
  userRole = '',
  showToast,
}) => {
  const { userProfile, updateProfileDetails } = useAuth();
  const [currentTempPass, setCurrentTempPass] = useState(tempPasswordPreFill);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!currentTempPass.trim()) {
      setErrorMsg('Informe a senha temporária de 6 caracteres fornecida no cadastro.');
      return;
    }

    const validation = validateNewPermanentPassword(
      newPassword,
      confirmPassword,
      currentTempPass
    );

    if (!validation.isValid) {
      setErrorMsg(validation.error || 'Senha inválida');
      return;
    }

    try {
      setSaving(true);
      const targetUid = userProfile?.uid || 'current_user';
      await updateUserPermanentPassword(targetUid, newPassword);

      // Update auth profile
      if (updateProfileDetails) {
        await updateProfileDetails({
          mustChangePassword: false,
          passwordChangedAt: new Date().toISOString(),
        });
      }

      showToast(
        'Senha definitiva atualizada com sucesso! Seu acesso está totalmente seguro.',
        'success'
      );
      onClose();
    } catch (err: any) {
      console.error('Erro ao atualizar senha definitiva:', err);
      setErrorMsg(err.message || 'Erro ao salvar a nova senha no Firebase.');
      showToast('Falha ao atualizar a senha. Tente novamente.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-neutral-200 shadow-2xl space-y-6 animate-in zoom-in-95">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
            <KeyRound className="w-7 h-7" />
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider">
            Primeiro Acesso Obrigatório
          </span>
          <h2 className="text-xl font-black text-neutral-900 tracking-tight">
            Redefina sua Senha Provisória
          </h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Por exigência de segurança da plataforma ConectAí, a senha temporária de 6 caracteres gerada no cadastro deve ser substituída por uma senha definitiva pessoal.
          </p>
          {userEmail && (
            <div className="text-[11px] font-bold text-neutral-700 bg-neutral-100 py-1 px-3 rounded-lg inline-block">
              Conta: {userEmail}
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Senha Provisória Recebida (6 caracteres)
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={currentTempPass}
              onChange={(e) => setCurrentTempPass(e.target.value)}
              placeholder="Ex: X7#k9@"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-xs font-mono text-neutral-900 outline-none transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-neutral-700">
                Nova Senha Definitiva
              </label>
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="text-[11px] text-neutral-400 hover:text-neutral-600 flex items-center gap-1"
              >
                {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPass ? 'Ocultar' : 'Ver'}</span>
              </button>
            </div>
            <input
              type={showPass ? 'text' : 'password'}
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo de 8 caracteres"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-xs text-neutral-900 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Confirmar Nova Senha
            </label>
            <input
              type={showPass ? 'text' : 'password'}
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Digite a nova senha novamente"
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-xs text-neutral-900 outline-none transition"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-black text-xs transition active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {saving ? (
                <span>Salvando Nova Senha...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Gravar Senha Definitiva & Liberar Acesso</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
