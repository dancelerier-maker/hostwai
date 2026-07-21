# Hostwai

L'app complète, en un seul projet : le dashboard (bouton ON/OFF + historique + réservations)
**et** le backend qui répond vraiment au téléphone. Twilio reçoit l'appel, transcrit ce que dit
le client, envoie le texte ici, Claude génère la réponse, Twilio la prononce à voix haute — en
boucle jusqu'à la fin de l'appel. Le bouton ON/OFF du dashboard contrôle directement si l'IA
décroche ou si l'appel part au staff.

## Ce qu'il te faut avant de commencer

1. **Un compte Twilio** (twilio.com) — gratuit pour tester, avec un numéro de téléphone (~1$/mois).
2. **Une clé API Anthropic** (console.anthropic.com) — `ANTHROPIC_API_KEY`.
3. **Un endroit où déployer** — Vercel est le plus simple pour un projet Next.js (gratuit pour démarrer).

## Étapes

### 1. Installer et configurer

```bash
npm install
cp .env.example .env.local
# remplis ANTHROPIC_API_KEY dans .env.local
```

### 2. Personnaliser le restaurant

Édite `lib/restaurant.ts` — nom, horaires, langues, infos utiles, et le numéro du staff
vers lequel transférer les appels compliqués.

### 3. Déployer

```bash
npx vercel deploy
```

(ou connecte le repo GitHub à Vercel directement — plus simple pour les mises à jour futures)

Note ton URL de déploiement, par exemple `https://restaurant-ia.vercel.app`.

### 4. Configurer Twilio

Dans la [console Twilio](https://console.twilio.com) :
1. Achète un numéro de téléphone (ou utilise un numéro existant transféré vers Twilio).
2. Dans la configuration du numéro, section **Voice & Fax** :
   - "A call comes in" → **Webhook**, méthode **POST**
   - URL : `https://ton-domaine.vercel.app/api/voice/incoming`
3. Sauvegarde.

C'est tout. Appelle le numéro Twilio — l'agent doit décrocher et te répondre.

### 5. Activer les SMS de confirmation

Dès qu'une réservation est prise, deux SMS partent automatiquement (via Twilio, même compte que pour la voix) :
- **Au client** : confirmation de sa réservation, sur le numéro qui a appelé.
- **Au staff** (si `STAFF_PHONE_NUMBER` est configuré) : notification de la nouvelle réservation.

Ajoute ces variables d'environnement (Twilio Console > Account) :
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER` (le même numéro que celui configuré pour la voix)

⚠️ Tant que ton compte Twilio est en mode "trial" (pas de carte bancaire ajoutée), les SMS ne
partent que vers des numéros que tu as vérifiés manuellement dans la console Twilio.

### 6. Configurer le paiement (Stripe)

Chaque restaurant a **1 heure d'appels offerte**, décomptée à la seconde près. Ensuite, deux forfaits
avec paiement en ligne, plus un forfait Enterprise sur devis (pas de Stripe, juste un lien email) :

| Forfait | Prix | Minutes incluses | Dépassement |
|---|---|---|---|
| Starter | 99€/mois | 100 min | 0,30€/min |
| Pro | 249€/mois | 500 min | 0,25€/min |
| Enterprise | Sur devis | Personnalisé | — |

1. Crée un compte sur [stripe.com](https://stripe.com).
2. Crée **deux produits** avec prix récurrent mensuel : un à 99€ (Starter), un à 249€ (Pro) → note
   les deux `price_id`.
3. Dans `.env.local` / les variables d'environnement Vercel, ajoute :
   - `STRIPE_SECRET_KEY` (Developers > API keys)
   - `STRIPE_PRICE_ID_STARTER` et `STRIPE_PRICE_ID_PRO`
   - `STRIPE_WEBHOOK_SECRET` (voir étape 4)
   - `NEXT_PUBLIC_APP_URL` (ton URL Vercel)
4. Dans Stripe, Developers > Webhooks > Add endpoint :
   - URL : `https://ton-domaine.vercel.app/api/billing/webhook`
   - Événements à écouter : `checkout.session.completed`, `customer.subscription.deleted`
   - Copie le "Signing secret" dans `STRIPE_WEBHOOK_SECRET`.
5. Dans Twilio, configure aussi le champ **"Call status changes"** (à côté de "A call comes in") :
   - URL : `https://ton-domaine.vercel.app/api/voice/status`
   - C'est ce qui permet de décompter le temps réellement utilisé (essai ET forfait payant).

**Important — ce qui n'est PAS encore automatisé :** le dépassement de minutes (`overageCostThisPeriod`
dans `/api/billing/status`) est **calculé et affiché**, mais pas facturé automatiquement — Stripe ne
prélève que le montant fixe de l'abonnement. Pour facturer le dépassement réellement, il faut soit
passer à un prix Stripe "metered" (usage-based) et envoyer des usage records, soit générer une facture
manuelle/complémentaire chaque mois avec `stripe.invoiceItems.create`. C'est la prochaine étape si tu
veux automatiser complètement la facturation.

