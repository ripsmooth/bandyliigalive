# Bandyliiga TorneoPal - testi

Tämä on tarkoituksella pieni testi, jolla selvitetään saadaanko Finbandyn julkisesta
TorneoPal-sarjasivusta dataa ilman API-avainta.

## Vercel

1. Lataa tämä kansio GitHub-repoon.
2. Importtaa repo Verceliin.
3. Deploy.
4. Avaa:
   `https://OMA-PROJEKTI.vercel.app/`
5. Skaalaus:
   `https://OMA-PROJEKTI.vercel.app/?scale=120`

Testi ei käytä TorneoPal API-avainta.

Jos `Palvelimen analyysi` näyttää HTML:n koon ja sisältää ottelu-/sarjataulukkotekstiä,
seuraava vaihe on kirjoittaa parseri, joka muodostaa oman JSON-datan:
- standings
- upcoming matches
- results
- match details
