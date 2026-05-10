import { useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import { useForm, Link, Head } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Separator } from '@/Components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/Components/ui/radio-group';
import { Textarea } from '@/Components/ui/textarea';
import { Badge } from '@/Components/ui/badge';
import {
    MapPin, CreditCard, ChevronRight, Lock,
    Truck, CheckCircle, AlertCircle, Loader2, Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Address {
    id: number; name: string; street: string; number: string;
    complement?: string; neighborhood: string; city: string;
    state: string; zipcode: string; phone?: string;
}
interface CartItem {
    id: number; quantity: number; price: number; subtotal: number;
    product: { name: string; images: any[] };
}
interface Cart {
    items: CartItem[]; subtotal: number; total: number;
    discount_amount: number; coupon_code?: string;
}
interface Props { cart: Cart; addresses: Address[]; cartCount?: number; }

type Step = 'address' | 'payment' | 'review';

export default function CheckoutIndex({ cart, addresses, cartCount = 0 }: Props) {
    const [step, setStep] = useState<Step>('address');
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(addresses[0] ?? null);
    const [useNewAddress, setUseNewAddress] = useState(addresses.length === 0);
    const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pix' | 'boleto'>('credit_card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState('');

    // ✅ Estados do CEP
    const [cepLoading, setCepLoading] = useState(false);
    const [cepError, setCepError] = useState('');
    const [cepFound, setCepFound] = useState(false);

    const fmt = (v: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

    const { data, setData, post, processing, errors } = useForm({
        payment_method: 'credit_card',
        payment_id: 'demo_payment_' + Date.now(),
        shipping_name: selectedAddress?.name ?? '',
        shipping_phone: selectedAddress?.phone ?? '',
        shipping_zipcode: selectedAddress?.zipcode ?? '',
        shipping_street: selectedAddress?.street ?? '',
        shipping_number: selectedAddress?.number ?? '',
        shipping_complement: selectedAddress?.complement ?? '',
        shipping_neighborhood: selectedAddress?.neighborhood ?? '',
        shipping_city: selectedAddress?.city ?? '',
        shipping_state: selectedAddress?.state ?? '',
        notes: '',
    });

    // ✅ Função de busca do CEP via ViaCEP
    const fetchCep = async (cep: string) => {
        const cleanCep = cep.replace(/\D/g, '');

        if (cleanCep.length !== 8) {
            setCepError('');
            setCepFound(false);
            return;
        }

        setCepLoading(true);
        setCepError('');
        setCepFound(false);

        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const result = await response.json();

            if (result.erro) {
                setCepError('CEP não encontrado. Verifique e tente novamente.');
                setCepFound(false);
            } else {
                // ✅ Preenche os campos automaticamente
                setData(prev => ({
                    ...prev,
                    shipping_street: result.logradouro ?? prev.shipping_street,
                    shipping_neighborhood: result.bairro ?? prev.shipping_neighborhood,
                    shipping_city: result.localidade ?? prev.shipping_city,
                    shipping_state: result.uf ?? prev.shipping_state,
                    shipping_complement: result.complemento ?? prev.shipping_complement,
                }));
                setCepFound(true);
                setCepError('');

                // Foca no campo número após preencher
                setTimeout(() => {
                    document.getElementById('shipping_number')?.focus();
                }, 100);
            }
        } catch {
            setCepError('Erro ao buscar CEP. Verifique sua conexão.');
            setCepFound(false);
        } finally {
            setCepLoading(false);
        }
    };

    // ✅ Formatar CEP enquanto digita (00000-000)
    const handleCepChange = (value: string) => {
        const clean = value.replace(/\D/g, '').slice(0, 8);
        const formatted = clean.length > 5
            ? `${clean.slice(0, 5)}-${clean.slice(5)}`
            : clean;

        setData('shipping_zipcode', formatted);
        setCepFound(false);
        setCepError('');

        // Busca automática quando completa 8 dígitos
        if (clean.length === 8) {
            fetchCep(clean);
        }
    };

    const formatarCelular = (value: string) => {
        const numbers = value.replace(/\D/g, '').slice(0, 11);

        return numbers
            .replace(/^(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2');
    };
    const fillFromAddress = (addr: Address) => {
        setSelectedAddress(addr);
        setData(prev => ({
            ...prev,
            shipping_name: addr.name,
            shipping_phone: addr.phone ?? '',
            shipping_zipcode: addr.zipcode,
            shipping_street: addr.street,
            shipping_number: addr.number,
            shipping_complement: addr.complement ?? '',
            shipping_neighborhood: addr.neighborhood,
            shipping_city: addr.city,
            shipping_state: addr.state,
        }));
    };

    const steps: { key: Step; label: string; icon: any }[] = [
        { key: 'address', label: 'Endereço', icon: MapPin },
        { key: 'payment', label: 'Pagamento', icon: CreditCard },
        { key: 'review', label: 'Revisão', icon: CheckCircle },
    ];

    const shipping = 15.00;
    const total = cart.total + shipping;

    const handleSubmit = () => {
        setIsProcessing(true);
        setData('payment_method', paymentMethod);
        post('/checkout', {
            onError: () => {
                setIsProcessing(false);
                setPaymentError('Erro ao processar pagamento. Tente novamente.');
            },
        });
    };

    const canProceedToPayment =
        data.shipping_name &&
        data.shipping_zipcode.replace(/\D/g, '').length === 8 &&
        data.shipping_street &&
        data.shipping_number &&
        data.shipping_neighborhood &&
        data.shipping_city &&
        data.shipping_state;

    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');

    const formatCardNumber = (value: string) => {
        return value
            .replace(/\D/g, '')
            .slice(0, 16)
            .replace(/(\d{4})(?=\d)/g, '$1 ');
    };

    const formatExpiry = (value: string) => {
        return value
            .replace(/\D/g, '')
            .slice(0, 4)
            .replace(/(\d{2})(\d)/, '$1/$2');
    };

    const formatCVV = (value: string) => {
        return value.replace(/\D/g, '').slice(0, 4);
    };

    const OrderSummary = () => (
        <>
        <Head title='Resumo do Pedido'/>
        <Card className="sticky top-24">
            <CardHeader><CardTitle className="text-base">Resumo do Pedido</CardTitle></CardHeader>
            <CardContent className="space-y-3">
                {cart.items.map(item => (
                    <div key={item.id} className="flex gap-3">
                        <img
                            src={item.product.images?.[0]?.image_path ?? '/placeholder.png'}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded-lg bg-muted shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium line-clamp-1">{item.product.name}</p>
                            <p className="text-xs text-muted-foreground">Qtd: {item.quantity}</p>
                        </div>
                        <span className="text-sm font-bold shrink-0">{fmt(item.subtotal)}</span>
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
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                    <Lock className="h-3 w-3" />
                    <span>Pagamento seguro e criptografado</span>
                </div>
            </CardContent>
        </Card>
        </>
    );
    

    return (
        <>
        <Head title='Finalizar Compra'/>
        <MainLayout cartCount={cartCount}>
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <h1 className="text-2xl font-bold mb-6">Finalizar Compra</h1>

                {/* Steps */}
                <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
                    {steps.map(({ key, label, icon: Icon }, i) => {
                        const stepOrder: Step[] = ['address', 'payment', 'review'];
                        const current = stepOrder.indexOf(step);
                        const thisIdx = stepOrder.indexOf(key);
                        const isDone = thisIdx < current;
                        const isActive = key === step;
                        return (
                            <div key={key} className="flex items-center gap-2">
                                <button
                                    onClick={() => isDone && setStep(key)}
                                    disabled={!isDone}
                                    className={cn(
                                        'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all shrink-0',
                                        isActive ? 'bg-primary text-primary-foreground' :
                                        isDone ? 'bg-primary/20 text-primary hover:bg-primary/30 cursor-pointer' :
                                        'bg-muted text-muted-foreground cursor-not-allowed'
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {label}
                                </button>
                                {i < steps.length - 1 && (
                                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">

                        {/* STEP 1: Endereço */}
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
                                        <div className="space-y-3">
                                            <Label className="font-semibold">Endereços Salvos</Label>
                                            <RadioGroup
                                                value={useNewAddress ? 'new' : String(selectedAddress?.id)}
                                                onValueChange={v => {
                                                    if (v === 'new') {
                                                        setUseNewAddress(true);
                                                        setSelectedAddress(null);
                                                    } else {
                                                        const addr = addresses.find(a => String(a.id) === v)!;
                                                        setUseNewAddress(false);
                                                        fillFromAddress(addr);
                                                    }
                                                }}
                                            >
                                                {addresses.map(addr => (
                                                    <div key={addr.id} className="flex items-start gap-3 p-3 border rounded-lg hover:border-primary/50 transition-colors">
                                                        <RadioGroupItem value={String(addr.id)} id={`addr-${addr.id}`} className="mt-1" />
                                                        <label htmlFor={`addr-${addr.id}`} className="cursor-pointer flex-1 text-sm">
                                                            <p className="font-medium">{addr.name}</p>
                                                            <p className="text-muted-foreground text-xs mt-0.5">
                                                                {addr.street}, {addr.number}
                                                                {addr.complement && `, ${addr.complement}`}
                                                                {' — '}{addr.neighborhood}, {addr.city}/{addr.state}
                                                                {' — CEP: '}{addr.zipcode}
                                                            </p>
                                                        </label>
                                                    </div>
                                                ))}
                                                <div className="flex items-center gap-3 p-3 border rounded-lg hover:border-primary/50 transition-colors cursor-pointer">
                                                    <RadioGroupItem value="new" id="addr-new" />
                                                    <label htmlFor="addr-new" className="cursor-pointer text-sm font-medium">
                                                        + Usar novo endereço
                                                    </label>
                                                </div>
                                            </RadioGroup>
                                        </div>
                                    )}

                                    {/* Formulário novo endereço */}
                                    {(useNewAddress || addresses.length === 0) && (
                                        <div className="space-y-4">
                                            {/* Nome e Telefone */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="shipping_name">Nome completo *</Label>
                                                    <Input
                                                        id="shipping_name"
                                                        value={data.shipping_name}
                                                        onChange={e => setData('shipping_name', e.target.value)}
                                                        placeholder="Seu nome completo"
                                                    />
                                                    {errors.shipping_name && <p className="text-destructive text-xs">{errors.shipping_name}</p>}
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="shipping_phone">Telefone</Label>
                                                    <Input
                                                        id="shipping_phone"
                                                        value={data.shipping_phone}
                                                        onChange={e => setData('shipping_phone', formatarCelular(e.target.value))}
                                                        placeholder="(83) 99999-9999"
                                                    />
                                                </div>
                                            </div>

                                            {/* ✅ Campo CEP com busca automática */}
                                            <div className="space-y-1.5">
                                                <Label htmlFor="shipping_zipcode">CEP *</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="shipping_zipcode"
                                                        value={data.shipping_zipcode}
                                                        onChange={e => handleCepChange(e.target.value)}
                                                        placeholder="00000-000"
                                                        maxLength={9}
                                                        className={cn(
                                                            'pr-10',
                                                            cepFound && 'border-green-500 focus-visible:ring-green-500',
                                                            cepError && 'border-red-500 focus-visible:ring-red-500'
                                                        )}
                                                    />
                                                    {/* Ícone de status */}
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                        {cepLoading && (
                                                            <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                                                        )}
                                                        {cepFound && !cepLoading && (
                                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                                        )}
                                                        {cepError && !cepLoading && (
                                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Feedback do CEP */}
                                                {cepLoading && (
                                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                        Buscando endereço...
                                                    </p>
                                                )}
                                                {cepFound && (
                                                    <p className="text-xs text-green-600 flex items-center gap-1">
                                                        <CheckCircle className="h-3 w-3" />
                                                        Endereço encontrado! Verifique os campos abaixo.
                                                    </p>
                                                )}
                                                {cepError && (
                                                    <p className="text-xs text-red-500 flex items-center gap-1">
                                                        <AlertCircle className="h-3 w-3" />
                                                        {cepError}
                                                    </p>
                                                )}
                                                {errors.shipping_zipcode && (
                                                    <p className="text-destructive text-xs">{errors.shipping_zipcode}</p>
                                                )}

                                                {/* Link para buscar CEP */}
                                                <a
                                                    href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-primary hover:underline flex items-center gap-1"
                                                >
                                                    <Search className="h-3 w-3" />
                                                    Não sei meu CEP
                                                </a>
                                            </div>

                                            {/* Rua */}
                                            <div className="space-y-1.5">
                                                <Label htmlFor="shipping_street">Rua / Avenida *</Label>
                                                <Input
                                                    id="shipping_street"
                                                    value={data.shipping_street}
                                                    onChange={e => setData('shipping_street', e.target.value)}
                                                    placeholder="Nome da rua"
                                                    className={cepFound && data.shipping_street ? 'border-green-300 bg-green-50/50 dark:bg-green-950/20' : ''}
                                                />
                                                {errors.shipping_street && <p className="text-destructive text-xs">{errors.shipping_street}</p>}
                                            </div>

                                            {/* Número e Complemento */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="shipping_number">Número *</Label>
                                                    <Input
                                                        id="shipping_number"
                                                        value={data.shipping_number}
                                                        onChange={e => setData('shipping_number', e.target.value)}
                                                        placeholder="Ex: 123"
                                                    />
                                                    {errors.shipping_number && <p className="text-destructive text-xs">{errors.shipping_number}</p>}
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="shipping_complement">Complemento</Label>
                                                    <Input
                                                        id="shipping_complement"
                                                        value={data.shipping_complement}
                                                        onChange={e => setData('shipping_complement', e.target.value)}
                                                        placeholder="Apto, Bloco, Casa..."
                                                    />
                                                </div>
                                            </div>

                                            {/* Bairro */}
                                            <div className="space-y-1.5">
                                                <Label htmlFor="shipping_neighborhood">Bairro *</Label>
                                                <Input
                                                    id="shipping_neighborhood"
                                                    value={data.shipping_neighborhood}
                                                    onChange={e => setData('shipping_neighborhood', e.target.value)}
                                                    placeholder="Seu bairro"
                                                    className={cepFound && data.shipping_neighborhood ? 'border-green-300 bg-green-50/50 dark:bg-green-950/20' : ''}
                                                />
                                                {errors.shipping_neighborhood && <p className="text-destructive text-xs">{errors.shipping_neighborhood}</p>}
                                            </div>

                                            {/* Cidade e Estado */}
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <div className="sm:col-span-2 space-y-1.5">
                                                    <Label htmlFor="shipping_city">Cidade *</Label>
                                                    <Input
                                                        id="shipping_city"
                                                        value={data.shipping_city}
                                                        onChange={e => setData('shipping_city', e.target.value)}
                                                        placeholder="Sua cidade"
                                                        className={cepFound && data.shipping_city ? 'border-green-300 bg-green-50/50 dark:bg-green-950/20' : ''}
                                                    />
                                                    {errors.shipping_city && <p className="text-destructive text-xs">{errors.shipping_city}</p>}
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="shipping_state">Estado *</Label>
                                                    <Input
                                                        id="shipping_state"
                                                        value={data.shipping_state}
                                                        onChange={e => setData('shipping_state', e.target.value.toUpperCase())}
                                                        placeholder="PB"
                                                        maxLength={2}
                                                        className={cn(
                                                            'uppercase',
                                                            cepFound && data.shipping_state ? 'border-green-300 bg-green-50/50 dark:bg-green-950/20' : ''
                                                        )}
                                                    />
                                                    {errors.shipping_state && <p className="text-destructive text-xs">{errors.shipping_state}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Info frete */}
                                    <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm text-blue-700 dark:text-blue-300">
                                        <Truck className="h-4 w-4 shrink-0" />
                                        <span>Frete padrão: {fmt(shipping)} — Entrega em 3-7 dias úteis</span>
                                    </div>

                                    {/* Observações */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="notes">Observações do pedido (opcional)</Label>
                                        <Textarea
                                            id="notes"
                                            rows={3}
                                            placeholder="Instruções especiais de entrega, ponto de referência..."
                                            value={data.notes}
                                            onChange={e => setData('notes', e.target.value)}
                                        />
                                    </div>

                                    <Button
                                        className="w-full"
                                        disabled={!canProceedToPayment || cepLoading}
                                        onClick={() => setStep('payment')}
                                    >
                                        {cepLoading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Buscando CEP...
                                            </>
                                        ) : (
                                            <>
                                                Continuar para Pagamento
                                                <ChevronRight className="h-4 w-4 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* STEP 2: Pagamento */}
                        {step === 'payment' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" /> Método de Pagamento
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-5">
                                    <RadioGroup
                                        value={paymentMethod}
                                        onValueChange={v => setPaymentMethod(v as any)}
                                        className="gap-3"
                                    >
                                        {[
                                            { value: 'credit_card', label: 'Cartão de Crédito', desc: 'Parcele em até 12x', icon: '💳' },
                                            { value: 'pix', label: 'PIX', desc: 'Aprovação imediata — 5% de desconto', icon: '⚡' },
                                            { value: 'boleto', label: 'Boleto Bancário', desc: 'Vencimento em 3 dias úteis', icon: '📄' },
                                        ].map(opt => (
                                            <div
                                                key={opt.value}
                                                className={cn(
                                                    'flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all',
                                                    paymentMethod === opt.value
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-border hover:border-primary/50'
                                                )}
                                            >
                                                <RadioGroupItem value={opt.value} id={opt.value} className="mt-1" />
                                                <label htmlFor={opt.value} className="cursor-pointer flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xl">{opt.icon}</span>
                                                        <span className="font-semibold">{opt.label}</span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-0.5">{opt.desc}</p>
                                                </label>
                                            </div>
                                        ))}
                                    </RadioGroup>

                                    {paymentMethod === 'credit_card' && (
                                        <div className="space-y-4 p-4 bg-muted/50 rounded-xl border">
                                            <p className="text-sm font-medium">Dados do Cartão</p>
                                            <div>
                                                <Label>Número do Cartão</Label>
                                                <Input
                                                    className="mt-1 font-mono"
                                                    placeholder="0000 0000 0000 0000"
                                                    value={cardNumber}
                                                    onChange={(e) =>
                                                        setCardNumber(formatCardNumber(e.target.value))
                                                    }
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <Label>Validade</Label>
                                                    <Input
                                                        className="mt-1"
                                                        placeholder="MM/AA"
                                                        value={cardExpiry}
                                                        onChange={(e) =>
                                                            setCardExpiry(formatExpiry(e.target.value))
                                                        }
                                                    />
                                                </div>
                                                <div>
                                                    <Label>CVV</Label>
                                                    <Input
                                                        className="mt-1 font-mono"
                                                        placeholder="123"
                                                        value={cardCvv}
                                                        onChange={(e) =>
                                                            setCardCvv(formatCVV(e.target.value))
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <Label>Nome no Cartão</Label>
                                                <Input className="mt-1 uppercase" placeholder="COMO ESTÁ NO CARTÃO" />
                                            </div>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Lock className="h-3 w-3" />
                                                Seus dados são protegidos por criptografia SSL
                                            </p>
                                        </div>
                                    )}

                                    {paymentMethod === 'pix' && (
                                        <div className="p-4 bg-green-50 dark:bg-green-950 rounded-xl border border-green-200 text-center space-y-2">
                                            <p className="text-2xl">📱</p>
                                            <p className="font-semibold text-green-700 dark:text-green-300">PIX — 5% de desconto!</p>
                                            <p className="text-sm text-muted-foreground">
                                                Após confirmar, você receberá o QR Code para pagamento.
                                            </p>
                                            <p className="text-lg font-bold text-green-700 dark:text-green-300">
                                                Total com desconto: {fmt(total * 0.95)}
                                            </p>
                                        </div>
                                    )}

                                    {paymentMethod === 'boleto' && (
                                        <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-xl border border-amber-200 space-y-2">
                                            <p className="font-semibold text-amber-700 dark:text-amber-300">ℹ️ Informações do Boleto</p>
                                            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                                                <li>O boleto será gerado após a confirmação</li>
                                                <li>Vencimento em 3 dias úteis</li>
                                                <li>Compensação em até 2 dias úteis após pagamento</li>
                                            </ul>
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

                        {/* STEP 3: Revisão */}
                        {step === 'review' && (
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center justify-between">
                                            Endereço de Entrega
                                            <Button variant="ghost" size="sm" onClick={() => setStep('address')}>Editar</Button>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm space-y-1">
                                        <p className="font-medium">{data.shipping_name}</p>
                                        <p className="text-muted-foreground">
                                            {data.shipping_street}, {data.shipping_number}
                                            {data.shipping_complement && `, ${data.shipping_complement}`}
                                        </p>
                                        <p className="text-muted-foreground">
                                            {data.shipping_neighborhood} — {data.shipping_city}/{data.shipping_state}
                                        </p>
                                        <p className="text-muted-foreground">CEP: {data.shipping_zipcode}</p>
                                        {data.shipping_phone && <p className="text-muted-foreground">Tel: {data.shipping_phone}</p>}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center justify-between">
                                            Forma de Pagamento
                                            <Button variant="ghost" size="sm" onClick={() => setStep('payment')}>Editar</Button>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-sm">
                                        <p className="font-medium">
                                            {paymentMethod === 'credit_card' ? '💳 Cartão de Crédito' :
                                             paymentMethod === 'pix' ? '⚡ PIX (5% desconto)' : '📄 Boleto Bancário'}
                                        </p>
                                    </CardContent>
                                </Card>

                                {data.notes && (
                                    <Card>
                                        <CardHeader><CardTitle className="text-base">Observações</CardTitle></CardHeader>
                                        <CardContent className="text-sm text-muted-foreground">{data.notes}</CardContent>
                                    </Card>
                                )}

                                {paymentError && (
                                    <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 rounded-lg text-red-600 text-sm">
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                        {paymentError}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={() => setStep('payment')} className="flex-1">
                                        ← Voltar
                                    </Button>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={isProcessing || processing}
                                        className="flex-1 gap-2"
                                        size="lg"
                                    >
                                        <Lock className="h-4 w-4" />
                                        {isProcessing ? 'Processando...' : `Pagar ${fmt(total)}`}
                                    </Button>
                                </div>

                                <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                                    <Lock className="h-3 w-3" />
                                    Compra 100% segura. Dados protegidos por SSL.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div>
                        <OrderSummary />
                    </div>
                </div>
            </div>
        </MainLayout>
        </>
    );
}