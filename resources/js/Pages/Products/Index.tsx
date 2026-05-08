import { useState } from 'react';
import MainLayout from '@/Layouts/MainLayout';
import ProductCard from '@/Components/ProductCard';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Checkbox } from '@/Components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Slider } from '@/Components/ui/slider';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/Components/ui/sheet';
import { SlidersHorizontal, X } from 'lucide-react';
import { router } from '@inertiajs/react';

interface Props {
    products: { data: any[]; links: any[]; meta: any };
    categories: any[];
    brands: string[];
    priceRange: { min: number; max: number };
    cartCount?: number;
}

export default function ProductsIndex({ products, categories, brands, priceRange, cartCount = 0 }: Props) {
    const params = new URLSearchParams(window.location.search);
    const [search, setSearch] = useState(params.get('search') ?? '');
    const [selectedCategory, setSelectedCategory] = useState(params.get('category') ?? '');
    const [selectedBrand, setSelectedBrand] = useState(params.get('brand') ?? '');
    const [priceVal, setPriceVal] = useState([
        Number(params.get('min_price') ?? priceRange.min),
        Number(params.get('max_price') ?? priceRange.max),
    ]);
    const [onSale, setOnSale] = useState(params.get('on_sale') === 'true');
    const [inStock, setInStock] = useState(params.get('in_stock') === 'true');
    const [sort, setSort] = useState(params.get('sort') ?? 'newest');

    const applyFilters = () => {
        const filters: Record<string, any> = {};
        if (search) filters.search = search;
        if (selectedCategory) filters.category = selectedCategory;
        if (selectedBrand) filters.brand = selectedBrand;
        if (priceVal[0] > priceRange.min) filters.min_price = priceVal[0];
        if (priceVal[1] < priceRange.max) filters.max_price = priceVal[1];
        if (onSale) filters.on_sale = true;
        if (inStock) filters.in_stock = true;
        if (sort !== 'newest') filters.sort = sort;

        router.get('/produtos', filters, { preserveState: true });
    };

    const clearFilters = () => {
        setSearch(''); setSelectedCategory(''); setSelectedBrand('');
        setPriceVal([priceRange.min, priceRange.max]);
        setOnSale(false); setInStock(false); setSort('newest');
        router.get('/produtos');
    };

    const hasFilters = search || selectedCategory || selectedBrand || onSale || inStock || sort !== 'newest';

    const FilterPanel = () => (
        <div className="space-y-6">
            <div>
                <Label className="text-sm font-semibold mb-2 block">Categorias</Label>
                <div className="space-y-1.5">
                    <button
                        onClick={() => setSelectedCategory('')}
                        className={`w-full text-left text-sm px-2 py-1.5 rounded hover:bg-accent transition-colors ${!selectedCategory ? 'bg-primary/10 text-primary font-medium' : ''}`}
                    >
                        Todas as Categorias
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.slug)}
                            className={`w-full text-left text-sm px-2 py-1.5 rounded hover:bg-accent transition-colors flex justify-between ${selectedCategory === cat.slug ? 'bg-primary/10 text-primary font-medium' : ''}`}
                        >
                            <span>{cat.name}</span>
                            <span className="text-muted-foreground text-xs">{cat.products_count}</span>
                        </button>
                    ))}
                </div>
            </div>

            <Separator />

            <div>
                <Label className="text-sm font-semibold mb-3 block">
                    Preço: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(priceVal[0])}
                    {' - '}
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(priceVal[1])}
                </Label>
                <Slider
                    min={priceRange.min}
                    max={priceRange.max}
                    step={10}
                    value={priceVal}
                    onValueChange={(value) => {
                        setPriceVal(Array.isArray(value) ? [...value] : [value]);
                    }}
                    className="my-2"
                />
            </div>

            <Separator />

            <div className="space-y-2">
                <Label className="text-sm font-semibold block">Marca</Label>
                <Select value={selectedBrand} onValueChange={(value) => setSelectedBrand(value ?? '')}>
                    <SelectTrigger>
                        <SelectValue placeholder="Todas as marcas" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">Todas as marcas</SelectItem>
                        {brands.map(brand => (
                            <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Separator />

            <div className="space-y-3">
                <Label className="text-sm font-semibold block">Filtros</Label>
                <div className="flex items-center gap-2">
                    <Checkbox id="on_sale" checked={onSale} onCheckedChange={v => setOnSale(!!v)} />
                    <label htmlFor="on_sale" className="text-sm cursor-pointer">Em Promoção</label>
                </div>
                <div className="flex items-center gap-2">
                    <Checkbox id="in_stock" checked={inStock} onCheckedChange={v => setInStock(!!v)} />
                    <label htmlFor="in_stock" className="text-sm cursor-pointer">Em Estoque</label>
                </div>
            </div>

            <Button onClick={applyFilters} className="w-full">Aplicar Filtros</Button>
            {hasFilters && (
                <Button variant="outline" onClick={clearFilters} className="w-full">
                    <X className="h-4 w-4 mr-2" /> Limpar Filtros
                </Button>
            )}
        </div>
    );

    return (
        <MainLayout cartCount={cartCount}>
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                    <div>
                        <h1 className="text-2xl font-bold">Produtos</h1>
                        <p className="text-muted-foreground text-sm">{products.meta?.total ?? 0} produtos encontrados</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {hasFilters && (
                            <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={clearFilters}>
                                Limpar filtros <X className="h-3 w-3" />
                            </Badge>
                        )}
                        <Select
                            value={sort}
                            onValueChange={(v) => {
                                const value = v ?? '';
                                setSort(value);
                                router.get('/produtos', {
                                    ...Object.fromEntries(params),
                                    sort: value
                                });
                            }}
                        >
                            <SelectTrigger className="w-44">
                                <SelectValue placeholder="Ordenar por" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Mais Recentes</SelectItem>
                                <SelectItem value="price_asc">Menor Preço</SelectItem>
                                <SelectItem value="price_desc">Maior Preço</SelectItem>
                                <SelectItem value="name_asc">A-Z</SelectItem>
                                <SelectItem value="rating">Mais Avaliados</SelectItem>
                                <SelectItem value="popular">Mais Vendidos</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Mobile filter trigger */}
                        <Sheet>
                            <SheetTrigger>
                                <Button variant="outline" size="sm" className="md:hidden">
                                    <SlidersHorizontal className="h-4 w-4 mr-2" /> Filtros
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left">
                                <SheetHeader>
                                    <SheetTitle>Filtros</SheetTitle>
                                </SheetHeader>
                                <div className="mt-6">
                                    <FilterPanel />
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                <div className="flex gap-8">
                    {/* Sidebar - desktop */}
                    <aside className="hidden md:block w-64 shrink-0">
                        <div className="sticky top-24">
                            <FilterPanel />
                        </div>
                    </aside>

                    {/* Products Grid */}
                    <div className="flex-1">
                        {products.data.length > 0 ? (
                            <>
                                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {products.data.map(product => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {products.meta?.last_page > 1 && (
                                    <div className="flex justify-center gap-2 mt-8 flex-wrap">
                                        {products.links.map((link: any, i: number) => (
                                            <Button
                                                key={i}
                                                variant={link.active ? 'default' : 'outline'}
                                                size="sm"
                                                disabled={!link.url}
                                                onClick={() => link.url && router.get(link.url)}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-20">
                                <p className="text-4xl mb-4">🔍</p>
                                <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
                                <p className="text-muted-foreground mb-6">Tente ajustar os filtros ou buscar por outro termo.</p>
                                <Button onClick={clearFilters}>Limpar Filtros</Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}