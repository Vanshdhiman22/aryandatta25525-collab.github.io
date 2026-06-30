import { useEffect, useRef } from 'react';
import markup from './bsnMarkup.html?raw';
import { mountBSN } from './bsnLogic.js';
import './styles.css';

/**
 * BSNSite
 *
 * Renders the original BSN page markup and runs the original application logic.
 *
 * The original site is an imperative DOM + Three.js + GSAP experience that drives
 * everything by element id. Rather than rewrite ~400 lines of markup and ~320
 * lines of imperative logic into idiomatic React (which would inevitably change
 * behaviour), we mount the exact original markup and run the exact original code
 * inside an effect. This is a standard React integration pattern for imperative
 * widgets, and it guarantees the backend/API calls stay byte-for-byte identical.
 */
export default function BSNSite() {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return undefined;
    // mountBSN instantiates the original Component and runs its lifecycle.
    const cleanup = mountBSN();
    return cleanup;
  }, []);

  return (
    <div ref={ref} dangerouslySetInnerHTML={{ __html: markup }} />
  );