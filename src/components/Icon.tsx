export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, string> = {
    spark: 'm12 3 2.6 6.4L21 12l-6.4 2.6L12 21l-2.6-6.4L3 12l6.4-2.6L12 3Z',
    heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
    grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
    arrow: 'M5 12h14m-5-5 5 5-5 5', download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
    upload: 'M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5', check: 'm5 12 4 4L19 6',
    plus: 'M12 5v14M5 12h14', close: 'm6 6 12 12M6 18 18 6',
    shuffle: 'm3 4 18 16m-4 0h4v-4M3 20 21 4m-4 0h4v4', pause: 'M8 5v14M16 5v14',
    play: 'm8 4 12 8-12 8V4Z', mouse: 'M12 3a7 7 0 0 0-7 7v4a7 7 0 0 0 14 0v-4a7 7 0 0 0-7-7Zm0 0v7',
    leaf: 'M20 3S3 2 3 13a8 8 0 0 0 8 8C22 21 20 3 20 3ZM4 20 15 9',
    globe: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3c-5 5-5 13 0 18 5-5 5-13 0-18Z',
    settings: 'M4 7h16M4 17h16M8 4v6m8 4v6',
    trash: 'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7',
    code: 'm8 7-5 5 5 5m8-10 5 5-5 5M14 3l-4 18', image: 'M3 3h18v18H3zM3 17l6-6 5 5 3-3 4 4M15 7h.01',
    moon: 'M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z',
    message: 'M21 11a8 8 0 0 1-8 8H7l-4 3V11a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8ZM7 9h10M7 13h7',
    edit: 'm15 4 5 5M3 21l5-1L21 7a2 2 0 0 0-5-5L3 15v6Z',
    sun: 'M12 3V1m0 22v-2M3 12H1m22 0h-2M4.2 4.2 2.8 2.8m18.4 18.4-1.4-1.4M4.2 19.8l-1.4 1.4M21.2 2.8l-1.4 1.4M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z',
    monitor: 'M3 3h18v13H3ZM8 21h8m-4-5v5',
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name] || paths.spark}/></svg>;
}
