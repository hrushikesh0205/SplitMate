import { useState } from 'react';
import { classNames } from '../../lib/utils.jsx';

export function Tooltip({ label, children, side = 'top' }) {
  const [show, setShow] = useState(false);
  const sides = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  };
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && (
        <span className={classNames(
          'pointer-events-none absolute z-50 whitespace-nowrap rounded-lg bg-ink-900 px-2 py-1 text-[11px] font-medium text-white shadow-lift animate-fade-in',
          sides[side]
        )}>
          {label}
        </span>
      )}
    </span>
  );
}
