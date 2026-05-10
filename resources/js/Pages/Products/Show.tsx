import { useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { Link, useForm, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Separator } from '@/Components/ui/separator';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import {
    ShoppingCart, Heart, Star, Truck, Shield,
    RefreshCw, ChevronRight, Minus, Plus, Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ProductCard from '@/Components/ProductCard';

interface ProductImage { id: number; image_path: string; is_primary: boolean; alt_text?: string; }
interface Review {
    id: number; rating: number; title?: string; body?: string;
    is_verified_purchase: boolean; created_at: string;
    user: { name: string };
}
interface Product {
    id: number; name: string; slug: string; description: string;
    short_description?: string; price: number; sale_price?: number;
    current_price: number; is_on_sale: boolean; in_stock: boolean;
    stock_quantity: number; brand?: string; sku?: string;
    average_rating: number; images: ProductImage[];
    reviews: Review[];
    category: { name: string; slug: string };
}

interface Props {
    product: Product;
    related: Product[];
    inWishlist: boolean;
    cartCount?: number;
}

function StarRating({ value, onChange, size = 'md' }: { value: number; onChange?: (v: number) => void; size?: 'sm' | 'md' }) {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <Star
                    key={i}
                    className={cn(
                        size === 'sm' ? 'h-4 w-4' : 'h-6 w-6',
                        'transition-colors',
                        onChange ? 'cursor-pointer' : '',
                        i <= (hover || value)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300 dark:text-gray-600'
                    )}
                    onMouseEnter={() => onChange && setHover(i)}
                    onMouseLeave={() => onChange && setHover(0)}
                    onClick={() => onChange && onChange(i)}
                />
            ))}
        </div>
    );
}

