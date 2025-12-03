import React, { useState } from 'react';
import { Search, Package, ShoppingCart, User } from 'lucide-react';
import { MOCK_PARTS } from '../constants';
import { Part } from '../types';

export const SupplyChain: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredParts = MOCK_PARTS.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
            <Package className="mr-2 text-amber-500" /> Virtual Supply Chain
            </h2>
            <p className="text-slate-400 text-sm">Search distributors & shadow stock (technician vans) globally.</p>
        </div>
        <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
            <input 
                type="text" 
                placeholder="Search by SKU or Part Name..." 
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:ring-2 focus:ring-amber-500 outline-none"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <div className="overflow-x-auto bg-slate-800 rounded-lg border border-slate-700">
        <table className="w-full text-left">
            <thead className="bg-slate-900 text-slate-400 text-xs uppercase font-semibold">
                <tr>
                    <th className="p-4">Part Details</th>
                    <th className="p-4">Source</th>
                    <th className="p-4">Distance</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-700 text-sm">
                {filteredParts.map((part) => (
                    <tr key={part.id} className="hover:bg-slate-700/50 transition">
                        <td className="p-4">
                            <div className="font-bold text-white">{part.name}</div>
                            <div className="text-slate-500 text-xs">{part.sku}</div>
                        </td>
                        <td className="p-4">
                            <div className="flex items-center">
                                {part.locationType === 'Van' ? (
                                    <span className="bg-purple-900/50 text-purple-300 border border-purple-700 px-2 py-0.5 rounded-full text-xs flex items-center mr-2">
                                        <User className="w-3 h-3 mr-1" /> Peer Stock
                                    </span>
                                ) : (
                                    <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full text-xs mr-2">
                                        Distributor
                                    </span>
                                )}
                                <span className="text-slate-300">{part.locationName}</span>
                            </div>
                        </td>
                        <td className="p-4 text-slate-300">{part.distance}</td>
                        <td className="p-4">
                            <span className={`font-bold ${part.stock < 3 ? 'text-red-400' : 'text-emerald-400'}`}>
                                {part.stock} units
                            </span>
                        </td>
                        <td className="p-4 text-white font-mono">${part.price.toFixed(2)}</td>
                        <td className="p-4">
                            <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded flex items-center text-xs font-bold transition">
                                <ShoppingCart className="w-3 h-3 mr-1" />
                                {part.locationType === 'Van' ? 'Request Transfer' : 'Order Now'}
                            </button>
                        </td>
                    </tr>
                ))}
                {filteredParts.length === 0 && (
                    <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500">
                            No parts found matching your criteria.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
};
