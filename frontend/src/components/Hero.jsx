import React from 'react';

const Hero = ({ onOpenChat }) => {
    return (
        <section className="relative overflow-hidden pt-8 pb-24 lg:pt-12 lg:pb-32">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-72 h-72 bg-accent-light rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
                    {/* Left Content */}
                    <div className="flex-1 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-100 mb-6">
                            <span className="flex h-2 w-2 rounded-full bg-primary-500 animate-pulse"></span>
                            <span className="text-xs font-semibold text-primary-700 uppercase tracking-wider">
                                Resmi PENS Chatbot
                            </span>
                        </div>

                        <h1 className="text-4xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                            Selamat Datang <span className="text-primary-600">Mahasiswa Baru</span> PENS
                        </h1>

                        <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                            Silahkan mengikuti alur sesuai panduan. Jika ada yang dibingungkan bisa ditanyakan melalui chatbot pintar kami yang siap membantu 24/7.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                            <button
                                onClick={onOpenChat}
                                className="w-full sm:w-auto px-10 py-4 bg-primary-600 text-white font-bold rounded-2xl shadow-xl shadow-primary-200 hover:bg-primary-700 hover:-translate-y-1 transition-all duration-300"
                            >
                                Mulai Chat sekarang
                            </button>
                            <button className="w-full sm:w-auto px-10 py-4 bg-white text-gray-800 font-bold rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-all duration-300">
                                Lihat Panduan
                            </button>
                        </div>

                        <div className="mt-12 flex items-center gap-4 justify-center lg:justify-start">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-gray-${i * 100 + 100}`}></div>
                                ))}
                            </div>
                            <p className="text-sm text-gray-500 font-medium">
                                Bergabung dengan <span className="text-gray-900">1000+</span> mahasiswa baru lainnya
                            </p>
                        </div>
                    </div>

                    {/* Right Image/Illustration */}
                    <div className="flex-1 w-full max-w-xl relative flex justify-center">
                        <div className="relative w-full max-w-[450px]">
                            {/* Glow Effect */}
                            <div className="absolute inset-0 bg-primary-200 rounded-full filter blur-3xl opacity-20 scale-110 animate-pulse"></div>

                            {/* Better Placeholder Robot */}
                            <img
                                src="/robo ai.png"
                                alt="PENS Chatbot Assistant"
                                className="relative w-full h-auto drop-shadow-[0_20px_50px_rgba(37,99,235,0.2)] animate-float z-10"
                            />

                            {/* Floating Cards - Refined positioning */}
                            <div className="absolute top-10 -left-12 p-3 bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-white/50 animate-bounce-slow z-20">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    </div>
                                    <p className="text-[11px] font-bold text-gray-800 whitespace-nowrap">Cepat & Akurat</p>
                                </div>
                            </div>

                            <div className="absolute bottom-20 -right-8 p-3 bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-white/50 animate-bounce-slow animation-delay-2000 z-20">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                                    </div>
                                    <p className="text-[11px] font-bold text-gray-800 whitespace-nowrap">Bantuan 24/7</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
