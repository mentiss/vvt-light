// src/client/src/features/dice/DiceOverlay2D.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Rendu 2D des dés (spec_fabula.md §4) : choisi par DiceAnimationOverlay quand
// le slug déclare dice.renderer: '2d'. Même place (au centre, par-dessus la page)
// et même rythme que la 3D (DICE_TIMING) : groupes en séquence, vagues, éclair
// des explosions, résultat affiché avant de rendre la main ; « Passer » à tout moment.
// Chaque dé (Die2D) est jeté depuis un bord, ses chiffres défilent, puis il se pose
// sur sa vraie valeur. Apparence résolue par features/dice/tools/dice2d.js : dé > groupe >
// dice.byType du slug > réglages du joueur.
// Habillage : classes .vtt-dice2d-* (features/dice/dice2d.css), surchargées par le theme.css du slug.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { diceAnimBridge } from './tools/diceAnimBridge.js';
import { DICE_TIMING, playerDieConfig, waveDice } from './tools/dice2d.js';
import useDiceConfig from './hooks/useDiceConfig.js';
import useSlugConfig from '@/app/hooks/useSlugConfig.js';
import Die2D from './Die2D.jsx';

const { WAVE_SETTLE_DELAY, EXPLOSION_FLASH, END_DISPLAY_DELAY, ROLL_2D } = DICE_TIMING;
const delay = ms => new Promise(r => setTimeout(r, ms));
const sidesOf = (type) => Number(String(type).replace('d', '')) || 6;
const randomFace = (type) => 1 + Math.floor(Math.random() * sidesOf(type));

const DiceOverlay2D = () => {
    const [active, setActive]       = useState(false);
    const [label, setLabel]         = useState('');
    const [dice, setDice]           = useState([]);        // [{ type, value, config }]
    const [shown, setShown]         = useState([]);        // valeurs affichées (défilent pendant le lancer)
    const [rolling, setRolling]     = useState(false);
    const [throwKey, setThrowKey]   = useState(0);         // relance l'animation d'entrée à chaque vague
    const [exploding, setExploding] = useState(false);
    const [finished, setFinished]   = useState(false);
    const abortedRef = useRef(false);

    const { config } = useDiceConfig();
    const slugConfig = useSlugConfig();
    const configRef = useRef({ player: null, byType: null });
    useEffect(() => {
        configRef.current = { player: playerDieConfig(config), byType: slugConfig?.dice?.byType ?? null };
    }, [config, slugConfig]);

    const finish = useCallback((skipped) => {
        setActive(false);
        setDice([]);
        if (skipped) diceAnimBridge.skip(); else diceAnimBridge.complete();
    }, []);

    // Un lancer : les dés entrent, les chiffres défilent, puis se posent
    const throwWave = useCallback(async (waveDiceList) => {
        setDice(waveDiceList);
        setThrowKey(k => k + 1);
        setRolling(true);
        const timer = setInterval(() => setShown(waveDiceList.map(d => randomFace(d.type))), 70);
        await delay(ROLL_2D);
        clearInterval(timer);
        setShown(waveDiceList.map(d => d.value));
        setRolling(false);
    }, []);

    const run = useCallback(async (seq) => {
        abortedRef.current = false;
        setActive(true);
        setFinished(false);
        setExploding(false);
        const { player, byType } = configRef.current;
        const groups = seq?.groups ?? [];
        try {
            for (let gi = 0; gi < groups.length; gi++) {
                const group = groups[gi];
                const waves = group.waves ?? [];
                for (let wi = 0; wi < waves.length; wi++) {
                    if (abortedRef.current) return;
                    if (wi > 0) {
                        setExploding(true);
                        await delay(EXPLOSION_FLASH);
                        if (abortedRef.current) return;
                        setExploding(false);
                        setLabel(`Explosion ! (vague ${wi + 1})`);
                    } else {
                        setLabel(group.label || '');
                    }
                    await throwWave(waveDice(group, waves[wi], player, byType));
                    if (wi < waves.length - 1) await delay(WAVE_SETTLE_DELAY);
                }
                if (gi < groups.length - 1) await delay(WAVE_SETTLE_DELAY);
            }
        } catch (err) {
            if (!abortedRef.current) console.error('[DiceOverlay2D]', err);
        }
        if (abortedRef.current) return;
        setFinished(true);
        setLabel('');
        await delay(END_DISPLAY_DELAY);
        if (!abortedRef.current) finish(false);
    }, [throwWave, finish]);

    // ── Enregistrement sur le pont ────────────────────────────────────────────
    useEffect(() => {
        diceAnimBridge.onPlay((seq) => { run(seq); });
        return () => diceAnimBridge.onPlay(null);
    }, [run]);

    const skip = () => {
        abortedRef.current = true;
        finish(true);
    };

    if (!active) return null;

    return (
        <div className={`vtt-dice2d${exploding ? ' is-exploding' : ''}${finished ? ' is-finished' : ''}`}
             onClick={e => e.stopPropagation()}>
            {label && <div className="vtt-dice2d-label">{label}</div>}
            <div className="vtt-dice2d-tray" key={throwKey}>
                {dice.map((d, i) => (
                    <div key={i} className={`vtt-dice2d-slot${rolling ? ' is-rolling' : ' is-landed'}`}
                         style={{ '--vtt-dice2d-from': i % 2 === 0 ? -1 : 1, '--vtt-dice2d-delay': `${i * 60}ms` }}>
                        <Die2D type={d.type} value={shown[i] ?? '?'} config={d.config} />
                    </div>
                ))}
            </div>
            {!finished && (
                <button type="button" className="vtt-dice2d-skip" onClick={skip}>Passer →</button>
            )}
        </div>
    );
};

export default DiceOverlay2D;
