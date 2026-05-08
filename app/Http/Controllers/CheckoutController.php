<?php
namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Stripe\Stripe;
use Stripe\PaymentIntent;

class CheckoutController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index()
    {
        $cart = Cart::with('items.product.images')
            ->where('user_id', auth()->id())
            ->firstOrFail();

        if ($cart->items->isEmpty()) {
            return redirect()->route('cart.index')->with('error', 'Seu carrinho está vazio.');
        }

        $addresses = auth()->user()->addresses()->get();

        return Inertia::render('Checkout/Index', compact('cart', 'addresses'));
    }

    public function createPaymentIntent(Request $request)
    {
        $cart = Cart::with('items.product')
            ->where('user_id', auth()->id())
            ->firstOrFail();

        Stripe::setApiKey(config('services.stripe.secret'));

        $amount = (int) ($cart->total * 100); // centavos

        $paymentIntent = PaymentIntent::create([
            'amount' => $amount,
            'currency' => 'brl',
            'metadata' => ['user_id' => auth()->id()],
        ]);

        return response()->json(['clientSecret' => $paymentIntent->client_secret]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'payment_method' => 'required|string',
            'payment_id' => 'required|string',
            'shipping_name' => 'required|string',
            'shipping_phone' => 'nullable|string',
            'shipping_zipcode' => 'required|string',
            'shipping_street' => 'required|string',
            'shipping_number' => 'required|string',
            'shipping_complement' => 'nullable|string',
            'shipping_neighborhood' => 'required|string',
            'shipping_city' => 'required|string',
            'shipping_state' => 'required|string|size:2',
            'notes' => 'nullable|string|max:500',
        ]);

        $cart = Cart::with('items.product')
            ->where('user_id', auth()->id())
            ->firstOrFail();

        if ($cart->items->isEmpty()) {
            return back()->withErrors(['cart' => 'Carrinho vazio.']);
        }

        // Verificar estoque
        foreach ($cart->items as $item) {
            if ($item->product->track_stock && $item->product->stock_quantity < $item->quantity) {
                return back()->withErrors([
                    'stock' => "Estoque insuficiente para: {$item->product->name}",
                ]);
            }
        }

        $subtotal = $cart->subtotal;
        $shipping = $this->calculateShipping($request->shipping_zipcode);
        $tax = round($subtotal * 0.0, 2); // sem imposto por padrão
        $total = $subtotal + $shipping + $tax - $cart->discount_amount;

        $order = Order::create([
            'order_number' => Order::generateOrderNumber(),
            'user_id' => auth()->id(),
            'status' => 'confirmed',
            'payment_status' => 'paid',
            'payment_method' => $request->payment_method,
            'payment_id' => $request->payment_id,
            'subtotal' => $subtotal,
            'tax' => $tax,
            'shipping' => $shipping,
            'discount' => $cart->discount_amount,
            'total' => $total,
            'coupon_code' => $cart->coupon_code,
            'shipping_name' => $request->shipping_name,
            'shipping_phone' => $request->shipping_phone,
            'shipping_zipcode' => $request->shipping_zipcode,
            'shipping_street' => $request->shipping_street,
            'shipping_number' => $request->shipping_number,
            'shipping_complement' => $request->shipping_complement,
            'shipping_neighborhood' => $request->shipping_neighborhood,
            'shipping_city' => $request->shipping_city,
            'shipping_state' => $request->shipping_state,
            'notes' => $request->notes,
            'paid_at' => now(),
        ]);

        // Criar itens do pedido e atualizar estoque
        foreach ($cart->items as $item) {
            $order->items()->create([
                'product_id' => $item->product_id,
                'product_name' => $item->product->name,
                'product_sku' => $item->product->sku,
                'price' => $item->price,
                'quantity' => $item->quantity,
                'subtotal' => $item->price * $item->quantity,
            ]);

            if ($item->product->track_stock) {
                $item->product->decrement('stock_quantity', $item->quantity);
            }
        }

        // Atualizar uso do cupom
        if ($cart->coupon_code) {
            \App\Models\Coupon::where('code', $cart->coupon_code)->increment('used_count');
        }

        // Limpar carrinho
        $cart->items()->delete();
        $cart->update(['coupon_code' => null, 'discount_amount' => 0]);

        return redirect()->route('orders.show', $order)->with('success', 'Pedido realizado com sucesso!');
    }

    private function calculateShipping(string $zipcode): float
    {
        // Aqui você pode integrar com Correios ou outro serviço
        return 15.00; // Frete fixo para demonstração
    }
}