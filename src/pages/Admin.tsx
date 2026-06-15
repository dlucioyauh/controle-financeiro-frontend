import { useState } from 'react';
import AdminUsers from './AdminUsers';
import AdminFeatures from './AdminFeatures';

export default function Admin() {
  const [aba, setAba] = useState<'usuarios' | 'features'>('usuarios');

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-slate-800">
        <button
          onClick={() => setAba('usuarios')}
          className={`px-4 py-2 text-sm font-medium transition ${
            aba === 'usuarios'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Usuários
        </button>
        <button
          onClick={() => setAba('features')}
          className={`px-4 py-2 text-sm font-medium transition ${
            aba === 'features'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Feature Flags
        </button>
      </div>
      {aba === 'usuarios' ? <AdminUsers /> : <AdminFeatures />}
    </div>
  );
}