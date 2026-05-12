<?php
namespace App\Http\Controllers;

use App\Models\Order;
use Inertia\Inertia;

class OrderController extends Controller
{

    public function index()
    {
        $orders = Order::with('items.product.images')
            ->where('user_id', auth()->id())
            ->latest()
            ->paginate(10);

        return Inertia::render('Orders/Index', compact('orders'));
    }

    public function show(Order $order)
    {
        abort_if($order->user_id !== auth()->id(), 403);

        $order->load('items.product.images');

        return Inertia::render('Orders/Show', compact('order'));
    }

    public function markDelivered(Order $order)
    {
        abort_if($order->user_id !== auth()->id(), 403);

        if ($order->status === 'delivered') {
            return back()->with('success', 'Pedido já está marcado como entregue.');
        }

        abort_if($order->status !== 'shipped', 403, 'Só é possível marcar como entregue após o pedido ser enviado.');

        $order->update([
            'status' => 'delivered',
            'delivered_at' => now(),
        ]);

        return back()->with('success', 'Pedido marcado como entregue. Obrigado!');
    }
}