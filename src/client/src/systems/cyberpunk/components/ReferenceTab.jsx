// src/client/src/systems/cyberpunk/components/tabs/ReferenceTab.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Onglet de référence système — accessible joueurs et GM.
// Contenu statique hardcodé : listes de contacts, expertises, daemons,
// questions de moves de base, options de retenues.
// Organisé par playbook + section "Moves de base".
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';

// ── Données statiques ─────────────────────────────────────────────────────────

const REFERENCE_DATA = {
    'Moves de base': {
        sections: [
            {
                title: 'Questions — Évaluer',
                type: 'list',
                items: [
                    'De quelle potentielle complication devrais-je me méfier ?',
                    'Qu\'est-ce que je remarque en dépit de l\'effort fait pour le cacher ?',
                    'En quoi __________ m\'est-il vulnérable ?',
                    'Comment puis-je éviter les ennuis ou me cacher ici ?',
                    'Quelle est la meilleure façon de m\'infiltrer / m\'exfiltrer / traverser ?',
                    'Où puis-je obtenir le meilleur avantage ?',
                    'Quelle est la plus grande menace dans cette situation ?',
                    'Qui est ou qu\'est-ce qui est aux commandes ici ?',
                ],
            },
            {
                title: 'Questions — Effectuer une recherche',
                type: 'list',
                items: [
                    'Où pourrais-je trouver __________ ?',
                    'À quel point __________ est sécurisé ?',
                    'Qui est ou quoi est relié à __________ ?',
                    'Qui a possédé ou employé __________ ?',
                    'Pour qui ou pour quoi __________ est le plus précieux ?',
                    'Quelle relation unit __________ et __________ ?',
                ],
            },
            {
                title: 'Options — Plan B',
                type: 'list',
                items: [
                    'Matériel planqué',
                    'Contact établi',
                    'Information obtenue',
                    'Lieu reconnu',
                    'Accord passé',
                ],
            },
        ],
    },

    'Assassin': {
        sections: [
            {
                title: 'Réseau de contacts',
                type: 'table',
                columns: ['Contact', 'Description'],
                rows: [
                    ['Armurier black market', 'Fournisseur d\'armes non traçables et munitions spéciales'],
                    ['Agent corpo (choisir)', 'Informateur interne, accès aux données et mouvements internes'],
                    ['Agent fédéral NUSA', 'Accès aux rouages officiels, zones grises légales'],
                    ['Faussaire', 'Identités, documents, accréditations biométriques'],
                    ['Cleaner', 'Effacement de scène, élimination de traces et de corps'],
                    ['Receleur', 'Écoule le matériel chaud, source de matos de récup'],
                    ['Broker', 'Intermédiaire en contrats, connaît tout le monde sans être connu'],
                    ['Ripperdoc discret', 'Soins sans questions, chrome hors circuit officiel'],
                    ['Passeur', 'Exfiltration, frontières, transports fantômes'],
                    ['Informateur de rue', 'Oreilles dans les bas-fonds, sait qui bouge quoi et où'],
                ],
            },
            {
                title: 'Retenues — Contrôler le terrain',
                type: 'list',
                items: [
                    'Identifier la menace prioritaire dans l\'espace',
                    'Savoir qui peut être manipulé ou intimidé',
                    'Passer inaperçu dans cet espace pour cette scène',
                    'Créer une ouverture sur une cible précise',
                    'Sortir sans laisser de trace mémorable',
                ],
            },
        ],
    },

    'Edgerunner': {
        sections: [
            {
                title: 'Spécialisations opérationnelles',
                type: 'table',
                columns: ['Spécialisation', 'Description'],
                rows: [
                    ['Démolition', 'Explosifs, brèches, destruction contrôlée'],
                    ['Combat rapproché / CQC', 'Neutralisation silencieuse, combat au corps à corps'],
                    ['Tir de précision', 'Engagement longue distance, positions de tir'],
                    ['Commandement de terrain', 'Leadership sous feu, coordination en conditions dégradées'],
                    ['Infiltration tactique', 'Pénétration de périmètres sécurisés, extraction discrète'],
                    ['Guerre électronique', 'Brouillage, interception, disruption des communications'],
                    ['Médecine de combat', 'Stabilisation en conditions de terrain, triage'],
                    ['Pilotage sous pression', 'Véhicules terrestres et aériens en situation critique'],
                ],
            },
            {
                title: 'Retenues — Stratégie opérationnelle',
                type: 'list',
                items: [
                    'Éviter une complication anticipée',
                    'Contourner un piège identifié',
                    'Sortir d\'une situation impossible par une issue préparée',
                ],
            },
        ],
    },

    'Fixer': {
        sections: [
            {
                title: 'Réseau de contacts',
                type: 'table',
                columns: ['Contact', 'Description'],
                rows: [
                    ['Avocat véreux', 'Contrats, zones grises légales, protections judiciaires'],
                    ['Agent corpo (choisir)', 'Informateur interne, fuites de données, accès privilégiés'],
                    ['Banquier offshore', 'Blanchiment, transferts discrets, financement'],
                    ['Journaliste corrompu', 'Manipulation de l\'info, enterrer ou sortir un scoop'],
                    ['Officiel NUSA', 'Accès aux rouages politiques et administratifs'],
                    ['Receleur', 'Écoule le matériel chaud, source de matos rare'],
                    ['Chef de gang', 'Accès aux territoires, muscle disponible, info de rue'],
                    ['Ripperdoc discret', 'Soins et chrome hors circuit, sans questions'],
                    ['Broker indépendant', 'Mise en contact entre parties, arbitrage de deals'],
                    ['Passeur', 'Exfiltration, transport fantôme, franchissement de frontières'],
                ],
            },
            {
                title: 'Retenues — Mobiliser mon équipe',
                type: 'list',
                items: [
                    'Surveiller une cible ou un lieu',
                    'Récupérer ou livrer un objet',
                    'Exercer une pression discrète sur quelqu\'un',
                    'Extraire ou protéger une personne',
                    'Créer une diversion ou une couverture',
                ],
            },
            {
                title: 'Retenues — Réputation',
                type: 'list',
                items: [
                    'Il te doit quelque chose',
                    'Il veut te garder dans ses bonnes grâces',
                    'Il a peur de ta réputation',
                    'Il t\'ouvre une porte qu\'il aurait gardée fermée',
                ],
            },
        ],
    },

    'Investigator': {
        sections: [
            {
                title: 'Informateurs',
                type: 'table',
                columns: ['Informateur', 'Description'],
                rows: [
                    ['Ancien collègue flic', 'Accès aux dossiers, archives et procédures officielles'],
                    ['Légiste / médecin légiste', 'Causes de mort, analyses, dossiers médicaux confidentiels'],
                    ['Indic de rue', 'Info des bas-fonds, mouvements de gangs, rumeurs'],
                    ['Journaliste d\'investigation', 'Croisement de sources, dossiers enterrés, contacts médias'],
                    ['Avocat', 'Accès aux dossiers judiciaires, contacts dans le système'],
                    ['Technicien forensique', 'Analyses techniques, preuves numériques, traces physiques'],
                    ['Agent corpo retourné', 'Fuites internes, mouvements et décisions corporatifs'],
                    ['Passeur / contact underground', 'Accès aux milieux que la loi ne voit pas'],
                ],
            },
            {
                title: 'Retenues — Constituer un dossier',
                type: 'list',
                items: [
                    'Anticiper le prochain mouvement de la cible',
                    'Identifier son point faible ou sa vulnérabilité',
                    'Savoir à qui elle fait confiance',
                    'Comprendre ce qu\'elle cherche à cacher',
                ],
            },
            {
                title: 'Retenues — I need backup',
                type: 'list',
                items: [
                    'Couverture policière ou officielle sur une scène',
                    'Barrage ou bouclage d\'une zone',
                    'Intervention rapide sur place',
                    'Protection d\'un témoin ou d\'une personne',
                ],
            },
        ],
    },

    'Media': {
        sections: [
            {
                title: 'Contacts',
                type: 'table',
                columns: ['Contact', 'Description'],
                rows: [
                    ['Rédacteur en chef indépendant', 'Diffusion large, protection journalistique, réseau médias'],
                    ['Agent corpo communication', 'Fuites contrôlées, accès aux communiqués internes'],
                    ['Activiste / lanceur d\'alerte', 'Sources sensibles, documents compromettants'],
                    ['Officiel NUSA', 'Accès aux déclarations officielles et aux coulisses politiques'],
                    ['Hacker / data broker', 'Données volées, preuves numériques, identités cachées'],
                    ['Avocat spécialisé presse', 'Protection légale, injonctions, liberté de publication'],
                    ['Fixeur médiatique', 'Accès aux zones de conflit, contacts terrain'],
                    ['Informateur corpo', 'Fuites internes, scandales à venir'],
                ],
            },
            {
                title: 'Options — En direct live',
                type: 'list',
                items: [
                    'La pression publique force un PNJ à reculer ou à parler',
                    'Quelqu\'un dans l\'audience intervient physiquement',
                    'L\'info se propage et atteint quelqu\'un d\'important',
                    'La position du personnage est protégée tant que la diffusion est active',
                ],
            },
        ],
    },

    'Netrunner': {
        sections: [
            {
                title: 'Daemons',
                type: 'table',
                columns: ['Daemon', 'Description'],
                rows: [
                    ['Daemon briseur de glace', 'Réduit ou annule le coût en retenues pour briser une ICE'],
                    ['Daemon caméra', 'Réduit ou annule le coût pour couper les caméras'],
                    ['Daemon fantôme', 'Réduit ou annule le coût pour passer inaperçu dans un système'],
                    ['Daemon de verrouillage', 'Réduit ou annule le coût pour verrouiller / déverrouiller un accès'],
                    ['Daemon offensif', 'Réduit ou annule le coût pour bloquer une routine de sécurité'],
                    ['Daemon de localisation', 'Réduit ou annule le coût pour localiser un fichier ou une personne'],
                    ['Daemon d\'extraction', 'Réduit ou annule le coût sur Extraire des données'],
                    ['Daemon de contre-mesure', 'Réduit ou annule le coût sur Contre-mesures'],
                ],
            },
            {
                title: 'Retenues — Pénétrer un système',
                type: 'list',
                items: [
                    'Ouvrir ou verrouiller un accès',
                    'Couper les caméras',
                    'Localiser un fichier ou une personne dans le système',
                    'Briser une ICE',
                    'Bloquer une routine de sécurité',
                ],
            },
        ],
    },

    'Nomad': {
        sections: [
            {
                title: 'Contacts',
                type: 'table',
                columns: ['Contact', 'Description'],
                rows: [
                    ['Chef de clan allié', 'Ressources, refuges, réseau nomad étendu'],
                    ['Mécanicien itinérant', 'Pièces rares, réparations discrètes, véhicules modifiés'],
                    ['Contrebandier', 'Marchandises hors circuit, passages secrets, transport discret'],
                    ['Passeur de frontière', 'Franchissement de checkpoints, routes alternatives'],
                    ['Fournisseur de carburant', 'Approvisionnement en zones isolées, dépôts cachés'],
                    ['Receleur de pièces', 'Matériel de récup, équipement militaire surplus'],
                    ['Informateur des Badlands', 'Mouvements de troupes, activité corpo hors des villes'],
                    ['Ripperdoc de route', 'Soins en conditions de terrain, chrome sans traçabilité'],
                ],
            },
        ],
    },

    'Rockerboy': {
        sections: [
            {
                title: 'Contacts',
                type: 'table',
                columns: ['Contact', 'Description'],
                rows: [
                    ['Producteur indépendant', 'Diffusion, financement, accès aux scènes underground'],
                    ['Journaliste alternatif', 'Couverture médiatique, amplification du message'],
                    ['Agitateur politique', 'Réseau militant, mobilisation, contacts dans les mouvements'],
                    ['Chef de gang culturel', 'Territoire, protection, base de fans dans les rues'],
                    ['Receleur de substances', 'Approvisionnement discret, réseau de distribution'],
                    ['Avocat spécialisé artistes', 'Protection légale, contrats, litiges avec les corpos'],
                    ['Technicien son/lumière', 'Accès aux équipements, sabotage ou mise en scène'],
                    ['Fixeur de concerts', 'Lieux alternatifs, organisation d\'événements off-grid'],
                ],
            },
            {
                title: 'Retenues — Visionnaire',
                type: 'list',
                items: [
                    'La cible adhère à ta vision et agit dans ton sens',
                    'Elle te protège ou t\'aide activement',
                    'Elle se retourne contre quelqu\'un que tu désignes',
                ],
            },
        ],
    },

    'Solo': {
        sections: [
            {
                title: 'Contacts',
                type: 'table',
                columns: ['Contact', 'Description'],
                rows: [
                    ['Fixeur de terrain', 'Missions, mises en relation, info sur les contrats disponibles'],
                    ['Armurier black market', 'Armes non traçables, munitions spéciales, modifications'],
                    ['Ripperdoc discret', 'Soins sans questions, chrome hors circuit officiel'],
                    ['Mercenaire freelance', 'Appui tactique, muscle de confiance, couverture'],
                    ['Informateur corpo', 'Mouvements de sécurité, agendas internes, cibles'],
                    ['Passeur / exfiltrateur', 'Extraction rapide, routes de fuite, faux papiers'],
                    ['Faussaire', 'Identités, accréditations, documents officiels'],
                    ['Technicien en surveillance', 'Pose de matos, contre-surveillance, écoutes'],
                ],
            },
        ],
    },

    'Techie': {
        sections: [
            {
                title: 'Expertises',
                type: 'table',
                columns: ['Expertise', 'Description'],
                rows: [
                    ['Armurier', 'Armes, munitions, modifications balistiques'],
                    ['Artificier', 'Explosifs, pièges, détonateurs, charges'],
                    ['Cybernéticien', 'Cyberware, interfaces neurales, prothèses'],
                    ['Électronicien', 'Systèmes électroniques, circuits, drones'],
                    ['Mécano', 'Véhicules, moteurs, systèmes mécaniques'],
                    ['Médecin', 'Soins, chirurgie, pharmacologie, stabilisation'],
                ],
            },
        ],
    },
};

