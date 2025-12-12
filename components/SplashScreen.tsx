import React from 'react';
import { Trophy, Activity } from 'lucide-react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col items-center justify-center overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-700 via-slate-900 to-black"></div>
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#ec4899 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

      <div className="relative z-10 flex flex-col items-center animate-fade-in-up">
        <div className="relative mb-6">
          <div className="absolute -inset-4 bg-primary-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="bg-gradient-to-br from-slate-800 to-black p-6 rounded-2xl border border-slate-700 shadow-2xl relative">
             <Trophy size={64} className="text-primary-500 animate-bounce" style={{ animationDuration: '2s' }} />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-primary-600 rounded-full p-2 border-4 border-slate-900">
            <Activity size={20} className="text-white animate-spin-slow" />
          </div>
        </div>

        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
          Club Manager <span className="text-primary-500">Plegma</span>
        </h1>
        <p className="text-slate-400 text-sm tracking-widest uppercase mb-8">Professional Sports Management</p>

        {/* Loading Bar */}
        <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500 animate-[loading_2s_ease-in-out_infinite]" style={{ width: '50%' }}></div>
        </div>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;