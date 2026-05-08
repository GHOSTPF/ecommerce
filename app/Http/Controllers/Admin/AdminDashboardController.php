<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'total_revenue' => Order::where('payment_status', 'paid')->sum('total'),
            'total_orders' => Order::count(),
            'total_products' => Product::count(),
            'total_customers' => User::role('customer')->count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'low_stock' => Product::where('track_stock', true)
                ->whereColumn('stock_quantity', '<=', 'low_stock_threshold')
                ->count(),
        ];

        $revenueByMonth = Order::where('payment_status', 'paid')
            ->selectRaw("TO_CHAR(created_at, 'YYYY-MM') as month, SUM(total) as revenue, COUNT(*) as orders")
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $topProducts = Product::withCount('orderItems')
            ->withSum(['orderItems' => fn($q) => $q->whereHas('order', fn($oq) => $oq->where('payment_status', 'paid'))], 'subtotal')
            ->orderBy('order_items_count', 'desc')
            ->limit(5)
            ->get();

        $recentOrders = Order::with('user')
            ->latest()
            ->limit(10)
            ->get();

        return Inertia::render('Admin/Dashboard', compact(
            'stats', 'revenueByMonth', 'topProducts', 'recentOrders'
        ));
    }
}