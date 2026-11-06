<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SeasonalRate extends Model
{
    protected $fillable = [
        'rule_name',
        'room_id',
        'start_date',
        'end_date',
        'rate_adjustment_percent',
        'is_active',
    ];

    protected $casts = [
        'start_date' => 'date:Y-m-d',
        'end_date' => 'date:Y-m-d',
        'rate_adjustment_percent' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }
}

