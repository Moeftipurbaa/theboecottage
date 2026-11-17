<?php

namespace Database\Factories;

use App\Models\AiChatLog;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AiChatLog>
 */
class AiChatLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'session_id' => fake()->uuid(),
            'user_query' => fake()->sentence(),
            'ai_response' => fake()->paragraph(),
        ];
    }
}
