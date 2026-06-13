function Bandeira({ url, nome, size = 40 }) {
  if (!url) return <span className="text-2xl">🏳️</span>;
  return (
    <img
      src={url}
      alt={nome}
      width={size}
      height={size}
      className="object-contain rounded"
      onError={(e) => { e.target.style.display = "none"; }}
    />
  );
}

function CardJogo({ jogo, destaque }) {
  return (
    <div className={`rounded-xl p-5 border transition-transform duration-200 hover:-translate-y-1
      ${destaque
        ? "bg-blue-900/40 border-blue-500 shadow-blue-900/30 shadow-lg"
        : "bg-slate-800 border-slate-700"
      }`}>
      <span className="inline-block bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
        {jogo.group || jogo.round}
      </span>

      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col items-center gap-2 flex-1">
          <Bandeira url={jogo.team1_info?.flag} nome={jogo.team1} />
          <span className="text-sm font-semibold text-center leading-tight">{jogo.team1}</span>
        </div>

        <div className="flex flex-col items-center px-2">
          {jogo.score1 != null ? (
            <span className="bg-blue-600 text-white font-bold text-xl px-4 py-2 rounded-lg">
              {jogo.score1} — {jogo.score2}
            </span>
          ) : (
            <span className="bg-amber-500 text-black font-bold text-sm px-3 py-2 rounded-lg">
              VS
            </span>
          )}
        </div>

        <div className="flex flex-col items-center gap-2 flex-1">
          <Bandeira url={jogo.team2_info?.flag} nome={jogo.team2} />
          <span className="text-sm font-semibold text-center leading-tight">{jogo.team2}</span>
        </div>
      </div>

      <div className="flex justify-between text-xs text-slate-400 mt-4">
        <span>📅 {jogo.date}</span>
        <span>🕐 {jogo.time}</span>
      </div>
      <div className="text-xs text-slate-500 mt-1">📍 {jogo.ground}</div>
    </div>
  );
}

export default function JogosHoje({ jogos, todos }) {
  const proximos = todos
    .filter((j) => j.date > new Date().toISOString().split("T")[0])
    .slice(0, 6);

  return (
    <div>
      <h2 className="text-xl font-bold mb-6 pl-3 border-l-4 border-blue-500">
        Jogos de Hoje
      </h2>
      {jogos.length === 0 ? (
        <div>
          <p className="text-slate-400 mb-6">Sem jogos hoje — próximos jogos:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {proximos.map((j, i) => <CardJogo key={i} jogo={j} />)}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {jogos.map((j, i) => <CardJogo key={i} jogo={j} destaque />)}
        </div>
      )}
    </div>
  );
}