import {STAT_LABELS, STATS} from "../../config.jsx";
import {useFetch} from "../../../../hooks/useFetch.js";
import React, {useEffect, useRef, useState} from "react";
import useSystem from "../../../../hooks/useSystem.js";
import Modal from "../../../../components/ui/Modal.jsx";
import ConfirmModal from "../../../../components/modals/ConfirmModal.jsx";
import ExpandableText from "../../../../components/ui/ExpandableText.jsx";

// Ligne d'achat : la description se lit en entier (« Voir plus »),
// seul le bouton de coût déclenche l'achat.
const MoveSpendRow = ({ move, xpCost, disabled, accentColor, onSpend }) => (
    <div className="rounded-lg px-3 py-2 flex items-start gap-2 w-full bg-surface-alt border border-default">
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-default">{move.name}</span>
                {move.stat && (
                    <span className={`cp-stat-badge cp-stat-badge-${move.stat}`}>{STAT_LABELS[move.stat]}</span>
                )}
            </div>
            <p className="text-xs mt-0.5 text-muted">
                <ExpandableText text={move.description} />
            </p>
        </div>
        <button
            type="button"
            onClick={onSpend}
            disabled={disabled}
            className="vtt-btn vtt-btn-sm shrink-0 font-mono"
            style={{ color: accentColor }}
        >
            −{xpCost} XP
        </button>
    </div>
);

// Crans de la jauge (spec §2 : -2 à +2, +3 en avancement majeur), centrée sur 0
const STAT_SCALE = [-2, -1, 1, 2, 3];
const formatStat = (v) => (v >= 0 ? `+${v}` : `${v}`);

// Cran plein : de 0 vers la valeur (à gauche si négative, à droite si positive)
const isNotchFilled = (v, current) => (v < 0 ? v >= current : v <= current);
// Cran concerné par l'achat : le cran négatif qui s'efface, ou le positif qui s'allume
const isNotchNext = (v, current) => (current < 0 ? v === current : v === current + 1);

// Carte d'augmentation d'une stat : valeur actuelle, jauge (marqueur du 0 au
// milieu, +3 séparé par un filet), action ou raison du blocage.
const StatUpgradeCard = ({ stat, current, reason, major = false, disabled, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`cp-xp-stat ${major ? 'cp-xp-major' : ''}`}
    >
        <span className="flex items-center justify-between gap-2">
            <span className={`cp-stat-badge cp-stat-badge-${stat}`}>{STAT_LABELS[stat]}</span>
            <span className="cp-xp-stat-value">{formatStat(current)}</span>
        </span>
        <span className="cp-xp-gauge" aria-hidden="true">
            {STAT_SCALE.map(v => (
                <React.Fragment key={v}>
                    {v === 1 && <span className="cp-xp-gauge-zero" />}
                    {v === 3 && <span className="cp-xp-gauge-cap" />}
                    <span className={[
                        'cp-xp-notch',
                        v < 0 && 'is-negative',
                        isNotchFilled(v, current) && 'is-filled',
                        !reason && isNotchNext(v, current) && 'is-next',
                    ].filter(Boolean).join(' ')} />
                </React.Fragment>
            ))}
        </span>
        <span className={`text-xs ${reason ? 'text-muted' : 'cp-xp-stat-action'}`}>
            {reason ?? `Passer à ${formatStat(current + 1)}`}
        </span>
    </button>
);

