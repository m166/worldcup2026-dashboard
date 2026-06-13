import { useState } from "react";

function Bandeira({ url, nome }) {
  if (!url) return <span className="text-2xl">🏳️</span>;
  return (
    <img src={url} alt={nome} width={36} height={36}
      className="object-contain rounded"
      onError={(e) => { e.target.style.display = "none"; }}
    />
  );
}

export default function ListaTimes({ jogos }) {
  const [busca, setBusca] = useState("");

  const times = {};
  jogos.filter((j) => j.group).forEach((j) => {
    if (j.team1 && !times[j.team1]) times[j.team1] = { info: j.team1_info, group: j.group };
    if (j.team2 && !times[j.team2]) times[j.team2] = { info: j.team2_info, group: j.group };
  });

  const filtrados = Object.entries(times)
    .filter(([nome]) => nome.toLowerCase().includes(busca.toLowerCase()))
    .sort(([a], [b]) => a.localeCompare(b));

  return (
    <div>
      <h2 className="text-xl font-bold mb-6 pl-3 border-l-4 border-blue-500">
        🌍 48 Times da Copa
      </h2>
      <input
        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3
          text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500
          transition-colors mb-2"
        placeholder="🔍 Buscar time..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />
      <p className="text-slate-500 text-sm mb-5">{filtrados.length} times encontrados</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filtrados.map(([nome, { info, group }]) => (
          <div key={nome}
            className="flex items-center justify-between bg-slate-800 border border-slate-700
              rounded-xl px-4 py-3 hover:border-blue-500 hover:-translate-y-0.5
              transition-all duration-200">
            <div className="flex items-center gap-3">
              <Bandeira url={info?.flag} nome={nome} />
              <span className="font-semibold text-sm">{nome}</span>
            </div>
            <span className="bg-slate-700 text-slate-400 text-xs px-2 py-1 rounded-md">
              {group}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}