import MainLayout from '@/Layouts/MainLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { Heart, ShoppingCart, Trash2, HeartOff } from 'lucide-react';

interface WishlistItem {
    id: number;
    product: {
        id: number; name: string; slug: string;
        current_price: number; price: number; is_on_sale: boolean;
        in_stock: boolean; images: { image_path: string; is_primary: boolean }[];
        category: { name: string };
    };
}

interface Props { wishlists: WishlistItem[]; cartCount?: number; }

export default function WishlistIndex({ wishlists, cartCount = 0 }: Props) {
    const fmt = (v: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

    const removeFromWishlist = (productId: number) => {
        router.post('/lista-de-desejos', { product_id: productId }, { preserveScroll: true });
    };

    const addToCart = (productId: number) => {
        router.post('/carrinho/adicionar', { product_id: productId, quantity: 1 }, { preserveScroll: true });
    };

    if (wishlists.length === 0) {
        return (
            <MainLayout cartCount={cartCount}>
                <div className="container mx-auto px-4 py-20 text-center">
                    <HeartOff className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Sua lista de desejos está vazia</h2>
                    <p className="text-muted-foreground mb-6">Salve produtos que você ama para comprar depois.</p>
                    <Button><Link href="/produtos">Explorar Produtos</Link></Button>
                </div>
            </MainLayout>
        );
    }

    return (
        <>
        <Head title='Lista de Desejos'/>
        <MainLayout cartCount={cartCount}>
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="flex items-center gap-3 mb-6">
                    <Heart className="h-6 w-6 text-red-500 fill-red-500" />
                    <h1 className="text-2xl font-bold">Lista de Desejos</h1>
                    <span className="text-muted-foreground text-sm">({wishlists.length} {wishlists.length === 1 ? 'item' : 'itens'})</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlists.map(({ id, product }) => {
                        const image = product.images.find(i => i.is_primary) ?? product.images[0];
                        return (
                            <Card key={id} className="group overflow-hidden hover:shadow-md transition-shadow">
                                <Link href={`/produtos/${product.slug}`} className="block">
                                    <div className="relative aspect-square overflow-hidden bg-muted">
                                        <img
                                            src={image?.image_path ?? '/placeholder.png'}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        {product.is_on_sale && (
                                            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                                                Oferta
                                            </span>
                                        )}
                                        {!product.in_stock && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <span className="text-white font-semibold text-sm">Esgotado</span>
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                <CardContent className="p-3 space-y-3">
                                    <div>
                                        <p className="text-xs text-muted-foreground">{product.category?.name}</p>
                                        <Link href={`/produtos/${product.slug}`}>
                                            <h3 className="font-medium text-sm leading-tight line-clamp-2 hover:text-primary transition-colors mt-0.5">
                                                {product.name}
                                            </h3>
                                        </Link>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-primary">{fmt(product.current_price)}</span>
                                        {product.is_on_sale && (
                                            <span className="text-xs text-muted-foreground line-through">{fmt(product.price)}</span>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            className="flex-1 gap-1.5"
                                            disabled={!product.in_stock}
                                            onClick={() => addToCart(product.id)}
                                        >
                                            <ShoppingCart className="h-3.5 w-3.5" />
                                            {product.in_stock ? 'Adicionar' : 'Esgotado'}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                                            onClick={() => removeFromWishlist(product.id)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </MainLayout>
        </>
    );
}