<?php

namespace Tests\Unit;

use App\Support\TemporaryPassword;
use PHPUnit\Framework\TestCase;

class TemporaryPasswordTest extends TestCase
{
    public function test_it_is_not_the_word_password(): void
    {
        $this->assertNotSame('password', TemporaryPassword::generate());
    }

    public function test_it_is_unpredictable_across_calls(): void
    {
        $generated = [];
        for ($i = 0; $i < 200; $i++) {
            $generated[] = TemporaryPassword::generate();
        }

        // ~50 usable characters over 8 positions; 200 draws should never collide.
        $this->assertCount(200, array_unique($generated));
    }

    public function test_it_avoids_characters_people_misread(): void
    {
        for ($i = 0; $i < 200; $i++) {
            $this->assertDoesNotMatchRegularExpression(
                '/[0O1lI5S2Z]/',
                TemporaryPassword::generate(),
                'A password read out over the counter must not contain ambiguous characters.',
            );
        }
    }

    public function test_it_has_a_readable_grouped_shape(): void
    {
        $this->assertMatchesRegularExpression('/^[a-zA-Z346789]{4}-[a-zA-Z346789]{4}$/', TemporaryPassword::generate());
    }
}
