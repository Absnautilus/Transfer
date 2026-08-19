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

Next.js (App Router) + TypeScript + Tailwind CSS, Prisma ORM con SQLite (adapter
`better-sqlite3`) come database, Auth.js (NextAuth v5) per l'accesso di hotel/taxi/autisti,
Nodemailer per le email (in sviluppo, senza SMTP configurato, le email vengono solo loggate
in console e nella tabella `EmailLog`).

## Sviluppo

```bash
npm install
cp .env.example .env      # genera AUTH_SECRET con: openssl rand -base64 32
npm run db:migrate        # crea/aggiorna il database SQLite locale
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
riga di comando e scrive solo nel database locale (`dev.db`), che è escluso da git — nessun
dato di ospiti reali viene mai committato. Vedi `.gitignore`.

## Note

- I ruoli/stati (`Role`, `RequestStatus`, `TransferStatus`, ...) sono in
  `src/lib/constants.ts`: SQLite non supporta enum nativi, quindi sono stringhe vincolate a
  livello applicativo.
- La protezione delle rotte `/hotel`, `/taxi`, `/driver` è centralizzata in `src/proxy.ts`.
- Ancora da fare per una versione successiva: tracciamento GPS in tempo reale lato autista
  (oggi lo stato è a "tappe" tipo Uber, non su mappa), dashboard multi-hotel per una stessa
  compagnia taxi, e le altre due dashboard del prodotto (ospite self-service, agenzia/
  intermediario).
