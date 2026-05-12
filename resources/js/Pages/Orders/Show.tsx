import MainLayout from '@/Layouts/MainLayout';
import { Link, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Separator } from '@/Components/ui/separator';
import { MapPin, Package, CreditCard, ChevronLeft, CheckCircle, Copy, Clock } from 'lucide-react';
import { useState } from 'react';

interface OrderItem {
    id: number; product_name: string; product_sku?: string;
    price: number; quantity: number; subtotal: number;
    product?: { images: any[] };
}
interface Order {
    id: number; order_number: string; status: string; payment_status: string;
    payment_method?: string; installments: number;
    subtotal: number; tax: number; shipping: number; discount: number; total: number;
    coupon_code?: string; tracking_code?: string; shipping_carrier?: string;
    pix_qr_code?: string; pix_qr_code_base64?: string; pix_expires_at?: string;
    shipping_name: string; shipping_phone?: string; shipping_zipcode: string;
    shipping_street: string; shipping_number: string; shipping_complement?: string;
    shipping_neighborhood: string; shipping_city: string; shipping_state: string;
    notes?: string; created_at: string; paid_at?: string;
    items: OrderItem[];
    status_badge?: { label: string; color: string };
}

const STATUS_COLORS: Record<string, string> = {
    pending: 'text-yellow-600 border-yellow-400 bg-yellow-50',
    confirmed: 'text-blue-600 border-blue-400 bg-blue-50',
    processing: 'text-purple-600 border-purple-400 bg-purple-50',
    shipped: 'text-indigo-600 border-indigo-400 bg-indigo-50',
    delivered: 'text-green-600 border-green-400 bg-green-50',
    cancelled: 'text-red-600 border-red-400 bg-red-50',
};
const STATUS_LABELS: Record<string, string> = {
    pending: 'Aguardando', confirmed: 'Confirmado', processing: 'Processando',
    shipped: 'Enviado', delivered: 'Entregue', cancelled: 'Cancelado',
};
const TIMELINE = [
    { key: 'pending', label: 'Recebido', icon: '📋' },
    { key: 'confirmed', label: 'Confirmado', icon: '✅' },
    { key: 'processing', label: 'Processando', icon: '⚙️' },
    { key: 'shipped', label: 'Enviado', icon: '🚚' },
    { key: 'delivered', label: 'Entregue', icon: '🎉' },
];

