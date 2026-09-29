<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IcalLink extends Model
{
    protected $fillable = ['room_id', 'platform', 'url', 'last_synced_at'];

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }
}