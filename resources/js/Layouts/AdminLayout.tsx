import { Link, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard, Package, ShoppingBag, Users, Tag,
    Settings, ChevronRight, Menu, X, LogOut,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/Components/ui/button';

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Produtos', icon: Package },
    { href: '/admin/orders', label: 'Pedidos', icon: ShoppingBag },
    { href: '/admin/categories', label: 'Categorias', icon: Tag },
    { href: '/admin/users', label: 'Usuários', icon: Users },
];

interface Props { children: React.ReactNode; title?: string; }

export default function AdminLayout({ children, title }: Props) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { url } = usePage();

    const Sidebar = ({ mobile = false }) => (
        <div className={cn(
            'flex flex-col h-full bg-card border-r',
            mobile ? 'fixed inset-y-0 left-0 z-50 w-64 shadow-xl' : 'w-64 fixed inset-y-0'
        )}>
            <div className="flex items-center justify-between px-6 py-4 border-b">
                <Link href="/admin" className="font-bold text-lg">⚡ Admin</Link>
                {mobile && (
                    <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                        <X className="h-5 w-5" />
                    </Button>
                )}
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const isActive = url === href || (href !== '/admin' && url.startsWith(href));
                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setSidebarOpen(false)}
                            className={cn(
                                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                                isActive
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                            )}
                        >
                            <Icon className="h-4 w-4 shrink-0" />
                            {label}
                            {isActive && <ChevronRight className="h-3 w-3 ml-auto" />}
                        </Link>
                    );
                })}
            </nav>
            <div className="border-t p-3 space-y-1">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                    <Settings className="h-4 w-4" />
                    Ver Loja
                </Link>
                <Link
                    href="/logout"
                    method="post"
                    as="button"
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                >
                    <LogOut className="h-4 w-4" />
                    Sair
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background">
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
                <Sidebar />
            </div>

            {/* Mobile Sidebar */}
            {sidebarOpen && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
                    <Sidebar mobile />
                </>
            )}

            {/* Main Content */}
            <div className="md:pl-64">
                {/* Top bar */}
                <header className="sticky top-0 z-30 flex h-14 items-center border-b bg-background/95 backdrop-blur px-6 gap-4">
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(true)}>
                        <Menu className="h-5 w-5" />
                    </Button>
                    {title && <h1 className="font-semibold text-lg">{title}</h1>}
                </header>

                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}