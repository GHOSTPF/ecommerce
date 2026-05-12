<?php
namespace App\Http\Controllers;

use App\Models\Address;
use Illuminate\Http\Request;

class AddressController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'label'        => 'nullable|string|max:50',
            'name'         => 'required|string|max:100',
            'phone'        => 'nullable|string|max:20',
            'zipcode'      => 'required|string|max:9',
            'street'       => 'required|string|max:150',
            'number'       => 'required|string|max:20',
            'complement'   => 'nullable|string|max:50',
            'neighborhood' => 'required|string|max:100',
            'city'         => 'required|string|max:100',
            'state'        => 'required|string|size:2',
            'is_default'   => 'boolean',
        ]);

        $validated['user_id'] = auth()->id();
        $validated['type']    = 'shipping';

        // Se for o primeiro endereço, já é padrão
        if (auth()->user()->addresses()->count() === 0) {
            $validated['is_default'] = true;
        }

        Address::create($validated);

        return back()->with('success', 'Endereço salvo com sucesso!');
    }

    public function update(Request $request, Address $address)
    {
        abort_if($address->user_id !== auth()->id(), 403);

        $validated = $request->validate([
            'label'        => 'nullable|string|max:50',
            'name'         => 'required|string|max:100',
            'phone'        => 'nullable|string|max:20',
            'zipcode'      => 'required|string|max:9',
            'street'       => 'required|string|max:150',
            'number'       => 'required|string|max:20',
            'complement'   => 'nullable|string|max:50',
            'neighborhood' => 'required|string|max:100',
            'city'         => 'required|string|max:100',
            'state'        => 'required|string|size:2',
        ]);

        $address->update($validated);

        return back()->with('success', 'Endereço atualizado!');
    }

    public function setDefault(Address $address)
    {
        abort_if($address->user_id !== auth()->id(), 403);

        // Remove padrão de todos
        auth()->user()->addresses()->update(['is_default' => false]);
        // Define este como padrão
        $address->update(['is_default' => true]);

        return back()->with('success', 'Endereço padrão definido!');
    }

    public function destroy(Address $address)
    {
        abort_if($address->user_id !== auth()->id(), 403);
        $address->delete();
        return back()->with('success', 'Endereço removido.');
    }
}