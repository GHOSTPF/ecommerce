<?php
namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\Product;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function store(Request $request, Product $product)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:100',
            'body' => 'nullable|string|max:1000',
        ]);

        $alreadyReviewed = Review::where('product_id', $product->id)
            ->where('user_id', auth()->id())
            ->exists();

        if ($alreadyReviewed) {
            return back()->withErrors(['review' => 'Você já avaliou este produto.']);
        }

        $hasPurchased = auth()->user()->orders()
            ->whereHas('items', fn($q) => $q->where('product_id', $product->id))
            ->where('payment_status', 'paid')
            ->exists();

        Review::create([
            'product_id' => $product->id,
            'user_id' => auth()->id(),
            'rating' => $request->rating,
            'title' => $request->title,
            'body' => $request->body,
            'is_verified_purchase' => $hasPurchased,
            'is_approved' => true, // auto-aprovar; ajuste se quiser moderação
        ]);

        return back()->with('success', 'Avaliação enviada!');
    }
}