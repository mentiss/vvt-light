// src/client/src/components/ui/HamburgerMenuItems.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Éléments prêts à l'emploi du menu hamburger (documentations/spec_ui_menu.md §5).
// Chacun embarque son action, sa modale et l'état d'ouverture ; la modale est
// rendue dans l'emplacement à modales de la page (HostedModal), à côté du
// bouton et non dedans (un clic dans la modale ne remonte pas à l'élément).
//
// Props communes : label (libellé par défaut), icon (absent : icône par défaut,
// nœud : remplace, null : aucune), className.
// Le slug est déduit de l'adresse (useSystem), jamais passé en prop.
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import { HamburgerMenuIcon, HamburgerMenuItem } from './HamburgerMenu.jsx';
import { HostedModal } from './ModalHost.jsx';
import { useSystem } from '../../hooks/useSystem.js';
import { useAuth } from '../../context/AuthContext.jsx';
import AvatarUploader       from '../AvatarUploader.jsx';
import AccessCodeModal      from '../modals/AccessCodeModal.jsx';
import CharacterListModal   from '../modals/CharacterListModal.jsx';
import DiceConfigModal      from '../modals/DiceConfigModal.jsx';
import FreeDiceModal        from '../modals/FreeDiceModal.jsx';
import TableManagementModal from '../gm/modals/TableManagementModal.jsx';

const pickIcon = (icon, name) => (icon === undefined ? <HamburgerMenuIcon name={name} /> : icon);

// ── Liens ────────────────────────────────────────────────────────────────────

export const HamburgerMenuItemCreateCharacter = ({ label = 'Créer un personnage', icon, className }) => {
    const { slug } = useSystem();
    return <HamburgerMenuItem href={`/${slug}/creation`} icon={pickIcon(icon, 'create')} className={className}>{label}</HamburgerMenuItem>;
};

export const HamburgerMenuItemGMInterface = ({ label = 'Interface MJ', icon, className }) => {
    const { slug } = useSystem();
    return <HamburgerMenuItem href={`/${slug}/gm`} icon={pickIcon(icon, 'crown')} className={className}>{label}</HamburgerMenuItem>;
};

export const HamburgerMenuItemPlayerView = ({ label = 'Vue joueur', icon, className }) => {
    const { slug } = useSystem();
    return <HamburgerMenuItem href={`/${slug}/`} icon={pickIcon(icon, 'eye')} className={className}>{label}</HamburgerMenuItem>;
};

export const HamburgerMenuItemHome = ({ label = 'Accueil de la plateforme', icon, className }) => (
    <HamburgerMenuItem href="/" icon={pickIcon(icon, 'home')} className={className}>{label}</HamburgerMenuItem>
);

// ── Déconnexion (joueur et MJ) : retour à l'accueil de la plateforme (D-4) ───

export const HamburgerMenuItemLogout = ({ label = 'Déconnexion', icon, className }) => {
    const { logout } = useAuth();
    const handleLogout = async () => {
        await logout();
        window.location.href = '/';
    };
    return <HamburgerMenuItem onClick={handleLogout} icon={pickIcon(icon, 'logout')} danger className={className}>{label}</HamburgerMenuItem>;
};

// ── Modales ──────────────────────────────────────────────────────────────────

export const HamburgerMenuItemSwitchCharacter = ({ currentCharId, label = 'Changer de personnage', icon, className }) => {
    const { slug } = useSystem();
    const [open, setOpen] = useState(false);
    return (
        <>
            <HamburgerMenuItem onClick={() => setOpen(true)} icon={pickIcon(icon, 'people')} className={className}>{label}</HamburgerMenuItem>
            <HostedModal>
                {open && (
                    <CharacterListModal
                        isOpen
                        currentCharId={currentCharId}
                        onClose={() => setOpen(false)}
                        onSelect={(c) => { window.location.href = `/${slug}/${c.accessUrl}`; }}
                    />
                )}
            </HostedModal>
        </>
    );
};

/** onChange(avatar) : le slug enregistre (patchImmediate, buffer d'édition…). */
export const HamburgerMenuItemAvatar = ({ currentAvatar, onChange, label = "Changer l'avatar", icon, className }) => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <HamburgerMenuItem onClick={() => setOpen(true)} icon={pickIcon(icon, 'portrait')} className={className}>{label}</HamburgerMenuItem>
            <HostedModal>
                {open && (
                    <AvatarUploader
                        currentAvatar={currentAvatar}
                        onAvatarChange={onChange}
                        onClose={() => setOpen(false)}
                    />
                )}
            </HostedModal>
        </>
    );
};

/** onSuccess(updatedCharacter) : le slug répercute le nouveau code ; la modale se ferme ensuite. */
export const HamburgerMenuItemAccessCode = ({ character, onSuccess, label = "Code d'accès", icon, className }) => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <HamburgerMenuItem onClick={() => setOpen(true)} icon={pickIcon(icon, 'key')} className={className}>{label}</HamburgerMenuItem>
            <HostedModal>
                {open && (
                    <AccessCodeModal
                        isOpen
                        character={character}
                        onClose={() => setOpen(false)}
                        onSuccess={(updated) => { onSuccess?.(updated); setOpen(false); }}
                    />
                )}
            </HostedModal>
        </>
    );
};

/** Joueur : characterId, characterName, sessionId. MJ : sessionId, isGM. */
export const HamburgerMenuItemFreeDice = ({ characterId, characterName, sessionId, isGM = false, label = 'Jet de dés libre', icon, className }) => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <HamburgerMenuItem onClick={() => setOpen(true)} icon={pickIcon(icon, 'dice')} className={className}>{label}</HamburgerMenuItem>
            <HostedModal>
                {open && (
                    <FreeDiceModal
                        characterId={characterId}
                        characterName={characterName}
                        sessionId={sessionId}
                        isGM={isGM}
                        onClose={() => setOpen(false)}
                    />
                )}
            </HostedModal>
        </>
    );
};

export const HamburgerMenuItemDiceConfig = ({ label = 'Configuration des dés', icon, className }) => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <HamburgerMenuItem onClick={() => setOpen(true)} icon={pickIcon(icon, 'settings')} className={className}>{label}</HamburgerMenuItem>
            <HostedModal>
                {open && <DiceConfigModal onClose={() => setOpen(false)} />}
            </HostedModal>
        </>
    );
};

/** MJ. onSelectTable(session | null) : table choisie (ou désactivée). */
export const HamburgerMenuItemTableManagement = ({ activeSessionId, onSelectTable, label = 'Gestion des tables', icon, className }) => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <HamburgerMenuItem onClick={() => setOpen(true)} icon={pickIcon(icon, 'tables')} className={className}>{label}</HamburgerMenuItem>
            <HostedModal>
                {open && (
                    <TableManagementModal
                        isOpen
                        onClose={() => setOpen(false)}
                        activeSessionId={activeSessionId}
                        onSelectTable={onSelectTable}
                    />
                )}
            </HostedModal>
        </>
    );
};
