import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface Address {
    id: string;
    type: string;
    name: string;
    details: string;
    isDefault: boolean;
}

const AddressesPage: React.FC = () => {
    const [addresses, setAddresses] = useState<Address[]>([
        { id: '1', type: 'Home', name: 'John Doe', details: '123 Market St, San Francisco, CA 94103, USA', isDefault: true },
        { id: '2', type: 'Work', name: 'John Doe', details: '456 Tech Blvd, Mountain View, CA 94043, USA', isDefault: false }
    ]);
    const [showForm, setShowForm] = useState(false);
    const [newAddress, setNewAddress] = useState({ name: '', street: '', city: '', zip: '', type: 'Home' });

    const handleDelete = (id: string) => {
        setAddresses(addresses.filter(a => a.id !== id));
    };

    const handleAddAddress = (e: React.FormEvent) => {
        e.preventDefault();
        const address: Address = {
            id: Date.now().toString(),
            type: newAddress.type,
            name: newAddress.name,
            details: `${newAddress.street}, ${newAddress.city}, ${newAddress.zip}`,
            isDefault: addresses.length === 0
        };
        setAddresses([...addresses, address]);
        setShowForm(false);
        setNewAddress({ name: '', street: '', city: '', zip: '', type: 'Home' });
    };

    return (
        <div className="flex-grow flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-2xl space-y-8">
                <nav className="flex items-center text-sm text-stone-500 mb-6">
                    <Link to="/account" className="hover:text-primary transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Back to Account
                    </Link>
                </nav>
                
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight text-stone-900">My Addresses</h1>
                    <button 
                        onClick={() => setShowForm(!showForm)}
                        className="text-sm font-semibold text-primary hover:text-primary-hover flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-lg">{showForm ? 'close' : 'add'}</span>
                        {showForm ? 'Cancel' : 'Add New'}
                    </button>
                </div>

                {showForm && (
                    <form onSubmit={handleAddAddress} className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4 animate-fade-in-up">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-stone-600">Full Name</label>
                                <input required type="text" className="w-full rounded-lg border-stone-200 text-sm focus:ring-primary focus:border-primary" value={newAddress.name} onChange={e => setNewAddress({...newAddress, name: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-stone-600">Address Type</label>
                                <select className="w-full rounded-lg border-stone-200 text-sm focus:ring-primary focus:border-primary" value={newAddress.type} onChange={e => setNewAddress({...newAddress, type: e.target.value})}>
                                    <option>Home</option>
                                    <option>Work</option>
                                    <option>Other</option>
                                </select>
                            </div>
                         </div>
                         <div className="space-y-1">
                            <label className="text-xs font-semibold text-stone-600">Street Address</label>
                            <input required type="text" className="w-full rounded-lg border-stone-200 text-sm focus:ring-primary focus:border-primary" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} />
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-stone-600">City</label>
                                <input required type="text" className="w-full rounded-lg border-stone-200 text-sm focus:ring-primary focus:border-primary" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-stone-600">Zip Code</label>
                                <input required type="text" className="w-full rounded-lg border-stone-200 text-sm focus:ring-primary focus:border-primary" value={newAddress.zip} onChange={e => setNewAddress({...newAddress, zip: e.target.value})} />
                            </div>
                         </div>
                         <div className="pt-2">
                            <button type="submit" className="bg-stone-900 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-stone-800 transition-colors w-full md:w-auto">
                                Save Address
                            </button>
                         </div>
                    </form>
                )}

                <div className="grid gap-4">
                    {addresses.map(addr => (
                        <div key={addr.id} className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm flex justify-between items-start group hover:border-primary/30 transition-all">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="font-bold text-stone-900">{addr.type}</span>
                                    {addr.isDefault && (
                                        <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wide">Default</span>
                                    )}
                                </div>
                                <p className="text-sm font-medium text-stone-800">{addr.name}</p>
                                <p className="text-sm text-stone-500 mt-1">{addr.details}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleDelete(addr.id)} className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete address">
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                    {addresses.length === 0 && (
                        <div className="text-center py-10 bg-stone-50 rounded-xl border border-dashed border-stone-300">
                            <span className="material-symbols-outlined text-3xl text-stone-400 mb-2">location_off</span>
                            <p className="text-stone-500 text-sm">You haven't added any addresses yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddressesPage;
