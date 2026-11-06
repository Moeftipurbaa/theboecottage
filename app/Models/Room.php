<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Room extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'price_per_night',
        'capacity',
        'status',
        'size',
        'amenities',
    ];

    protected $casts = [
        'price_per_night' => 'decimal:2',
        'capacity' => 'integer',
        'amenities' => 'array',
    ];

    protected $appends = [
        'export_token',
        'export_url',
    ];

    public function getExportTokenAttribute(): string
    {
        return substr(hash_hmac('sha256', 'ical-export-' . $this->slug, (string) config('app.key', 'the-boe-cottage')), 0, 24);
    }

    public function getExportUrlAttribute(): string
    {
        return url("/ical/export/{$this->slug}.ics?token={$this->export_token}");
    }

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

    public function seasonalRates(): HasMany
    {
        return $this->hasMany(SeasonalRate::class);
    }
}
