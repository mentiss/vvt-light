// src/client/src/systems/cyberpunk/components/creation/CreationDossier.jsx
// Dossier de l'opérateur (spec §9.1) : le personnage se remplit en direct, avec ce
// qui reste à faire. Sous l'étape et repliable sur tablette en portrait (P-1).
import React, { useState } from 'react';
import {
    STATS, STAT_LABELS, DIRECTIVES_PERSONNELLES, CHROME_BASE, TAG_VARIANT_CLASS, findPlaybook, stepRemaining,
    buildCreationPayload,
} from '../../config.jsx';
import CpIcon from '../ui/CpIcon.jsx';

const sign = (v) => (v > 0 ? `+${v}` : v < 0 ? `−${Math.abs(v)}` : '±0');

const Section = ({ title, remaining, unit, okLabel, children }) => (
    <div className="cp-cr-doss-sec">
        <h4>{title}{remaining !== undefined && (
            <em className={remaining ? 'is-todo' : 'is-ok'}>{remaining ? `${remaining} ${unit}` : okLabel}</em>
        )}</h4>
        {children}
    </div>
);

const Pending = ({ children }) => <div className="cp-cr-doss-line is-pending"><span className="n">{children}</span></div>;

// Tags d'une ligne telle qu'elle partira sur la fiche (verrouillés : cadenas)
const SheetTags = ({ tags = [] }) => tags.length > 0 && (
    <div className="cp-cr-doss-tags">
        {tags.map((t, i) => (
            <span key={i} className={`cp-tag ${t.locked ? 'is-locked' : TAG_VARIANT_CLASS[t.tag_variant] ?? ''}`}>
                {t.locked && <CpIcon name="lock" size="sm" />}{t.tag_text}
            </span>
        ))}
    </div>
);

const CreationDossier = ({ draft }) => {
    const [open, setOpen] = useState(true);
    const moveObjs = draft.moveObjs;
    const sheet = buildCreationPayload(draft);   // ce qui sera enregistré
    const pb = findPlaybook(draft.playbook);
    const { identity } = draft;
    const name = [identity.prenom, identity.nom].filter(s => s.trim()).join(' ');
    const directives = draft.directives.filter(d => d.selected);
    const statsLeft = STATS.filter(s => draft.stats[s] === null).length;

    return (
        <aside className={`cp-panel cp-cr-dossier ${open ? '' : 'is-closed'}`}>
            <div className="cp-panel-head">
                <h3 className="cp-panel-title">Dossier de l'opérateur</h3>
                <span className="cp-panel-rule" />
                <button type="button" className="cp-btn is-sm is-ghost cp-cr-doss-toggle" onClick={() => setOpen(o => !o)}>{open ? 'Replier' : 'Déplier'}</button>
            </div>

            <div className={`cp-cr-doss-name ${name ? '' : 'is-empty'}`}>
                <small>{pb?.label ?? 'Archétype à choisir'}</small>{name || 'Sans nom'}
            </div>
            {identity.playerName.trim() && <div className="cp-cr-rule">Joué par {identity.playerName}</div>}
            {identity.apparence.trim() && <div className="cp-cr-rule">{identity.apparence}</div>}

            <Section title="Stats" remaining={statsLeft} unit="à placer" okLabel="placées">
                <div className="cp-cr-minihex">
                    {STATS.map(s => (
                        <div key={s} className={`st-${s} ${draft.stats[s] === null ? 'is-unset' : ''}`}>
                            <b>{draft.stats[s] === null ? '·' : sign(draft.stats[s])}</b><span>{STAT_LABELS[s]}</span>
                        </div>
                    ))}
                </div>
            </Section>

            <Section title="Manœuvres" remaining={stepRemaining(4, draft)} unit="à choisir" okLabel={`${moveObjs.length}`}>
                {moveObjs.map(m => (
                    <div key={m.id} className="cp-cr-doss-line">
                        <span className="n">{m.name}</span>
                        {m.stat && STAT_LABELS[m.stat] && <span className={`cp-stat-badge cp-stat-badge-${m.stat}`}>{STAT_LABELS[m.stat]}</span>}
                    </div>
                ))}
                {moveObjs.length === 0 && <Pending>Manœuvres de playbook à choisir</Pending>}
            </Section>

            <Section title="Directives" remaining={stepRemaining(5, draft)} unit="à choisir" okLabel="choisies">
                {directives.map(d => {
                    const def = DIRECTIVES_PERSONNELLES.find(x => x.id === d.id);
                    return (
                        <div key={d.id} className="cp-cr-doss-line">
                            <span className="n">{def?.label ?? d.id}</span>
                            {d.blankValue?.trim() && <span className="o">{d.blankValue}</span>}
                        </div>
                    );
                })}
                {directives.length === 0 && <Pending>Directives à choisir</Pending>}
            </Section>

            <Section title="Relations" remaining={stepRemaining(6, draft)} unit="à nommer" okLabel={`${draft.relations.length}`}>
                {draft.relations.filter(r => r.name.trim()).map((r, i) => (
                    <div key={i} className="cp-cr-doss-line">
                        <span className="n">{r.name}</span>
                        <span className="q">{sign(r.link_score)}</span>
                    </div>
                ))}
            </Section>

            {sheet.tags.length > 0 && (
                <Section title="Tags">
                    <SheetTags tags={sheet.tags} />
                    <div className="cp-cr-rule">Verrouillés : retrait en mode Édition seulement.</div>
                </Section>
            )}

            <Section title="Chrome" remaining={stepRemaining(7, draft)} unit="à choisir" okLabel={`${sheet.cyberware.length}`}>
                <div className="cp-cr-doss-line is-base">Socle : {CHROME_BASE}</div>
                {sheet.cyberware.map((c, i) => (
                    <React.Fragment key={i}>
                        <div className="cp-cr-doss-line"><span className="n">{c.name}</span></div>
                        <SheetTags tags={c.tags.filter(t => t.tag_variant === 'negative' || t.locked)} />
                    </React.Fragment>
                ))}
            </Section>

            <Section title="Matos" remaining={stepRemaining(8, draft)} unit="à choisir" okLabel={`${sheet.items.length}`}>
                {sheet.items.map((it, i) => (
                    <React.Fragment key={i}>
                        <div className="cp-cr-doss-line"><span className="n">{it.name}</span>{it.quantity > 1 && <span className="q">×{it.quantity}</span>}</div>
                        <SheetTags tags={it.tags.filter(t => t.tag_variant === 'negative' || t.locked)} />
                    </React.Fragment>
                ))}
                {sheet.items.length === 0 && <Pending>Kit à choisir</Pending>}
            </Section>

            <Section title="Cred">
                <div className={`cp-credstick self-start ${sheet.cred < 0 ? 'text-danger' : ''}`}><b>{sheet.cred}</b></div>
            </Section>
        </aside>
    );
};

export default CreationDossier;
