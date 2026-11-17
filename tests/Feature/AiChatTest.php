<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AiChatTest extends TestCase
{
    use RefreshDatabase;

    protected bool $seed = true;

    public function test_ai_chat_validates_required_message(): void
    {
        $response = $this->postJson('/api/ai-chat', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['message']);
    }

    public function test_ai_chat_validates_message_max_length(): void
    {
        $response = $this->postJson('/api/ai-chat', [
            'message' => str_repeat('a', 1001),
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['message']);
    }

    public function test_ai_chat_returns_reply_and_creates_log(): void
    {
        $response = $this->postJson('/api/ai-chat', [
            'message' => 'Halo, apa perbedaan Daisy dan Lily room?',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['reply', 'session_id']);

        $data = $response->json();
        $this->assertNotEmpty($data['session_id']);
        $this->assertStringContainsString('Daisy Room', $data['reply']);
        $this->assertStringContainsString('Lily Room', $data['reply']);
        $this->assertStringContainsString('persegi', $data['reply']);
        $this->assertStringContainsString('bulat', $data['reply']);

        $this->assertDatabaseHas('ai_chat_logs', [
            'session_id' => $data['session_id'],
            'user_query' => 'Halo, apa perbedaan Daisy dan Lily room?',
        ]);
    }

    public function test_ai_chat_reuses_provided_session_id(): void
    {
        $sessionId = 'custom-session-12345';

        $response = $this->postJson('/api/ai-chat', [
            'session_id' => $sessionId,
            'message' => 'Berapa harga menginap permalam?',
        ]);

        $response->assertOk()
            ->assertJson([
                'session_id' => $sessionId,
            ]);

        $reply = $response->json('reply');
        $this->assertStringContainsString('3.000.000', $reply);
        $this->assertStringContainsString('3.300.000', $reply);

        $this->assertDatabaseHas('ai_chat_logs', [
            'session_id' => $sessionId,
            'user_query' => 'Berapa harga menginap permalam?',
        ]);
    }

    public function test_ai_chat_handles_bbq_and_steamboat_queries(): void
    {
        $response = $this->postJson('/api/ai-chat', [
            'message' => 'Apakah ada paket BBQ atau steamboat?',
        ]);

        $response->assertOk();
        $reply = $response->json('reply');
        $this->assertStringContainsString('390.000', $reply);
        $this->assertStringContainsString('275.000', $reply);
        $this->assertStringContainsString('Paket BBQ', $reply);
        $this->assertStringContainsString('Paket Steamboat', $reply);
    }

    public function test_ai_chat_handles_breakfast_queries(): void
    {
        $response = $this->postJson('/api/ai-chat', [
            'message' => 'Menu breakfast apa saja yang tersedia?',
        ]);

        $response->assertOk();
        $reply = $response->json('reply');
        $this->assertStringContainsString('Nasi Goreng', $reply);
        $this->assertStringContainsString('Pancake & Sausage', $reply);
    }

    public function test_ai_chat_handles_tourist_attractions_queries(): void
    {
        $response = $this->postJson('/api/ai-chat', [
            'message' => 'Tempat wisata apa yang dekat dari villa?',
        ]);

        $response->assertOk();
        $reply = $response->json('reply');
        $this->assertStringContainsString('Kawah Sikidang', $reply);
        $this->assertStringContainsString('Candi Arjuna', $reply);
        $this->assertStringContainsString('Telaga Warna', $reply);
    }
}
