# Tablo Generator

Generator rasporeda i dokumentacije elektro tabli za instalatere.

Alat je namenjen brzom crtanju redova u tabli, oznacavanju osiguraca i zastitnih elemenata, stampi/PDF izvozu i cuvanju projekta lokalno ili u JSON fajlu.

## Sta trenutno radi

- autosave u browseru
- cuvanje i ucitavanje projekta kao JSON
- poslednji projekti iz localStorage-a
- NikVolt vizuelna tema
- profesionalni podaci za PDF: objekat, adresa, investitor, instalater, datum, napomena
- redovi sa kapacitetom modula i upozorenjem kada je red prepun
- faze L1/L2/L3/3F i pregled balansa opterecenja po fazama
- katalog elemenata: osigurac, glavni prekidac, SPD, RCBO, kontaktor, tajmer, impulsni relej, zvonce, rezerva, N/PE sabirnica
- sabloni: stan, kuca, lokal, garaza, spratna tabla, razvodni orman
- undo/redo za izmene table
- PDF i print export
- PWA/offline osnova

## Pokretanje lokalno

```bash
npm install
npm run dev
```

## Provera

```bash
npm test
npm run build
```

## Deploy

Repo sadrzi GitHub Pages workflow. Kada je Pages ukljucen u podesavanjima repozitorijuma, push na `main` pokrece test, build i deploy na:

```text
https://dzoni9o.github.io/tablogenerator/
```

## Roadmap

- preciznija tabela proracuna opterecenja po fazama
- import/export vise projekata u jednom fajlu
- precizniji standardi i validacije po pravilima instalacije
- e2e testovi za JSON import/export i PDF dugme
