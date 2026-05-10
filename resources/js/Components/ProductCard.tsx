import { Link, router, usePage } from '@inertiajs/react';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent } from '@/Components/ui/card';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface Product {
    id: number;
    name: string;
    slug: string;
    price: number;
    sale_price?: number;
    is_on_sale: boolean;
    current_price: number;
    in_stock: boolean;
    average_rating: number;
    images: { image_path: string; is_primary: boolean }[];
    category?: { name: string };
}

interface Props {
    product: Product;
    initialWishlisted?: boolean;
}

export default function ProductCard({ product, initialWishlisted = false }: Props) {
    const { auth } = usePage().props as any;
    const [wishlisted, setWishlisted] = useState(initialWishlisted);
    const [addingToCart, setAddingToCart] = useState(false);

    const primaryImage = product.images?.find(i => i.is_primary) ?? product.images?.[0];

    const discountPct = product.is_on_sale
        ? Math.round(((product.price - product.sale_price!) / product.price) * 100)
        : 0;

    const fmt = (v: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

    // ✅ Adicionar ao carrinho
    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        setAddingToCart(true);
        router.post('/carrinho/adicionar',
            { product_id: product.id, quantity: 1 },
            {
                preserveScroll: true,
                onFinish: () => setAddingToCart(false),
            }
        );
    };

    // ✅ Toggle wishlist com verificação de login
    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Se não está logado, redireciona para login
        if (!auth?.user) {
            router.visit('/login');
            return;
        }

        // Atualiza o estado visual imediatamente (optimistic update)
        setWishlisted(prev => !prev);

        router.post('/lista-de-desejos',
            { product_id: product.id },
            {
                preserveScroll: true,
                // Se der erro, reverte o estado visual
                onError: () => setWishlisted(prev => !prev),
            }
        );
    };

    return (
        <Card className="group overflow-hidden hover:shadow-lg transition-all duration-200 border hover:border-primary/30">
            <Link href={`/produtos/${product.slug}`} className="block">
                <div className="relative aspect-square overflow-hidden bg-muted">
                    <img
                        src={primaryImage?.image_path ?? '/placeholder.png'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Badge de desconto */}
                    {product.is_on_sale && (
                        <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-500">
                            -{discountPct}%
                        </Badge>
                    )}

                    {/* Overlay de esgotado */}
                    {!product.in_stock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">Esgotado</span>
                        </div>
                    )}

                    {/* ✅ Botão de favoritar corrigido */}
                    <button
                        className={cn(
                            'absolute top-2 right-2 p-1.5 bg-white rounded-full shadow',
                            'opacity-0 group-hover:opacity-100 transition-all duration-200',
                            'hover:scale-110 active:scale-95',
                            // Se já está na wishlist, sempre visível
                            wishlisted && 'opacity-100'
                        )}
                        onClick={handleWishlist}
                        title={wishlisted ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                    >
                        <Heart
                            className={cn(
                                'h-4 w-4 transition-colors',
                                wishlisted
                                    ? 'fill-red-500 text-red-500'  // ✅ Preenchido quando favoritado
                                    : 'text-gray-400 hover:text-red-500'
                            )}
                        />
                    </button>
                </div>
            </Link>

            <CardContent className="p-3 space-y-2">
                <Link href={`/produtos/${product.slug}`}>
                    <h3 className="font-medium text-sm leading-tight line-clamp-2 hover:text-primary transition-colors">
                        {product.name}
                    </h3>
                </Link>

                {/* Rating */}
                {product.average_rating > 0 && (
                    <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                                key={i}
                                className={cn(
                                    'h-3 w-3',
                                    i < Math.round(product.average_rating)
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300'
                                )}
                            />
                        ))}
                        <span className="text-xs text-muted-foreground">
                            ({product.average_rating.toFixed(1)})
                        </span>
                    </div>
                )}

                {/* Preço */}
                <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-primary">
                        {fmt(product.current_price)}
                    </span>
                    {product.is_on_sale && (
                        <span className="text-sm text-muted-foreground line-through">
                            {fmt(product.price)}
                        </span>
                    )}
                </div>

                {/* Botão adicionar ao carrinho */}
                <Button
                    size="sm"
                    className="w-full"
                    onClick={handleAddToCart}
                    disabled={!product.in_stock || addingToCart}
                >
                    <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                    {!product.in_stock
                        ? 'Esgotado'
                        : addingToCart
                            ? 'Adicionando...'
                            : 'Adicionar'
                    }
                </Button>
            </CardContent>
        </Card>
    );
}