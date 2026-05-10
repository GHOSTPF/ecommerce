import AdminLayout from '@/Layouts/AdminLayout';
import { useForm, Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Switch } from '@/Components/ui/switch';
import { Separator } from '@/Components/ui/separator';
import { ChevronLeft, Upload, X, ImagePlus } from 'lucide-react';
import { useState, useRef } from 'react';
import { Badge } from '@/Components/ui/badge';

interface Category { id: number; name: string; }
interface ProductImage { id: number; image_path: string; is_primary: boolean; }
interface Product {
    id?: number; name: string; description?: string; short_description?: string;
    price: number; sale_price?: number; cost_price?: number; stock_quantity: number;
    sku?: string; brand?: string; category_id?: number; is_active: boolean;
    is_featured: boolean; track_stock: boolean; low_stock_threshold: number;
    images?: ProductImage[];
}

interface Props {
    categories: Category[];
    product?: Product;
}

export default function AdminProductForm({ categories, product }: Props) {
    const isEdit = !!product?.id;
    const [previewImages, setPreviewImages] = useState<string[]>([]);
    const fileRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, put, processing, errors } = useForm({
        name: product?.name ?? '',
        description: product?.description ?? '',
        short_description: product?.short_description ?? '',
        price: product?.price ?? '',
        sale_price: product?.sale_price ?? '',
        cost_price: product?.cost_price ?? '',
        stock_quantity: product?.stock_quantity ?? 0,
        sku: product?.sku ?? '',
        brand: product?.brand ?? '',
        category_id: product?.category_id ? String(product.category_id) : '',
        is_active: product?.is_active ?? true,
        is_featured: product?.is_featured ?? false,
        track_stock: product?.track_stock ?? true,
        low_stock_threshold: product?.low_stock_threshold ?? 5,
        images: [] as File[],
        _method: isEdit ? 'PUT' : 'POST',
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        setData('images', files);
        const urls = files.map(f => URL.createObjectURL(f));
        setPreviewImages(urls);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = isEdit ? `/admin/products/${product!.id}` : '/admin/products';
        post(url, { forceFormData: true });
    };

    const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
        <div className="space-y-1.5">
            <Label>{label}</Label>
            {children}
            {error && <p className="text-destructive text-xs">{error}</p>}
        </div>
    );

    return (
        <AdminLayout title={isEdit ? 'Editar Produto' : 'Novo Produto'}>
            <div className="flex items-center gap-3 mb-6">
                <Button variant="ghost" size="sm" >
                    <Link href="/admin/products" className='flex flex-items'>
                        <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
                    </Link>
                </Button>
            </div>

            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader><CardTitle>Informações Básicas</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <Field label="Nome do Produto *" error={errors.name}>
                                    <Input
                                        placeholder="Ex: Camiseta Premium Preta"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                    />
                                </Field>

                                <Field label="Descrição Curta" error={errors.short_description}>
                                    <Textarea
                                        rows={2}
                                        placeholder="Uma frase que resume o produto (aparece na listagem)"
                                        value={data.short_description}
                                        onChange={e => setData('short_description', e.target.value)}
                                    />
                                </Field>

                                <Field label="Descrição Completa" error={errors.description}>
                                    <Textarea
                                        rows={8}
                                        placeholder="Descrição detalhada do produto, especificações, materiais..."
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                    />
                                </Field>

                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Marca" error={errors.brand}>
                                        <Input
                                            placeholder="Ex: Nike, Apple..."
                                            value={data.brand}
                                            onChange={e => setData('brand', e.target.value)}
                                        />
                                    </Field>
                                    <Field label="SKU" error={errors.sku}>
                                        <Input
                                            placeholder="Código único do produto"
                                            value={data.sku}
                                            onChange={e => setData('sku', e.target.value)}
                                        />
                                    </Field>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>Preços</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-3 gap-4">
                                    <Field label="Preço de Venda *" error={errors.price}>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                                            <Input
                                                type="number" step="0.01" min="0"
                                                className="pl-9"
                                                placeholder="0,00"
                                                value={data.price}
                                                onChange={e => setData('price', e.target.value)}
                                            />
                                        </div>
                                    </Field>
                                    <Field label="Preço Promocional" error={errors.sale_price}>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                                            <Input
                                                type="number" step="0.01" min="0"
                                                className="pl-9"
                                                placeholder="0,00"
                                                value={data.sale_price}
                                                onChange={e => setData('sale_price', e.target.value)}
                                            />
                                        </div>
                                    </Field>
                                    <Field label="Preço de Custo" error={errors.cost_price}>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">R$</span>
                                            <Input
                                                type="number" step="0.01" min="0"
                                                className="pl-9"
                                                placeholder="0,00"
                                                value={data.cost_price}
                                                onChange={e => setData('cost_price', e.target.value)}
                                            />
                                        </div>
                                    </Field>
                                </div>
                                {data.price && data.sale_price && Number(data.sale_price) < Number(data.price) && (
                                    <p className="text-sm text-green-600">
                                        ✓ Desconto de {Math.round(((Number(data.price) - Number(data.sale_price)) / Number(data.price)) * 100)}% aplicado
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>Estoque</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                    <div>
                                        <p className="font-medium text-sm">Controlar Estoque</p>
                                        <p className="text-xs text-muted-foreground">Desative para produto sem limite de estoque</p>
                                    </div>
                                    <Switch
                                        checked={data.track_stock}
                                        onCheckedChange={v => setData('track_stock', v)}
                                    />
                                </div>

                                {data.track_stock && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field label="Quantidade em Estoque *" error={errors.stock_quantity}>
                                            <Input
                                                type="number" min="0"
                                                value={data.stock_quantity}
                                                onChange={e => setData('stock_quantity', Number(e.target.value))}
                                            />
                                        </Field>
                                        <Field label="Alerta de Estoque Baixo">
                                            <Input
                                                type="number" min="0"
                                                value={data.low_stock_threshold}
                                                onChange={e => setData('low_stock_threshold', Number(e.target.value))}
                                            />
                                        </Field>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Imagens */}
                        <Card>
                            <CardHeader><CardTitle>Imagens do Produto</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                {/* Imagens existentes */}
                                {product?.images && product.images.length > 0 && (
                                    <div>
                                        <Label className="text-sm text-muted-foreground mb-2 block">Imagens atuais</Label>
                                        <div className="flex gap-3 flex-wrap">
                                            {product.images.map(img => (
                                                <div key={img.id} className="relative group">
                                                    <img
                                                        src={img.image_path}
                                                        alt=""
                                                        className="w-20 h-20 object-cover rounded-lg border"
                                                    />
                                                    {img.is_primary && (
                                                        <Badge className="absolute -top-1 -right-1 text-xs px-1 py-0 h-4">
                                                            Principal
                                                        </Badge>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Upload novas imagens */}
                                <div>
                                    <input
                                        ref={fileRef}
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileRef.current?.click()}
                                        className="w-full border-2 border-dashed rounded-xl p-8 text-center hover:border-primary hover:bg-primary/5 transition-all cursor-pointer"
                                    >
                                        <ImagePlus className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                        <p className="text-sm font-medium">Clique para selecionar imagens</p>
                                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP até 2MB cada</p>
                                    </button>

                                    {previewImages.length > 0 && (
                                        <div className="flex gap-3 flex-wrap mt-3">
                                            {previewImages.map((url, i) => (
                                                <div key={i} className="relative">
                                                    <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border" />
                                                    {i === 0 && (
                                                        <Badge className="absolute -top-1 -right-1 text-xs px-1 py-0 h-4">
                                                            Principal
                                                        </Badge>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader><CardTitle>Configurações</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <Field label="Categoria *" error={errors.category_id}>
                                    <Select
                                        value={data.category_id}
                                        onValueChange={(v) => setData('category_id', v || '')}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map(cat => (
                                                <SelectItem key={cat.id} value={String(cat.id)}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>

                                <Separator />

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium">Produto Ativo</p>
                                            <p className="text-xs text-muted-foreground">Visível na loja</p>
                                        </div>
                                        <Switch
                                            checked={data.is_active}
                                            onCheckedChange={v => setData('is_active', v)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium">Em Destaque</p>
                                            <p className="text-xs text-muted-foreground">Aparece na home</p>
                                        </div>
                                        <Switch
                                            checked={data.is_featured}
                                            onCheckedChange={v => setData('is_featured', v)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex flex-col gap-3">
                            <Button type="submit" size="lg" disabled={processing} className="w-full">
                                {processing ? 'Salvando...' : isEdit ? '💾 Salvar Alterações' : '✨ Criar Produto'}
                            </Button>
                            <Button variant="outline"  className="w-full">
                                <Link href="/admin/products">Cancelar</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}