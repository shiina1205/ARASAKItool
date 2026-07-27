import { useEffect, useState } from 'react';

type BootState = 'loading' | 'ready' | 'error';

let legacyBootPromise: Promise<void> | undefined;

function loadScript(src: string, module = false): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.type = module ? 'module' : 'text/javascript';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`${src} の読み込みに失敗しました`));
    document.body.append(script);
  });
}

function bootLegacyApp(): Promise<void> {
  legacyBootPromise ??= loadScript('./assets/js/app-v0.8.js')
    .then(() => loadScript('./assets/js/firebase-v0.8.js', true));
  return legacyBootPromise;
}

export function AppBootstrap() {
  const [bootState, setBootState] = useState<BootState>('loading');

  useEffect(() => {
    const onReady = () => setBootState('ready');
    document.addEventListener('arasaki-app-ready', onReady, { once: true });

    if (window.__ARASAKI_APP_READY__) {
      setBootState('ready');
    }

    void bootLegacyApp()
      .then(() => {
        if (window.__ARASAKI_APP_READY__) setBootState('ready');
      })
      .catch((error: unknown) => {
        console.error(error);
        setBootState('error');
      });

    return () => document.removeEventListener('arasaki-app-ready', onReady);
  }, []);

  if (bootState === 'error') {
    return <span className="version-badge">起動エラー</span>;
  }

  return (
    <span className="version-badge" aria-live="polite">
      {bootState === 'ready' ? 'React + TypeScript v0.9 ✓' : 'React + TypeScript（読込中）'}
    </span>
  );
}
