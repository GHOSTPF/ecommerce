<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with('user')->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('order_number', 'ilike', "%{$request->search}%")
                  ->orWhereHas('user', fn($uq) => $uq->where('name', 'ilike', "%{$request->search}%")
                      ->orWhere('email', 'ilike', "%{$request->search}%"));
            });
        }

        $orders = $query->paginate(20)->withQueryString();

        return Inertia::render('Admin/Orders/Index', compact('orders'));
    }

    public function show(Order $order)
    {
        $order->load('items.product.images', 'user');
        return Inertia::render('Admin/Orders/Show', compact('order'));
    }

    public function updateStatus(Request $request, Order $order)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,processing,shipped,delivered,cancelled,refunded',
            'tracking_code' => 'nullable|string',
            'shipping_carrier' => 'nullable|string',
            'admin_notes' => 'nullable|string',
        ]);

        $data = ['status' => $request->status];

        if ($request->tracking_code) {
            $data['tracking_code'] = $request->tracking_code;
        }
        if ($request->shipping_carrier) {
            $data['shipping_carrier'] = $request->shipping_carrier;
        }
        if ($request->admin_notes) {
            $data['admin_notes'] = $request->admin_notes;
        }

        match($request->status) {
            'shipped' => $data['shipped_at'] = now(),
            'delivered' => $data['delivered_at'] = now(),
            'cancelled' => $data['cancelled_at'] = now(),
            default => null,
        };

        $order->update($data);

        return back()->with('success', 'Status do pedido atualizado!');
    }
}