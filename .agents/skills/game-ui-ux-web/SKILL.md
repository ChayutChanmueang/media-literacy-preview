---
name: game-ui-ux-web
description: >
  Creates, polishes, and maintains consistent UI/UX for browser-based games built
  with Phaser.js + Vite + Material UI (MUI). Use this skill whenever the user wants
  to build or refine any game UI — HUD elements, menu screens, minigame UI overlays,
  landing pages, or loading/transition screens. Trigger for requests like "make the
  health bar look better", "design the main menu", "create a theme system", "polish
  the UI", "add dark mode", "make it feel consistent", "build the minigame UI",
  "create a loading screen", or "design the landing page". Enforces a single
  source-of-truth Design Token System via MUI ThemeProvider with system-aware
  dark/light mode. All components are MUI-based and integrated with Phaser.js canvas.
---

# Game UI/UX Web Skill

Senior game UI designer + frontend engineer for Phaser.js + Vite + MUI projects.
Builds visually consistent, system-aware UI with a token-first approach:
define once in the MUI theme → propagate everywhere automatically.

> [!IMPORTANT]
> **Mandatory Guideline Check:**
> Before making any UX/UI changes or improvements, you MUST read and follow the project-specific guidelines in:
> `docs/wiki/guidelines/ux-ui-guidelines.md`

---

## Stack Overview

| Layer | Technology | Role |
|-------|-----------|------|
| Game Engine | Phaser.js 3 | Canvas rendering, game logic |
| Build Tool | Vite | Dev server, HMR, bundling |
| UI Framework | Material UI (MUI) v5+ | All DOM UI components |
| Theme System | MUI ThemeProvider | Design tokens, dark/light mode |
| Styling | MUI `sx` prop + `styled()` | Component-level styles |

**Architecture rule:** Phaser handles canvas; MUI handles all DOM UI layers on top.

---

## Design Token System (Source of Truth)

### Theme File: `src/theme/index.ts`

This is the single source of truth. All colors, typography, spacing, and shadows
are defined here — never hardcoded inside components.

```typescript
// src/theme/index.ts
import { createTheme, ThemeOptions } from '@mui/material/styles';

const baseTokens = {
  // ── GAME-SPECIFIC PALETTE ──────────────────────────────
  gold:    { main: '#C8A96E', light: '#E8C98E', dark: '#A8894E', glow: '#C8A96E33' },
  danger:  { main: '#C86E6E', glow: '#C86E6E33' },
  success: { main: '#6EC87A', glow: '#6EC87A33' },
  mana:    { main: '#6E8DC8', glow: '#6E8DC833' },

  // ── TYPOGRAPHY SCALE ──────────────────────────────────
  fontDisplay: '"Cinzel", serif',      // Titles, HUD headers
  fontBody:    '"Crimson Text", serif', // Descriptions, tooltips
  fontMono:    '"Share Tech Mono", monospace', // Stats, numbers

  // ── MOTION ────────────────────────────────────────────
  transitionFast: '120ms ease',
  transitionBase: '240ms ease',
  transitionSlow: '480ms ease',
};

const darkTokens: ThemeOptions = {
  palette: {
    mode: 'dark',
    background: { default: '#0A0A12', paper: '#13131F' },
    primary:    { main: baseTokens.gold.main, light: baseTokens.gold.light, dark: baseTokens.gold.dark },
    error:      { main: baseTokens.danger.main },
    success:    { main: baseTokens.success.main },
    text:       { primary: '#E8E0D0', secondary: '#8A8070' },
    divider:    '#C8A96E22',
  },
};

const lightTokens: ThemeOptions = {
  palette: {
    mode: 'light',
    background: { default: '#F5F0E8', paper: '#FFFDF7' },
    primary:    { main: '#8B6E3E', light: '#C8A96E', dark: '#5A4520' },
    error:      { main: '#C83030' },
    success:    { main: '#2E8B3A' },
    text:       { primary: '#1A1208', secondary: '#5A5040' },
    divider:    '#8B6E3E22',
  },
};

const sharedOverrides = (mode: 'dark' | 'light'): ThemeOptions => ({
  typography: {
    fontFamily: baseTokens.fontBody,
    h1: { fontFamily: baseTokens.fontDisplay, letterSpacing: '0.05em' },
    h2: { fontFamily: baseTokens.fontDisplay, letterSpacing: '0.04em' },
    h3: { fontFamily: baseTokens.fontDisplay },
    overline: { fontFamily: baseTokens.fontMono, letterSpacing: '0.1em' },
    caption:  { fontFamily: baseTokens.fontMono },
  },
  shape: { borderRadius: 4 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: baseTokens.fontDisplay,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          transition: baseTokens.transitionFast,
        },
        containedPrimary: {
          '&:hover': {
            boxShadow: `0 0 16px ${baseTokens.gold.glow}`,
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: `1px solid`,
          borderColor: mode === 'dark' ? '#C8A96E22' : '#8B6E3E22',
        },
      },
    },
  },
});

export const getTheme = (mode: 'dark' | 'light') =>
  createTheme({
    ...(mode === 'dark' ? darkTokens : lightTokens),
    ...sharedOverrides(mode),
  });

export { baseTokens };
```

