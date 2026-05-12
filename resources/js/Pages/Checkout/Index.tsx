import { useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { useForm, Link, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Separator } from '@/Components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/Components/ui/radio-group';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Switch } from '@/Components/ui/switch';
import {
    MapPin, CreditCard, ChevronRight, Lock, Truck,
    CheckCircle, AlertCircle, Loader2, Search, Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Address {
    id: number; label?: string; name: string; street: string; number: string;
    complement?: string; neighborhood: string; city: string;
    state: string; zipcode: string; phone?: string; is_default: boolean;
}
interface CartItem {
    id: number; quantity: number; price: number; subtotal: number;
    product: { name: string; images: any[] };
}
interface Cart {
    items: CartItem[]; subtotal: number; total: number;
    discount_amount: number; coupon_code?: string;
}
interface Props {
    cart: Cart;
    addresses: Address[];
    defaultAddress?: Address;
    cartCount?: number;
}

type Step = 'address' | 'payment' | 'review';

const INSTALLMENT_OPTIONS = [
    { value: '1', label: 'À vista' },
    { value: '2', label: '2x sem juros' },
    { value: '3', label: '3x sem juros' },
    { value: '4', label: '4x sem juros' },
    { value: '5', label: '5x sem juros' },
    { value: '6', label: '6x sem juros' },
    { value: '10', label: '10x sem juros' },
    { value: '12', label: '12x sem juros' },
];

export default function CheckoutIndex({ cart, addresses, defaultAddress, cartCount = 0 }: Props) {
    const [step, setStep]                     = useState<Step>('address');
    const [useNewAddress, setUseNewAddress]   = useState(!defaultAddress);
    const [selectedAddr, setSelectedAddr]     = useState<Address | null>(defaultAddress ?? null);
    const [paymentMethod, setPaymentMethod]   = useState<'credit_card' | 'pix'>('credit_card');
    const [isProcessing, setIsProcessing]     = useState(false);
    const [paymentError, setPaymentError]     = useState('');
    const [cepLoading, setCepLoading]         = useState(false);
    const [cepError, setCepError]             = useState('');
    const [cepFound, setCepFound]             = useState(false);

    const shipping = 15.00;
    const fmt = (v: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

    const { data, setData, post, processing, errors } = useForm({
        payment_method:         'credit_card',
        installments:           '1',
        shipping_name:          defaultAddress?.name ?? '',
        shipping_phone:         defaultAddress?.phone ?? '',
        shipping_zipcode:       defaultAddress?.zipcode ?? '',
        shipping_street:        defaultAddress?.street ?? '',
        shipping_number:        defaultAddress?.number ?? '',
        shipping_complement:    defaultAddress?.complement ?? '',
        shipping_neighborhood:  defaultAddress?.neighborhood ?? '',
        shipping_city:          defaultAddress?.city ?? '',
        shipping_state:         defaultAddress?.state ?? '',
        notes:                  '',
        save_address:           false,
    });

    const fillAddress = (addr: Address) => {
        setSelectedAddr(addr);
        setData(prev => ({
            ...prev,
            shipping_name:         addr.name,
            shipping_phone:        addr.phone ?? '',
            shipping_zipcode:      addr.zipcode,
            shipping_street:       addr.street,
            shipping_number:       addr.number,
            shipping_complement:   addr.complement ?? '',
            shipping_neighborhood: addr.neighborhood,
            shipping_city:         addr.city,
            shipping_state:        addr.state,
        }));
    };

    // Busca CEP
    const handleCepChange = (value: string) => {
        const clean = value.replace(/\D/g, '').slice(0, 8);
        const fmt2  = clean.length > 5 ? `${clean.slice(0, 5)}-${clean.slice(5)}` : clean;
        setData('shipping_zipcode', fmt2);
        setCepFound(false);
        setCepError('');
        if (clean.length === 8) fetchCep(clean);
    };

    const fetchCep = async (cep: string) => {
        setCepLoading(true);
        try {
            const res    = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const result = await res.json();
            if (result.erro) {
                setCepError('CEP não encontrado.');
            } else {
                setData(prev => ({
                    ...prev,
                    shipping_street:       result.logradouro ?? '',
                    shipping_neighborhood: result.bairro ?? '',
                    shipping_city:         result.localidade ?? '',
                    shipping_state:        result.uf ?? '',
                }));
                setCepFound(true);
                setTimeout(() => document.getElementById('shipping_number')?.focus(), 100);
            }
        } catch {
            setCepError('Erro ao buscar CEP.');
        } finally {
            setCepLoading(false);
        }
    };

    const canProceed = data.shipping_name && data.shipping_street &&
        data.shipping_number && data.shipping_city && data.shipping_state &&
        data.shipping_zipcode.replace(/\D/g, '').length === 8;

    const handleSubmit = () => {
        setIsProcessing(true);
        setData('payment_method', paymentMethod);
        post('/checkout', {
            onError: () => {
                setIsProcessing(false);
                setPaymentError('Erro ao processar. Tente novamente.');
            },
        });
    };

    const total = cart.total + shipping;

    // Parcelas
    const installmentValue = data.installments !== '1'
        ? fmt(total / Number(data.installments))
        : null;

    const OrderSummary = () => (
        <Card className="sticky top-24">
            <CardHeader><CardTitle className="text-base">Resumo</CardTitle></CardHeader>
            <CardContent className="space-y-3">
                {cart.items.map(item => (
                    <div key={item.id} className="flex gap-3">
                        <img
                            src={item.product.images?.[0]?.image_path ?? '/placeholder.png'}
                            className="w-12 h-12 object-cover rounded-lg bg-muted shrink-0"
                            alt={item.product.name}
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                            <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                        </div>
                        <span className="text-sm font-bold">{fmt(item.subtotal)}</span>
                    </div>
                ))}
                <Separator />
                <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{fmt(cart.subtotal)}</span>
                    </div>
                    {cart.discount_amount > 0 && (
                        <div className="flex justify-between text-green-600">
                            <span>Desconto {cart.coupon_code && `(${cart.coupon_code})`}</span>
                            <span>-{fmt(cart.discount_amount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Frete</span>
                        <span>{fmt(shipping)}</span>
                    </div>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{fmt(total)}</span>
                </div>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Lock className="h-3 w-3" /> Compra 100% segura
                </p>
            </CardContent>
        </Card>
    );

    return (
        <MainLayout cartCount={cartCount}>
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <h1 className="text-2xl font-bold mb-6">Finalizar Compra</h1>

                {/* Steps */}
                <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
                    {(['address', 'payment', 'review'] as Step[]).map((s, i) => {
                        const labels = { address: 'Endereço', payment: 'Pagamento', review: 'Revisão' };
                        const stepOrder = ['address', 'payment', 'review'];
                        const isDone   = stepOrder.indexOf(s) < stepOrder.indexOf(step);
                        const isActive = s === step;
                        return (
                            <div key={s} className="flex items-center gap-1">
                                <button
                                    onClick={() => isDone && setStep(s)}
                                    disabled={!isDone}
                                    className={cn(
                                        'px-4 py-2 rounded-full text-sm font-medium transition-all shrink-0',
                                        isActive  ? 'bg-primary text-primary-foreground' :
                                        isDone    ? 'bg-primary/20 text-primary cursor-pointer hover:bg-primary/30' :
                                        'bg-muted text-muted-foreground cursor-not-allowed'
                                    )}
                                >
                                    {isDone && '✓ '}{labels[s]}
                                </button>
                                {i < 2 && <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">

                        {/* ═══════════════════ STEP 1: ENDEREÇO ═══════════════════ */}
                        {step === 'address' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="h-5 w-5" /> Endereço de Entrega
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-5">

                                    {/* Endereços salvos */}
                                    {addresses.length > 0 && (
                                        <div className="space-y-2">
                                            <Label className="font-semibold">Seus Endereços</Label>
                                            <RadioGroup
                                                value={useNewAddress ? 'new' : String(selectedAddr?.id)}
                                                onValueChange={v => {
                                                    if (v === 'new') {
                                                        setUseNewAddress(true);
                                                        setSelectedAddr(null);
                                                    } else {
                                                        const addr = addresses.find(a => String(a.id) === v)!;
                                                        setUseNewAddress(false);
                                                        fillAddress(addr);
                                                    }
                                                }}
                                            >
                                                {addresses.map(addr => (
                                                    <div
                                                        key={addr.id}
                                                        className={cn(
                                                            'flex items-start gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all',
                                                            String(selectedAddr?.id) === String(addr.id) && !useNewAddress
                                                                ? 'border-primary bg-primary/5'
                                                                : 'border-border hover:border-primary/50'
                                                        )}
                                                    >
                                                        <RadioGroupItem value={String(addr.id)} id={`a-${addr.id}`} className="mt-1" />
                                                        <label htmlFor={`a-${addr.id}`} className="cursor-pointer flex-1">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <p className="font-semibold text-sm">{addr.label || addr.name}</p>
                                                                {addr.is_default && (
                                                                    <span className="inline-flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                                                        <Star className="h-2.5 w-2.5 fill-primary" /> Padrão
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                                {addr.street}, {addr.number}
                                                                {addr.complement && `, ${addr.complement}`}
                                                                {' — '}{addr.neighborhood}, {addr.city}/{addr.state}
                                                                {' — CEP: '}{addr.zipcode}
                                                            </p>
                                                        </label>
                                                    </div>
                                                ))}
                                                <div className={cn(
                                                    'flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all',
                                                    useNewAddress ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                                                )}>
                                                    <RadioGroupItem value="new" id="a-new" />
                                                    <label htmlFor="a-new" className="cursor-pointer text-sm font-medium">
                                                        + Usar novo endereço
                                                    </label>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                    )}

                                    {/* Formulário de novo endereço */}
                                    {(useNewAddress || addresses.length === 0) && (
                                        <div className="space-y-4 pt-2">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2 space-y-1.5">
                                                    <Label>Nome no endereço *</Label>
                                                    <Input
                                                        value={data.shipping_name}
                                                        onChange={e => setData('shipping_name', e.target.value)}
                                                        placeholder="Seu nome completo"
                                                    />
                                                    {errors.shipping_name && <p className="text-destructive text-xs">{errors.shipping_name}</p>}
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label>Telefone</Label>
                                                    <Input
                                                        value={data.shipping_phone}
                                                        onChange={e => setData('shipping_phone', e.target.value)}
                                                        placeholder="(83) 99999-9999"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label>CEP *</Label>
                                                    <div className="relative">
                                                        <Input
                                                            value={data.shipping_zipcode}
                                                            onChange={e => handleCepChange(e.target.value)}
                                                            placeholder="00000-000"
                                                            maxLength={9}
                                                            className={cn(
                                                                'pr-8',
                                                                cepFound && 'border-green-500',
                                                                cepError && 'border-red-500'
                                                            )}
                                                        />
                                                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                                            {cepLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                                                            {cepFound && !cepLoading && <CheckCircle className="h-4 w-4 text-green-500" />}
                                                            {cepError && !cepLoading && <AlertCircle className="h-4 w-4 text-red-500" />}
                                                        </div>
                                                    </div>
                                                    {cepFound && <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Endereço encontrado!</p>}
                                                    {cepError && <p className="text-xs text-red-500">{cepError}</p>}
                                                    <a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                                                        <Search className="h-3 w-3" /> Não sei meu CEP
                                                    </a>
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label>Rua / Avenida *</Label>
                                                <Input
                                                    value={data.shipping_street}
                                                    onChange={e => setData('shipping_street', e.target.value)}
                                                    className={cepFound && data.shipping_street ? 'border-green-300 bg-green-50/30' : ''}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label>Número *</Label>
                                                    <Input
                                                        id="shipping_number"
                                                        value={data.shipping_number}
                                                        onChange={e => setData('shipping_number', e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label>Complemento</Label>
                                                    <Input
                                                        value={data.shipping_complement}
                                                        onChange={e => setData('shipping_complement', e.target.value)}
                                                        placeholder="Apto, Bloco..."
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <Label>Bairro *</Label>
                                                <Input
                                                    value={data.shipping_neighborhood}
                                                    onChange={e => setData('shipping_neighborhood', e.target.value)}
                                                    className={cepFound && data.shipping_neighborhood ? 'border-green-300 bg-green-50/30' : ''}
                                                />
                                            </div>

                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="col-span-2 space-y-1.5">
                                                    <Label>Cidade *</Label>
                                                    <Input
                                                        value={data.shipping_city}
                                                        onChange={e => setData('shipping_city', e.target.value)}
                                                        className={cepFound && data.shipping_city ? 'border-green-300 bg-green-50/30' : ''}
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label>Estado *</Label>
                                                    <Input
                                                        value={data.shipping_state}
                                                        onChange={e => setData('shipping_state', e.target.value.toUpperCase())}
                                                        maxLength={2}
                                                        placeholder="PB"
                                                        className={cn('uppercase', cepFound && data.shipping_state ? 'border-green-300 bg-green-50/30' : '')}
                                                    />
                                                </div>
                                            </div>

                                            {/* Salvar endereço */}
                                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                                <div>
                                                    <p className="text-sm font-medium">Salvar endereço no perfil</p>
                                                    <p className="text-xs text-muted-foreground">Facilita nas próximas compras</p>
                                                </div>
                                                <Switch
                                                    checked={data.save_address}
                                                    onCheckedChange={v => setData('save_address', v)}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                                        <Truck className="h-4 w-4 shrink-0" />
                                        <span>Frete padrão: {fmt(shipping)} — Entrega em 3-7 dias úteis</span>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label>Observações (opcional)</Label>
                                        <Textarea
                                            rows={2}
                                            placeholder="Instruções de entrega, ponto de referência..."
                                            value={data.notes}
                                            onChange={e => setData('notes', e.target.value)}
                                        />
                                    </div>

                                    <Button
                                        className="w-full"
                                        disabled={!canProceed || cepLoading}
                                        onClick={() => setStep('payment')}
                                    >
                                        Continuar para Pagamento <ChevronRight className="h-4 w-4 ml-1" />
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* ═══════════════════ STEP 2: PAGAMENTO ═══════════════════ */}
                        {step === 'payment' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" /> Forma de Pagamento
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <RadioGroup
                                        value={paymentMethod}
                                        onValueChange={v => setPaymentMethod(v as any)}
                                        className="grid grid-cols-2 gap-3"
                                    >
                                        {/* Cartão */}
                                        <div className={cn(
                                            'flex flex-col items-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all text-center',
                                            paymentMethod === 'credit_card' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                                        )}>
                                            <RadioGroupItem value="credit_card" id="cc" className="sr-only" />
                                            <label htmlFor="cc" className="cursor-pointer w-full">
                                                <p className="text-2xl mb-1">💳</p>
                                                <p className="font-bold text-sm">Cartão de Crédito</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">Parcele em até 12x</p>
                                            </label>
                                        </div>

                                        {/* PIX */}
                                        <div className={cn(
                                            'flex flex-col items-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all text-center',
                                            paymentMethod === 'pix' ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-border hover:border-green-400'
                                        )}>
                                            <RadioGroupItem value="pix" id="pix" className="sr-only" />
                                            <label htmlFor="pix" className="cursor-pointer w-full">
                                                <p className="text-2xl mb-1">⚡</p>
                                                <p className="font-bold text-sm">PIX</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">Aprovação manual</p>
                                            </label>
                                        </div>
                                    </RadioGroup>

                                    {/* Opções do Cartão — só parcelas */}
                                    {paymentMethod === 'credit_card' && (
                                        <div className="p-4 bg-muted/50 rounded-xl border space-y-3">
                                            <p className="text-sm font-semibold flex items-center gap-2">
                                                💳 Pagamento com Cartão de Crédito
                                            </p>
                                            <div className="space-y-1.5">
                                                <Label>Número de Parcelas</Label>
                                                <Select
                                                    value={data.installments}
                                                    onValueChange={v => setData('installments', v ?? '1')}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {INSTALLMENT_OPTIONS.map(opt => {
                                                            const parcela = Number(opt.value) > 1
                                                                ? ` — ${fmt(total / Number(opt.value))}/mês`
                                                                : ` — ${fmt(total)}`;
                                                            return (
                                                                <SelectItem key={opt.value} value={opt.value}>
                                                                    {opt.label}{parcela}
                                                                </SelectItem>
                                                            );
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            {Number(data.installments) > 1 && (
                                                <div className="p-3 bg-primary/5 rounded-lg text-sm">
                                                    <p className="font-medium">
                                                        {data.installments}x de {fmt(total / Number(data.installments))} sem juros
                                                    </p>
                                                    <p className="text-muted-foreground text-xs mt-0.5">
                                                        Total: {fmt(total)}
                                                    </p>
                                                </div>
                                            )}
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Lock className="h-3 w-3" />
                                                Os dados do cartão serão solicitados na maquininha na entrega
                                            </p>
                                        </div>
                                    )}

                                    {/* Info PIX */}
                                    {paymentMethod === 'pix' && (
                                        <div className="p-4 bg-green-50 dark:bg-green-950 rounded-xl border border-green-200 space-y-3">
                                            <p className="font-semibold text-green-700 dark:text-green-300 flex items-center gap-2">
                                                ⚡ Como funciona o PIX
                                            </p>
                                            <ol className="text-sm text-muted-foreground space-y-1.5 list-decimal list-inside">
                                                <li>Finalize o pedido e copie o QR Code gerado</li>
                                                <li>Pague via PIX no app do seu banco</li>
                                                <li>Envie o comprovante pelo WhatsApp ou e-mail</li>
                                                <li>Nosso time confirma manualmente e seu pedido é processado</li>
                                            </ol>
                                            <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900 p-2 rounded-lg">
                                                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                                <span>O QR Code expira em 24 horas. O pedido só será processado após confirmação.</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-3">
                                        <Button variant="outline" onClick={() => setStep('address')} className="flex-1">
                                            ← Voltar
                                        </Button>
                                        <Button onClick={() => setStep('review')} className="flex-1">
                                            Revisar Pedido <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* ═══════════════════ STEP 3: REVISÃO ═══════════════════ */}
                        {step === 'review' && (
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm flex justify-between">
                                            Endereço <Button variant="ghost" size="sm" onClick={() => setStep('address')}>Editar</Button>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm space-y-0.5">
                                        <p className="font-medium">{data.shipping_name}</p>
                                        <p className="text-muted-foreground">
                                            {data.shipping_street}, {data.shipping_number}
                                            {data.shipping_complement && `, ${data.shipping_complement}`}
                                        </p>
                                        <p className="text-muted-foreground">
                                            {data.shipping_neighborhood} — {data.shipping_city}/{data.shipping_state}
                                        </p>
                                        <p className="text-muted-foreground">CEP: {data.shipping_zipcode}</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm flex justify-between">
                                            Pagamento <Button variant="ghost" size="sm" onClick={() => setStep('payment')}>Editar</Button>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm">
                                        {paymentMethod === 'credit_card' ? (
                                            <div>
                                                <p className="font-medium">💳 Cartão de Crédito</p>
                                                <p className="text-muted-foreground">
                                                    {data.installments === '1'
                                                        ? `À vista — ${fmt(total)}`
                                                        : `${data.installments}x de ${fmt(total / Number(data.installments))} sem juros`}
                                                </p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="font-medium">⚡ PIX</p>
                                                <p className="text-muted-foreground">QR Code gerado após confirmação do pedido</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {paymentError && (
                                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                        {paymentError}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={() => setStep('payment')} className="flex-1">
                                        ← Voltar
                                    </Button>
                                    <Button
                                        size="lg"
                                        className="flex-1 gap-2"
                                        disabled={isProcessing || processing}
                                        onClick={handleSubmit}
                                    >
                                        <Lock className="h-4 w-4" />
                                        {isProcessing
                                            ? 'Processando...'
                                            : paymentMethod === 'pix'
                                                ? 'Gerar QR Code PIX'
                                                : `Confirmar Pedido — ${fmt(total)}`}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                                    <Lock className="h-3 w-3" /> Transação segura e criptografada
                                </p>
                            </div>
                        )}
                    </div>

                    <div><OrderSummary /></div>
                </div>
            </div>
        </MainLayout>
    );
}