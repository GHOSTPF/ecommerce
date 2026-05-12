<?php
namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Order;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    public function index()
    {
        $cart = Cart::with('items.product.images')
            ->where('user_id', auth()->id())
            ->first();

        if (!$cart || $cart->items->isEmpty()) {
            return redirect()->route('cart.index')->with('error', 'Seu carrinho está vazio.');
        }

        $user      = auth()->user();
        $addresses = $user->addresses()->orderBy('is_default', 'desc')->get();
        $default   = $addresses->firstWhere('is_default', true);

        return Inertia::render('Checkout/Index', [
            'cart'           => $cart,
            'addresses'      => $addresses,
            'defaultAddress' => $default,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'payment_method'         => 'required|in:credit_card,pix',
            'installments'           => 'required_if:payment_method,credit_card|integer|min:1|max:12',
            'shipping_name'          => 'required|string',
            'shipping_phone'         => 'nullable|string',
            'shipping_zipcode'       => 'required|string',
            'shipping_street'        => 'required|string',
            'shipping_number'        => 'required|string',
            'shipping_complement'    => 'nullable|string',
            'shipping_neighborhood'  => 'required|string',
            'shipping_city'          => 'required|string',
            'shipping_state'         => 'required|string|size:2',
            'notes'                  => 'nullable|string|max:500',
            'save_address'           => 'boolean',
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
                return back()->withErrors(['stock' => "Estoque insuficiente: {$item->product->name}"]);
            }
        }

        $subtotal = (float) $cart->subtotal;
        $shipping = 15.00;
        $total    = $subtotal + $shipping - (float) $cart->discount_amount;

        // Status inicial: PIX fica pendente, cartão fica aguardando confirmação admin
        $paymentStatus = 'pending';
        $orderStatus   = 'pending';

        // Gerar PIX fake (em produção integrar com gateway real)
        $pixData = [];
        if ($request->payment_method === 'pix') {
            $pixKey = 'pix@minhaloja.com.br';
            // QR Code usando API gratuita do QR Server
            $pixPayload = $this->generatePixPayload($pixKey, $total, Order::generateOrderNumber());
            $pixData = [
                'pix_key'             => $pixKey,
                'pix_qr_code'         => $pixPayload,
                'pix_qr_code_base64'  => 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' . urlencode($pixPayload),
                'pix_expires_at'      => now()->addHours(24),
            ];
        }

        $order = Order::create(array_merge([
            'order_number'          => Order::generateOrderNumber(),
            'user_id'               => auth()->id(),
            'status'                => $orderStatus,
            'payment_status'        => $paymentStatus,
            'payment_method'        => $request->payment_method,
            'installments'          => $request->payment_method === 'credit_card' ? $request->installments : 1,
            'payment_id'            => null,
            'subtotal'              => $subtotal,
            'tax'                   => 0,
            'shipping'              => $shipping,
            'discount'              => (float) $cart->discount_amount,
            'total'                 => $total,
            'coupon_code'           => $cart->coupon_code,
            'shipping_name'         => $request->shipping_name,
            'shipping_phone'        => $request->shipping_phone,
            'shipping_zipcode'      => $request->shipping_zipcode,
            'shipping_street'       => $request->shipping_street,
            'shipping_number'       => $request->shipping_number,
            'shipping_complement'   => $request->shipping_complement,
            'shipping_neighborhood' => $request->shipping_neighborhood,
            'shipping_city'         => $request->shipping_city,
            'shipping_state'        => $request->shipping_state,
            'notes'                 => $request->notes,
        ], $pixData));

        // Criar itens
        foreach ($cart->items as $item) {
            $order->items()->create([
                'product_id'   => $item->product_id,
                'product_name' => $item->product->name,
                'product_sku'  => $item->product->sku,
                'price'        => $item->price,
                'quantity'     => $item->quantity,
                'subtotal'     => $item->price * $item->quantity,
            ]);
            if ($item->product->track_stock) {
                $item->product->decrement('stock_quantity', $item->quantity);
            }
        }

        // Salvar endereço se solicitado
        if ($request->save_address) {
            $hasDefault = auth()->user()->addresses()->where('is_default', true)->exists();
            \App\Models\Address::create([
                'user_id'      => auth()->id(),
                'type'         => 'shipping',
                'name'         => $request->shipping_name,
                'phone'        => $request->shipping_phone,
                'zipcode'      => $request->shipping_zipcode,
                'street'       => $request->shipping_street,
                'number'       => $request->shipping_number,
                'complement'   => $request->shipping_complement,
                'neighborhood' => $request->shipping_neighborhood,
                'city'         => $request->shipping_city,
                'state'        => $request->shipping_state,
                'is_default'   => !$hasDefault,
            ]);
        }

        // Atualizar cupom
        if ($cart->coupon_code) {
            Coupon::where('code', $cart->coupon_code)->increment('used_count');
        }

        // Limpar carrinho
        $cart->items()->delete();
        $cart->update(['coupon_code' => null, 'discount_amount' => 0]);

        return redirect()->route('orders.show', $order)
            ->with('success', $request->payment_method === 'pix'
                ? 'Pedido criado! Realize o pagamento via PIX para confirmar.'
                : 'Pedido realizado! Aguardando confirmação do pagamento.');
    }

    // Gera payload PIX padrão BR Code (simplificado)
    private function generatePixPayload(string $key, float $amount, string $txid): string
    {
        $name   = 'MINHA LOJA';
        $city   = 'SAO PAULO';
        $amount = number_format($amount, 2, '.', '');

        $payload  = '000201';                          // Payload Format Indicator
        $payload .= '010212';                          // Point of Initiation Method (dinâmico)
        $payload .= '26' . str_pad(strlen('0014BR.GOV.BCB.PIX0' . strlen($key) . $key), 2, '0', STR_PAD_LEFT)
                  . '0014BR.GOV.BCB.PIX01' . strlen($key) . $key;
        $payload .= '52040000';                        // Merchant Category Code
        $payload .= '5303986';                         // Transaction Currency (BRL)
        $payload .= '54' . str_pad(strlen($amount), 2, '0', STR_PAD_LEFT) . $amount;
        $payload .= '5802BR';
        $payload .= '59' . str_pad(strlen($name), 2, '0', STR_PAD_LEFT) . $name;
        $payload .= '60' . str_pad(strlen($city), 2, '0', STR_PAD_LEFT) . $city;
        $payload .= '6207' . '0503' . substr($txid, 0, 25);
        $payload .= '6304';

        // CRC16 CCITT
        $payload .= $this->crc16($payload);

        return $payload;
    }

    private function crc16(string $payload): string
    {
        $crc = 0xFFFF;
        for ($i = 0; $i < strlen($payload); $i++) {
            $crc ^= ord($payload[$i]) << 8;
            for ($j = 0; $j < 8; $j++) {
                if ($crc & 0x8000) {
                    $crc = ($crc << 1) ^ 0x1021;
                } else {
                    $crc <<= 1;
                }
                $crc &= 0xFFFF;
            }
        }
        return strtoupper(str_pad(dechex($crc), 4, '0', STR_PAD_LEFT));
    }

    private function calculateShipping(string $zipcode): float
    {
        return 15.00;
    }
}