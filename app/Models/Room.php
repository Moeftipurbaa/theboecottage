<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    protected $fillable = ['name', 'slug', 'description', 'price_per_night', 'capacity'];

    public function images(): HasMany
    {
        return $this->hasMany(RoomImage::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function icalLinks(): HasMany
    {
        return $this->hasMany(IcalLink::class);
    }
}