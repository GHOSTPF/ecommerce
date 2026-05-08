<?php
namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'images', 'reviews'])
            ->active();

        // Filtros
        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'ilike', "%{$request->search}%")
                  ->orWhere('description', 'ilike', "%{$request->search}%")
                  ->orWhere('brand', 'ilike', "%{$request->search}%");
            });
        }

        if ($request->filled('category')) {
            $query->whereHas('category', fn($q) => $q->where('slug', $request->category));
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        if ($request->filled('brand')) {
            $query->where('brand', $request->brand);
        }

        if ($request->boolean('on_sale')) {
            $query->whereNotNull('sale_price');
        }

        if ($request->boolean('in_stock')) {
            $query->where(function ($q) {
                $q->where('track_stock', false)
                  ->orWhere('stock_quantity', '>', 0);
            });
        }

        // Ordenação
        match($request->get('sort', 'newest')) {
            'price_asc' => $query->orderBy('price', 'asc'),
            'price_desc' => $query->orderBy('price', 'desc'),
            'name_asc' => $query->orderBy('name', 'asc'),
            'rating' => $query->withAvg(['reviews' => fn($q) => $q->where('is_approved', true)], 'rating')
                              ->orderBy('reviews_avg_rating', 'desc'),
            'popular' => $query->withCount('orderItems')->orderBy('order_items_count', 'desc'),
            default => $query->orderBy('created_at', 'desc'),
        };

        $products = $query->paginate(12)->withQueryString();

        $categories = Category::active()->withCount('products')->get();
        $brands = Product::active()->whereNotNull('brand')->distinct()->pluck('brand');
        $priceRange = [
            'min' => Product::active()->min('price'),
            'max' => Product::active()->max('price'),
        ];

        return Inertia::render('Products/Index', compact(
            'products', 'categories', 'brands', 'priceRange'
        ));
    }

    public function show(string $slug)
    {
        $product = Product::with([
            'category', 'images',
            'reviews' => fn($q) => $q->where('is_approved', true)->with('user')->latest(),
        ])->where('slug', $slug)->active()->firstOrFail();

        $related = Product::with(['images', 'reviews'])
            ->active()
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->limit(4)
            ->get();

        $inWishlist = auth()->check()
            ? auth()->user()->wishlists()->where('product_id', $product->id)->exists()
            : false;

        return Inertia::render('Products/Show', compact('product', 'related', 'inWishlist'));
    }
}