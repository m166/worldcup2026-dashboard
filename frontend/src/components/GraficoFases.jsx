import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";

const CORES = ["#f59e0b","#3b82f6","#10b981","#ef4444","#8b5cf6","#ec4899"];

export default function GraficoFases({ jogos }) {
  const fases = {};
  jogos.forEach((j) => {
    const fase = j.round || "Outros";
    fases[fase] = (fases[fase] || 0) + 1;
  });

  const data = Object.entries(fases).map(([fase, total]) => ({
    fase: fase.replace("Matchday ", "Rodada "),
    total,
  }));

  return (
    <div>
      <h2 className="text-xl font-bold mb-6 pl-3 border-l-4 border-blue-500">
        Jogos por Fase
      </h2>
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="fase" tick={{ fill: "#94a3b8", fontSize: 11 }}
              angle={-35} textAnchor="end" />
            <YAxis tick={{ fill: "#94a3b8" }} />
            <Tooltip
              contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: 8 }}
              labelStyle={{ color: "#f1f5f9" }}
            />
            <Bar dataKey="total" radius={[6, 6, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={CORES[i % CORES.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}