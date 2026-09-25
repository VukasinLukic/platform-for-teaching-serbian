import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * Shared two-column layout for auth screens (login, register, reset password).
 * Left: notebook-paper brand panel with the logo and Alano (lg+ only).
 * Right: the form column.
 */
export default function AuthShell({ title, subtitle, children, footer, mascot = '/mascot/alano-wave.webp' }) {
  return (
    <div className="min-h-screen flex bg-white">
      <aside className="hidden lg:flex lg:w-[46%] xl:w-1/2 bg-notebook relative overflow-hidden border-r border-paper-300/70">
        <div className="relative flex flex-col justify-between w-full pl-20 pr-12 py-12 xl:pl-24">
          <Link to="/" className="block w-56 rounded-lg" aria-label="Српски у Срцу — почетна">
            <img src="/logoFULL.svg" alt="" className="w-full h-auto mix-blend-multiply" />
          </Link>
          <div className="max-w-md">
            <p className="font-display text-3xl xl:text-4xl font-semibold leading-snug text-ink">
              Српски језик учимо <span className="text-brand">срцем</span> — корак по корак, до мале матуре.
            </p>
            <p className="mt-4 text-ink-600">Видео лекције, квизови и онлајн настава са наставницом Марином Лукић.</p>
          </div>
          <img
            src={mascot}
            alt=""
            width="220"
            height="220"
            className="self-end w-44 xl:w-52 h-auto drop-shadow-xl"
            loading="lazy"
          />
        </div>
      </aside>

      <main className="w-full lg:w-[54%] xl:w-1/2 flex flex-col">
        <div className="flex items-center justify-between px-5 sm:px-8 pt-6 lg:px-16">
          <Link to="/" className="lg:hidden block w-36 rounded-lg" aria-label="Српски у Срцу — почетна">
            <img src="/logoFULL.svg" alt="" className="w-full h-auto mix-blend-multiply" />
          </Link>
          <Link
            to="/"
            className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-ink rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Почетна
          </Link>
        </div>
        <div className="flex-1 flex items-center px-5 sm:px-8 lg:px-16 py-10">
          <div className="w-full max-w-md mx-auto lg:mx-0 animate-fade-in-up">
            <h1 className="font-display text-4xl sm:text-[2.75rem] font-bold leading-[1.1] text-ink">{title}</h1>
            {subtitle && <p className="mt-3 text-lg text-ink-600">{subtitle}</p>}
            <div className="mt-10">{children}</div>
            {footer && <div className="mt-8 pt-8 border-t border-ink-100 text-center text-ink-600">{footer}</div>}
          </div>
        </div>
      </main>
    </div>
  );
}

/** Shared input styles for auth forms. */
export const authInputClass = (hasError) =>
  `w-full h-[3.25rem] pl-12 rounded-xl border bg-white text-ink placeholder:text-ink-400 transition-colors focus:outline-none focus:ring-4 ${
    hasError
      ? 'border-danger-500 focus:border-danger focus:ring-danger/15 bg-danger-50/40'
      : 'border-ink-200 hover:border-ink-300 focus:border-brand focus:ring-brand/15'
  }`;

export const authLabelClass = 'block mb-2 text-sm font-semibold text-ink';
export const authIconClass =
  'absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400 group-focus-within:text-brand transition-colors pointer-events-none';
