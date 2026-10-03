import React, { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';

interface SplashScreenProps {
  onFinish?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFading(true);
      const closeTimer = setTimeout(() => {
        setVisible(false);
        if (onFinish) onFinish();
      }, 400);
      return () => clearTimeout(closeTimer);
    }, 900);

    return () => clearTimeout(timer);
  }, [onFinish]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-8 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white transition-opacity duration-400 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="w-full flex justify-end">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold backdrop-blur-xs">
          <MapPin className="w-3 h-3 text-emerald-400" />
          <span>Cachoeiras de Macacu</span>
        </div>
      </div>

      <div className="flex flex-col items-center text-center space-y-4 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-black text-4xl shadow-2xl shadow-emerald-500/40">
          C
        </div>

        <div>
          <h1 className="text-3xl font-black tracking-tight font-['Space_Grotesk']">
            Conect<span className="text-emerald-400">Aí</span>
          </h1>
          <p className="text-xs text-emerald-200 mt-1 max-w-xs leading-relaxed">
            O ecossistema digital de comércio, serviços e entregas da sua cidade
          </p>
        </div>

        {/* Loading bar */}
        <div className="w-48 h-1.5 bg-emerald-950/80 rounded-full overflow-hidden mt-6">
          <div className="h-full bg-emerald-400 rounded-full animate-pulse w-3/4" />
        </div>
      </div>

      <div className="text-[11px] text-emerald-300/60 font-medium">
        Cachoeiras de Macacu • Inovação Local
      </div>
    </div>
  );
};
