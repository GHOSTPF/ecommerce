import MainLayout from '@/Layouts/MainLayout';
import { Link, useForm, router, Head } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Separator } from '@/Components/ui/separator';
import { Badge } from '@/Components/ui/badge';
import { Minus, Plus, Trash2, ShoppingBag, Tag } from 'lucide-react';
import { useState } from 'react';

interface CartItem {
    id: number; quantity: number; price: number; subtotal: number;
    product: { id: number; name: string; slug: string; images: any[]; in_stock: boolean; };
}
interface Cart {
    items: CartItem[]; subtotal: number; total: number;
    discount_amount: number; coupon_code?: string; item_count: number;
}

export default function CartIndex({ cart }: { cart: Cart }) {
    const [coupon, setCoupon] = useState('');
    const couponForm = useForm({ coupon_code: '' });

    const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

    const updateQty = (itemId: number, qty: number) => {
        router.patch(`/carrinho/${itemId}`, { quantity: qty }, { preserveScroll: true });
    };

    const removeItem = (itemId: number) => {
        router.delete(`/carrinho/${itemId}`, { preserveScroll: true });
    };

    const applyCoupon = () => {
        router.post('/carrinho/cupom', { coupon_code: coupon }, { preserveScroll: true });
    };

    if (cart.items.length === 0) {
        return (
            <MainLayout>
                <div className="container mx-auto px-4 py-20 text-center">
                    <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Seu carrinho está vazio</h2>
                    <p className="text-muted-foreground mb-6">Adicione produtos para continuar comprando.</p>
                    <Button><Link href="/produtos">Ver Produtos</Link></Button>
                </div>
            </MainLayout>
        );
    }

    return (
        <>
        <Head title='Carrinho'/>
        <MainLayout>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">Carrinho ({cart.item_count} {cart.item_count === 1 ? 'item' : 'itens'})</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.items.map(item => (
                            <Card key={item.id}>
                                <CardContent className="p-4">
                                    <div className="flex gap-4">
                                        <Link href={`/produtos/${item.product.slug}`}>
                                            <img
                                                src={item.product.images?.[0]?.image_path ?? '/placeholder.png'}
                                                alt={item.product.name}
                                                className="w-20 h-20 object-cover rounded-lg bg-muted"
                                            />
                                        </Link>
                                        <div className="flex-1 min-w-0">
                                            <Link href={`/produtos/${item.product.slug}`}>
                                                <h3 className="font-medium hover:text-primary transition-colors line-clamp-2">
                                                    {item.product.name}
                                                </h3>
                                            </Link>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Unitário: {fmt(item.price)}
                                            </p>
                                            <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline" size="icon" className="h-7 w-7"
                                                        onClick={() => item.quantity > 1 ? updateQty(item.id, item.quantity - 1) : removeItem(item.id)}
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                    <Button
                                                        variant="outline" size="icon" className="h-7 w-7"
                                                        onClick={() => updateQty(item.id, item.quantity + 1)}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold">{fmt(item.subtotal)}</span>
                                                    <Button
                                                        variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"
                                                        onClick={() => removeItem(item.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Summary */}
                    <div>
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle>Resumo do Pedido</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Coupon */}
                                {cart.coupon_code ? (
                                    <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200">
                                        <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                                            <Tag className="h-4 w-4" />
                                            <span className="text-sm font-medium">{cart.coupon_code}</span>
                                        </div>
                                        <Button
                                            variant="ghost" size="sm"
                                            className="h-6 text-xs text-red-500 hover:text-red-600"
                                            onClick={() => router.delete('/carrinho/cupom', { preserveScroll: true })}
                                        >
                                            Remover
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Cupom de desconto"
                                            value={coupon}
                                            onChange={e => setCoupon(e.target.value.toUpperCase())}
                                            onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                                        />
                                        <Button variant="outline" onClick={applyCoupon} disabled={!coupon}>
                                            Aplicar
                                        </Button>
                                    </div>
                                )}

                                <Separator />

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>{fmt(cart.subtotal)}</span>
                                    </div>
                                    {cart.discount_amount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Desconto</span>
                                            <span>-{fmt(cart.discount_amount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-muted-foreground">
                                        <span>Frete</span>
                                        <span className="text-green-600">Calculado no checkout</span>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span className="text-primary">{fmt(cart.total)}</span>
                                </div>

                                <Button size="lg" className="w-full">
                                    <Link href="/checkout">Finalizar Compra</Link>
                                </Button>
                                <Button variant="outline" size="sm" className="w-full">
                                    <Link href="/produtos">Continuar Comprando</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </MainLayout>
        </>
    );
}