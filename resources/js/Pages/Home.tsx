import MainLayout from '@/Layouts/MainLayout';
import { Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { ArrowRight, Truck, Shield, RefreshCw, Headphones } from 'lucide-react';
import ProductCard from '@/Components/ProductCard';
import { Head } from '@inertiajs/react';

interface Product {
    id: number; name: string; slug: string; price: number; sale_price?: number;
    is_on_sale: boolean; current_price: number; in_stock: boolean;
    images: { image_path: string; is_primary: boolean }[];
    category: { name: string; slug: string };
    average_rating: number;
}

interface Category { id: number; name: string; slug: string; image?: string; products_count: number; }

interface Props {
    featured: Product[];
    categories: Category[];
    newArrivals: Product[];
    cartCount?: number;
}

export default function Home({ featured, categories, newArrivals, cartCount = 0 }: Props) {
    return (
        <>
        <Head title="Dashboard" />
        <MainLayout cartCount={cartCount}>
            {/* Hero Banner */}
            <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/10">
                <div className="container mx-auto px-4 py-20 flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 space-y-6">
                        <Badge variant="secondary" className="text-sm">🎉 Frete grátis acima de R$ 299</Badge>
                        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                            Compre com<br />
                            <span className="text-primary">segurança</span> e<br />
                            <span className="text-primary">praticidade</span>
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-md">
                            Milhares de produtos com os melhores preços. Entrega rápida para todo o Brasil.
                        </p>
                        <div className="flex gap-4 flex-wrap">
                            <Button size="lg" >
                                <Link href="/produtos" className="flex items-center">
                                    Ver Produtos
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>

                            <Button size="lg" variant="outline" >
                                <Link
                                    href="/produtos?on_sale=true"
                                    className="flex items-center"
                                >
                                    Ver Promoções
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                    <div className="flex-1 hidden md:block">
                        <div className="relative w-full aspect-square max-w-sm mx-auto">
                            <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl" />
                            <img
                                src="https://picsum.photos/seed/hero/500/500"
                                alt="Hero"
                                className="relative rounded-2xl object-cover w-full h-full shadow-2xl"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-12 border-y bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { icon: Truck, title: 'Frete Rápido', desc: 'Entrega em todo Brasil' },
                            { icon: Shield, title: 'Compra Segura', desc: 'Pagamento protegido' },
                            { icon: RefreshCw, title: 'Troca Fácil', desc: '30 dias para trocar' },
                            { icon: Headphones, title: 'Suporte 24h', desc: 'Atendimento sempre' },
                        ].map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="flex flex-col items-center text-center gap-2">
                                <div className="p-3 bg-primary/10 rounded-full">
                                    <Icon className="h-6 w-6 text-primary" />
                                </div>
                                <div className="font-semibold text-sm">{title}</div>
                                <div className="text-xs text-muted-foreground">{desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categorias */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold">Categorias</h2>
                        <Button variant="ghost">
                            <Link href="/produtos" className="flex items-center" >Ver todas <ArrowRight className="ml-1 h-4 w-4" /></Link>
                        </Button>
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                        {categories.map(cat => (
                            <Link
                                key={cat.id}
                                href={`/produtos?category=${cat.slug}`}
                                className="group flex flex-col items-center gap-2 p-4 rounded-xl border hover:border-primary hover:bg-primary/5 transition-all"
                            >
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-2xl group-hover:bg-primary/20 transition-colors">
                                    {cat.name.charAt(0)}
                                </div>
                                <span className="text-sm font-medium text-center leading-tight">{cat.name}</span>
                                <span className="text-xs text-muted-foreground">{cat.products_count} itens</span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Destaques */}
            <section className="py-16 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold">Produtos em Destaque</h2>
                        <Button variant="ghost">
                            <Link href="/produtos?featured=true" className="flex items-center">Ver mais <ArrowRight className="ml-1 h-4 w-4" /></Link>
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {featured.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Novidades */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold">Chegou Agora</h2>
                        <Button variant="ghost">
                            <Link href="/produtos?sort=newest" className="flex items-center">Ver tudo <ArrowRight className="ml-1 h-4 w-4" /></Link>
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {newArrivals.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Banner CTA */}
            <section className="py-16 bg-primary text-primary-foreground">
                <div className="container mx-auto px-4 text-center space-y-6">
                    <h2 className="text-3xl font-bold">Use o cupom BEMVINDO10</h2>
                    <p className="text-primary-foreground/80 text-lg">10% de desconto na sua primeira compra acima de R$ 100</p>
                    <Button size="lg" variant="secondary">
                        <Link href="/produtos">Comprar Agora</Link>
                    </Button>
                </div>
            </section>
        </MainLayout>
    </>
    );
}