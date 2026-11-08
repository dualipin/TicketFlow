import { describe, it, expect, beforeEach } from 'bun:test';

describe('Theme Persistence and Toggle Logic', () => {
  const STORAGE_KEY = 'ticketflow_theme';
  let storage: Record<string, string> = {};
  const classList = new Set<string>();

  beforeEach(() => {
    storage = {};
    classList.clear();
  });

  const getStoredTheme = () => storage[STORAGE_KEY] || 'system';
  const resolveTheme = (theme: 'light' | 'dark' | 'system', systemIsDark = true) => {
    if (theme === 'system') return systemIsDark ? 'dark' : 'light';
    return theme;
  };

  const applyTheme = (theme: 'light' | 'dark' | 'system', systemIsDark = true) => {
    storage[STORAGE_KEY] = theme;
    const resolved = resolveTheme(theme, systemIsDark);
    if (resolved === 'dark') {
      classList.add('dark');
    } else {
      classList.delete('dark');
    }
    return resolved;
  };

  it('persists and cycles through dark, light, and system modes correctly', () => {
    // Default fallback is system
    expect(getStoredTheme()).toBe('system');
    let resolved = applyTheme('system', true);
    expect(resolved).toBe('dark');
    expect(classList.has('dark')).toBe(true);

    // If system is light
    resolved = applyTheme('system', false);
    expect(resolved).toBe('light');
    expect(classList.has('dark')).toBe(false);

    // Set to light
    resolved = applyTheme('light', true);
    expect(getStoredTheme()).toBe('light');
    expect(resolved).toBe('light');
    expect(classList.has('dark')).toBe(false);

    // Set to dark
    resolved = applyTheme('dark', false);
    expect(getStoredTheme()).toBe('dark');
    expect(resolved).toBe('dark');
    expect(classList.has('dark')).toBe(true);
  });
});
