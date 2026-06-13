import { useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000";

function Bandeira({ url, nome, size = 20 }) {
    if (!url) return <span className="text-sm">🏳️</span>;
    return (
        <img src={url} alt={nome} width={size} height={size}
            className="object-contain flex-shrink-0"
            onError={(e) => { e.target.style.display = "none"; }}
        />
    );
}

function calcularClassificacao(jogos) {
    const times = {};
    jogos.forEach((j) => {
        [{ name: j.team1, info: j.team1_info }, { name: j.team2, info: j.team2_info }]
            .forEach(({ name, info }) => {
                if (name && !times[name])
                    times[name] = { info, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, pts: 0 };
            });

        if (j.score1 != null && j.score2 != null) {
            const t1 = times[j.team1];
            const t2 = times[j.team2];
            if (t1 && t2) {
                t1.j++; t2.j++;
                t1.gp += j.score1; t1.gc += j.score2;
                t2.gp += j.score2; t2.gc += j.score1;
                if (j.score1 > j.score2) { t1.v++; t2.d++; t1.pts += 3; }
                else if (j.score1 < j.score2) { t2.v++; t1.d++; t2.pts += 3; }
                else { t1.e++; t2.e++; t1.pts++; t2.pts++; }
            }
        }
    });

    return Object.entries(times)
        .map(([nome, s]) => ({ nome, ...s, sg: s.gp - s.gc }))
        .sort((a, b) => b.pts - a.pts || b.sg - a.sg || b.gp - a.gp);
}

function formatarData(dateStr) {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    const dias = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
    const dia = dias[new Date(dateStr).getDay()];
    return { diaSemana: dia, data: `${d}/${m}/${y}` };
}

function formatarHora(timeStr) {
    if (!timeStr) return "";
    return timeStr.split(" ")[0];
}

function JogoRow({ jogo, onSave }) {
    const [s1, setS1] = useState(jogo.score1 ?? "");
    const [s2, setS2] = useState(jogo.score2 ?? "");
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const temPlacar = jogo.score1 != null;
    const { diaSemana, data } = formatarData(jogo.date);
    const hora = formatarHora(jogo.time);

    const salvar = async () => {
        if (s1 === "" || s2 === "") return;
        setSaving(true);
        await axios.post(`${API}/placar`, {
            team1: jogo.team1,
            team2: jogo.team2,
            score1: parseInt(s1),
            score2: parseInt(s2),
            date: jogo.date,
            group_name: jogo.group,
        });
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        onSave();
    };

    return (
        <div className="border-b border-gray-100 last:border-0 px-3 py-2.5 hover:bg-gray-50 transition-colors">

            {/* Linha 1: data + local + hora */}
            <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[9px] font-black text-gray-500 uppercase">{diaSemana}</span>
                <span className="text-[9px] text-gray-400">{data}</span>
                <span className="text-[9px] text-gray-300 mx-0.5">·</span>
                <span className="text-[9px] text-gray-400 uppercase truncate flex-1">
                    {jogo.ground?.split("(")[0].trim()}
                </span>
                <span className="text-[9px] font-bold text-gray-500">{hora}</span>
            </div>

            {/* Linha 2: time1 + inputs + time2 */}
            <div className="flex items-center gap-2">

                {/* Time 1 */}
                <div className="flex items-center gap-1.5 flex-1 justify-end min-w-0">
                    <span className="text-[11px] font-black text-gray-700 truncate text-right uppercase">
                        {jogo.team1}
                    </span>
                    <Bandeira url={jogo.team1_info?.flag} nome={jogo.team1} size={20} />
                </div>

                {/* Inputs de placar */}
                <div className="flex items-center gap-1 flex-shrink-0">
                    <input
                        type="number" min="0" max="20"
                        value={s1}
                        onChange={(e) => setS1(e.target.value)}
                        placeholder={temPlacar ? String(jogo.score1) : ""}
                        className="w-8 h-8 text-center text-sm font-black text-gray-900
              border-2 border-gray-300 rounded
              focus:border-[#00A550] focus:outline-none
              hover:border-gray-400 transition-colors
              [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-gray-400 text-xs font-bold">×</span>
                    <input
                        type="number" min="0" max="20"
                        value={s2}
                        onChange={(e) => setS2(e.target.value)}
                        placeholder={temPlacar ? String(jogo.score2) : ""}
                        className="w-8 h-8 text-center text-sm font-black text-gray-900
              border-2 border-gray-300 rounded
              focus:border-[#00A550] focus:outline-none
              hover:border-gray-400 transition-colors
              [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                    />
                </div>

                {/* Time 2 */}
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <Bandeira url={jogo.team2_info?.flag} nome={jogo.team2} size={20} />
                    <span className="text-[11px] font-black text-gray-700 truncate uppercase">
                        {jogo.team2}
                    </span>
                </div>

            </div>

            {/* Linha 3: botão salvar */}
            <div className="flex justify-center mt-2">
                <button
                    onClick={salvar}
                    disabled={saving || s1 === "" || s2 === ""}
                    className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded
            transition-all disabled:opacity-30
            ${saved
                            ? "bg-[#00A550] text-white"
                            : "bg-gray-100 text-gray-500 hover:bg-[#00A550] hover:text-white"
                        }`}>
                    {saved ? "✓ Salvo" : saving ? "Salvando..." : "Salvar placar"}
                </button>
            </div>
        </div>
    );
}

export default function GrupoCard({ grupo, jogos, onUpdate }) {
    const [rodada, setRodada] = useState(0);
    const classificacao = calcularClassificacao(jogos);

    // Ordena jogos por data e agrupa em rodadas de 2 jogos por grupo
    const jogosOrdenados = [...jogos].sort((a, b) => a.date.localeCompare(b.date));
    const rodadas = [];
    for (let i = 0; i < jogosOrdenados.length; i += 2) {
        rodadas.push(jogosOrdenados.slice(i, i + 2));
    }
    const jogosRodada = rodadas[rodada] || [];

    const COLS = [
        { key: "pts", label: "P", bold: true },
        { key: "j", label: "J", bold: false },
        { key: "v", label: "V", bold: false },
        { key: "e", label: "E", bold: false },
        { key: "d", label: "D", bold: false },
        { key: "gp", label: "GP", bold: false },
        { key: "gc", label: "GC", bold: false },
        { key: "sg", label: "SG", bold: false },
    ];

    return (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">

            {/* Título */}
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3">
                <h2 className="text-xl font-black text-[#0A0A0A] uppercase tracking-tight">{grupo}</h2>
                <div className="h-4 w-px bg-gray-200" />
                <span className="text-[9px] text-[#00A550] font-black uppercase tracking-widest">
                    Fase de Grupos
                </span>
            </div>

            <div className="flex flex-col lg:flex-row">

                {/* ── TABELA ── */}
                <div className="flex-1 overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left py-2 px-5 text-[9px] text-gray-400 font-bold
                  uppercase tracking-widest" colSpan={2}>
                                    Classificação
                                </th>
                                {COLS.map((c) => (
                                    <th key={c.key}
                                        className={`py-2 px-2 text-[9px] font-bold uppercase tracking-wider text-center
                      ${c.bold ? "text-[#0A0A0A]" : "text-gray-400"}`}>
                                        {c.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {classificacao.map((t, i) => (
                                <tr key={t.nome}
                                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors
                    ${i < 2
                                            ? "border-l-[3px] border-l-[#00A550]"
                                            : "border-l-[3px] border-l-transparent"}`}>
                                    <td className="py-3 pl-4 pr-2 text-[11px] text-gray-400 font-bold w-7">{i + 1}</td>
                                    <td className="py-3 pr-4 min-w-36">
                                        <div className="flex items-center gap-2">
                                            <Bandeira url={t.info?.flag} nome={t.nome} size={20} />
                                            <span className="text-sm font-semibold text-[#0A0A0A]">{t.nome}</span>
                                        </div>
                                    </td>
                                    {COLS.map((c) => (
                                        <td key={c.key}
                                            className={`py-3 px-2 text-center text-sm
                        ${c.bold ? "font-black text-[#0A0A0A]" : "font-normal text-gray-500"}`}>
                                            {t[c.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Divisor */}
                <div className="hidden lg:block w-px bg-gray-100" />

                {/* ── JOGOS ── */}
                <div className="w-full lg:w-64 flex-shrink-0 border-t lg:border-t-0 border-gray-100">

                    {/* Nav rodada */}
                    <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50">
                        <button onClick={() => setRodada((r) => Math.max(0, r - 1))}
                            disabled={rodada === 0}
                            className="w-6 h-6 flex items-center justify-center text-gray-400
                hover:text-[#00A550] disabled:opacity-20 font-bold text-lg transition-colors">
                            ‹
                        </button>
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">
                            {rodada + 1}ª Rodada
                        </span>
                        <button onClick={() => setRodada((r) => Math.min(rodadas.length - 1, r + 1))}
                            disabled={rodada === rodadas.length - 1}
                            className="w-6 h-6 flex items-center justify-center text-gray-400
                hover:text-[#00A550] disabled:opacity-20 font-bold text-lg transition-colors">
                            ›
                        </button>
                    </div>

                    {/* Jogos */}
                    <div>
                        {jogosRodada?.map((j, i) => (
                            <JogoRow key={i} jogo={j} onSave={onUpdate} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}