import { useState, useEffect } from 'react';

interface OOBEProps {
  onComplete: (settings: {
    name: string;
    region: string;
    language: string;
    theme: 'light' | 'dark';
    accentColor: string;
  }) => void;
}

const REGIONS = [
  { code: 'RU', name: 'Россия', flag: '🇷🇺' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'DE', name: 'Deutschland', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'JP', name: '日本', flag: '🇯🇵' },
  { code: 'CN', name: '中国', flag: '🇨🇳' },
];

const LANGUAGES = [
  { code: 'ru', name: 'Русский' },
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
  { code: 'fr', name: 'Français' },
  { code: 'ja', name: '日本語' },
];

const ACCENT_COLORS = [
  { name: 'Blue', value: '#007aff' },
  { name: 'Purple', value: '#af52de' },
  { name: 'Pink', value: '#ff2d55' },
  { name: 'Red', value: '#ff3b30' },
  { name: 'Orange', value: '#ff9500' },
  { name: 'Yellow', value: '#ffcc00' },
  { name: 'Green', value: '#34c759' },
  { name: 'Teal', value: '#5ac8fa' },
];

export default function OOBE({ onComplete }: OOBEProps) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [region, setRegion] = useState('RU');
  const [language, setLanguage] = useState('ru');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [accentColor, setAccentColor] = useState('#007aff');
  const [animating, setAnimating] = useState(true);

  useEffect(() => {
    setTimeout(() => setAnimating(false), 2000);
  }, []);

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      localStorage.setItem('eos_setup_complete', 'true');
      onComplete({ name, region, language, theme, accentColor });
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  // Step 0: Welcome
  if (step === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className={`text-center transition-all duration-1000 ${animating ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
          <div className="animate-logo-float mb-8">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl">
              <span className="material-icons text-white text-5xl">computer</span>
            </div>
          </div>
          <h1 className="text-white text-4xl font-light mb-3">Добро пожаловать в eOS</h1>
          <p className="text-gray-400 text-lg mb-12">Desktop v2.0 — Liquid Glass</p>
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full text-lg transition-all backdrop-blur-sm border border-white/20"
          >
            Начать настройку
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto px-8">
        {/* Progress */}
        <div className="flex gap-2 mb-12 justify-center">
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={i}
              className={`h-1 w-16 rounded-full transition-all duration-300 ${
                i <= step ? 'bg-white' : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        <div className="animate-fade-in-up" key={step}>
          {/* Step 1: Region & Language */}
          {step === 1 && (
            <div className="text-center">
              <h2 className="text-white text-3xl font-light mb-2">Регион и язык</h2>
              <p className="text-gray-400 mb-10">Выберите ваш регион и язык интерфейса</p>
              
              <div className="grid grid-cols-2 gap-6 max-w-lg mx-auto">
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Регион</label>
                  <select
                    value={region}
                    onChange={e => setRegion(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white backdrop-blur-sm focus:outline-none focus:border-white/40"
                  >
                    {REGIONS.map(r => (
                      <option key={r.code} value={r.code} className="bg-gray-800">
                        {r.flag} {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-sm mb-2 block">Язык</label>
                  <select
                    value={language}
                    onChange={e => setLanguage(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white backdrop-blur-sm focus:outline-none focus:border-white/40"
                  >
                    {LANGUAGES.map(l => (
                      <option key={l.code} value={l.code} className="bg-gray-800">
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Appearance */}
          {step === 2 && (
            <div className="text-center">
              <h2 className="text-white text-3xl font-light mb-2">Внешний вид</h2>
              <p className="text-gray-400 mb-10">Выберите тему оформления и акцентный цвет</p>
              
              <div className="mb-8">
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setTheme('light')}
                    className={`w-32 h-24 rounded-xl border-2 transition-all ${
                      theme === 'light' ? 'border-white shadow-lg shadow-white/20' : 'border-white/20'
                    } bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center`}
                  >
                    <span className="material-icons text-gray-700 text-3xl">light_mode</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`w-32 h-24 rounded-xl border-2 transition-all ${
                      theme === 'dark' ? 'border-white shadow-lg shadow-white/20' : 'border-white/20'
                    } bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center`}
                  >
                    <span className="material-icons text-gray-300 text-3xl">dark_mode</span>
                  </button>
                </div>
                <p className="text-gray-400 text-sm mt-3">
                  {theme === 'light' ? 'Светлая тема' : 'Тёмная тема'}
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-4">Акцентный цвет</p>
                <div className="flex gap-3 justify-center flex-wrap">
                  {ACCENT_COLORS.map(c => (
                    <button
                      key={c.value}
                      onClick={() => setAccentColor(c.value)}
                      className={`w-10 h-10 rounded-full transition-all ${
                        accentColor === c.value ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent scale-110' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Account */}
          {step === 3 && (
            <div className="text-center">
              <h2 className="text-white text-3xl font-light mb-2">Учётная запись</h2>
              <p className="text-gray-400 mb-10">Создайте имя пользователя для eOS</p>
              
              <div className="max-w-sm mx-auto">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="material-icons text-white text-4xl">person</span>
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ваше имя"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-white text-center text-xl backdrop-blur-sm focus:outline-none focus:border-white/40 placeholder-gray-500"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Step 4: Migration */}
          {step === 4 && (
            <div className="text-center">
              <h2 className="text-white text-3xl font-light mb-2">Миграция данных</h2>
              <p className="text-gray-400 mb-10">Импортировать настройки из предыдущей версии?</p>
              
              <div className="max-w-md mx-auto space-y-4">
                <button
                  onClick={handleNext}
                  className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-6 py-4 text-white text-left transition-all flex items-center gap-4"
                >
                  <span className="material-icons text-blue-400">cloud_upload</span>
                  <div>
                    <div className="font-medium">Импортировать из ePhone Player</div>
                    <div className="text-sm text-gray-400">Восстановить приложения и настройки</div>
                  </div>
                </button>
                <button
                  onClick={handleNext}
                  className="w-full bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-6 py-4 text-white text-left transition-all flex items-center gap-4"
                >
                  <span className="material-icons text-gray-400">skip_next</span>
                  <div>
                    <div className="font-medium">Начать с чистого листа</div>
                    <div className="text-sm text-gray-400">Создать новую систему</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Complete */}
          {step === 5 && (
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center animate-pulse-slow">
                <span className="material-icons text-white text-4xl">check</span>
              </div>
              <h2 className="text-white text-3xl font-light mb-2">Всё готово!</h2>
              <p className="text-gray-400 mb-10">
                {name ? `Добро пожаловать, ${name}!` : 'Добро пожаловать в eOS Desktop!'}
              </p>
              <div className="liquid-glass rounded-2xl p-6 max-w-sm mx-auto text-left mb-8" style={{ background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.1)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-icons text-white/60">person</span>
                  <span className="text-white">{name || 'User'}</span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-icons text-white/60">palette</span>
                  <span className="text-white">{theme === 'dark' ? 'Тёмная' : 'Светлая'} тема</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-icons text-white/60">language</span>
                  <span className="text-white">{LANGUAGES.find(l => l.code === language)?.name}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-12">
          <button
            onClick={handleBack}
            className={`px-6 py-2 text-white/60 hover:text-white transition-all ${step <= 1 ? 'invisible' : ''}`}
          >
            ← Назад
          </button>
          <button
            onClick={handleNext}
            className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-sm border border-white/20"
            style={{ backgroundColor: step === 5 ? accentColor : undefined }}
          >
            {step === 5 ? 'Начать работу' : 'Далее →'}
          </button>
        </div>
      </div>
    </div>
  );
}
