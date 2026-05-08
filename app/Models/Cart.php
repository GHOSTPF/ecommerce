<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cart extends Model
{
    protected $fillable = ['user_id', 'session_id', 'coupon_code', 'discount_amount'];
    protected $casts = ['discount_amount' => 'decimal:2'];

    public function items(): HasMany { return $this->hasMany(CartItem::class); }

    public function getSubtotalAttribute(): float
    {
        return $this->items->sum(fn($item) => $item->price * $item->quantity);
    }

    public function getTotalAttribute(): float
    {
        return max(0, $this->subtotal - $this->discount_amount);
    }

    public function getItemCountAttribute(): int
    {
        return $this->items->sum('quantity');
    }
}