// src/client/src/systems/zoneblanche/config/maximes.js
// Catalogue Maximes complet (cf. spec §7) — 4 pools liés chacun à un Principe,
// quotas stricts par archétype (5 sur le Principe majeur, 3 sur les autres).
// Picklist UI à la création / déblocage : le stockage reste texte libre
// (characters.<principe>_maxime) ; ce catalogue ne fait que préremplir le choix.

export const MAXIMES_POOLS = {
    logique: [
        "Toute anomalie a une explication. Mon travail, c'est de la trouver avant d'avoir peur.",
        "Un phénomène qu'on ne peut pas reproduire est un phénomène qu'on ne comprend pas encore.",
        "Éliminer l'impossible d'abord. Ce qui reste mérite qu'on s'y attarde.",
        "L'ordre dans lequel les choses arrivent dit toujours quelque chose. Toujours.",
        "Croire ou ne pas croire n'est pas la question. Comprendre est la question.",
        "Un esprit a des habitudes, comme tout le monde. Trouvez le motif, vous trouvez l'esprit.",
        "Je n'ai jamais convaincu personne en argumentant. J'ai convaincu en démontrant.",
        "Je ne choisis pas l'explication qui me rassure. Je choisis celle qui survit à la vérification.",
        "Chacun son poste, chacun sa raison d'y être. Une équipe qui sait pourquoi elle fait les choses n'a pas le temps d'avoir peur.",
        "Avant d'interroger les morts, je lis ce qu'ils ont signé de leur vivant.",
        "Comprendre une chose, c'est déjà cesser de la subir.",
        "Je ne connais rien à leurs machines. Mais je sais quand une histoire ne tient pas debout.",
        "Un problème à la fois. C'est comme ça qu'on démêle un nœud de câbles, c'est comme ça qu'on traverse une nuit.",
    ],
    instinct: [
        "La peur est un message. La refuser, c'est raccrocher au nez de celui qui prévient.",
        "Le silence n'est jamais vide. Il suffit de savoir l'écouter.",
        "Réfléchir trop longtemps, c'est déjà mourir un peu. Je fais confiance à mon premier geste.",
        "Il y a une différence entre le froid d'une cave et le froid d'une présence. Ma peau la connaît.",
        "Une intuition qu'on ignore revient toujours. Plus tard, plus fort, et rarement pour de bonnes nouvelles.",
        "Un lieu vous accueille ou vous supporte. Aucun instrument ne mesure la différence, moi si.",
        "Ce métier ne s'apprend pas. Il se réveille.",
        "Mon premier souvenir n'est pas une image. C'est une sensation. Elle ne m'a jamais quittée.",
        "Je ne suis pas devenu sensible. J'ai juste arrêté de faire semblant de ne pas l'être.",
        "Quand quelqu'un a vraiment vu quelque chose, ça se lit sur lui des semaines après. Ce regard-là ne s'invente pas.",
        "Il y a des pannes normales et des pannes qui n'en sont pas. Et croyez-moi, on préfère les premières.",
    ],
    technique: [
        "On ne meurt pas d'un fantôme. On meurt d'une lampe qui lâche au mauvais moment.",
        "L'amateurisme tue plus sûrement que n'importe quelle entité.",
        "Chaque problème a un outil. Chaque outil a un réglage. Chaque réglage a son moment.",
        "Je ne crois pas aux fantômes. Je crois aux capteurs qui les enregistrent.",
        "Le terrain décide, le matériel suit, jamais l'inverse.",
        "Un plan B n'est pas une option, c'est le minimum syndical.",
        "Il n'y a pas de conditions impossibles. Il y a des configurations pas encore trouvées.",
        "L'obscurité est un problème technique. Les problèmes techniques ont des solutions.",
        "Ce qui est fait correctement n'est fait qu'une fois.",
        "L'exactitude n'est pas de la froideur. C'est du respect — pour les vivants comme pour les morts.",
        "Chaque chose dans l'ordre, chaque ordre pour une raison. C'est ma manière de prier.",
        "Je ne sais pas réparer grand-chose. Mais je sais tenir une lampe sans trembler, et certains soirs c'est le poste le plus important.",
        "Mes rituels ont leurs réglages, comme leurs machines. Une bougie mal placée, c'est une porte mal fermée.",
    ],
    presence: [
        "Les gens ne se confient pas à un micro. Ils se confient à quelqu'un qui écoute.",
        "Je parle aux vivants comme aux morts : avec respect, et sans baisser les yeux.",
        "Tout est bon à filmer, surtout ce qui nous terrifie. C'est pour ça qu'on nous regarde.",
        "Chaque témoin a droit à ma confiance le temps de son récit. Après, on vérifie.",
        "Le trac et la terreur, c'est le même animal. Je l'ai dressé il y a longtemps.",
        "Le public sent le mensonge à travers l'écran. Alors je ne mens jamais — je choisis juste ce que je montre.",
        "Chaque lieu a un gardien, chaque témoin une blessure. On n'entre dans aucun des deux sans être invité.",
        "Savoir se taire au bon moment, c'est aussi de l'animation.",
        "Le lien qu'on tisse avec les gens, c'est le seul matériel qui ne tombe jamais en panne.",
        "On ne survit pas à une présence en se faisant petit. On lui montre qu'on tient debout.",
        "Les morts aussi ont besoin qu'on les regarde en face. Personne ne l'a fait depuis longtemps, c'est souvent pour ça qu'ils crient.",
        "Il faut être deux pour une possession. Je refuse simplement d'être le second.",
        "Je ne parle pas beaucoup. Mais quand je dis que ça va tenir, ça tient.",
    ],
};

