<?php

namespace App\Enums;

enum Track: string
{
    case Academic = 'academic';
    case Tvl = 'tvl';
    case Sports = 'sports';
    case ArtsAndDesign = 'arts_and_design';

    public function label(): string
    {
        return match ($this) {
            self::Academic => 'Academic',
            self::Tvl => 'Technical-Vocational-Livelihood',
            self::Sports => 'Sports',
            self::ArtsAndDesign => 'Arts and Design',
        };
    }
}