### System-Aware Toggle: `src/theme/ThemeProvider.tsx`

```tsx
// src/theme/ThemeProvider.tsx
import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from './index';

type Mode = 'dark' | 'light' | 'system';

const ThemeCtx = createContext<{ mode: Mode; setMode: (m: Mode) => void }>({
  mode: 'system', setMode: () => {},
});

export const useThemeMode = () => useContext(ThemeCtx);

export function GameThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>('system');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  const resolved = mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;
  const theme = useMemo(() => getTheme(resolved), [resolved]);

  // Sync system preference changes
  useEffect(() => {
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setMode('system'); // re-trigger memo
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  return (
    <ThemeCtx.Provider value={{ mode, setMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeCtx.Provider>
  );
}
```

---

## Component Patterns

All components use MUI + `sx` prop referencing theme tokens. Never use hardcoded values.

### HUD Components

#### Health / Resource Bar
```tsx
// src/ui/hud/ResourceBar.tsx
import { Box, Typography } from '@mui/material';

interface ResourceBarProps {
  label: string;
  value: number;
  max: number;
  variant?: 'health' | 'mana' | 'stamina';
}

export function ResourceBar({ label, value, max, variant = 'health' }: ResourceBarProps) {
  const pct = (value / max) * 100;
  const colorMap = {
    health:  'error.main',
    mana:    'primary.main',  // override in theme if needed
    stamina: 'success.main',
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', width: '3ch' }}>
        {label}
      </Typography>
      <Box sx={{
        flex: 1, height: 8,
        bgcolor: 'background.paper',
        border: '1px solid', borderColor: 'divider',
        borderRadius: 'shape.borderRadius',
        overflow: 'hidden',
      }}>
        <Box sx={{
          width: `${pct}%`, height: '100%',
          bgcolor: colorMap[variant],
          transition: 'width 240ms ease',
          boxShadow: pct < 25 ? `0 0 8px currentColor` : 'none',
        }} />
      </Box>
      <Typography variant="caption" sx={{ color: 'text.secondary', width: '7ch', textAlign: 'right' }}>
        {value}/{max}
      </Typography>
    </Box>
  );
}
```

#### HUD Overlay (Phaser integration)
```tsx
// src/ui/hud/HudLayer.tsx — DOM layer over Phaser canvas
export function HudLayer() {
  return (
    <Box sx={{
      position: 'absolute', inset: 0,
      pointerEvents: 'none',        // clicks pass through to Phaser
      display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between', p: 2,
    }}>
      {/* Top-left: Player stats */}
      <Box sx={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', gap: 1, maxWidth: 220 }}>
        <ResourceBar label="HP" value={72} max={100} variant="health" />
        <ResourceBar label="MP" value={45} max={60} variant="mana" />
      </Box>

      {/* Bottom-center: Action bar */}
      <Box sx={{ pointerEvents: 'auto', display: 'flex', justifyContent: 'center' }}>
        {/* ActionBar component here */}
      </Box>
    </Box>
  );
}
```

