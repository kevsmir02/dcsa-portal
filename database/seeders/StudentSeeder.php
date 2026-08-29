<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Student;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Seeds the 128 Grade 12 learners the portal is sized for, each with a login.
 */
class StudentSeeder extends Seeder
{
    public const TOTAL = 128;

    private const FIRST_NAMES_MALE = [
        'Juan', 'Jose', 'Miguel', 'Carlo', 'Paolo', 'Rafael', 'Emmanuel', 'Christian', 'Angelo', 'Mark',
        'Joshua', 'Kenneth', 'Vincent', 'Daniel', 'Gabriel', 'Nathaniel', 'Francis', 'Adrian', 'Jerome', 'Patrick',
    ];

    private const FIRST_NAMES_FEMALE = [
        'Maria', 'Ana', 'Angela', 'Kristine', 'Patricia', 'Nicole', 'Danica', 'Jasmine', 'Camille', 'Andrea',
        'Bianca', 'Charmaine', 'Katrina', 'Rosemarie', 'Alyssa', 'Trisha', 'Michelle', 'Aubrey', 'Sofia', 'Erika',
    ];

    private const MIDDLE_NAMES = [
        'Bautista', 'Santos', 'Reyes', 'Garcia', 'Cruz', 'Torres', 'Flores', 'Mendoza', 'Ramos', 'Domingo',
        'Navarro', 'Pascual', 'Castillo', 'Gutierrez', 'Alvarez', 'Aguilar', 'Fernandez', 'Manalo', 'Ocampo', 'Salvador',
    ];

    private const LAST_NAMES = [
        'Dela Cruz', 'Reyes', 'Santos', 'Garcia', 'Mendoza', 'Bautista', 'Villanueva', 'Aquino', 'Ramos', 'Del Rosario',
        'Gonzales', 'Rivera', 'Castro', 'Morales', 'Fernandez', 'Perez', 'Cortez', 'Bacani', 'Dizon', 'Espiritu',
        'Ferrer', 'Guevarra', 'Hernandez', 'Ignacio', 'Javier', 'Lazaro', 'Marquez', 'Nolasco', 'Obispo', 'Padilla',
        'Quintos', 'Rosales', 'Sicat', 'Tolentino', 'Urbano', 'Valdez', 'Yumul', 'Zamora', 'Abad', 'Bermudez',
    ];

    private const BARANGAYS = [
        'Concepcion Uno', 'Concepcion Dos', 'Marikina Heights', 'Parang', 'Nangka', 'Fortune',
        'Tumana', 'San Roque', 'Sto. Niño', 'Malanday', 'Barangka', 'Industrial Valley',
    ];

    public function run(): void
    {
        mt_srand(20262027);  // deterministic sample data across re-seeds

        $userRows = [];
        $studentRows = [];
        $now = now();

        // Modular indices march in lockstep and would repeat the same full name
        // every 40 learners, so draw each name and keep it only if the
        // first/last pair has not been used yet.
        $usedNames = [];

        for ($i = 0; $i < self::TOTAL; $i++) {
            $sex = $i % 2 === 0 ? 'male' : 'female';
            $pool = $sex === 'male' ? self::FIRST_NAMES_MALE : self::FIRST_NAMES_FEMALE;

            do {
                $first = $pool[mt_rand(0, count($pool) - 1)];
                $last = self::LAST_NAMES[mt_rand(0, count(self::LAST_NAMES) - 1)];
                $key = $first.'|'.$last;
            } while (isset($usedNames[$key]));

            $usedNames[$key] = true;
            $middle = self::MIDDLE_NAMES[mt_rand(0, count(self::MIDDLE_NAMES) - 1)];

            // A DepEd Learner Reference Number is 12 digits.
            $lrn = '1234567'.str_pad((string) (89101 + $i), 5, '0', STR_PAD_LEFT);
            $email = Str::slug($first.'.'.$last.'.'.($i + 1), '.').'@dcsa.edu.ph';

            $userRows[] = [
                'name' => "{$first} {$last}",
                'email' => $email,
                'password' => Hash::make('password'),
                'role' => UserRole::Student->value,
                'is_active' => true,
                'email_verified_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
            ];

            $studentRows[] = [
                'lrn' => $lrn,
                'first_name' => $first,
                'middle_name' => $middle,
                'last_name' => $last,
                'sex' => $sex,
                'birthdate' => now()->subYears(18)->subDays(($i * 11) % 365)->toDateString(),
                'birthplace' => 'Marikina City',
                'address' => sprintf('%d %s St., Brgy. %s, Marikina City', 10 + ($i % 90), self::MIDDLE_NAMES[$i % 20], self::BARANGAYS[$i % count(self::BARANGAYS)]),
                'contact_number' => '09'.str_pad((string) (170000000 + $i * 137), 9, '0', STR_PAD_LEFT),
                'guardian_name' => self::FIRST_NAMES_FEMALE[($i * 5) % 20].' '.$last,
                'guardian_contact' => '09'.str_pad((string) (180000000 + $i * 211), 9, '0', STR_PAD_LEFT),
                'guardian_relationship' => $i % 3 === 0 ? 'Father' : 'Mother',
                'status' => 'active',
                'email' => $email,   // stripped below, used only to pair with the user row
            ];
        }

        DB::table('users')->insert($userRows);

        $userIds = DB::table('users')
            ->where('role', UserRole::Student->value)
            ->pluck('id', 'email');

        foreach ($studentRows as &$row) {
            $row['user_id'] = $userIds[$row['email']] ?? null;
            unset($row['email']);
            $row['created_at'] = $now;
            $row['updated_at'] = $now;
        }
        unset($row);

        foreach (array_chunk($studentRows, 50) as $chunk) {
            Student::insert($chunk);
        }
    }
}
