<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = [
        'product_id', 'user_id', 'order_id', 'rating',
        'title', 'body', 'is_approved', 'is_verified_purchase',
    ];
    protected $casts = [
        'is_approved' => 'boolean',
        'is_verified_purchase' => 'boolean',
    ];

    public function user() { return $this->belongsTo(User::class); }
    public function product() { return $this->belongsTo(Product::class); }
}