### Minigame UI Components

Minigame = a **separate Phaser Scene** with its own canvas context, launched from the
main game and communicating back via an EventBus. MUI handles all DOM chrome around
or above the canvas; Phaser handles all in-canvas rendering.

#### Architecture: Scene ↔ React EventBus
```typescript
// src/lib/EventBus.ts — shared event channel between Phaser and React
import { EventEmitter } from 'eventemitter3';
export const EventBus = new EventEmitter();

// Phaser scene emits:   EventBus.emit('minigame:score', { score: 42 })
// React listens:        EventBus.on('minigame:score', ({ score }) => setScore(score))
// React emits:          EventBus.emit('minigame:exit')
// Phaser scene listens: EventBus.on('minigame:exit', () => this.scene.stop())
```

#### Phaser Minigame Scene Stub
```typescript
// src/game/scenes/MinigameScene.ts
import Phaser from 'phaser';
import { EventBus } from '../../lib/EventBus';

export class MinigameScene extends Phaser.Scene {
  private score = 0;
  private timeLeft = 30;
  private timer!: Phaser.Time.TimerEvent;

  constructor() { super({ key: 'MinigameScene' }); }

  create() {
    EventBus.emit('minigame:started', { timeTotal: this.timeLeft });

    // Countdown timer — emits tick to React overlay
    this.timer = this.time.addEvent({
      delay: 1000, repeat: this.timeLeft - 1,
      callback: () => {
        this.timeLeft--;
        EventBus.emit('minigame:tick', { timeLeft: this.timeLeft });
        if (this.timeLeft <= 0) this.endGame();
      },
    });

    // Listen for exit signal from React UI
    EventBus.on('minigame:exit', () => { this.timer.remove(); this.scene.stop(); }, this);
  }

  addScore(pts: number) {
    this.score += pts;
    EventBus.emit('minigame:score', { score: this.score });
  }

  endGame() {
    this.timer.remove();
    EventBus.emit('minigame:ended', { score: this.score });
  }

  shutdown() { EventBus.removeAllListeners(); }
}
```

