import React, { useState } from 'react';
import { X, Star, ThumbsUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Review } from '../types';
import { addReview } from '../services/firestoreService';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'store' | 'product' | 'service' | 'driver';
  targetId: string;
  targetName: string;
  onReviewSubmitted?: (review: Review) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetName,
  onReviewSubmitted,
}) => {
  const { userProfile } = useAuth();
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    try {
      setIsSubmitting(true);
      const newReview: Review = {
        id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        authorId: userProfile.uid,
        authorName: userProfile.displayName,
        targetType,
        targetId,
        rating,
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
      };

      await addReview(newReview);
      if (onReviewSubmitted) onReviewSubmitted(newReview);
      alert('Avaliação publicada com sucesso! Obrigado pelo feedback.');
      onClose();
    } catch (err) {
      console.error('Erro ao salvar avaliação:', err);
      alert('Não foi possível salvar a avaliação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">Avaliar Experiência</h3>
            <p className="text-xs text-neutral-500 font-medium truncate max-w-[280px]">
              {targetName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="text-center space-y-2">
            <span className="text-xs font-semibold text-neutral-600 block">
              Quantas estrelas você dá?
            </span>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 text-amber-400 hover:scale-110 active:scale-95 transition"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-neutral-800 block">
              {rating === 5 && 'Excelente! Adorei a experiência'}
              {rating === 4 && 'Muito bom! Recomendo'}
              {rating === 3 && 'Bom, dentro do esperado'}
              {rating === 2 && 'Pode melhorar'}
              {rating === 1 && 'Experiência insatisfatória'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Seu Comentário
            </label>
            <textarea
              rows={3}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conte o que achou da pontualidade, atendimento e qualidade..."
              className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-emerald-500 bg-neutral-50"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Salvando...' : 'Enviar Avaliação'}
          </button>
        </form>
      </div>
    </div>
  );
};
