import { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Hero } from './Hero';

const THEMES = [
  'apple',
  'clear-skies',
  'monsoon-radar',
  'singapore-morning',
  'coastal',
  'paper',
  'midnight',
  'alpine-forecast',
] as const;
type Theme = (typeof THEMES)[number];

function getInitialTheme(): Theme {
  const saved = window.localStorage.getItem('weather-starter-theme');
  return THEMES.includes(saved as Theme) ? (saved as Theme) : 'apple';
}

export function Layout() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('weather-starter-theme', theme);
  }, [theme]);

  return (
    <div className="relative flex h-full min-h-screen w-full">
      <label className="fixed right-5 top-4 z-[1300] flex items-center gap-2 rounded-full border border-white/20 bg-slate-950/35 px-3 py-2 text-xs font-medium text-white/80 shadow-lg backdrop-blur-xl">
        <span>Theme</span>
        <select
          aria-label="Choose visual theme"
          value={theme}
          onChange={(event) => setTheme(event.target.value as Theme)}
          className="cursor-pointer border-0 bg-transparent pr-1 text-xs font-semibold text-white outline-none [&>option]:bg-slate-900 [&>option]:text-white"
        >
          {THEMES.map((option) => (
            <option key={option} value={option}>
            {option === 'alpine-forecast'
              ? 'Alpine Forecast'
              : option.includes('-')
              ? option
                  .split('-')
                  .map((word) => word[0].toUpperCase() + word.slice(1))
                  .join(' ')
              : option[0].toUpperCase() + option.slice(1)}
            </option>
          ))}
        </select>
      </label>
      <Sidebar />
      <Hero />
    </div>
  );
}