export const XPPanel = ({ character, onUpdate, onClose }) => {
    const { apiBase }   = useSystem();
    const fetchWithAuth = useFetch();

    const [allMoves,   setAllMoves]   = useState([]);
    const [loading,    setLoading]    = useState(false);
    const [msg,        setMsg]        = useState(null);
    const [search,     setSearch]     = useState('');
    const [confirm,    setConfirm]    = useState(null); // { label, action } — confirmation avant dépense
    const [openGroups, setOpenGroups] = useState({});   // accordéon par playbook

    const xp               = character?.xp               ?? 0;
    const baseAdvancements = character?.baseAdvancements  ?? 0;
    const hasAdvancement   = baseAdvancements >= 5;

    // Moves du playbook : dépliés tant que les majeurs sont verrouillés,
    // repliés ensuite pour que les avancements majeurs restent à portée.
    const [playbookOpen, setPlaybookOpen] = useState(() => !hasAdvancement);

    // Raccourcis Base / Majeurs (en-tête de la modale)
    const baseRef  = useRef(null);
    const majorRef = useRef(null);
    const jumpTo   = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const XP_PER_ADV       = 10;
    const canSpend         = xp >= XP_PER_ADV;

    const charMoveIds = new Set((character?.moves ?? []).map(m => m.id));

    useEffect(() => {
        fetchWithAuth(`${apiBase}/moves`)
            .then(r => r.ok ? r.json() : [])
            .then(data => setAllMoves(Array.isArray(data) ? data : []))
            .catch(() => {});
    }, [apiBase]);

    // ── Moves disponibles ─────────────────────────────────────────────────────
    const playbookMovesAvailable = allMoves.filter(
        m => m.type === 'official'
            && m.playbook === character?.playbook
            && !charMoveIds.has(m.id)
    );

    // Moves majeurs groupés par playbook
    const majorMovesRaw = allMoves.filter(
        m => m.type === 'official'
            && m.playbook !== null
            && m.playbook !== character?.playbook
            && !charMoveIds.has(m.id)
            && (search.trim() === '' || m.name.toLowerCase().includes(search.toLowerCase()) || m.description.toLowerCase().includes(search.toLowerCase()))
    );
    const majorByPlaybook = majorMovesRaw.reduce((acc, m) => {
        if (!acc[m.playbook]) acc[m.playbook] = [];
        acc[m.playbook].push(m);
        return acc;
    }, {});

    // ── Actions ───────────────────────────────────────────────────────────────

    const executeAction = async (action) => {
        setConfirm(null);
        setLoading(true);
        setMsg(null);
        try {
            const res = await fetchWithAuth(`${apiBase}/characters/${character.id}/xp`, {
                method: 'PATCH',
                body:   JSON.stringify(action.payload),
            });
            if (res.ok) {
                const updated = await res.json();
                onUpdate(updated);
                setMsg({ type: 'success', text: action.successMsg });
            } else {
                const err = await res.json();
                setMsg({ type: 'error', text: err.error ?? 'Erreur serveur' });
            }
        } catch { setMsg({ type: 'error', text: 'Erreur réseau' }); }
        finally { setLoading(false); }
    };

    const askConfirm = (label, payload, successMsg) => {
        setConfirm({ label, action: { payload, successMsg } });
    };

    const spendOnStat = (stat, isMajor = false) => {
        const current = character?.[stat] ?? 0;
        const maxStat = isMajor ? 3 : 2;
        if (current >= maxStat) return;
        if (!canSpend) return;
        askConfirm(
            `Augmenter ${STAT_LABELS[stat]} de +${current} à +${current + 1} pour ${XP_PER_ADV} XP`,
            {
                xp:               xp - XP_PER_ADV,
                baseAdvancements: isMajor ? baseAdvancements : baseAdvancements + 1,
                statKey:          stat,
                statDelta:        1,
            },
            `✦ ${STAT_LABELS[stat]} passe à +${current + 1} !`
        );
    };

    const spendOnMove = (move, isMajor = false) => {
        if (!canSpend) return;
        askConfirm(
            `Débloquer "${move.name}" pour ${XP_PER_ADV} XP`,
            {
                xp:               xp - XP_PER_ADV,
                baseAdvancements: isMajor ? baseAdvancements : baseAdvancements + 1,
                moveId:           move.id,
                action:           'add',
            },
            `✦ "${move.name}" débloqué !`
        );
    };

    const toggleGroup = (pb) => setOpenGroups(prev => ({ ...prev, [pb]: !prev[pb] }));

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <>
        <Modal
            onClose={onClose}
            size="md"
            expandable
            title="Dépense d'XP"
            subtitle={
                <>
                    XP : <span className="font-mono font-bold text-accent">{xp}</span>
                    {' · '}
                    Avancements : <span className={`font-mono font-bold ${hasAdvancement ? 'text-success' : 'text-default'}`}>{baseAdvancements}</span>
                    {hasAdvancement && <span className="text-success"> ★</span>}
                    {hasAdvancement && (
                        <span className="flex gap-1.5 mt-2">
                            <button type="button" onClick={() => jumpTo(baseRef)} className="vtt-pill">Base</button>
                            <button type="button" onClick={() => jumpTo(majorRef)} className="vtt-pill">Majeurs</button>
                        </span>
                    )}
                </>
            }
        >
                <div className="flex flex-col gap-5">

                    {/* Feedback */}
                    {msg && (
                        <div className={`vtt-callout ${msg.type === 'success' ? '' : 'vtt-callout-danger'}`}>
                            {msg.text}
                        </div>
                    )}

                    {!canSpend && (
                        <p className="text-sm text-center py-2" style={{ color: 'var(--color-text-muted)' }}>
                            Il faut au moins {XP_PER_ADV} XP pour dépenser un avancement.
                        </p>
                    )}

                    {/* ── AVANCEMENTS DE BASE ──────────────────────────── */}
                    <section ref={baseRef} className="scroll-mt-2">
                        <h4 className="text-xs font-bold cp-font-ui uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>
                            Avancements de base — {XP_PER_ADV} XP
                        </h4>

                        {/* Stats +1 (max +2) */}
                        <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
                            +1 à une stat (max +2 sans avancement majeur)
                        </p>
                        <div className="cp-xp-stats mb-4">
                            {STATS.map(stat => {
                                const current = character?.[stat] ?? 0;
                                const maxed   = current >= 2; // cap de base
                                return (
                                    <StatUpgradeCard
                                        key={stat}
                                        stat={stat}
                                        current={current}
                                        reason={maxed ? 'Maximum de base' : null}
                                        disabled={!canSpend || maxed || loading}
                                        onClick={() => spendOnStat(stat, false)}
                                    />
                                );
                            })}
                        </div>

                        {/* Moves du playbook (accordéon, même en-tête que les majeurs, en cyan) */}
                        {playbookMovesAvailable.length > 0 && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setPlaybookOpen(v => !v)}
                                    aria-expanded={playbookOpen}
                                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer bg-primary/10 border border-primary/30 text-primary"
                                >
                                    <span className="cp-font-ui uppercase tracking-wide text-xs">Nouveau move — {character?.playbook}</span>
                                    <span className="text-[0.7rem]">
                                        {playbookOpen ? '▲' : '▼'} {playbookMovesAvailable.length} move{playbookMovesAvailable.length > 1 ? 's' : ''}
                                    </span>
                                </button>
                                {playbookOpen && (
                                    <div className="flex flex-col gap-1.5 mt-1 ml-2">
                                        {playbookMovesAvailable.map(move => (
                                            <MoveSpendRow
                                                key={move.id}
                                                move={move}
                                                xpCost={XP_PER_ADV}
                                                disabled={!canSpend || loading}
                                                accentColor="var(--color-primary)"
                                                onSpend={() => spendOnMove(move, false)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                        {playbookMovesAvailable.length === 0 && (
                            <p className="text-xs italic mt-1" style={{ color: 'var(--color-text-muted)' }}>
                                Tous les moves du playbook sont débloqués.
                            </p>
                        )}
                    </section>

                    {/* ── AVANCEMENTS MAJEURS ──────────────────────────── */}
                    {hasAdvancement && (
                        <section ref={majorRef} className="scroll-mt-2">
                            <div className="cp-divider mb-4" />
                            <h4 className="text-xs font-bold cp-font-ui uppercase tracking-widest mb-3" style={{ color: 'var(--cp-neon-amber)' }}>
                                ★ Avancements majeurs — {XP_PER_ADV} XP
                            </h4>

                            {/* Stat +3 (uniquement disponible en majeur) */}
                            <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
                                Passer une stat à +3 (maximum absolu — une seule stat peut atteindre +3)
                            </p>
                            <div className="cp-xp-stats mb-4">
                                {STATS.map(stat => {
                                    const current = character?.[stat] ?? 0;
                                    // Une seule stat peut atteindre +3
                                    const statAt3 = STATS.find(s => s !== stat && (character?.[s] ?? 0) >= 3);
                                    const reason  = current >= 3 ? 'Déjà à +3'
                                        : statAt3     ? `+3 déjà pris (${STAT_LABELS[statAt3]})`
                                        : current < 2 ? "Doit d'abord être à +2"
                                        : null;
                                    return (
                                        <StatUpgradeCard
                                            key={stat}
                                            stat={stat}
                                            current={current}
                                            reason={reason}
                                            major
                                            disabled={!canSpend || !!reason || loading}
                                            onClick={() => spendOnStat(stat, true)}
                                        />
                                    );
                                })}
                            </div>

                            {/* Recherche */}
                            <div className="mb-3">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Rechercher un move…"
                                    className="vtt-input"
                                />
                            </div>

                            {/* Accordéon par playbook */}
                            {Object.keys(majorByPlaybook).length === 0 && (
                                <p className="text-xs italic" style={{ color: 'var(--color-text-muted)' }}>
                                    {search ? 'Aucun résultat.' : 'Tous les moves sont débloqués.'}
                                </p>
                            )}
                            {Object.entries(majorByPlaybook).map(([pb, moves]) => (
                                <div key={pb} className="mb-2">
                                    <button
                                        onClick={() => toggleGroup(pb)}
                                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                                        style={{
                                            background: 'rgba(255,170,0,0.07)',
                                            border:     '1px solid rgba(255,170,0,0.2)',
                                            color:      'var(--cp-neon-amber)',
                                            cursor:     'pointer',
                                        }}
                                    >
                                        <span className="cp-font-ui uppercase tracking-wide text-xs">{pb}</span>
                                        <span style={{ fontSize: '0.7rem' }}>
                                            {openGroups[pb] ? '▲' : '▼'} {moves.length} move{moves.length > 1 ? 's' : ''}
                                        </span>
                                    </button>
                                    {openGroups[pb] && (
                                        <div className="flex flex-col gap-1 mt-1 ml-2">
                                            {moves.map(move => (
                                                <MoveSpendRow
                                                    key={move.id}
                                                    move={move}
                                                    xpCost={XP_PER_ADV}
                                                    disabled={!canSpend || loading}
                                                    accentColor="var(--cp-neon-amber)"
                                                    onSpend={() => spendOnMove(move, true)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </section>
                    )}
                </div>
        </Modal>

        {/* ── Confirmation : rendue à côté de la modale (le panneau a un clip-path) ── */}
        {confirm && (
            <ConfirmModal
                title="Confirmer la dépense"
                message={`${confirm.label}. Cette action est irréversible.`}
                onConfirm={() => executeAction(confirm.action)}
                onCancel={() => setConfirm(null)}
            />
        )}
        </>
    );
};
