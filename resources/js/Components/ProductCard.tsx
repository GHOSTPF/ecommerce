import { Link, useForm } from '@inertiajs/react';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent } from '@/Components/ui/card';
import { cn } from '@/lib/utils';

interface Product {
    id: number; name: string; slug: string; price: number;
    sale_price?: number; is_on_sale: boolean; current_price: number;
    in_stock: boolean; average_rating: number;
    images: { image_path: string; is_primary: boolean }[];
    category?: { name: string };
}

interface Props { product: Product; }

export default function ProductCard({ product }: Props) {
    const { post, processing } = useForm({ product_id: product.id, quantity: 1 });
    const primaryImage = product.images?.find(i => i.is_primary) ?? product.images?.[0];

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        post('/carrinho/adicionar');
    };

    const discountPct = product.is_on_sale
        ? Math.round(((product.price - product.sale_price!) / product.price) * 100)
        : 0;

    return (
        <Card className="group overflow-hidden hover:shadow-lg transition-all duration-200 border hover:border-primary/30">
            <Link href={`/produtos/${product.slug}`} className="block">
                <div className="relative aspect-square overflow-hidden bg-muted">
                    <img
                        src={primaryImage?.image_path ?? '/placeholder.png'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {product.is_on_sale && (
                        <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-500">
                            -{discountPct}%
                        </Badge>
                    )}
                    {!product.in_stock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">Esgotado</span>
                        </div>
                    )}
                    <button
                        className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                        onClick={(e) => {
                            e.preventDefault();
                            // Toggle wishlist
                        }}
                    >
                        <Heart className="h-4 w-4 text-gray-400 hover:text-red-500 transition-colors" />
                    </button>
                </div>
            </Link>

            <CardContent className="p-3 space-y-2">
                <Link href={`/produtos/${product.slug}`}>
                    <h3 className="font-medium text-sm leading-tight line-clamp-2 hover:text-primary transition-colors">
                        {product.name}
                    </h3>
                </Link>

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
                        <span className="text-xs text-muted-foreground">({product.average_rating.toFixed(1)})</span>
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-primary">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                            .format(product.current_price)}
                    </span>
                    {product.is_on_sale && (
                        <span className="text-sm text-muted-foreground line-through">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                                .format(product.price)}
                        </span>
                    )}
                </div>

                <Button
                    size="sm"
                    className="w-full"
                    onClick={handleAddToCart}
                    disabled={!product.in_stock || processing}
                >
                    <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                    {product.in_stock ? 'Adicionar' : 'Esgotado'}
                </Button>
            </CardContent>
        </Card>
    );
}