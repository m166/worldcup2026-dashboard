import { useState, useEffect } from "react";
import axios from "axios";
import GrupoCard from "./components/GrupoCard";

const API = "https://worldcup2026-api-nqtt.onrender.com";

export default function App() {
  const [jogos, setJogos] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregar = () => {
    axios.get(`${API}/jogos`).then((res) => {
      setJogos(res.data.matches || []);
      setLoading(false);
    });
  };

  useEffect(() => { carregar(); }, []);

  const grupos = {};
  jogos.filter((j) => j.group).forEach((j) => {
    if (!grupos[j.group]) grupos[j.group] = [];
    grupos[j.group].push(j);
  });

  return (
    <div className="min-h-screen bg-[#F2F2F2] font-sans">

      {/* Barra verde FIFA no topo */}
      <div className="h-1 bg-[#00A550] w-full" />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">

        {/* Logo + Título */}
        <div className="flex items-center gap-4">
          <img
            src="https://upload.wikimedia.org/wikipedia/pt/5/58/2026_FIFA_World_Cup_logo.svg"
            alt="FIFA World Cup 2026"
            className="h-12 object-contain"
          />
          <div className="h-8 w-px bg-gray-200" />
          <span className="text-xl font-black text-[#0A0A0A] tracking-tight">
            Copa do Mundo da FIFA 2026™
          </span>
        </div>

        {/* Nome + LinkedIn lado direito */}
        <div className="text-right">
          <p className="text-sm font-bold text-[#0A0A0A]">Matheus Moreno</p>
          <a
            href="https://www.linkedin.com/in/matheus-moreno-51461716a/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#0077B5] hover:underline font-medium"
          >
            linkedin.com/in/matheus-moreno-51461716a
          </a>
        </div>

      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-5">
        {loading ? (
          <div className="flex items-center justify-center py-40 text-gray-400">
            <div className="text-center">
              <div className="text-5xl mb-3 animate-bounce">⚽</div>
              <p className="text-sm font-medium">Carregando dados da Copa...</p>
            </div>
          </div>
        ) : (
          Object.entries(grupos).sort().map(([grupo, jogosGrupo]) => (
            <GrupoCard key={grupo} grupo={grupo} jogos={jogosGrupo} onUpdate={carregar} />
          ))
        )}
      </main>

      <footer className="border-t border-gray-200 bg-white mt-6 py-5 text-center">
        <p className="text-sm font-bold text-[#0A0A0A]">Matheus Moreno</p>
        <a
          href="https://www.linkedin.com/in/matheus-moreno-51461716a/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[#0077B5] hover:underline font-medium mt-0.5 inline-block">
          linkedin.com/in/matheus-moreno-51461716a
        </a>
      </footer>
    </div >
  );
}