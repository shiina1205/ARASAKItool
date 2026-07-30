import { useEffect, useState } from 'react';
import * as plannerDomain from './domain/planner-v1/index.ts';

type BootState = 'loading' | 'ready' | 'error';

let legacyBootPromise: Promise<void> | undefined;

window.ARASAKI_PLANNER_DOMAIN = plannerDomain;

function runtimeAsset(fileName: string): string {
  const url = new URL(`assets/js/${fileName}`, `${window.location.origin}${import.meta.env.BASE_URL}`);
  url.searchParams.set('v', '0.9.9');
  return url.href;
}

function loadScript(fileName: string, module = false): Promise<void> {
  const src = runtimeAsset(fileName);
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
  legacyBootPromise ??= loadScript('app-v0.8.js')
    .then(() => loadScript('firebase-v0.8.js', true));
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
      {bootState === 'ready' ? '同期システム稼働中' : 'システム読込中'}
    </span>
  );
}
