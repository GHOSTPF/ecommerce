<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coupon extends Model
{
    protected $fillable = [
        'code', 'type', 'value', 'minimum_amount',
        'maximum_discount', 'usage_limit', 'used_count',
        'is_active', 'starts_at', 'expires_at',
    ];

    protected $casts = [
        'value'           => 'decimal:2',
        'minimum_amount'  => 'decimal:2',
        'maximum_discount'=> 'decimal:2',
        'is_active'       => 'boolean',
        'starts_at'       => 'datetime',
        'expires_at'      => 'datetime',
    ];
}