<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::withCount('orders');

        if ($request->filled('search')) {
            $query->where('name', 'ilike', "%{$request->search}%")
                  ->orWhere('email', 'ilike', "%{$request->search}%");
        }

        $users = $query->latest()->paginate(20)->withQueryString();
        return Inertia::render('Admin/Users/Index', compact('users'));
    }

    public function show(User $user)
    {
        $user->load('orders', 'addresses');
        return Inertia::render('Admin/Users/Show', compact('user'));
    }

    public function destroy(User $user)
    {
        if ($user->hasRole('admin')) {
            return back()->withErrors(['user' => 'Não é possível remover um administrador.']);
        }
        $user->delete();
        return back()->with('success', 'Usuário removido.');
    }
}