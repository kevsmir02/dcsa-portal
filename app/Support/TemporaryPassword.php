<?php

namespace App\Support;

/**
 * A one-time password handed to a learner or teacher when the registrar creates
 * or resets their account.
 *
 * Readable over the counter or down a phone line, so the alphabet leaves out
 * the characters people confuse: 0/O, 1/l/I, 5/S, 2/Z.
 */
final class TemporaryPassword
{
    // Excludes 0/O, 1/l/I, 5/S and 2/Z in the cases that get misread.
    private const ALPHABET = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRTUVWXY346789';

    private const BLOCK = 4;

    private const BLOCKS = 2;

    public static function generate(): string
    {
        $blocks = [];

        for ($b = 0; $b < self::BLOCKS; $b++) {
            $block = '';

            for ($i = 0; $i < self::BLOCK; $i++) {
                // random_int is cryptographically secure; rand()/mt_rand() are not.
                $block .= self::ALPHABET[random_int(0, strlen(self::ALPHABET) - 1)];
            }

            $blocks[] = $block;
        }

        return implode('-', $blocks);
    }
}
