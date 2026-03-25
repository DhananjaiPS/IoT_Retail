import Link from 'next/link';
import { SearchX, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-8 font-sans">
      
      {/* Visual Graphic */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-blue-200 rounded-full blur-3xl opacity-50 animate-pulse"></div>
        <div className="relative bg-white p-8 rounded-full shadow-2xl border border-slate-100">
          <SearchX className="w-20 h-20 text-blue-500" strokeWidth={1.5} />
        </div>
        
        {/* Floating IoT/Tech Dots */}
        <div className="absolute top-0 -right-4 w-4 h-4 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="absolute bottom-4 -left-6 w-6 h-6 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
      </div>

      {/* Text Content */}
      <div className="text-center max-w-md z-10">
        <h1 className="text-6xl font-black text-slate-900 mb-2 tracking-tighter">
          404
        </h1>
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
          Page Not Found
        </h2>
        <p className="text-slate-500 font-medium mb-8 leading-relaxed">
          Oops! It looks like the signal was lost. The page you are looking for doesn't exist, has been moved, or is currently offline.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/" 
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 shadow-xl shadow-blue-500/30"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
          
          {/* <button 
            // If you want a functional back button, you'd need to make this a "use client" component and use router.back()
            // For a server component, linking to a safe fallback like /store or /support is best.
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-blue-600 font-bold py-3 px-8 rounded-full transition-all shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            Previous Page
          </button> */}
        </div>
      </div>

      {/* Footer / Tech touch */}
      <div className="absolute bottom-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
        SmartCart IoT System • Error Code: 404
      </div>
    </div>
  );
}