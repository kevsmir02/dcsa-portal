<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TeacherSeeder extends Seeder
{
    public function run(): void
    {
        $teachers = [
            ['Corazon', 'Bautista', 'Villanueva', 'female', 'Master Teacher II', 'Mathematics'],
            ['Ramon', 'Cruz', 'Dela Peña', 'male', 'Teacher III', 'Science'],
            ['Imelda', 'Santos', 'Aquino', 'female', 'Teacher III', 'English'],
            ['Benigno', 'Reyes', 'Macapagal', 'male', 'Teacher II', 'Filipino'],
            ['Josefina', 'Garcia', 'Lim', 'female', 'Master Teacher I', 'Social Studies'],
            ['Eduardo', 'Torres', 'Panganiban', 'male', 'Teacher III', 'Science'],
            ['Marilou', 'Flores', 'Sarmiento', 'female', 'Teacher II', 'Mathematics'],
            ['Rodrigo', 'Mendoza', 'Escalona', 'male', 'Teacher I', 'ICT'],
            ['Teresita', 'Ramos', 'Buenaventura', 'female', 'Teacher III', 'Values Education'],
            ['Alfredo', 'Domingo', 'Salazar', 'male', 'Teacher II', 'MAPEH'],
            ['Lourdes', 'Navarro', 'Concepcion', 'female', 'Teacher III', 'English'],
            ['Fernando', 'Pascual', 'Rivera', 'male', 'Teacher II', 'Business Education'],
            ['Milagros', 'Castillo', 'Del Rosario', 'female', 'Master Teacher I', 'Research'],
            ['Antonio', 'Gutierrez', 'Bonifacio', 'male', 'Teacher III', 'Social Studies'],
            ['Nenita', 'Alvarez', 'Magbanua', 'female', 'Teacher II', 'Filipino'],
        ];

        foreach ($teachers as $index => [$first, $middle, $last, $sex, $position, $department]) {
            $employeeNo = sprintf('T-%04d', 2001 + $index);
            $email = Str::slug($first.'.'.$last, '.').'@dcsa.edu.ph';

            $user = User::create([
                'name' => "{$first} {$last}",
                'email' => $email,
                'password' => Hash::make('password'),
                'role' => UserRole::Teacher,
                'is_active' => true,
                'email_verified_at' => now(),
            ]);

            Teacher::create([
                'user_id' => $user->id,
                'employee_no' => $employeeNo,
                'first_name' => $first,
                'middle_name' => $middle,
                'last_name' => $last,
                'sex' => $sex,
                'position' => $position,
                'department' => $department,
                'contact_number' => '09'.random_int(100000000, 999999999),
                'email' => $email,
                'is_active' => true,
            ]);
        }
    }
}
