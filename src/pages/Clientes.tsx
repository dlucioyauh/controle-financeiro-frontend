import 'leaflet/dist/leaflet.css'; // ← PRIMEIRO, antes de qualquer outro import
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin, List } from 'lucide-react';
import L from 'leaflet';
import api from '../api';

// Ícone customizado para o marcador
const marcadorIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface ClienteMapa {
  id: string;
  nome: string;
  latitude: number;
  longitude: number;
  endereco?: string;
  bairro?: string;
  cidade?: string;
}

export default function Clientes() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [clientesMapa, setClientesMapa] = useState<ClienteMapa[]>([]);
  const [mostrarMapa, setMostrarMapa] = useState(true);

  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [cep, setCep] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const carregarClientes = async () => {
    const [listaRes, mapaRes] = await Promise.all([
      api.get('/clientes'),
      api.get('/clientes/mapa'),
    ]);
    setClientes(listaRes.data);
    setClientesMapa(mapaRes.data.filter((c: ClienteMapa) => c.latitude && c.longitude));
  };

  useEffect(() => {
    carregarClientes();
  }, []);

  const salvarCliente = async () => {
    if (!nome) return alert('O nome é obrigatório.');
    const payload: any = { nome, telefone, endereco, bairro, cidade, estado, cep };

    // Geocodificação automática ao salvar
    if (endereco && cidade) {
      try {
        const enderecoCompleto = `${endereco}, ${bairro}, ${cidade}, ${estado}, Brasil`;
        const resp = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoCompleto)}`
        );
        const dados = await resp.json();
        if (dados.length > 0) {
          payload.latitude = parseFloat(dados[0].lat);
          payload.longitude = parseFloat(dados[0].lon);
        }
      } catch (err) {
        console.error('Erro na geocodificação:', err);
      }
    }

    try {
      if (editandoId) {
        await api.patch(`/clientes/${editandoId}`, payload);
        setEditandoId(null);
      } else {
        await api.post('/clientes', payload);
      }
      limparForm();
      carregarClientes();
    } catch (err) {
      alert('Erro ao salvar cliente.');
    }
  };

  const limparForm = () => {
    setNome(''); setTelefone(''); setEndereco(''); setBairro('');
    setCidade(''); setEstado(''); setCep(''); setEditandoId(null);
  };

  const editarCliente = (c: any) => {
    setNome(c.nome); setTelefone(c.telefone || ''); setEndereco(c.endereco || '');
    setBairro(c.bairro || ''); setCidade(c.cidade || ''); setEstado(c.estado || '');
    setCep(c.cep || ''); setEditandoId(c.id);
  };

  const excluirCliente = async (id: string) => {
    if (confirm('Deseja excluir este cliente?')) {
      await api.delete(`/clientes/${id}`);
      carregarClientes();
    }
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0f172a] p-4 rounded-lg border border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Clientes</h1>
          <p className="text-xs text-slate-400">Cadastre e gerencie seus clientes.</p>
        </div>
        <button onClick={() => setMostrarMapa(!mostrarMapa)}
          className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
          {mostrarMapa ? <List size={16} /> : <MapPin size={16} />}
          {mostrarMapa ? 'Ocultar Mapa' : 'Mostrar Mapa'}
        </button>
      </div>

      {/* Mapa */}
      {mostrarMapa && (
        <div style={{ height: '400px', width: '100%' }} className="bg-[#0f172a] rounded-lg border border-slate-800 overflow-hidden">
          <MapContainer center={[-27.5954, -48.5480]} zoom={10} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {clientesMapa.map((c) => (
              <Marker key={c.id} position={[c.latitude, c.longitude]} icon={marcadorIcon}>
                <Popup>
                  <strong>{c.nome}</strong><br />
                  {c.endereco && `${c.endereco}, `}{c.bairro && `${c.bairro}, `}{c.cidade}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}

      {/* Formulário */}
      <div className="bg-[#0f172a] p-5 rounded-lg border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white">{editandoId ? 'Editar Cliente' : 'Novo Cliente'}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <input placeholder="Nome *" value={nome} onChange={(e) => setNome(e.target.value)}
            className="bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
          <input placeholder="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)}
            className="bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
          <input placeholder="Rua, número" value={endereco} onChange={(e) => setEndereco(e.target.value)}
            className="bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
          <input placeholder="Bairro" value={bairro} onChange={(e) => setBairro(e.target.value)}
            className="bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
          <input placeholder="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)}
            className="bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
          <input placeholder="Estado (ex: SC)" value={estado} onChange={(e) => setEstado(e.target.value)}
            className="bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
          <input placeholder="CEP" value={cep} onChange={(e) => setCep(e.target.value)}
            className="bg-[#1e293b] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500" />
        </div>
        <div className="flex gap-2">
          <button onClick={salvarCliente} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
            {editandoId ? 'Atualizar' : 'Cadastrar'}
          </button>
          {editandoId && <button onClick={limparForm} className="text-slate-400 hover:text-white text-sm">Cancelar</button>}
        </div>
      </div>

      {/* Lista de clientes */}
      <div className="bg-[#0f172a] rounded-lg border border-slate-800 overflow-x-auto">
        <table className="w-full text-xs text-slate-300">
          <thead className="text-[10px] text-slate-500 uppercase border-b border-slate-800">
            <tr>
              <th className="py-2 px-3 text-left">Nome</th>
              <th className="py-2 px-3 text-left">Telefone</th>
              <th className="py-2 px-3 text-left">Endereço</th>
              <th className="py-2 px-3 text-left">Bairro</th>
              <th className="py-2 px-3 text-left">Cidade</th>
              <th className="py-2 px-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {clientes.map((c) => (
              <tr key={c.id} className="hover:bg-slate-800/20 transition-colors">
                <td className="py-2 px-3 font-medium text-white">{c.nome}</td>
                <td className="py-2 px-3">{c.telefone || '—'}</td>
                <td className="py-2 px-3">{c.endereco || '—'}</td>
                <td className="py-2 px-3">{c.bairro || '—'}</td>
                <td className="py-2 px-3">{c.cidade || '—'}</td>
                <td className="py-2 px-3 text-right flex gap-2 justify-end">
                  <button onClick={() => editarCliente(c)} className="text-yellow-400 hover:text-yellow-300">Editar</button>
                  <button onClick={() => excluirCliente(c.id)} className="text-red-400 hover:text-red-300">Excluir</button>
                </td>
              </tr>
            ))}
            {clientes.length === 0 && (
              <tr><td colSpan={6} className="py-8 text-center text-slate-500">Nenhum cliente cadastrado ainda.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}// force production deploy
