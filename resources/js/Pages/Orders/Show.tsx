import MainLayout from '@/Layouts/MainLayout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Separator } from '@/Components/ui/separator';
import { Badge } from '@/Components/ui/badge';
import { Package, MapPin, CreditCard, ChevronLeft, Truck } from 'lucide-react';

interface OrderItem {
    id: number; product_name: string; product_sku?: string;
    price: number; quantity: number; subtotal: number;
    product?: { images: any[] };
}
interface Order {
    id: number; order_number: string; status: string; payment_status: string;
    payment_method: string; total: number; subtotal: number;
    shipping: number; discount: number; tax: number;
    coupon_code?: string; tracking_code?: string; shipping_carrier?: string;
    created_at: string; paid_at?: string; shipped_at?: string; delivered_at?: string;
    shipping_name: string; shipping_street: string; shipping_number: string;
    shipping_complement?: string; shipping_neighborhood: string;
    shipping_city: string; shipping_state: string; shipping_zipcode: string;
    shipping_phone?: string; notes?: string;
    items: OrderItem[];
    status_badge: { label: string; color: string };
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

const paymentLabels: Record<string, string> = {
    credit_card: '💳 Cartão de Crédito',
    pix: '📱 PIX',
    boleto: '🧾 Boleto',
};

const steps = [
    { key: 'confirmed', label: 'Confirmado' },
    { key: 'processing', label: 'Preparando' },
    { key: 'shipped', label: 'Enviado' },
    { key: 'delivered', label: 'Entregue' },
];

export default function OrderShow({ order }: { order: Order }) {
    const fmt = (v: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

    const stepIndex = steps.findIndex(s => s.key === order.status);
    const isCancelled = order.status === 'cancelled' || order.status === 'refunded';

    return (
        <>
        <Head title='Meus Pedidos'/>
        <MainLayout>
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Back */}
                <Button variant="ghost" size="sm"  className="mb-4 -ml-2">
                    <Link href="/meus-pedidos" className='flex flex-items'>
                        <ChevronLeft className="h-4 w-4 mr-1" /> Meus Pedidos
                    </Link>
                </Button>

                {/* Header */}
                <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Pedido {order.order_number}</h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            Realizado em {new Date(order.created_at).toLocaleDateString('pt-BR', {
                                day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                        </p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${statusColors[order.status_badge?.color ?? 'gray']}`}>
                        {order.status_badge?.label ?? order.status}
                    </span>
                </div>

                {/* Progress Tracker */}
                {!isCancelled && (
                    <Card className="mb-6">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between relative">
                                <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted" />
                                <div
                                    className="absolute top-4 left-0 h-0.5 bg-primary transition-all"
                                    style={{ width: `${stepIndex >= 0 ? (stepIndex / (steps.length - 1)) * 100 : 0}%` }}
                                />
                                {steps.map((step, i) => {
                                    const done = i <= stepIndex;
                                    return (
                                        <div key={step.key} className="flex flex-col items-center gap-2 relative z-10">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                                                done
                                                    ? 'bg-primary border-primary text-primary-foreground'
                                                    : 'bg-background border-muted text-muted-foreground'
                                            }`}>
                                                {done ? '✓' : i + 1}
                                            </div>
                                            <span className={`text-xs font-medium text-center ${done ? 'text-primary' : 'text-muted-foreground'}`}>
                                                {step.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Tracking */}
                {order.tracking_code && (
                    <Card className="mb-6 border-blue-200 dark:border-blue-800">
                        <CardContent className="p-4 flex items-center gap-3">
                            <Truck className="h-5 w-5 text-blue-500 shrink-0" />
                            <div>
                                <p className="font-medium text-sm">Código de Rastreio</p>
                                <p className="font-mono text-sm text-blue-600 dark:text-blue-400">
                                    {order.tracking_code}
                                    {order.shipping_carrier && ` — ${order.shipping_carrier}`}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Items */}
                    <div className="lg:col-span-2 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Package className="h-4 w-4" /> Itens do Pedido
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {order.items.map(item => (
                                    <div key={item.id} className="flex gap-4">
                                        <img
                                            src={item.product?.images?.[0]?.image_path ?? '/placeholder.png'}
                                            alt={item.product_name}
                                            className="w-16 h-16 object-cover rounded-lg bg-muted border shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm">{item.product_name}</p>
                                            {item.product_sku && (
                                                <p className="text-xs text-muted-foreground">SKU: {item.product_sku}</p>
                                            )}
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {fmt(item.price)} × {item.quantity}
                                            </p>
                                        </div>
                                        <span className="font-bold text-sm shrink-0">{fmt(item.subtotal)}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Notes */}
                        {order.notes && (
                            <Card>
                                <CardContent className="p-4 text-sm text-muted-foreground">
                                    <p className="font-medium text-foreground mb-1">Observações</p>
                                    {order.notes}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        {/* Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Resumo Financeiro</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{fmt(order.subtotal)}</span>
                                </div>
                                {order.discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Desconto{order.coupon_code && ` (${order.coupon_code})`}</span>
                                        <span>-{fmt(order.discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Frete</span>
                                    <span>{fmt(order.shipping)}</span>
                                </div>
                                {order.tax > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Impostos</span>
                                        <span>{fmt(order.tax)}</span>
                                    </div>
                                )}
                                <Separator />
                                <div className="flex justify-between font-bold text-base">
                                    <span>Total</span>
                                    <span className="text-primary">{fmt(order.total)}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" /> Pagamento
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-1.5">
                                <p>{paymentLabels[order.payment_method] ?? order.payment_method}</p>
                                <p className={`font-medium ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {order.payment_status === 'paid' ? '✅ Pagamento confirmado' : '⏳ Aguardando pagamento'}
                                </p>
                                {order.paid_at && (
                                    <p className="text-muted-foreground text-xs">
                                        Pago em {new Date(order.paid_at).toLocaleDateString('pt-BR')}
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Shipping Address */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <MapPin className="h-4 w-4" /> Endereço de Entrega
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm space-y-1 text-muted-foreground">
                                <p className="font-medium text-foreground">{order.shipping_name}</p>
                                {order.shipping_phone && <p>{order.shipping_phone}</p>}
                                <p>
                                    {order.shipping_street}, {order.shipping_number}
                                    {order.shipping_complement && `, ${order.shipping_complement}`}
                                </p>
                                <p>{order.shipping_neighborhood}</p>
                                <p>{order.shipping_city}/{order.shipping_state}</p>
                                <p>CEP: {order.shipping_zipcode}</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </MainLayout>
        </>
    );
}