# Hotel Transfer

App per la gestione automatizzata dei transfer organizzati dall'hotel: richiesta dell'ospite,
verifica dell'operatore hotel, conferma della compagnia taxi, assegnazione autisti (anche
last minute) e stato del viaggio condiviso in tempo reale tra autista e ospite.

Questo è il primo modulo del prodotto (dei tre previsti: ospite/hotel/compagnia taxi),
focalizzato sui transfer organizzati dall'hotel.

## Flusso

1. **Ospite** compila il questionario pubblico `/richiedi/<hotel-slug>`.
2. La richiesta finisce nella pagina **Richieste** dell'hotel (`/hotel/richieste`); l'operatore
   la **accetta** (invio email automatica di conferma con link di tracciamento) o la **rifiuta**
   indicando il motivo (email automatica all'ospite).
3. Un transfer accettato finisce nella tabella **Transfer confermati**, condivisa tra hotel
   (`/hotel/transfer`) e compagnia taxi (`/taxi/transfer`): navigazione per giorno, calendario,
   ricerca per nome/camera/numero prenotazione, inserimento e modifica manuale da parte
   dell'operatore hotel.
4. La **compagnia taxi** conferma o rifiuta ogni transfer e assegna (o riassegna, anche
   all'ultimo minuto) un autista.
5. L'**autista** vede i propri transfer (`/driver`) e aggiorna lo stato del viaggio (in arrivo,
   arrivato, iniziato, completato); l'**ospite** vede lo stesso stato in tempo reale sulla pagina
   pubblica di tracciamento `/traccia/<token>`.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS, Prisma ORM con Postgres (adapter
`@prisma/adapter-pg`) come database, Auth.js (NextAuth v5) per l'accesso di hotel/taxi/autisti,
Nodemailer per le email (in sviluppo, senza SMTP configurato, le email vengono solo loggate
in console e nella tabella `EmailLog`).

## Sviluppo

Serve un database Postgres raggiungibile (locale, Docker, o uno gratuito su Neon/Vercel/Supabase
— vedi sezione Deploy sotto per come crearne uno in 1 minuto).

```bash
npm install
cp .env.example .env      # imposta DATABASE_URL e genera AUTH_SECRET con: openssl rand -base64 32
npm run db:migrate        # crea/aggiorna lo schema sul database Postgres
npm run db:seed           # dati demo (fittizi) + utenti di accesso
npm run dev
```

Apri http://localhost:3000.

Accessi demo (password: `password123`):

- Hotel: `hotel@demo.local` → `/hotel/richieste`
- Taxi: `taxi@demo.local` → `/taxi/transfer`
- Autista: `marco.bianchi@demo.local` → `/driver`

Questionario ospite demo: `/richiedi/palazzo-veneziano`

## Importare uno storico reale (es. export CSV "NCC Plan")

```bash
npm run import:csv -- /percorso/assoluto/al/file.csv [hotel-slug]
```

Lo script (`scripts/import-ncc-csv.ts`) non contiene dati reali: legge il percorso del CSV da
riga di comando e scrive solo nel database puntato da `DATABASE_URL` — usalo con un database
locale/di sviluppo, mai con quello di produzione. Nessun dato reale di ospiti è mai committato
(vedi `.gitignore`).

## Deploy su Vercel

1. Su [vercel.com](https://vercel.com) → **Add New → Project** → importa questo repo GitHub,
   branch `claude/hotel-transfer-automation-app-bgrpzz` (o `main` dopo il merge).
2. Nel progetto Vercel: **Storage → Create Database → Postgres** (Neon, incluso gratis) e
   collegalo al progetto — questo imposta automaticamente `DATABASE_URL`.
3. In **Settings → Environment Variables** aggiungi:
   - `AUTH_SECRET` — genera con `openssl rand -base64 32`
   - `APP_URL` — l'URL che Vercel assegna al progetto (es. `https://tuo-progetto.vercel.app`)
4. In **Settings → Build & Development**, imposta il **Build Command** su:
   `prisma migrate deploy && next build`
   (crea le tabelle sul database ad ogni deploy).
5. Fai il primo **Deploy**.
6. Per popolare i dati demo la prima volta, da locale con `DATABASE_URL` puntato al database
   Vercel/Neon appena creato (copialo da Storage → `.env.local` tab su Vercel):
   `npm run db:seed`

Da quel momento l'app è raggiungibile all'URL assegnato da Vercel, con gli accessi demo sopra.

## Note

- I ruoli/stati (`Role`, `RequestStatus`, `TransferStatus`, ...) sono in
  `src/lib/constants.ts`: sono stringhe vincolate a livello applicativo (non enum nativi del DB).
- La protezione delle rotte `/hotel`, `/taxi`, `/driver` è centralizzata in `src/proxy.ts`.
- Ancora da fare per una versione successiva: tracciamento GPS in tempo reale lato autista
  (oggi lo stato è a "tappe" tipo Uber, non su mappa), dashboard multi-hotel per una stessa
  compagnia taxi, e le altre due dashboard del prodotto (ospite self-service, agenzia/
  intermediario).