const PLAYBOOKS = Object.keys(REFERENCE_DATA);

// ── Sous-composants ───────────────────────────────────────────────────────────

const RefList = ({ items }) => (
    <ul className="flex flex-col gap-1">
        {items.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm">
                <span className="cp-font-ui shrink-0" style={{ color: 'var(--color-primary)' }}>›</span>
                <span style={{ color: 'var(--color-text-default)' }}>{item}</span>
            </li>
        ))}
    </ul>
);

const RefTable = ({ columns, rows }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
            <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {columns.map((col, i) => (
                    <th
                        key={i}
                        className="text-left py-1.5 pr-4 text-xs cp-font-ui uppercase tracking-widest"
                        style={{ color: 'var(--color-text-muted)' }}
                    >
                        {col}
                    </th>
                ))}
            </tr>
            </thead>
            <tbody>
            {rows.map((row, i) => (
                <tr
                    key={i}
                    style={{ borderBottom: '1px solid var(--color-border-subtle, var(--color-border))' }}
                >
                    {row.map((cell, j) => (
                        <td
                            key={j}
                            className="py-1.5 pr-4 align-top"
                            style={{
                                color: j === 0
                                    ? 'var(--color-text-default)'
                                    : 'var(--color-text-muted)',
                                fontWeight: j === 0 ? '600' : '400',
                            }}
                        >
                            {cell}
                        </td>
                    ))}
                </tr>
            ))}
            </tbody>
        </table>
    </div>
);

