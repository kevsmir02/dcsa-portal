<?php

namespace App\Enums;

enum SubjectType: string
{
    case Core = 'core';
    case Applied = 'applied';
    case Specialized = 'specialized';

    public function label(): string
    {
        return match ($this) {
            self::Core => 'Core Subject',
            self::Applied => 'Applied Subject',
            self::Specialized => 'Specialized Subject',
        };
    }
}
