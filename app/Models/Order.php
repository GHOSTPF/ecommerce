<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'order_number', 'user_id', 'status', 'payment_status', 'payment_method',
        'installments', 'payment_id', 'pix_key', 'pix_qr_code', 'pix_qr_code_base64',
        'pix_expires_at', 'subtotal', 'tax', 'shipping', 'discount', 'total', 'currency',
        'coupon_code', 'shipping_name', 'shipping_phone', 'shipping_zipcode',
        'shipping_street', 'shipping_number', 'shipping_complement',
        'shipping_neighborhood', 'shipping_city', 'shipping_state', 'shipping_country',
        'tracking_code', 'shipping_carrier', 'notes', 'admin_notes',
        'paid_at', 'shipped_at', 'delivered_at', 'cancelled_at',
    ];

    protected $casts = [
        'subtotal'      => 'decimal:2',
        'tax'           => 'decimal:2',
        'shipping'      => 'decimal:2',
        'discount'      => 'decimal:2',
        'total'         => 'decimal:2',
        'paid_at'       => 'datetime',
        'shipped_at'    => 'datetime',
        'delivered_at'  => 'datetime',
        'cancelled_at'  => 'datetime',
        'pix_expires_at'=> 'datetime',
    ];

    protected $appends = ['status_badge'];

    public function user()  { return $this->belongsTo(User::class); }
    public function items() { return $this->hasMany(OrderItem::class); }

    public static function generateOrderNumber(): string
    {
        return 'ORD-' . strtoupper(uniqid()) . '-' . date('Y');
    }

    public function getStatusBadgeAttribute(): array
    {
        return match($this->status) {
            'pending'    => ['label' => 'Aguardando', 'color' => 'yellow'],
            'confirmed'  => ['label' => 'Confirmado', 'color' => 'blue'],
            'processing' => ['label' => 'Processando', 'color' => 'purple'],
            'shipped'    => ['label' => 'Enviado', 'color' => 'indigo'],
            'delivered'  => ['label' => 'Entregue', 'color' => 'green'],
            'cancelled'  => ['label' => 'Cancelado', 'color' => 'red'],
            'refunded'   => ['label' => 'Reembolsado', 'color' => 'gray'],
            default      => ['label' => 'Desconhecido', 'color' => 'gray'],
        };
    }

    public function getInstallmentLabelAttribute(): string
    {
        if ($this->payment_method !== 'credit_card') return '—';
        return $this->installments > 1
            ? "{$this->installments}x sem juros"
            : "À vista";
    }
}