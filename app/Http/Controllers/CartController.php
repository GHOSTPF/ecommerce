<?php
namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CartController extends Controller
{
    private function getCart(): Cart
    {
        if (auth()->check()) {
            $cart = Cart::firstOrCreate(['user_id' => auth()->id()]);
        } else {
            $sessionId = session()->getId();
            $cart = Cart::firstOrCreate(['session_id' => $sessionId]);
        }
        $cart->load('items.product.images');
        return $cart->load('items.product.images');
    }

    public function index()
    {
        $cart = $this->getCart();
        // Garante que items e product estão carregados antes dos accessors calcularem
        $cart->load('items.product.images');
        return Inertia::render('Cart/Index', ['cart' => $cart]);
    }

    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1|max:99',
        ]);

        $product = Product::findOrFail($request->product_id);

        if ($product->track_stock && $product->stock_quantity < $request->quantity) {
            return back()->withErrors(['stock' => 'Quantidade insuficiente em estoque.']);
        }

        $cart = $this->getCart();
        $item = $cart->items()->where('product_id', $product->id)->first();

        if ($item) {
            $newQty = $item->quantity + $request->quantity;
            if ($product->track_stock && $product->stock_quantity < $newQty) {
                return back()->withErrors(['stock' => 'Quantidade insuficiente em estoque.']);
            }
            $item->update(['quantity' => $newQty]);
        } else {
            $cart->items()->create([
                'product_id' => $product->id,
                'quantity' => $request->quantity,
                'price' => $product->current_price,
            ]);
        }

        return back()->with('success', 'Produto adicionado ao carrinho!');
    }

    public function update(Request $request, CartItem $item)
    {
        $request->validate(['quantity' => 'required|integer|min:1|max:99']);

        $this->authorizeCartItem($item);

        if ($item->product->track_stock && $item->product->stock_quantity < $request->quantity) {
            return back()->withErrors(['stock' => 'Quantidade insuficiente em estoque.']);
        }

        $item->update(['quantity' => $request->quantity]);
        return back()->with('success', 'Carrinho atualizado!');
    }

    public function remove(CartItem $item)
    {
        $this->authorizeCartItem($item);
        $item->delete();
        return back()->with('success', 'Item removido do carrinho.');
    }

    public function applyCoupon(Request $request)
    {
        $request->validate(['coupon_code' => 'required|string']);

        $coupon = Coupon::where('code', strtoupper($request->coupon_code))
            ->where('is_active', true)
            ->where(fn($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->where(fn($q) => $q->whereNull('starts_at')->orWhere('starts_at', '<=', now()))
            ->first();

        if (!$coupon) {
            return back()->withErrors(['coupon_code' => 'Cupom inválido ou expirado.']);
        }

        if ($coupon->usage_limit && $coupon->used_count >= $coupon->usage_limit) {
            return back()->withErrors(['coupon_code' => 'Cupom esgotado.']);
        }

        $cart = $this->getCart();

        if ($coupon->minimum_amount && $cart->subtotal < $coupon->minimum_amount) {
            return back()->withErrors([
                'coupon_code' => "Pedido mínimo de R$ {$coupon->minimum_amount} para usar este cupom.",
            ]);
        }

        $discount = $coupon->type === 'percentage'
            ? $cart->subtotal * ($coupon->value / 100)
            : $coupon->value;

        if ($coupon->maximum_discount) {
            $discount = min($discount, $coupon->maximum_discount);
        }

        $cart->update(['coupon_code' => $coupon->code, 'discount_amount' => $discount]);

        return back()->with('success', "Cupom aplicado! Desconto de R$ " . number_format($discount, 2, ',', '.'));
    }

    public function removeCoupon()
    {
        $cart = $this->getCart();
        $cart->update(['coupon_code' => null, 'discount_amount' => 0]);
        return back()->with('success', 'Cupom removido.');
    }

    private function authorizeCartItem(CartItem $item): void
    {
        $cart = $this->getCart();
        abort_if($item->cart_id !== $cart->id, 403);
    }
}