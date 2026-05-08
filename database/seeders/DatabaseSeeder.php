<?php
namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Coupon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Criar roles
        $adminRole = Role::create(['name' => 'admin']);
        $customerRole = Role::create(['name' => 'customer']);

        // Admin
        $admin = User::create([
            'name' => 'Administrador',
            'email' => 'admin@loja.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);
        $admin->assignRole('admin');

        // Cliente teste
        $customer = User::create([
            'name' => 'Cliente Teste',
            'email' => 'cliente@loja.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);
        $customer->assignRole('customer');

        // Categorias
        $categorias = [
            ['name' => 'Eletrônicos', 'slug' => 'eletronicos', 'description' => 'Smartphones, tablets e mais'],
            ['name' => 'Roupas', 'slug' => 'roupas', 'description' => 'Moda masculina e feminina'],
            ['name' => 'Casa & Jardim', 'slug' => 'casa-jardim', 'description' => 'Decoração e utilidades'],
            ['name' => 'Esportes', 'slug' => 'esportes', 'description' => 'Equipamentos e vestuário esportivo'],
            ['name' => 'Livros', 'slug' => 'livros', 'description' => 'Livros e e-books'],
            ['name' => 'Beleza', 'slug' => 'beleza', 'description' => 'Cosméticos e cuidados pessoais'],
        ];

        $createdCategories = [];
        foreach ($categorias as $cat) {
            $createdCategories[] = Category::create(array_merge($cat, ['is_active' => true]));
        }

        // Produtos
        $products = [
            ['name' => 'iPhone 15 Pro', 'price' => 7999.00, 'sale_price' => 7499.00, 'brand' => 'Apple', 'stock' => 50, 'category' => 0],
            ['name' => 'Samsung Galaxy S24', 'price' => 5999.00, 'brand' => 'Samsung', 'stock' => 30, 'category' => 0],
            ['name' => 'MacBook Pro M3', 'price' => 15999.00, 'brand' => 'Apple', 'stock' => 15, 'category' => 0],
            ['name' => 'Camiseta Polo Premium', 'price' => 129.00, 'sale_price' => 99.00, 'brand' => 'Brand X', 'stock' => 200, 'category' => 1],
            ['name' => 'Calça Jeans Slim', 'price' => 199.00, 'brand' => 'Brand Y', 'stock' => 150, 'category' => 1],
            ['name' => 'Jaqueta de Couro', 'price' => 599.00, 'brand' => 'Brand Z', 'stock' => 50, 'category' => 1],
            ['name' => 'Sofá 3 Lugares', 'price' => 2499.00, 'brand' => 'MóveisBR', 'stock' => 10, 'category' => 2],
            ['name' => 'Mesa de Jantar', 'price' => 1899.00, 'sale_price' => 1599.00, 'brand' => 'MóveisBR', 'stock' => 8, 'category' => 2],
            ['name' => 'Kit Halteres 10kg', 'price' => 299.00, 'brand' => 'FitPro', 'stock' => 100, 'category' => 3],
            ['name' => 'Tênis Running Pro', 'price' => 499.00, 'sale_price' => 399.00, 'brand' => 'SportX', 'stock' => 80, 'category' => 3],
            ['name' => 'Clean Code', 'price' => 79.00, 'brand' => 'Alta Books', 'stock' => 300, 'category' => 4],
            ['name' => 'Kit Skincare Completo', 'price' => 349.00, 'brand' => 'BeautyBR', 'stock' => 60, 'category' => 5],
        ];

        foreach ($products as $i => $p) {
            $product = Product::create([
                'name' => $p['name'],
                'slug' => Str::slug($p['name']),
                'description' => "Descrição completa do produto {$p['name']}. Alta qualidade e durabilidade garantida.",
                'short_description' => "O melhor {$p['name']} disponível no mercado.",
                'price' => $p['price'],
                'sale_price' => $p['sale_price'] ?? null,
                'stock_quantity' => $p['stock'],
                'sku' => 'SKU-' . strtoupper(Str::random(6)),
                'category_id' => $createdCategories[$p['category']]->id,
                'brand' => $p['brand'],
                'is_active' => true,
                'is_featured' => $i < 4,
                'track_stock' => true,
            ]);

            // Imagem placeholder (use imagens reais em produção)
            ProductImage::create([
                'product_id' => $product->id,
                'image_path' => "https://picsum.photos/seed/{$product->id}/600/600",
                'is_primary' => true,
                'sort_order' => 0,
            ]);
        }

        // Cupons
        Coupon::create([
            'code' => 'BEMVINDO10',
            'type' => 'percentage',
            'value' => 10,
            'minimum_amount' => 100,
            'is_active' => true,
        ]);

        Coupon::create([
            'code' => 'FRETE0',
            'type' => 'fixed',
            'value' => 15,
            'is_active' => true,
        ]);
    }
}