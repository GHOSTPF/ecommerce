<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // A coluna já existe, mas garantir que tem o campo label
        if (!Schema::hasColumn('addresses', 'label')) {
            Schema::table('addresses', function (Blueprint $table) {
                $table->string('label')->nullable()->after('type'); // "Casa", "Trabalho", etc
            });
        }
    }
    public function down(): void {}
};