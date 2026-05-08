import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ShoppingCart, Heart, User, Menu, Search, X, ChevronDown } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Input } from '@/Components/ui/input';
import { cn } from '@/lib/utils';

interface Props {
    children: React.ReactNode;
    cartCount?: number;
}

export default function MainLayout({ children, cartCount = 0 }: Props) {
    const { auth } = usePage().props as any;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/produtos?search=${encodeURIComponent(searchQuery)}`;
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
                <div className="container mx-auto px-4">
                    <div className="flex h-16 items-center justify-between gap-4">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl shrink-0">
                            <span className="text-primary">🛒</span>
                            <span>MinhaLoja</span>
                        </Link>

                        {/* Search - desktop */}
                        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar produtos..."
                                    className="pl-9 pr-4"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </form>

                        {/* Nav Icons */}
                        <div className="flex items-center gap-2">
                            {auth?.user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger>
                                        <Button variant="ghost" size="sm" className="gap-1">
                                            <User className="h-4 w-4" />
                                            <span className="hidden sm:inline truncate max-w-24">
                                                {auth.user.name.split(' ')[0]}
                                            </span>
                                            <ChevronDown className="h-3 w-3" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem>
                                            <Link href="/profile">Meu Perfil</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Link href="/meus-pedidos">Meus Pedidos</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Link href="/lista-de-desejos">Lista de Desejos</Link>
                                        </DropdownMenuItem>
                                        {auth.user.roles?.includes('admin') && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem>
                                                    <Link href="/admin">Painel Admin</Link>
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem>
                                            <Link href="/logout" method="post" as="button" className="w-full text-left text-red-600">
                                                Sair
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Button variant="ghost" size="sm">
                                    <Link href="/login">Entrar</Link>
                                </Button>
                            )}

                            <Button variant="ghost" size="icon">
                                <Link href="/lista-de-desejos">
                                    <Heart className="h-5 w-5" />
                                </Link>
                            </Button>

                            <Button variant="ghost" size="icon" className="relative">
                                <Link href="/carrinho">
                                    <ShoppingCart className="h-5 w-5" />
                                    {cartCount > 0 && (
                                        <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-[10px] flex items-center justify-center">
                                            {cartCount > 99 ? '99+' : cartCount}
                                        </Badge>
                                    )}
                                </Link>
                            </Button>

                            <Button
                                variant="ghost" size="icon"
                                className="md:hidden"
                                onClick={() => setMobileOpen(!mobileOpen)}
                            >
                                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </Button>
                        </div>
                    </div>

                    {/* Nav Links */}
                    <nav className="hidden md:flex items-center gap-6 pb-3 text-sm">
                        <Link href="/produtos" className="text-muted-foreground hover:text-foreground transition-colors">
                            Todos Produtos
                        </Link>
                        <Link href="/produtos?category=eletronicos" className="text-muted-foreground hover:text-foreground transition-colors">
                            Eletrônicos
                        </Link>
                        <Link href="/produtos?category=roupas" className="text-muted-foreground hover:text-foreground transition-colors">
                            Roupas
                        </Link>
                        <Link href="/produtos?category=esportes" className="text-muted-foreground hover:text-foreground transition-colors">
                            Esportes
                        </Link>
                        <Link href="/produtos?on_sale=true" className="text-red-500 font-medium hover:text-red-600 transition-colors">
                            Promoções 🔥
                        </Link>
                    </nav>

                    {/* Mobile menu */}
                    {mobileOpen && (
                        <div className="md:hidden pb-4 space-y-2">
                            <form onSubmit={handleSearch}>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Buscar produtos..."
                                        className="pl-9"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </form>
                            <div className="flex flex-col gap-1">
                                {[
                                    { href: '/produtos', label: 'Todos Produtos' },
                                    { href: '/produtos?category=eletronicos', label: 'Eletrônicos' },
                                    { href: '/produtos?category=roupas', label: 'Roupas' },
                                    { href: '/produtos?on_sale=true', label: '🔥 Promoções' },
                                ].map(link => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="px-2 py-1.5 text-sm rounded hover:bg-accent"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Main */}
            <main>{children}</main>

            {/* Footer */}
            <footer className="border-t bg-muted/50 mt-16">
                <div className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="font-semibold mb-3">MinhaLoja</h3>
                            <p className="text-sm text-muted-foreground">
                                A melhor loja online do Brasil.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-3">Categorias</h3>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                <li><Link href="/produtos?category=eletronicos" className="hover:text-foreground">Eletrônicos</Link></li>
                                <li><Link href="/produtos?category=roupas" className="hover:text-foreground">Roupas</Link></li>
                                <li><Link href="/produtos?category=esportes" className="hover:text-foreground">Esportes</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-3">Ajuda</h3>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                <li><Link href="/meus-pedidos" className="hover:text-foreground">Meus Pedidos</Link></li>
                                <li><a href="#" className="hover:text-foreground">Política de Troca</a></li>
                                <li><a href="#" className="hover:text-foreground">Frete e Entrega</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-3">Contato</h3>
                            <ul className="space-y-1 text-sm text-muted-foreground">
                                <li>contato@minhaloja.com</li>
                                <li>(11) 99999-9999</li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
                        © {new Date().getFullYear()} MinhaLoja. Todos os direitos reservados.
                    </div>
                </div>
            </footer>
        </div>
    );
}