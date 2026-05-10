import MainLayout from '@/Layouts/MainLayout';
import { Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent } from '@/Components/ui/card';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';
import { Head } from '@inertiajs/react';

interface Order {
    id: number; order_number: string; status: string; payment_status: string;
    total: number; created_at: string; items: any[];
    status_badge: { label: string; color: string };
}
interface Props {
    orders: { data: Order[]; links: any[]; meta: any };
    cartCount?: number;
}

const statusColors: Record<string, string> = {
    green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
};

export default function OrdersIndex({ orders, cartCount = 0 }: Props) {
    const fmt = (v: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

    if (orders.data.length === 0) {
        return (
            <>
            <Head title='Meus Pedidos'/>
            <MainLayout cartCount={cartCount}>
                <div className="container mx-auto px-4 py-20 text-center">
                    <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Você ainda não fez nenhum pedido</h2>
                    <p className="text-muted-foreground mb-6">Explore nossa loja e faça seu primeiro pedido!</p>
                    <Button><Link href="/produtos">Ver Produtos</Link></Button>
                </div>
            </MainLayout>
            </>
        );
    }

    return (
        <>
        <Head title='Meus Pedidos'/>
        <MainLayout cartCount={cartCount}>
            <div className="container mx-auto px-4 py-8 max-w-3xl">
                <h1 className="text-2xl font-bold mb-6">Meus Pedidos</h1>

                <div className="space-y-4">
                    {orders.data.map(order => (
                        <Card key={order.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between flex-wrap gap-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <span className="font-mono text-sm font-bold">{order.order_number}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[order.status_badge?.color ?? 'gray']}`}>
                                                {order.status_badge?.label ?? order.status}
                                            </span>
                                            {order.payment_status === 'paid' && (
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 font-medium">
                                                    Pago
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(order.created_at).toLocaleDateString('pt-BR', {
                                                day: '2-digit', month: 'long', year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg text-primary">{fmt(order.total)}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {order.items?.length} {order.items?.length === 1 ? 'item' : 'itens'}
                                        </p>
                                    </div>
                                </div>

                                {/* Items preview */}
                                {order.items && order.items.length > 0 && (
                                    <div className="mt-4 flex items-center gap-2 overflow-hidden">
                                        {order.items.slice(0, 4).map((item: any) => (
                                            <img
                                                key={item.id}
                                                src={item.product?.images?.[0]?.image_path ?? '/placeholder.png'}
                                                alt={item.product_name}
                                                className="w-10 h-10 object-cover rounded-md bg-muted border shrink-0"
                                            />
                                        ))}
                                        {order.items.length > 4 && (
                                            <div className="w-10 h-10 rounded-md bg-muted border flex items-center justify-center text-xs font-medium text-muted-foreground">
                                                +{order.items.length - 4}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="mt-4 flex justify-end">
                                    <Button variant="outline" size="sm">
                                        <Link href={`/meus-pedidos/${order.id}`} className="flex items-center gap-1.5">
                                            <Package className="h-3.5 w-3.5" />
                                            Ver Detalhes
                                            <ChevronRight className="h-3.5 w-3.5" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Pagination */}
                {orders.meta?.last_page > 1 && (
                    <div className="flex justify-center gap-2 mt-8 flex-wrap">
                        {orders.links.map((link: any, i: number) => (
                            <Button
                                key={i}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && (window.location.href = link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
        </>
    );
}