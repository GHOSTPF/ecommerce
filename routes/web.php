<?php
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\WishlistController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminProductController;
use App\Http\Controllers\Admin\AdminOrderController;
use App\Http\Controllers\Admin\AdminCategoryController;
use App\Http\Controllers\Admin\AdminUserController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

// Home
Route::get('/', function () {
    $featured = \App\Models\Product::with(['images', 'category'])
        ->active()->featured()->limit(8)->get();
    $categories = \App\Models\Category::active()
        ->withCount('products')->limit(6)->get();
    $newArrivals = \App\Models\Product::with(['images'])
        ->active()->latest()->limit(8)->get();
    return Inertia::render('Home', compact('featured', 'categories', 'newArrivals'));
})->name('home');

// Produtos
Route::get('/produtos', [ProductController::class, 'index'])->name('products.index');
Route::get('/produtos/{slug}', [ProductController::class, 'show'])->name('products.show');

// Reviews
Route::post('/produtos/{product}/reviews', [ReviewController::class, 'store'])->name('reviews.store');

// Carrinho
Route::get('/carrinho', [CartController::class, 'index'])->name('cart.index');
Route::post('/carrinho/adicionar', [CartController::class, 'add'])->name('cart.add');
Route::patch('/carrinho/{item}', [CartController::class, 'update'])->name('cart.update');
Route::delete('/carrinho/{item}', [CartController::class, 'remove'])->name('cart.remove');
Route::post('/carrinho/cupom', [CartController::class, 'applyCoupon'])->name('cart.coupon.apply');
Route::delete('/carrinho/cupom', [CartController::class, 'removeCoupon'])->name('cart.coupon.remove');

// Checkout (requer auth)
Route::middleware('auth')->group(function () {
    Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout.index');
    Route::post('/checkout/payment-intent', [CheckoutController::class, 'createPaymentIntent'])->name('checkout.payment-intent');
    Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');
});

// Pedidos (requer auth)
Route::middleware('auth')->group(function () {
    Route::get('/meus-pedidos', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/meus-pedidos/{order}', [OrderController::class, 'show'])->name('orders.show');
});

// Lista de Desejos (requer auth)
Route::middleware('auth')->group(function () {
    Route::get('/lista-de-desejos', [WishlistController::class, 'index'])->name('wishlist.index');
    Route::post('/lista-de-desejos', [WishlistController::class, 'toggle'])->name('wishlist.toggle');
});

// Perfil do usuário (gerado pelo Breeze)
// Já incluído pelo: require __DIR__.'/auth.php';

// Admin
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [AdminDashboardController::class, 'index'])->name('dashboard');

    Route::resource('products', AdminProductController::class);
    Route::resource('orders', AdminOrderController::class)->only(['index', 'show']);
    Route::patch('orders/{order}/status', [AdminOrderController::class, 'updateStatus'])->name('orders.status');
    Route::resource('categories', AdminCategoryController::class);
    Route::resource('users', AdminUserController::class)->only(['index', 'show', 'destroy']);
});

require __DIR__.'/auth.php';