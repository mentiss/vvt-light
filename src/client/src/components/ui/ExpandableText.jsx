// src/client/src/components/ui/ExpandableText.jsx

import { useState } from 'react';

const ExpandableText = ({ text, maxLength = 120, className = '', style = {} }) => {
    const [expanded, setExpanded] = useState(false);

    if (!text || text.length <= maxLength) {
        return <span className={className} style={style}>{text}</span>;
    }

    return (
        <span className={className} style={style}>
            {expanded ? text : `${text.slice(0, maxLength)}…`}
            {/* stopPropagation : le texte peut vivre dans une carte cliquable */}
            <button
                type="button"
                onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
                className="ml-1 text-xs text-primary bg-transparent border-0 p-0 cursor-pointer"
            >
                {expanded ? 'Voir moins' : 'Voir plus'}
            </button>
        </span>
    );
};

export default ExpandableText;