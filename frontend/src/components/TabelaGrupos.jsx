function Bandeira({ url, nome }) {
  if (!url) return <span>🏳️</span>;
  return (
    <img src={url} alt={nome} width={22} height={22}
      className="object-contain rounded-sm flex-shrink-0"
      onError={(e) => { e.target.style.display = "none"; }}
    />
  );
}

export default function TabelaGrupos({ jogos }) {
  const grupos = {};

  jogos.filter((j) => j.group).forEach((j) => {
    if (!grupos[j.group]) grupos[j.group] = {};
    [
      { name: j.team1, info: j.team1_info },
      { name: j.team2, info: j.team2_info },
    ].forEach(({ name, info }) => {
      if (name && !grupos[j.group][name]) {
        grupos[j.group][name] = { info, j:0, c:0, e:0, d:0, gm:0, gs:0, pts:0 };
      }
    });

    if (j.score1 != null && j.score2 != null) {
      const t1 = grupos[j.group][j.team1];
      const t2 = grupos[j.group][j.team2];
      if (t1 && t2) {
        t1.j++; t2.j++;
        t1.gm += j.score1; t1.gs += j.score2;
        t2.gm += j.score2; t2.gs += j.score1;
        if (j.score1 > j.score2)      { t1.c++; t2.d++; t1.pts += 3; }
        else if (j.score1 < j.score2) { t2.c++; t1.d++; t2.pts += 3; }
        else                           { t1.e++; t2.e++; t1.pts++; t2.pts++; }
      }
    }
  });

  const cols = ["J","C","E","D","M","S","DG","Pts"];

  return (
    <div>
      <h2 className="text-xl font-bold mb-6 pl-3 border-l-4 border-blue-500">
        Classificação por Grupos
      </h2>
      <div className="flex flex-col gap-6">
        {Object.entries(grupos).sort().map(([grupo, times]) => {
          const lista = Object.entries(times)
            .map(([nome, s]) => ({ nome, ...s }))
            .sort((a, b) => b.pts - a.pts || (b.gm - b.gs) - (a.gm - a.gs));

          return (
            <div key={grupo} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
              <table className="w-full text-sm">
                <thead className="bg-slate-900 text-slate-400 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="text-left py-3 px-4 text-amber-400 text-base normal-case tracking-normal" colSpan={2}>
                      {grupo}
                    </th>
                    {cols.map((c) => (
                      <th key={c} className={`py-3 px-2 text-center ${c === "Pts" ? "text-blue-400" : ""}`}>
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {lista.map((t, i) => (
                    <tr key={t.nome}
                      className={`border-t border-slate-700 hover:bg-slate-700/50 transition-colors
                        ${i < 2 ? "border-l-2 border-l-emerald-500" : ""}`}>
                      <td className="py-3 px-3 text-slate-500 text-xs w-8">{i + 1}</td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <Bandeira url={t.info?.flag} nome={t.nome} />
                          <span className="font-medium text-slate-100">{t.nome}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center text-slate-300">{t.j}</td>
                      <td className="py-3 px-2 text-center text-slate-300">{t.c}</td>
                      <td className="py-3 px-2 text-center text-slate-300">{t.e}</td>
                      <td className="py-3 px-2 text-center text-slate-300">{t.d}</td>
                      <td className="py-3 px-2 text-center text-slate-300">{t.gm}</td>
                      <td className="py-3 px-2 text-center text-slate-300">{t.gs}</td>
                      <td className="py-3 px-2 text-center text-slate-300">{t.gm - t.gs}</td>
                      <td className="py-3 px-2 text-center font-bold text-blue-400">{t.pts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}