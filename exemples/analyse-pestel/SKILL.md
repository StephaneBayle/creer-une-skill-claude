---
name: analyse-pestel
description: Réalise une analyse PESTEL d'une entreprise, d'un projet, d'un secteur ou d'un territoire. Utiliser quand on demande un PESTEL, une analyse du macro-environnement ou des facteurs externes.
---

# Analyse PESTEL

Une analyse PESTEL passe en revue les **facteurs externes** qui pèsent sur un sujet : Politiques,
Économiques, Sociologiques, Technologiques, Écologiques et Légaux. Elle sert à décider (lancer, investir,
s'implanter), à nourrir un dossier ou à apprendre la méthode. Sa valeur tient à trois choses : des facteurs
**propres au sujet** (et non des généralités valables partout), une **évaluation** qui distingue ce qui est
acquis de ce qui reste incertain, et des **conséquences** concrètes pour le lecteur.

## 1. Cadrer

Il faut savoir :
- **le sujet** : entreprise, projet, secteur ou territoire, et ce qu'il fait ou vend ;
- **la zone** : commune, région, pays, Europe… (les facteurs politiques et légaux en dépendent) ;
- **l'horizon** : par défaut 3 à 5 ans ;
- **la finalité** : décision à prendre, dossier, cours. Elle sert d'étalon à toute l'évaluation.

Si la demande laisse des trous, pose **au plus trois questions** en une fois. Si la personne veut aller vite
ou si la réponse se devine, avance avec des **hypothèses explicites** (« Hypothèse : horizon 2030, France »)
plutôt que de bloquer : une analyse à corriger vaut mieux qu'un interrogatoire.

## 2. Collecter les facteurs

Retiens **2 à 4 facteurs par dimension**, chacun formulé comme un fait ou une tendance précise, rattaché au
sujet. « L'inflation » est une généralité ; « la hausse du prix des matières premières réduit la marge des
épiceries de centre-ville » est un facteur utile.

Quand une dimension paraît pauvre ou qu'un facteur hésite entre deux cases, lis
`references/grille-pestel.md` : questions guides et règles de classement par dimension.

Sur les sources, dans cet ordre :
1. les **documents fournis** par la personne, qui priment sur tout le reste ;
2. si la recherche web est disponible, des sources récentes, en préférant textes officiels et statistiques
   publiques ;
3. sinon, tes connaissances, en le disant, et en marquant « à vérifier » tout chiffre, loi ou date précise.
   N'invente jamais un chiffre : mieux vaut une tendance qualitative qu'une fausse précision.

Chaque facteur porte sa source dans le tableau : un renvoi `[n]` vers la liste en fin de rapport, ou `CG`
(connaissances générales, à vérifier).

## 3. Évaluer

Pour chaque facteur, note :
- **Effet** : opportunité (+) ou menace (−). Un facteur à double tranchant garde son effet **dominant** ;
  l'autre versant se traite dans les interactions. Un facteur ne compte qu'une fois.
- **Impact**, mesuré **par rapport à la finalité** : 1 ne change pas la décision, 2 en modifie les conditions
  (coût, calendrier, ampleur), 3 peut la remettre en cause ;
- **Probabilité** : 1 incertaine, 2 probable, 3 quasi certaine ou déjà là ;
- **Horizon** : court (< 1 an), moyen (1–3 ans), long (> 3 ans).

Le score **impact × probabilité** (1 à 9) classe les facteurs ; à égalité, l'impact le plus fort passe
devant, puis l'horizon le plus court. Mais le score seul cache l'essentiel : un facteur à fort impact et à
issue ouverte obtient une note moyenne alors que c'est lui qui peut faire basculer la décision. Sépare donc :
- les **incertitudes critiques** : impact 3 et probabilité 1 ou 2, quel que soit le score. On ne peut pas
  parier dessus ; on les surveille avec un indicateur et un seuil qui déclenche une action ;
- tous les autres facteurs, que le plan doit intégrer : ils alimentent opportunités et menaces.

Cherche enfin les **interactions** : deux facteurs qui se renforcent ou se neutralisent changent souvent plus
la conclusion que chacun pris seul.

## 4. Restituer

Utilise ce format, dans cet ordre :

```markdown
# Analyse PESTEL — [sujet], [zone], horizon [année]

> **Cadrage** : [finalité] · Date : [date de l'analyse] · Hypothèses : [liste courte]

## En bref
[5 lignes maximum qui répondent à la finalité. Décision : un verdict conditionnel (« oui si…, non si… »).
Dossier : le message clé. Cours : ce que l'exemple apprend de la méthode.]

## Tableau PESTEL
| Dimension | Facteur | Effet | Impact | Proba. | Score | Horizon | Source |
|---|---|---|---|---|---|---|---|
| Politique | … | + / − | 1-3 | 1-3 | 1-9 | court/moyen/long | [n] / CG |

## Interactions clés
1 à 3 lignes : quels facteurs se combinent, et ce que ça change pour le sujet.

## Priorités
**Incertitudes critiques à surveiller** : pour chacune, l'indicateur à suivre et le seuil qui déclenche
une action.
**Opportunités à saisir** : les 3 meilleurs scores parmi les « + » restants, une phrase chacun sur ce
qu'ils permettent.
**Menaces à traiter** : les 3 meilleurs scores parmi les « − » restants, une phrase chacun sur le risque.

## Recommandations
3 à 5 actions concrètes, chacune reliée au facteur qui la justifie. Au moins une prépare une incertitude
critique.

## Limites de l'analyse
Sources numérotées (ou absence de recherche web), hypothèses, points à vérifier.

*Pour aller plus loin : croiser ce PESTEL avec les forces et faiblesses internes dans une SWOT.*
```

Pour le ton et le niveau de détail attendus, regarde `exemples/rapport-exemple.md`.

## Pièges à éviter

- **Mélanger interne et externe.** Le PESTEL ne parle que de l'environnement. « Notre équipe est petite »
  est une faiblesse interne (SWOT), pas un facteur PESTEL.
- **Confondre macro-environnement et secteur.** Concurrents, clients et fournisseurs relèvent de l'analyse
  du secteur (les cinq forces de Porter). Retiens la **cause** externe (une loi, une tendance), pas le
  concurrent qu'elle fait entrer.
- **Ranger un facteur dans deux cases.** Choisis la dimension dominante : une nouvelle loi va dans « Légal »,
  même si elle a un effet économique ; l'effet se lit dans la colonne « Effet ».
- **Lister sans conclure.** Un tableau sans priorités ni recommandations n'aide personne à décider.
- **Rester générique.** Si un facteur pourrait figurer tel quel dans le PESTEL de n'importe quelle
  entreprise, reformule-le pour dire en quoi il touche ce sujet-là.
