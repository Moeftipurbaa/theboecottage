<?php

namespace App\Models;

use Database\Factories\AiChatLogFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AiChatLog extends Model
{
    /** @use HasFactory<AiChatLogFactory> */
    use HasFactory;

    protected $table = 'ai_chat_logs';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'session_id',
        'user_query',
        'ai_response',
    ];
}