// Quotas stricts par archétype × Principe — indices 1-based dans MAXIMES_POOLS.
// Le Principe majeur de l'archétype porte le quota de 5 (débloqué dès la
// création) ; les 3 autres portent chacun un quota de 3 (débloqués si le
// Principe correspondant atteint le rang 6).
export const MAXIMES_QUOTAS = {
    animateur:    { logique: [1, 5, 9],           instinct: [1, 2, 10],       technique: [2, 5, 9],        presence: [3, 5, 6, 8, 9] },
    guest_star:   { logique: [5, 11, 12],         instinct: [1, 5, 9],        technique: [1, 2, 12],       presence: [1, 4, 5, 9, 10] },
    ingenieur:    { logique: [2, 7, 8],           instinct: [3, 5, 11],       technique: [3, 4, 6, 7, 8],  presence: [8, 9, 13] },
    operateur:    { logique: [2, 9, 13],          instinct: [3, 4, 5],        technique: [1, 2, 5, 8, 9],  presence: [6, 8, 9] },
    scientifique: { logique: [1, 3, 6, 8, 10],    instinct: [5, 9, 10],       technique: [3, 4, 7],        presence: [1, 4, 8] },
    producteur:   { logique: [2, 5, 7, 9, 11],    instinct: [5, 6, 10],       technique: [5, 6, 9],        presence: [3, 4, 6] },
    medium:       { logique: [6, 10, 11],         instinct: [2, 4, 7, 8, 9],  technique: [10, 11, 13],     presence: [2, 7, 11] },
    exorciste:    { logique: [4, 6, 10],          instinct: [1, 3, 5, 6, 10], technique: [9, 10, 11],      presence: [10, 11, 12] },
};

/**
 * Retourne les textes de maximes accessibles à un archétype pour un Principe donné.
 * @param {string} archetypeKey
 * @param {string} principeKey
 * @returns {string[]}
 */
export function getMaximesForArchetype(archetypeKey, principeKey) {
    const indices = MAXIMES_QUOTAS[archetypeKey]?.[principeKey] ?? [];
    const pool = MAXIMES_POOLS[principeKey] ?? [];
    return indices.map(i => pool[i - 1]).filter(Boolean);
}