// src/client/src/systems/cyberpunk/config/tags.js
// ─────────────────────────────────────────────────────────────────────────────
// Tags narratifs : suggestions par type d'entité, classes de type.
// ─────────────────────────────────────────────────────────────────────────────

export const TAG_SUGGESTIONS_BY_TYPE = {
    character: [
        { text: '+blessé',       variant: 'negative' },
        { text: '+amoché',       variant: 'negative' },
        { text: '+hémorragie',   variant: 'negative' },
        { text: '+flatline imminent', variant: 'negative' },
        { text: '+sonné',        variant: 'negative' },
        { text: '+endetté',      variant: 'negative' },
        { text: '+épuisé',       variant: 'negative' },
        { text: '+traumatisé',   variant: 'negative' },
        { text: '+convalescent', variant: 'neutral' },
        { text: '+juiced',       variant: 'neutral' },
        { text: '+paranoïaque',     variant: 'negative' },
        { text: '+dissocié',        variant: 'negative' },
    ],
    cyberware: [
        { text: '+défaillant',   variant: 'negative' },
        { text: '+dégradation',  variant: 'negative' },
        { text: '+douloureux',   variant: 'negative' },
        { text: '+aliénant',     variant: 'negative' },
        { text: '+médiocre',     variant: 'negative' },
        { text: '+crypté',       variant: 'positive' },
        { text: '+furtif',       variant: 'positive' },
        { text: '+modifié',      variant: 'neutral'  },
    ],
    relation: [
        { text: '+dette',        variant: 'negative' },
        { text: '+compromis',    variant: 'negative' },
        { text: '+menacé',       variant: 'negative' },
        { text: '+disparu',      variant: 'negative' },
        { text: '+fiable',       variant: 'positive' },
        { text: '+allié',        variant: 'positive' },
        { text: '+redevable',    variant: 'positive' },
        { text: '+suspect',      variant: 'neutral'  },
        { text: '+flatlined',    variant: 'negative'  },
    ],
    item: [
        { text: '+défaillant',   variant: 'negative' },
        { text: '+dégradé',      variant: 'negative' },
        { text: '+volé',         variant: 'negative' },
        { text: '+tracé',        variant: 'negative' },
        { text: '+modifié',      variant: 'neutral'  },
        { text: '+rare',         variant: 'positive' },
        { text: '+militaire',    variant: 'neutral'  },
        { text: '+illégal',      variant: 'negative' },
        { text: '+biométrique',  variant: 'neutral' },
        { text: '+smartlink',    variant: 'neutral' },
        { text: '+jetable',      variant: 'neutral' },
    ],
};

// Classes de type d'un tag (theme.css .cp-tag.is-*)
export const TAG_VARIANT_CLASS = {
    positive: 'is-positive',
    negative: 'is-negative',
    neutral:  'is-neutral',
};