const RefSection = ({ section }) => (
    <div className="flex flex-col gap-3">
        <h3
            className="text-xs cp-font-ui uppercase tracking-widest"
            style={{ color: 'var(--color-primary)' }}
        >
            {section.title}
        </h3>
        {section.type === 'list'
            ? <RefList items={section.items} />
            : <RefTable columns={section.columns} rows={section.rows} />
        }
    </div>
);

// ── Composant principal ───────────────────────────────────────────────────────

const ReferenceTab = ({ characterPlaybook }) => {
    const defaultPlaybook = characterPlaybook && PLAYBOOKS.includes(characterPlaybook)
        ? characterPlaybook
        : PLAYBOOKS[0];

    const [selected, setSelected] = useState(defaultPlaybook);

    const data = REFERENCE_DATA[selected];

    return (
        <div className="flex flex-col h-full overflow-hidden">

            {/* ── Pills de navigation ───────────────────────────────────── */}
            <div
                className="flex flex-wrap gap-1.5 p-3 shrink-0"
                style={{ borderBottom: '1px solid var(--color-border)' }}
            >
                {PLAYBOOKS.map(pb => (
                    <button
                        key={pb}
                        onClick={() => setSelected(pb)}
                        className="px-3 py-1 text-xs cp-font-ui uppercase tracking-wide rounded transition-all"
                        style={{
                            background:  selected === pb ? 'var(--color-primary)' : 'var(--color-surface-alt)',
                            color:       selected === pb ? 'var(--color-bg)'      : 'var(--color-text-muted)',
                            border:      selected === pb
                                ? '1px solid var(--color-primary)'
                                : '1px solid var(--color-border)',
                            cursor: 'pointer',
                        }}
                    >
                        {pb}
                    </button>
                ))}
            </div>

            {/* ── Contenu ───────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
                {data?.sections.map((section, i) => (
                    <RefSection key={i} section={section} />
                ))}
            </div>

        </div>
    );
};

export default ReferenceTab;