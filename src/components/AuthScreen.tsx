import React, { useState } from 'react';
import { Building2, LoaderCircle, LogIn } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const AuthScreen: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) return;

    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setMessage('Check your email to confirm your account, then sign in.');
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-7 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-600 text-white">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">One Gate</h1>
            <p className="text-sm text-slate-500">Community portal</p>
          </div>
        </div>

        <h2 className="text-xl font-bold text-slate-900">
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Sign in to participate and access your community workspace.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-slate-700">
            Email
            <input
              autoComplete="email"
              className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Password
            <input
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>

          {message && <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
          {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-800">{error}</p>}

          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-3 font-bold text-white hover:bg-amber-700 disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            {isSignUp ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <button
          className="mt-5 min-h-11 w-full text-sm font-semibold text-amber-800 hover:underline"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setError('');
            setMessage('');
          }}
          type="button"
        >
          {isSignUp ? 'Already have an account? Sign in' : 'New here? Create an account'}
        </button>
      </section>
    </main>
  );
};
