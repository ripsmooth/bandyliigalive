# Bandyliiga – ottelupöytäkirjan PDF-testi

Tämä testi tarkistaa, saadaanko TorneoPalin julkisesta ottelupöytäkirjan PDF:stä
käyttökelpoista tekstidataa ilman API-avainta.

Oletusottelu: 24901 (Botnia – Kampparit).

## Käyttö

```bash
npm install
npm start
```

Tai toinen ottelu:

```bash
node api/pdf.js 24901
```

Windowsissa ID:n voi antaa myös ympäristömuuttujalla:

```powershell
$env:ID="24901"
npm start
```

Ohjelma tulostaa JSON-muodossa:
- PDF-osoitteen
- HTTP-statuksen
- Content-Type:n
- PDF:n koon
- sivumäärän
- kaiken PDF:stä puretun tekstin
- ensimmäiset 5000 merkkiä
- mahdolliset TorneoPal/Finbandy-verkkopyynnöt

Tärkein tarkistettava kohta on `text`.
