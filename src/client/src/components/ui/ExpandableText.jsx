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
            <button
                onClick={() => setExpanded(v => !v)}
                className="ml-1 text-xs"
                style={{
                    color:      'var(--color-primary)',
                    background: 'none',
                    border:     'none',
                    cursor:     'pointer',
                    padding:    0,
                }}
            >
                {expanded ? 'Voir moins' : 'Voir plus'}
            </button>
        </span>
    );
};

export default ExpandableText;