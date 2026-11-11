// src/client/src/ui/hooks/useConfirm.jsx
import React, { useState, useCallback } from 'react';
import ConfirmModal from "../modal/ConfirmModal.jsx";

const useConfirm = () => {
    const [opts, setOpts] = useState(null);

    const confirm = useCallback((options) =>
        new Promise((resolve) => {
            setOpts({
                ...options,
                onConfirm: () => { setOpts(null); resolve(true);  },
                onCancel:  () => { setOpts(null); resolve(false); },
            });
        }), []
    );

    const confirmEl = opts ? <ConfirmModal {...opts} /> : null;

    return { confirm, confirmEl };
};

export default useConfirm;