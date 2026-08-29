<?php

namespace App\Models;

use App\Enums\Track;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Strand extends Model
{
    use HasFactory;

    protected $fillable = ['track', 'code', 'name', 'description', 'is_active'];

    protected function casts(): array
    {
        return [
            'track' => Track::class,
            'is_active' => 'boolean',
        ];
    }

    public function sections(): HasMany
    {
        return $this->hasMany(Section::class);
    }

    public function subjects(): HasMany
    {
        return $this->hasMany(Subject::class);
    }
}