### 7. Utiliser le dashboard

Une fois déployé, `https://ton-domaine.vercel.app/` affiche le site vitrine, et `/dashboard` le vrai
tableau de bord : bouton ON/OFF (qui contrôle réellement si l'IA décroche), historique des appels,
réservations, et un bandeau qui affiche le temps d'essai gratuit restant (ou un bouton "S'abonner" une
fois épuisé). Tout se rafraîchit automatiquement toutes les 5 secondes.

## Mettre l'app sur le Google Play Store

L'app est maintenant une **PWA installable** (`public/manifest.json`, `public/sw.js`, icônes). Pour la
publier sur le Play Store, on l'empaquette en **Trusted Web Activity (TWA)** avec l'outil officiel
Google **Bubblewrap** — ça prend ton site déployé et en fait une vraie app Android, sans réécrire de code.

1. Déploie d'abord l'app (étapes ci-dessus) — il te faut une URL en HTTPS, par exemple
   `https://restaurant-ia.vercel.app`.
2. Installe Bubblewrap :
   ```bash
   npm i -g @bubblewrap/cli
   ```
3. Génère le projet Android :
   ```bash
   bubblewrap init --manifest https://ton-domaine.vercel.app/manifest.json
   ```
   Bubblewrap pose quelques questions (nom du package Android, ex. `com.tonentreprise.iareceptionist`)
   puis génère un projet Android complet.
4. Build le paquet :
   ```bash
   bubblewrap build
   ```
   → produit un fichier `.aab` (Android App Bundle), c'est ce que Google Play attend.
5. **Digital Asset Links** — pour que Chrome enlève la barre d'adresse dans l'app (sinon ça ressemble à
   un simple onglet de navigateur), il faut prouver que tu contrôles le domaine. Bubblewrap génère un
   fichier `assetlinks.json` à héberger sur `https://ton-domaine.vercel.app/.well-known/assetlinks.json`
   (mets-le dans `public/.well-known/assetlinks.json` et redéploie).
6. Crée un compte [Google Play Console](https://play.google.com/console) (25$, paiement unique).
7. Nouvelle application → upload le `.aab` → remplis la fiche (description, captures d'écran, icône
   512×512 déjà dans `public/icon-512.png`, catégorie, **politique de confidentialité** — obligatoire,
   même une page simple suffit).
8. Soumets pour review (1 à 3 jours généralement chez Google).

Étant donné que c'est un produit B2B (dashboard pour restaurateurs, pas grand public), beaucoup
d'équipes restent en PWA pure sans jamais publier sur le Play Store — ce n'est pas obligatoire pour
vendre le produit, juste une option si tu veux une présence app formelle.


- **Un seul compte** : le suivi de l'heure gratuite et de l'abonnement (`lib/billing.ts`) est global,
  pas par restaurant. Pour gérer plusieurs restaurants avec chacun leur propre essai/abonnement, il
  faudra lier ça à un vrai customer Stripe par compte.
- **Stockage en mémoire** (`lib/store.ts`, `lib/conversations.ts`, `lib/billing.ts`) : les réservations et conversations
  disparaissent si le serveur redémarre, et ne fonctionnent pas s'il y a plusieurs instances (ce qui
  arrive automatiquement sur Vercel dès qu'il y a du trafic). Pour la prod, remplace ça par une vraie
  base de données (Postgres via Supabase/Neon, ou Vercel KV pour un stockage clé-valeur simple).
- **Une seule fiche restaurant** : `lib/restaurant.ts` est codé en dur. Pour gérer plusieurs restaurants,
  il faudrait une table `restaurants` et retrouver le bon profil via le numéro Twilio appelé (`To`).
- **Pas de vérification de signature Twilio** : en prod, vérifie l'en-tête `X-Twilio-Signature` sur
  chaque webhook pour être sûr que les requêtes viennent bien de Twilio (voir la doc Twilio sur la
  validation des requêtes).
- **Voix** : `Polly.Lea-Neural` est une voix française via Amazon Polly (intégrée à Twilio). Pour une
  voix plus naturelle, on peut brancher ElevenLabs ou une autre voix IA à la place — ça demande de
  streamer l'audio différemment (Twilio Media Streams au lieu de `<Say>`), plus complexe mais faisable.
