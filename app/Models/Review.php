<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    protected $fillable = [
        'product_id', 'user_id', 'order_id', 'rating',
        'title', 'body', 'is_approved', 'is_verified_purchase',
    ];

    protected $casts = [
        'is_approved'         => 'boolean',
        'is_verified_purchase'=> 'boolean',
    ];

    public function user(): BelongsTo    { return $this->belongsTo(User::class); }
    public function product(): BelongsTo { return $this->belongsTo(Product::class); }
    public function order(): BelongsTo   { return $this->belongsTo(Order::class); }
}