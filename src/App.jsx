import { lazy, Suspense, useEffect, useState } from 'react';
import BSNSite from './BSNSite.jsx';

// The previous React version is preserved as a backup. Visit "#old" (or "#legacy")
// e.g. https://bandnashrinika.com/#old to view it. It is lazy-loaded so its old
// stylesheet only activates when requested and never clashes with the new site.
const AppOld = lazy(() => import('./AppOld.jsx'));

function isLegacy() {
  const h = (typeof window !== 'undefined' && window.location.hash) || '';
  return h === '#old' || h === '#legacy';
}

export default function App() {
  const [legacy, setLegacy] = useState(isLegacy);

  useEffect(() => {
    const onHash = () => setLegacy(isLegacy());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (legacy) {
    return (
      <Suspense fallback={null}>
        <AppOld />
      </Suspense>
    );
  }
  return <BSNSite />;
}