#### React Minigame Wrapper (DOM overlay + state sync)
```tsx
// src/ui/minigame/MinigameWrapper.tsx
import { useEffect, useState } from 'react';
import { Box, Typography, LinearProgress, Chip, Button } from '@mui/material';
import { EventBus } from '../../lib/EventBus';
import { GamePanel } from '../menu/GamePanel';

type Phase = 'playing' | 'ended';

export function MinigameWrapper({ phaserRef, timeTotal = 30, onExit }: {
  phaserRef: React.RefObject<HTMLDivElement>;  // wraps the Phaser canvas div
  timeTotal?: number;
  onExit: () => void;
}) {
  const [phase, setPhase]     = useState<Phase>('playing');
  const [score, setScore]     = useState(0);
  const [timeLeft, setTime]   = useState(timeTotal);
  const [finalScore, setFinal]= useState(0);

  useEffect(() => {
    EventBus.on('minigame:score', ({ score }: { score: number }) => setScore(score));
    EventBus.on('minigame:tick',  ({ timeLeft }: { timeLeft: number }) => setTime(timeLeft));
    EventBus.on('minigame:ended', ({ score }: { score: number }) => {
      setFinal(score); setPhase('ended');
    });
    return () => {
      EventBus.off('minigame:score');
      EventBus.off('minigame:tick');
      EventBus.off('minigame:ended');
    };
  }, []);

  const timePct = (timeLeft / timeTotal) * 100;
  const warn    = timePct < 25;

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Phaser canvas lives here */}
      <div ref={phaserRef} style={{ width: '100%', height: '100%' }} />

      {/* DOM HUD overlay — pointer-events: none passthrough */}
      {phase === 'playing' && (
        <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none',
                   display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 2 }}>
          <Box sx={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: 2,
                     bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider',
                     borderRadius: 1, px: 2, py: 1 }}>
            <Box sx={{ flex: 1 }}>
              <LinearProgress variant="determinate" value={timePct} color={warn ? 'error' : 'primary'}
                sx={{ height: 6, borderRadius: 1,
                      '& .MuiLinearProgress-bar': { transition: 'width 1s linear',
                        boxShadow: warn ? '0 0 8px currentColor' : 'none' } }} />
              <Typography variant="caption" sx={{ color: warn ? 'error.main' : 'text.secondary' }}>
                {timeLeft}s
              </Typography>
            </Box>
            <Chip label={`${score} pts`} size="small" color="primary" variant="outlined" />
            <Button size="small" variant="outlined" color="error"
              sx={{ pointerEvents: 'auto' }}
              onClick={() => EventBus.emit('minigame:exit')}>
              Exit
            </Button>
          </Box>
        </Box>
      )}

      {/* Result overlay — blocks canvas interaction */}
      {phase === 'ended' && (
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex',
                   alignItems: 'center', justifyContent: 'center',
                   bgcolor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
          <GamePanel title="Result"
            actions={<>
              <Button variant="outlined" onClick={onExit}>Exit</Button>
              <Button variant="contained"
                onClick={() => { setPhase('playing'); setScore(0); setTime(timeTotal);
                                 EventBus.emit('minigame:restart'); }}>
                Try Again
              </Button>
            </>}>
            <Typography variant="h2" sx={{ color: 'primary.main', textAlign: 'center' }}>
              {finalScore}
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: 'text.secondary' }}>
              points
            </Typography>
          </GamePanel>
        </Box>
      )}
    </Box>
  );
}
```

#### Launching the Minigame Scene from Main Game
```typescript
// In main Phaser scene or game manager:
import { EventBus } from '../lib/EventBus';

// Start minigame scene alongside main scene (parallel)
this.scene.launch('MinigameScene');

// Or switch to it entirely:
this.scene.start('MinigameScene');

// Listen for minigame end in parent scene:
EventBus.once('minigame:ended', ({ score }) => {
  console.log('Minigame finished with score:', score);
  this.scene.stop('MinigameScene');
});
```

### Landing Page Components

#### Hero Section
```tsx
// src/ui/landing/HeroSection.tsx
import { Box, Typography, Button, Stack } from '@mui/material';

export function HeroSection({ title, tagline, onPlay }: {
  title: string; tagline: string; onPlay: () => void;
}) {
  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', px: 4,
      background: 'radial-gradient(ellipse at center, var(--bg-elevated) 0%, var(--bg-deep) 70%)',
    }}>
      <Stack spacing={4} alignItems="center">
        <Typography variant="h1" sx={{
          color: 'primary.main', fontSize: { xs: '2.5rem', md: '4rem' },
          textShadow: '0 0 40px currentColor',
          animation: 'glow-pulse 3s ease-in-out infinite',
          '@keyframes glow-pulse': {
            '0%,100%': { textShadow: '0 0 20px currentColor' },
            '50%':     { textShadow: '0 0 60px currentColor' },
          },
        }}>
          {title}
        </Typography>
        <Typography variant="h5" sx={{ color: 'text.secondary', maxWidth: 600 }}>
          {tagline}
        </Typography>
        <Button variant="contained" size="large" onClick={onPlay}
          sx={{ px: 6, py: 1.5, fontSize: '1.1rem' }}>
          Play Now
        </Button>
      </Stack>
    </Box>
  );
}
```

