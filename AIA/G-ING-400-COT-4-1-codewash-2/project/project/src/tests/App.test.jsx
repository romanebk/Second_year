import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import App from '../App';

// Mock child components that might use Electron or heavy assets
vi.mock('../components/ui/SafeImage', () => ({
    default: ({ src, alt, className }) => <img src={src} alt={alt} className={className} />
}));

vi.mock('../components/ui/PixelHeart', () => ({
    default: () => <div data-testid="pixel-heart" />
}));

vi.mock('../components/drawers/SettingsDrawer', () => ({
    default: () => <div data-testid="settings-drawer" />
}));

vi.mock('../components/drawers/CosmeticsDrawer', () => ({
    default: () => <div data-testid="cosmetics-drawer" />
}));

vi.mock('../components/drawers/MenuDrawer', () => ({
    default: () => <div data-testid="menu-drawer" />
}));

vi.mock('../components/modals/ResetModal', () => ({
    default: () => <div data-testid="reset-modal" />
}));

vi.mock('../components/modals/BugReportModal', () => ({
    default: () => <div data-testid="bug-report-modal" />
}));

const localStorageMock = {
    getItem: vi.fn().mockReturnValue(null),
    setItem: vi.fn(),
    clear: vi.fn(),
};
globalThis.localStorage = localStorageMock;

// Mock soundManager to prevent audio-related crashes
vi.mock('../utils/soundManager', () => ({
    getBGMManager: () => ({ setVolume: vi.fn(), play: vi.fn(), stop: vi.fn() }),
    setSfxVolume: vi.fn(),
    playClick: vi.fn(),
    playActionCardLeft: vi.fn(),
    playActionCardRight: vi.fn(),
    playDeath: vi.fn(),
    playFail: vi.fn(),
    playLevelUp: vi.fn(),
    playNotification: vi.fn(),
    playSuccessfulHit: vi.fn(),
    playMobHurt: vi.fn(),
    playMobDeath: vi.fn(),
    playAchievement: vi.fn(),
}));

vi.mock('../components/ui/LoadingScreen', () => ({
    default: ({ onComplete }) => {
        setTimeout(onComplete, 0);
        return <div data-testid="loading-mocked" />;
    }
}));

vi.mock('lucide-react', async () => {
    const original = await vi.importActual('lucide-react');
    return {
        ...original,
        Menu: () => <div data-testid="icon-menu" />,
        Sparkles: () => <div data-testid="icon-sparkles" />,
        Gift: () => <div data-testid="icon-gift" />,
        Maximize: () => <div data-testid="icon-maximize" />,
        Minimize: () => <div data-testid="icon-minimize" />,
        Settings: () => <div data-testid="icon-settings" />,
        Bug: () => <div data-testid="icon-bug" />,
    };
});

test('renders the main menu with primary title', async () => {
    render(<App />);

    // The LoadingScreen might take a tick to call onComplete even when mocked
    // because it uses useEffect. We use findBy to wait for it.
    const title = await screen.findByText(/Level Up!/i, {}, { timeout: 5000 });
    expect(title).toBeInTheDocument();
}, 15000);
