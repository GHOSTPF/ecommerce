<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use Notifiable, HasRoles;

    protected $fillable = [
        'name', 'email', 'password', 'phone', 'avatar', 'is_active',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected $appends = ['avatar_url'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
        ];
    }

    public function getAvatarUrlAttribute(): string
    {
        if ($this->avatar) {
            return asset('storage/' . $this->avatar);
        }
        // Gera avatar com iniciais via UI Avatars
        return 'https://ui-avatars.com/api/?name=' . urlencode($this->name) . '&background=random&color=fff&size=128';
    }

    public function orders()    { return $this->hasMany(Order::class); }
    public function cart()      { return $this->hasOne(Cart::class); }
    public function addresses() { return $this->hasMany(Address::class); }
    public function reviews()   { return $this->hasMany(Review::class); }
    public function wishlists() { return $this->hasMany(Wishlist::class); }

    public function defaultAddress()
    {
        return $this->addresses()->where('is_default', true)->first();
    }
}