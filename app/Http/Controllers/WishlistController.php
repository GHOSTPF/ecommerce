<?php
namespace App\Http\Controllers;

use App\Models\Wishlist;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WishlistController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index()
    {
        $wishlists = Wishlist::with('product.images', 'product.category')
            ->where('user_id', auth()->id())
            ->get();

        return Inertia::render('Wishlist/Index', compact('wishlists'));
    }

    public function toggle(Request $request)
    {
        $request->validate(['product_id' => 'required|exists:products,id']);

        $wishlist = Wishlist::where('user_id', auth()->id())
            ->where('product_id', $request->product_id)
            ->first();

        if ($wishlist) {
            $wishlist->delete();
            return back()->with('success', 'Removido da lista de desejos.');
        }

        Wishlist::create(['user_id' => auth()->id(), 'product_id' => $request->product_id]);
        return back()->with('success', 'Adicionado à lista de desejos!');
    }
}