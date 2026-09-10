import React, { useState } from 'react';
import { Menu, X, Dumbbell, Activity, Trophy, Cloud, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import ThemeToggle from '../components/ThemeToggle';
import Footer from '../components/Footer';

// Define navigation items outside component to avoid recreation
const ShuttlecockIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 19c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5z" />
        <path d="M12 9V3" />
        <path d="M9 10l-2-5" />
        <path d="M15 10l2-5" />
        <path d="M12 19v2" />
    </svg>
);

const NAV_ITEMS = [
    { name: '天氣查詢', path: '/weather', icon: Cloud },
    { name: '馬拉松配速換算', path: '/running', icon: Activity },
    { name: '磅-公斤換算', path: '/weight', icon: Dumbbell },
    { name: '公里-英里換算', path: '/pitching', icon: Trophy },
    { name: '羽球記分板', path: '/badminton', icon: ShuttlecockIcon },
];

const SidebarContent: React.FC<{
    location: ReturnType<typeof useLocation>;
    isDesktopSidebarCollapsed: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
}> = ({ location, isDesktopSidebarCollapsed, setIsSidebarOpen }) => (
    <>
        <div className="flex items-center h-14 px-4 border-b border-rail-border shrink-0">
            <div className="flex items-center gap-2 w-full min-w-0">
                <div className="shrink-0 overflow-hidden rounded-md w-8 h-8">
                    <img src="/runner_icon.jpg" alt="" width={32} height={32} className="w-full h-full object-cover" />
                </div>
                {/* The rail is a declared surface, so its foreground is a token.
                    No !important, no inline hex — the colour has an owner now. */}
                <span className={clsx('font-display font-extrabold text-2xl tracking-tight text-rail-ink whitespace-nowrap overflow-hidden', isDesktopSidebarCollapsed && 'hidden')}>
                    Z-Running
                </span>
            </div>
            <button
                onClick={() => setIsSidebarOpen(false)}
                aria-label="關閉選單"
                className="md:hidden shrink-0 grid place-items-center w-11 h-11 -mr-2 rounded-lg text-rail-ink-muted cursor-pointer t-press [@media(hover:hover)]:hover:bg-rail-2 [@media(hover:hover)]:hover:text-rail-ink"
            >
                <X size={22} />
            </button>
        </div>

        <nav aria-label="主選單" className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
                {NAV_ITEMS.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <li key={item.path}>
                            <Link
                                to={item.path}
                                onClick={() => setIsSidebarOpen(false)}
                                aria-current={isActive ? 'page' : undefined}
                                className={clsx(
                                    'flex items-center gap-3 h-12 px-3 rounded-lg whitespace-nowrap t-surface',
                                    isActive ? 'bg-primary text-primary-ink font-semibold' : 'text-rail-ink-muted [@media(hover:hover)]:hover:bg-rail-2 [@media(hover:hover)]:hover:text-rail-ink',
                                )}
                                title={isDesktopSidebarCollapsed ? item.name : undefined}
                            >
                                <item.icon size={22} className="shrink-0" />
                                <span className={clsx('font-medium overflow-hidden', isDesktopSidebarCollapsed && 'hidden')}>{item.name}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>

        <div className="p-3 border-t border-rail-border shrink-0">
            <ThemeToggle showLabel={!isDesktopSidebarCollapsed} />
        </div>
    </>
);

const AppLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile default closed
    const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false); // Desktop collapse state
    const location = useLocation();

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const toggleDesktopSidebar = () => setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed);

    // Routes outside the menu still need a title — falling back to the wordmark
    // duplicated the rail's logotype in the header.
    const OFF_MENU_TITLES: Record<string, string> = { '/ui': '元件庫' };
    const pageTitle = NAV_ITEMS.find((item) => item.path === location.pathname)?.name ?? OFF_MENU_TITLES[location.pathname] ?? 'Z-Running';

    return (
        // dvh, not vh — iOS counts the retracting toolbar in 100vh and the bottom
        // of the scroll region ends up under browser chrome.
        <div className="flex h-dvh bg-app overflow-hidden">
            {/* N3 Side-rail — desktop */}
            <aside
                className={clsx(
                    // Width is a layout property; animating it thrashes layout every
                    // frame. The rail snaps and the content reflows once.
                    'hidden md:flex bg-rail flex-col z-sticky h-full border-r border-rail-border shrink-0',
                    isDesktopSidebarCollapsed ? 'w-20' : 'w-64',
                )}
            >
                <SidebarContent location={location} isDesktopSidebarCollapsed={isDesktopSidebarCollapsed} setIsSidebarOpen={setIsSidebarOpen} />
            </aside>

            {/* N3 Side-rail — mobile sheet */}
            <div className={clsx('fixed inset-0 z-modal md:hidden', !isSidebarOpen && 'pointer-events-none')}>
                <div
                    className={clsx('absolute inset-0 bg-black/55 backdrop-blur-sm transition-opacity duration-300 ease-out', isSidebarOpen ? 'opacity-100' : 'opacity-0')}
                    onClick={() => setIsSidebarOpen(false)}
                    aria-hidden
                />
                <aside
                    className={clsx(
                        'absolute top-0 left-0 w-64 h-full bg-rail shadow-2xl flex flex-col transition-transform duration-300 ease-out',
                        isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
                    )}
                    aria-hidden={!isSidebarOpen}
                    // Keeps the closed sheet out of the tab order without removing it
                    // from the DOM — no focus leak behind the backdrop.
                    inert={!isSidebarOpen}
                >
                    <SidebarContent location={location} isDesktopSidebarCollapsed={false} setIsSidebarOpen={setIsSidebarOpen} />
                </aside>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-surface z-sticky h-14 flex items-center gap-1 px-2 md:px-4 border-b border-border sticky top-0 shrink-0">
                    <button
                        onClick={toggleSidebar}
                        aria-label="開啟選單"
                        aria-expanded={isSidebarOpen}
                        className="md:hidden grid place-items-center w-11 h-11 rounded-lg text-ink-muted cursor-pointer t-press [@media(hover:hover)]:hover:bg-surface-3 [@media(hover:hover)]:hover:text-ink"
                    >
                        <Menu size={22} />
                    </button>
                    <button
                        onClick={toggleDesktopSidebar}
                        aria-label={isDesktopSidebarCollapsed ? '展開側欄' : '收合側欄'}
                        aria-expanded={!isDesktopSidebarCollapsed}
                        className="hidden md:grid place-items-center w-11 h-11 rounded-lg text-ink-muted cursor-pointer t-press [@media(hover:hover)]:hover:bg-surface-3 [@media(hover:hover)]:hover:text-ink"
                    >
                        {isDesktopSidebarCollapsed ? <PanelLeftOpen size={22} /> : <PanelLeftClose size={22} />}
                    </button>
                    {/* One h1 per page, and it lives here. Pages start at h2. */}
                    <h1 className="ml-1 md:ml-2 text-lg md:text-xl font-extrabold text-ink truncate">{pageTitle}</h1>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-[max(1rem,env(safe-area-inset-bottom))]">
                    <div className="max-w-7xl mx-auto flex flex-col min-h-full">
                        <div className="flex-1">
                            <Outlet />
                        </div>
                        <Footer />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
