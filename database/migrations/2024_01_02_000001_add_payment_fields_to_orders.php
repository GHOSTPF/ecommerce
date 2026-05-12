<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->integer('installments')->default(1)->after('payment_method');
            $table->string('pix_key')->nullable()->after('installments');
            $table->string('pix_qr_code')->nullable()->after('pix_key');
            $table->string('pix_qr_code_base64')->nullable()->after('pix_qr_code');
            $table->timestamp('pix_expires_at')->nullable()->after('pix_qr_code_base64');
        });
    }
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['installments', 'pix_key', 'pix_qr_code', 'pix_qr_code_base64', 'pix_expires_at']);
        });
    }
};