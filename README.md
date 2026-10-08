# Bandyliiga Playwright - testi

Tämä testi yrittää avata Finbandyn TorneoPal-sivun oikealla Chromium-selaimella
Vercelin serverless-funktiossa.

Se ei käytä TorneoPal API-avainta.

## Vercel
Lataa tiedostot GitHubiin ja deployaa Verceliin. Avaa etusivu ja paina "Aja testi".

Testi palauttaa:
- lopullisen URL:n
- sivun title
- sivun tekstin
- taulukoiden määrän
- linkkien määrän
- HTML:n koon
- TorneoPaliin liittyvät verkkopyynnöt

Jos tämä toimii, seuraava vaihe on parseroida sarjataulukko ja ottelut.
