import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, register, isAuthenticating, error } = useAuthStore();

  const isRegister = mode === 'register';
  const heroImage =
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&fm=jpg&q=80&w=1400';

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isAuthenticating) return;

    try {
      if (isRegister) {
        await register(name.trim(), email.trim(), password);
        return;
      }

      await login(email.trim(), password);
    } catch {
      // The auth store owns error display.
    }
  };

  return (
    <div className="min-h-screen bg-[#07080b] text-zinc-100 flex items-center justify-center px-5 py-8 font-sans antialiased selection:bg-blue-500/30">
      <main className="w-full max-w-6xl grid overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl lg:grid-cols-[1.2fr_0.8fr]">
        <section className="relative min-h-[360px] overflow-hidden bg-zinc-950 lg:min-h-[650px]">
          <img
            src={heroImage}
            alt="Habit dashboard workspace"
            className="absolute inset-0 h-full w-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_22%,rgba(59,130,246,0.32),transparent_34%),linear-gradient(135deg,rgba(9,9,11,0.30),rgba(9,9,11,0.96))]" />

          <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-zinc-950/72 p-4 shadow-2xl backdrop-blur-md">
              <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_14px_#3b82f6]" />
                  <span className="font-mono text-xs font-semibold tracking-widest text-zinc-100">
                    HABIT<span className="text-blue-500">FLOW</span>
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="h-2 w-2 rounded-full bg-zinc-600" />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ['12', 'Active'],
                  ['86%', 'Focus'],
                  ['7', 'Streak'],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
                    <div className="text-2xl font-bold tracking-tight text-zinc-100">{value}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-widest text-zinc-500">{label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-3">
                {[
                  ['Morning run', 'w-10/12', 'bg-emerald-500'],
                  ['Read 20 mins', 'w-8/12', 'bg-blue-500'],
                  ['No sugar', 'w-6/12', 'bg-cyan-400'],
                ].map(([title, width, color]) => (
                  <div key={title} className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-zinc-200">{title}</span>
                      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                      <div className={`h-full rounded-full ${width} ${color}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center border-t border-zinc-800 bg-zinc-900 p-6 sm:p-8 lg:border-l lg:border-t-0">
          <div className="w-full">
            <div className="mb-6 flex justify-center">
              <div className="grid w-full max-w-xs grid-cols-2 rounded-xl border border-zinc-800 bg-zinc-950 p-1">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className={`rounded-lg px-3 py-2 text-xs font-medium uppercase tracking-wide transition ${
                    !isRegister ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-500 hover:text-zinc-200'
                  }`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className={`rounded-lg px-3 py-2 text-xs font-medium uppercase tracking-wide transition ${
                    isRegister ? 'bg-zinc-100 text-zinc-950' : 'text-zinc-500 hover:text-zinc-200'
                  }`}
                >
                  Sign up
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-rose-500/20 bg-rose-500/5 p-3 text-xs text-rose-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {isRegister && (
                <div>
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Name"
                    disabled={isAuthenticating}
                    className="h-11 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 text-sm text-zinc-100 placeholder-zinc-600 transition focus:border-blue-500 focus:outline-none disabled:opacity-40"
                  />
                </div>
              )}
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Email"
                  disabled={isAuthenticating}
                  className="h-11 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 text-sm text-zinc-100 placeholder-zinc-600 transition focus:border-blue-500 focus:outline-none disabled:opacity-40"
                />
              </div>
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Password"
                  disabled={isAuthenticating}
                  className="h-11 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 text-sm text-zinc-100 placeholder-zinc-600 transition focus:border-blue-500 focus:outline-none disabled:opacity-40"
                />
              </div>
              <button
                type="submit"
                disabled={
                  isAuthenticating ||
                  !email.trim() ||
                  password.length < 6 ||
                  (isRegister && !name.trim())
                }
                className="h-11 w-full rounded-lg bg-zinc-100 px-4 text-xs font-semibold uppercase tracking-wide text-zinc-950 transition hover:bg-zinc-200 active:scale-[0.99] disabled:bg-zinc-800 disabled:text-zinc-600"
              >
                {isAuthenticating ? 'Please wait...' : isRegister ? 'Create account' : 'Login'}
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};
