import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { User, Lock, Loader2, ArrowRight } from 'lucide-react';

const LoginForm = ({ formData, setFormData, handleSubmit, loading, error }) => {
    const formRef = useRef(null);
    const contentRef = useRef(null);
    const titleRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        const tl = gsap.timeline();

        // Split title into characters for animation
        const titleText = titleRef.current.innerText;
        titleRef.current.innerHTML = titleText.split('').map(char => `<span class="inline-block">${char === ' ' ? '&nbsp;' : char}</span>`).join('');
        const chars = titleRef.current.querySelectorAll('span');

        tl.fromTo(chars,
            { opacity: 0, y: 20, rotateX: -90 },
            { opacity: 1, y: 0, rotateX: 0, stagger: 0.05, duration: 0.8, ease: "back.out(1.7)" }
        );

        tl.fromTo(contentRef.current.querySelectorAll('.animate-item'),
            { opacity: 0, x: -30 },
            { opacity: 1, x: 0, stagger: 0.1, duration: 0.6, ease: "power2.out" },
            "-=0.4"
        );
    }, []);

    // Magnetic button effect
    const handleMouseMove = (e) => {
        const btn = buttonRef.current;
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(btn, {
            x: x * 0.2,
            y: y * 0.2,
            duration: 0.3,
            ease: "power2.out"
        });
    };

    const handleMouseLeave = () => {
        gsap.to(buttonRef.current, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: "elastic.out(1, 0.3)"
        });
    };

    return (
        <div ref={formRef} className="w-full max-w-md p-8 sm:p-12 z-10">
            <div ref={contentRef} className="space-y-8">
                <div className="animate-item">
                    <div className="w-14 h-14 bg-amber-500 rounded-2xl mb-6 shadow-xl shadow-amber-500/30 flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform duration-500 cursor-pointer group">
                        <div className="w-7 h-7 bg-white rounded-full opacity-30 group-hover:scale-150 transition-transform duration-700"></div>
                    </div>
                    <h2 className="text-xs font-bold text-violet-500 uppercase tracking-[0.3em] mb-3">Gateway to</h2>
                    <h1 ref={titleRef} className="text-6xl font-black text-slate-900 tracking-tight perspective-1000">
                        HAB CREATION
                    </h1>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-2xl animate-item">
                        <p className="text-red-700 text-sm font-semibold">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative group animate-item">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-violet-600 group-focus-within:translate-x-1 transition-all">
                            Identification
                        </label>
                        <div className="relative">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-600 group-focus-within:scale-110 transition-all duration-300">
                                <User size={20} />
                            </div>
                            <input
                                type="text"
                                className="w-full bg-transparent border-b-2 border-slate-100 py-3 pl-8 outline-none focus:border-violet-600 transition-all text-slate-800 font-semibold placeholder:text-slate-200"
                                placeholder="bonjourguys@talk.com"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="relative group animate-item">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-violet-600 group-focus-within:translate-x-1 transition-all">
                            Secret Key
                        </label>
                        <div className="relative">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-600 group-focus-within:scale-110 transition-all duration-300">
                                <Lock size={20} />
                            </div>
                            <input
                                type="password"
                                className="w-full bg-transparent border-b-2 border-slate-100 py-3 pl-8 outline-none focus:border-violet-600 transition-all text-slate-800 font-semibold placeholder:text-slate-200"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="pt-2 animate-item">
                        <button
                            ref={buttonRef}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white rounded-2xl py-5 font-bold uppercase tracking-widest text-xs shadow-2xl shadow-slate-200 hover:bg-violet-600 hover:shadow-violet-200 transition-all flex items-center justify-center gap-3 overflow-hidden group relative"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        Authorize Access
                                        <ArrowRight className="group-hover:translate-x-2 transition-transform duration-500" size={18} />
                                    </>
                                )}
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </button>
                    </div>
                </form>

                <div className="pt-10 border-t border-slate-100 animate-item">
                    <p className="text-slate-400 text-xs font-medium">
                        New to the platform? <a href="#" className="text-violet-600 font-bold hover:text-indigo-600 transition-colors">Request Access</a>
                    </p>

                    <div className="mt-8 flex gap-3">
                        <div className="flex-1 p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-violet-100 transition-all hover:bg-white hover:shadow-lg hover:shadow-slate-100 group cursor-help">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-violet-500">Admin</p>
                            <p className="text-xs font-bold text-slate-600">admin / admin123</p>
                        </div>
                        <div className="flex-1 p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-violet-100 transition-all hover:bg-white hover:shadow-lg hover:shadow-slate-100 group cursor-help">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-violet-500">Staff</p>
                            <p className="text-xs font-bold text-slate-600">cashier / cashier123</p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .perspective-1000 { perspective: 1000px; }
            `}</style>
        </div>
    );
};

export default LoginForm;
