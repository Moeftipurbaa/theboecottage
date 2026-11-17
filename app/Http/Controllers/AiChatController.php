<?php

namespace App\Http\Controllers;

use App\Models\AiChatLog;
use App\Services\AiChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AiChatController extends Controller
{
    public function __construct(
        protected AiChatService $aiChatService
    ) {}

    /**
     * Handle incoming AI Concierge chat requests.
     */
    public function chat(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:1000'],
            'session_id' => ['nullable', 'string', 'max:100'],
        ]);

        $sessionId = ! empty($validated['session_id']) ? $validated['session_id'] : (string) Str::uuid();
        $userMessage = trim($validated['message']);

        // Process reply using AI service (OpenAI / Gemini / Deterministic Fallback)
        $aiReply = $this->aiChatService->reply($userMessage, $sessionId);

        // Save conversation turn to database log
        AiChatLog::create([
            'session_id' => $sessionId,
            'user_query' => $userMessage,
            'ai_response' => $aiReply,
        ]);

        return response()->json([
            'reply' => $aiReply,
            'session_id' => $sessionId,
        ]);
    }
}