export default function OrderShow({ order, cartCount = 0 }: { order: Order; cartCount?: number }) {
    const [copied, setCopied] = useState(false);
    const fmt = (v: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

    const statusOrder  = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIdx   = statusOrder.indexOf(order.status);
    const isCancelled  = ['cancelled', 'refunded'].includes(order.status);
    const isPix        = order.payment_method === 'pix';
    const isPixPending = isPix && order.payment_status === 'pending';

    const copyPixCode = async () => {
        if (order.pix_qr_code) {
            await navigator.clipboard.writeText(order.pix_qr_code);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        }
    };

    const canMarkDelivered = order.status === 'shipped';
    const markAsDelivered = () => {
        if (!confirm('Você recebeu o pedido? Marcar como entregue atualizará o status para Entregue.')) {
            return;
        }
        router.patch(`/meus-pedidos/${order.id}/entregue`, {}, { preserveScroll: true });
    };

    return (
        <MainLayout cartCount={cartCount}>
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                    <Button variant="ghost" size="sm" >
                        <Link href="/meus-pedidos" className='flex flex-items'><ChevronLeft className="h-4 w-4 mr-1" /> Meus Pedidos</Link>
                    </Button>
                    <Separator orientation="vertical" className="h-5" />
                    <span className="font-mono font-bold text-sm">{order.order_number}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[order.status] ?? ''}`}>
                        {order.status_badge?.label ?? STATUS_LABELS[order.status] ?? order.status}
                    </span>
                    {order.payment_status === 'paid' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border text-green-600 border-green-400 bg-green-50">
                            <CheckCircle className="h-3 w-3" /> Pago
                        </span>
                    )}
                </div>

                {canMarkDelivered && (
                    <div className="mb-6">
                        <Button onClick={markAsDelivered} className="w-full bg-green-600 hover:bg-green-700 text-white">
                            ✅ Recebi o pedido - Marcar como Entregue
                        </Button>
                        <p className="mt-2 text-xs text-muted-foreground">
                            Use este botão quando o produto chegar na sua casa. O status será atualizado para Entregue para você e para o administrador.
                        </p>
                    </div>
                )}

                {/* ✅ BANNER PIX PENDENTE */}
                {isPixPending && (
                    <div className="mb-6 p-5 bg-amber-50 dark:bg-amber-950 border-2 border-amber-300 rounded-2xl space-y-4">
                        <div className="flex items-start gap-3">
                            <Clock className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-amber-800 dark:text-amber-200 text-lg">
                                    ⚡ Pagamento PIX Pendente
                                </h3>
                                <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">
                                    Realize o pagamento via PIX e aguarde a confirmação manual da nossa equipe.
                                </p>
                                {order.pix_expires_at && (
                                    <p className="text-xs text-amber-600 mt-1">
                                        QR Code válido até: {new Date(order.pix_expires_at).toLocaleString('pt-BR')}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-6 items-center">
                            {/* QR Code */}
                            {order.pix_qr_code_base64 && (
                                <div className="shrink-0">
                                    <p className="text-xs font-medium text-center mb-2 text-amber-800 dark:text-amber-200">
                                        Escaneie o QR Code
                                    </p>
                                    <div className="bg-white p-3 rounded-xl shadow-md inline-block">
                                        <img
                                            src={order.pix_qr_code_base64}
                                            alt="QR Code PIX"
                                            className="w-40 h-40"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex-1 space-y-3 w-full">
                                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                                    Ou copie o código PIX:
                                </p>
                                <div className="flex gap-2">
                                    <code className="flex-1 p-2 bg-white dark:bg-gray-900 border rounded-lg text-xs break-all font-mono text-gray-700 dark:text-gray-300 max-h-20 overflow-y-auto">
                                        {order.pix_qr_code}
                                    </code>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="shrink-0"
                                        onClick={copyPixCode}
                                    >
                                        {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                                {copied && (
                                    <p className="text-xs text-green-600 flex items-center gap-1">
                                        <CheckCircle className="h-3 w-3" /> Código copiado!
                                    </p>
                                )}

                                <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-lg">
                                    <p className="text-xs font-semibold text-amber-800 dark:text-amber-200 mb-1">
                                        📋 Próximos passos:
                                    </p>
                                    <ol className="text-xs text-amber-700 dark:text-amber-300 space-y-0.5 list-decimal list-inside">
                                        <li>Abra o app do seu banco</li>
                                        <li>Escaneie o QR Code ou cole o código PIX</li>
                                        <li>Confirme o pagamento de {fmt(order.total)}</li>
                                        <li>Nossa equipe confirmará em até 30 minutos</li>
                                    </ol>
                                </div>

                                <p className="text-xs text-amber-600">
                                    💬 Dúvidas? Envie o comprovante para{' '}
                                    <a href="mailto:pagamentos@minhaloja.com" className="underline">
                                        pagamentos@minhaloja.com
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Timeline */}
                        {!isCancelled && (
                            <Card>
                                <CardHeader><CardTitle className="text-base">Status do Pedido</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="flex items-center overflow-x-auto pb-1">
                                        {TIMELINE.map((step, i) => {
                                            const stepIdx  = statusOrder.indexOf(step.key);
                                            const isDone   = stepIdx <= currentIdx;
                                            const isActive = step.key === order.status;
                                            return (
                                                <div key={step.key} className="flex items-center">
                                                    <div className="flex flex-col items-center gap-1.5 px-2">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                                                            isActive ? 'bg-primary ring-4 ring-primary/20 scale-110' :
                                                            isDone   ? 'bg-green-100 dark:bg-green-900' : 'bg-muted'
                                                        }`}>
                                                            {step.icon}
                                                        </div>
                                                        <span className={`text-xs text-center leading-tight w-16 ${
                                                            isActive ? 'font-bold text-primary' :
                                                            isDone   ? 'text-green-600 font-medium' : 'text-muted-foreground'
                                                        }`}>
                                                            {step.label}
                                                        </span>
                                                    </div>
                                                    {i < TIMELINE.length - 1 && (
                                                        <div className={`h-0.5 w-6 shrink-0 ${
                                                            statusOrder.indexOf(TIMELINE[i+1].key) <= currentIdx ? 'bg-green-400' : 'bg-border'
                                                        }`} />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Itens */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Package className="h-4 w-4" /> Itens
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="divide-y">
                                    {order.items.map(item => (
                                        <div key={item.id} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                                            <img
                                                src={item.product?.images?.[0]?.image_path ?? '/placeholder.png'}
                                                className="w-14 h-14 object-cover rounded-lg bg-muted shrink-0"
                                                alt={item.product_name}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm">{item.product_name}</p>
                                                {item.product_sku && <p className="text-xs text-muted-foreground font-mono">SKU: {item.product_sku}</p>}
                                                <p className="text-sm text-muted-foreground mt-1">{item.quantity}x {fmt(item.price)}</p>
                                            </div>
                                            <p className="font-bold text-sm">{fmt(item.subtotal)}</p>
                                        </div>
                                    ))}
                                </div>
                                <Separator className="my-4" />
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{fmt(order.subtotal)}</span></div>
                                    {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Desconto</span><span>-{fmt(order.discount)}</span></div>}
                                    <div className="flex justify-between"><span className="text-muted-foreground">Frete</span><span>{fmt(order.shipping)}</span></div>
                                    <Separator />
                                    <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-primary">{fmt(order.total)}</span></div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Endereço */}
                        <Card>
                            <CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4" /> Entrega</CardTitle></CardHeader>
                            <CardContent className="text-sm space-y-1">
                                <p className="font-medium">{order.shipping_name}</p>
                                {order.shipping_phone && <p className="text-muted-foreground">{order.shipping_phone}</p>}
                                <p className="text-muted-foreground">{order.shipping_street}, {order.shipping_number}{order.shipping_complement && `, ${order.shipping_complement}`}</p>
                                <p className="text-muted-foreground">{order.shipping_neighborhood} — {order.shipping_city}/{order.shipping_state}</p>
                                <p className="text-muted-foreground font-mono text-xs">CEP: {order.shipping_zipcode}</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader><CardTitle className="text-base flex items-center gap-2"><CreditCard className="h-4 w-4" /> Pagamento</CardTitle></CardHeader>
                            <CardContent className="text-sm space-y-2">
                                <div>
                                    <p className="text-muted-foreground text-xs">Método</p>
                                    <p className="font-medium">
                                        {order.payment_method === 'credit_card' ? '💳 Cartão de Crédito' :
                                         order.payment_method === 'pix' ? '⚡ PIX' : order.payment_method}
                                    </p>
                                </div>
                                {order.payment_method === 'credit_card' && order.installments > 0 && (
                                    <div>
                                        <p className="text-muted-foreground text-xs">Parcelamento</p>
                                        <p className="font-medium">
                                            {order.installments > 1
                                                ? `${order.installments}x de ${fmt(order.total / order.installments)} sem juros`
                                                : `À vista — ${fmt(order.total)}`}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-muted-foreground text-xs">Status</p>
                                    <p className={`font-medium ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {order.payment_status === 'paid' ? '✅ Pago' : '⏳ Aguardando'}
                                    </p>
                                </div>
                                {order.paid_at && (
                                    <div>
                                        <p className="text-muted-foreground text-xs">Pago em</p>
                                        <p className="font-medium">{new Date(order.paid_at).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <p className="text-xs text-muted-foreground text-center">
                            Pedido em {new Date(order.created_at).toLocaleDateString('pt-BR', {
                                day: '2-digit', month: 'long', year: 'numeric',
                            })}
                        </p>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}