export default function ProductShow({ product, related, inWishlist, cartCount = 0 }: Props) {
    const [selectedImage, setSelectedImage] = useState(
        product.images.find(i => i.is_primary) ?? product.images[0]
    );
    const [qty, setQty] = useState(1);
    const [wishlisted, setWishlisted] = useState(inWishlist);
    const [reviewRating, setReviewRating] = useState(0);
    const [added, setAdded] = useState(false);

    const cartForm = useForm({ product_id: product.id, quantity: qty });
    const reviewForm = useForm({ rating: 0, title: '', body: '' });

    const fmt = (v: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

    const discountPct = product.is_on_sale
        ? Math.round(((product.price - product.sale_price!) / product.price) * 100)
        : 0;

    const handleAddToCart = () => {
        cartForm.setData('quantity', qty);
        cartForm.post('/carrinho/adicionar', {
            preserveScroll: true,
            onSuccess: () => {
                setAdded(true);
                setTimeout(() => setAdded(false), 2000);
            },
        });
    };

    const handleWishlist = () => {
        router.post('/lista-de-desejos', { product_id: product.id }, {
            preserveScroll: true,
            onSuccess: () => setWishlisted(w => !w),
        });
    };

    const handleReview = () => {
        reviewForm.setData('rating', reviewRating);
        reviewForm.post(`/produtos/${product.id}/reviews`, {
            preserveScroll: true,
            onSuccess: () => {
                reviewForm.reset();
                setReviewRating(0);
            },
        });
    };

    const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: product.reviews.filter(r => r.rating === star).length,
        pct: product.reviews.length
            ? Math.round((product.reviews.filter(r => r.rating === star).length / product.reviews.length) * 100)
            : 0,
    }));

    return (
        <MainLayout cartCount={cartCount}>
            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
                    <Link href="/" className="hover:text-foreground">Início</Link>
                    <ChevronRight className="h-3.5 w-3.5" />
                    <Link href="/produtos" className="hover:text-foreground">Produtos</Link>
                    <ChevronRight className="h-3.5 w-3.5" />
                    <Link href={`/produtos?category=${product.category.slug}`} className="hover:text-foreground">
                        {product.category.name}
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5" />
                    <span className="text-foreground truncate max-w-48">{product.name}</span>
                </nav>

                {/* Product Main */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                    {/* Images */}
                    <div className="space-y-3">
                        <div className="aspect-square rounded-xl overflow-hidden bg-muted border">
                            <img
                                src={selectedImage?.image_path ?? '/placeholder.png'}
                                alt={selectedImage?.alt_text ?? product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {product.images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {product.images.map(img => (
                                    <button
                                        key={img.id}
                                        onClick={() => setSelectedImage(img)}
                                        className={cn(
                                            'shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors',
                                            selectedImage?.id === img.id
                                                ? 'border-primary'
                                                : 'border-transparent hover:border-border'
                                        )}
                                    >
                                        <img
                                            src={img.image_path}
                                            alt={img.alt_text ?? product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="space-y-5">
                        <div>
                            {product.brand && (
                                <p className="text-sm text-muted-foreground font-medium uppercase tracking-wide mb-1">
                                    {product.brand}
                                </p>
                            )}
                            <h1 className="text-2xl md:text-3xl font-bold leading-tight">{product.name}</h1>
                        </div>

                        {/* Rating summary */}
                        {product.reviews.length > 0 && (
                            <div className="flex items-center gap-3">
                                <StarRating value={Math.round(product.average_rating)} size="sm" />
                                <span className="text-sm font-medium">{product.average_rating.toFixed(1)}</span>
                                <span className="text-sm text-muted-foreground">
                                    ({product.reviews.length} {product.reviews.length === 1 ? 'avaliação' : 'avaliações'})
                                </span>
                            </div>
                        )}

                        {/* Price */}
                        <div className="flex items-end gap-3 flex-wrap">
                            <span className="text-3xl font-bold text-primary">{fmt(product.current_price)}</span>
                            {product.is_on_sale && (
                                <>
                                    <span className="text-lg text-muted-foreground line-through">{fmt(product.price)}</span>
                                    <Badge className="bg-red-500 hover:bg-red-500 text-white">-{discountPct}% OFF</Badge>
                                </>
                            )}
                        </div>
                        {product.is_on_sale && (
                            <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                                Você economiza {fmt(product.price - product.current_price)}
                            </p>
                        )}

                        {product.short_description && (
                            <p className="text-muted-foreground leading-relaxed">{product.short_description}</p>
                        )}

                        <Separator />

                        {/* Stock */}
                        <div className="flex items-center gap-2 text-sm">
                            {product.in_stock ? (
                                <>
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    <span className="text-green-600 dark:text-green-400 font-medium">Em estoque</span>
                                    {product.stock_quantity <= 10 && (
                                        <span className="text-orange-500">
                                            — apenas {product.stock_quantity} restantes
                                        </span>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                    <span className="text-red-500 font-medium">Esgotado</span>
                                </>
                            )}
                        </div>

                        {/* Quantity + Actions */}
                        {product.in_stock && (
                            <div className="flex items-center gap-3 flex-wrap">
                                <div className="flex items-center border rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => setQty(q => Math.max(1, q - 1))}
                                        className="px-3 py-2.5 hover:bg-accent transition-colors"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="px-4 py-2.5 font-medium min-w-[3rem] text-center border-x">
                                        {qty}
                                    </span>
                                    <button
                                        onClick={() => setQty(q => Math.min(product.stock_quantity, q + 1))}
                                        className="px-3 py-2.5 hover:bg-accent transition-colors"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>

                                <Button
                                    size="lg"
                                    className="flex-1 gap-2"
                                    onClick={handleAddToCart}
                                    disabled={cartForm.processing}
                                >
                                    {added ? (
                                        <><Check className="h-4 w-4" /> Adicionado!</>
                                    ) : (
                                        <><ShoppingCart className="h-4 w-4" /> Adicionar ao Carrinho</>
                                    )}
                                </Button>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    className={cn('h-11 w-11', wishlisted && 'text-red-500 border-red-500')}
                                    onClick={handleWishlist}
                                >
                                    <Heart className={cn('h-5 w-5', wishlisted && 'fill-red-500')} />
                                </Button>
                            </div>
                        )}

                        <Button size="lg" variant="default" className="w-full">
                            <Link href="/checkout">Comprar Agora</Link>
                        </Button>

                        {/* Trust badges */}
                        <div className="grid grid-cols-3 gap-3 pt-2">
                            {[
                                { icon: Truck, label: 'Entrega Rápida' },
                                { icon: Shield, label: 'Compra Segura' },
                                { icon: RefreshCw, label: 'Troca em 30 dias' },
                            ].map(({ icon: Icon, label }) => (
                                <div key={label} className="flex flex-col items-center gap-1.5 p-3 bg-muted/50 rounded-lg text-center">
                                    <Icon className="h-5 w-5 text-primary" />
                                    <span className="text-xs text-muted-foreground leading-tight">{label}</span>
                                </div>
                            ))}
                        </div>

                        {/* SKU */}
                        {product.sku && (
                            <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                        )}
                    </div>
                </div>

                {/* Description + Reviews */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                    {/* Description */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Descrição do Produto</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className="prose dark:prose-invert max-w-none text-sm leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: product.description ?? '' }}
                                />
                                {!product.description && (
                                    <p className="text-muted-foreground">Nenhuma descrição disponível.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Reviews */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Avaliações dos Clientes</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Rating Overview */}
                                {product.reviews.length > 0 && (
                                    <div className="flex gap-8 flex-wrap">
                                        <div className="text-center">
                                            <div className="text-5xl font-bold text-primary">
                                                {product.average_rating.toFixed(1)}
                                            </div>
                                            <StarRating value={Math.round(product.average_rating)} />
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {product.reviews.length} avaliações
                                            </p>
                                        </div>
                                        <div className="flex-1 space-y-1.5 min-w-48">
                                            {ratingDistribution.map(({ star, count, pct }) => (
                                                <div key={star} className="flex items-center gap-2 text-sm">
                                                    <span className="w-3 text-right">{star}</span>
                                                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className="bg-yellow-400 h-full rounded-full"
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-muted-foreground w-6">{count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <Separator />

                                {/* Review Form */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold">Deixe sua avaliação</h4>
                                    <div>
                                        <Label className="text-sm mb-1.5 block">Nota</Label>
                                        <StarRating value={reviewRating} onChange={setReviewRating} />
                                    </div>
                                    <div>
                                        <Label htmlFor="review-title" className="text-sm">Título (opcional)</Label>
                                        <input
                                            id="review-title"
                                            className="mt-1 w-full px-3 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                            placeholder="Resumo da sua avaliação"
                                            value={reviewForm.data.title}
                                            onChange={e => reviewForm.setData('title', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="review-body" className="text-sm">Comentário (opcional)</Label>
                                        <Textarea
                                            id="review-body"
                                            className="mt-1"
                                            rows={3}
                                            placeholder="Conte sua experiência com o produto..."
                                            value={reviewForm.data.body}
                                            onChange={e => reviewForm.setData('body', e.target.value)}
                                        />
                                    </div>
                                    <Button
                                        onClick={handleReview}
                                        disabled={reviewRating === 0 || reviewForm.processing}
                                    >
                                        Enviar Avaliação
                                    </Button>
                                </div>

                                <Separator />

                                {/* Reviews List */}
                                {product.reviews.length > 0 ? (
                                    <div className="space-y-5">
                                        {product.reviews.map(review => (
                                            <div key={review.id} className="space-y-2">
                                                <div className="flex items-start justify-between flex-wrap gap-2">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-sm">{review.user.name}</span>
                                                            {review.is_verified_purchase && (
                                                                <Badge variant="secondary" className="text-xs gap-1">
                                                                    <Check className="h-2.5 w-2.5" /> Compra verificada
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <StarRating value={review.rating} size="sm" />
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(review.created_at).toLocaleDateString('pt-BR')}
                                                    </span>
                                                </div>
                                                {review.title && (
                                                    <p className="font-medium text-sm">{review.title}</p>
                                                )}
                                                {review.body && (
                                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                                        {review.body}
                                                    </p>
                                                )}
                                                <Separator />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-muted-foreground py-4">
                                        Nenhuma avaliação ainda. Seja o primeiro a avaliar!
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar: Shipping info */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader><CardTitle className="text-base">Informações de Entrega</CardTitle></CardHeader>
                            <CardContent className="space-y-3 text-sm">
                                <div className="flex gap-3">
                                    <Truck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium">Frete Standard</p>
                                        <p className="text-muted-foreground">5-10 dias úteis — R$ 15,00</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <Truck className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium">Frete Expresso</p>
                                        <p className="text-muted-foreground">2-3 dias úteis — R$ 35,00</p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex gap-3">
                                    <RefreshCw className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium">Política de Devolução</p>
                                        <p className="text-muted-foreground">30 dias para devolver ou trocar</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Related Products */}
                {related.length > 0 && (
                    <section>
                        <h2 className="text-xl font-bold mb-6">Produtos Relacionados</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {related.map(p => <ProductCard key={p.id} product={p} />)}
                        </div>
                    </section>
                )}
            </div>
        </MainLayout>
    );
}