#### Game Panel (base for all menus)
```tsx
import { Paper, Box, Typography, Divider } from '@mui/material';

export function GamePanel({ title, children, actions }: {
  title: string; children: React.ReactNode; actions?: React.ReactNode;
}) {
  return (
    <Paper elevation={8} sx={{
      p: 4, minWidth: 360,
      bgcolor: 'background.paper',
      border: '1px solid', borderColor: 'divider',
    }}>
      <Typography variant="h3" sx={{ color: 'primary.main', mb: 2 }}>
        {title}
      </Typography>
      <Divider sx={{ mb: 3 }} />
      <Box>{children}</Box>
      {actions && <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>{actions}</Box>}
    </Paper>
  );
}
```

#### Theme Toggle Button
```tsx
import { IconButton, Tooltip } from '@mui/material';
import { useThemeMode } from '../theme/ThemeProvider';

export function ThemeToggle() {
  const { mode, setMode } = useThemeMode();
  const next = mode === 'dark' ? 'light' : mode === 'light' ? 'system' : 'dark';
  const icons = { dark: '🌙', light: '☀️', system: '⚙️' };

  return (
    <Tooltip title={`Theme: ${mode} → switch to ${next}`}>
      <IconButton onClick={() => setMode(next)} size="small">
        {icons[mode]}
      </IconButton>
    </Tooltip>
  );
}
```

---

## Workflow

### Command: `"create theme"`
1. Generate `src/theme/index.ts` with full token definition.
2. Generate `src/theme/ThemeProvider.tsx` with system-aware toggle.
3. Show how to wrap `main.tsx` with `<GameThemeProvider>`.
4. Output a `ThemePreview` component showing all tokens visually.

### Command: `"build [component]"`
1. Identify category: HUD / Menu / Lobby / Landing.
2. Generate MUI component using only `theme.*` tokens via `sx` prop.
3. Include Phaser integration note if it overlays the canvas.
4. Verify against Polish Checklist before outputting.

### Command: `"polish [component/screen]"`
Refinement only — do NOT restructure:
- Replace any hardcoded values with `sx` theme references.
- Add missing `transition`, hover, focus, disabled states.
- Verify dark/light mode renders correctly for both.
- Add animation for high-impact moments (mount, state change).

### Command: `"audit UI"` / `"check consistency"`
Scan provided code for:
- Hardcoded hex/px/font strings → flag and replace with theme tokens.
- Components not wrapped in `GameThemeProvider`.
- Missing `aria-label` on interactive elements.
- Dark mode rendering issues (hardcoded background defeating theme).
Output checklist; apply fixes inline.

---

## Polish Checklist (run on every component)

- [ ] All values use `sx={{ color: 'primary.main' }}` — zero hardcoded hex
- [ ] Hover state defined with `transition` referencing theme
- [ ] Focus-visible state styled for keyboard navigation
- [ ] Disabled state: `opacity: 0.4`, `cursor: 'not-allowed'`
- [ ] Dark mode and light mode both tested visually
- [ ] Animation respects `prefers-reduced-motion`
- [ ] Phaser canvas: `pointerEvents: 'none'` on overlay, `'auto'` on interactives
- [ ] MUI `aria-label` present on all icon buttons

---

## Special Commands Reference

| User says | Action |
|-----------|--------|
| `"create theme"` | Generate ThemeProvider + tokens + preview component |
| `"build HUD"` | Full HUD overlay: resource bars, stat display, action bar |
| `"build main menu"` | Title screen with MUI components + theme toggle |
| `"build pause menu"` | Modal GamePanel with resume/settings/quit |
| `"build minigame UI"` | EventBus + MinigameScene stub + MinigameWrapper with HUD overlay |
| `"build loading screen"` | Transition/loading screen between scenes |
| `"build landing page"` | Hero + features + CTA sections for game marketing |
| `"polish [X]"` | Refine specific component for consistency & feel |
| `"audit UI"` | Scan for token violations, a11y issues, dark mode bugs |
| `"add dark mode"` | Add system-aware ThemeProvider to existing project |