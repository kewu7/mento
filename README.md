# Mento — mentoolikristallide e-pood

Ühe toote e-poe leht (eesti keeles): staatiline HTML + CSS + JS, ilma build-tööriistadeta.
Ava `index.html` brauseris või serveeri suvalise staatilise serveriga.

## Struktuur

```
index.html      — kogu leht (hero, lugu, kasutusjuhend, KKK, ostuplokk, ostukorv, checkout)
css/style.css   — disainisüsteem ja stiilid
js/main.js      — ostukorv (localStorage), tellimuse vormistamine, valideerimine
```

## Seadistamine

- **Hind ja toote andmed:** muuda `js/main.js` algusest `PRODUCT` objekti (hind on praegu
  kohatäide 24,90 €) ning HTML-is `[data-price]` kuvahindu. Samuti `FREE_SHIPPING_FROM` lävend.
- **Tarnehinnad:** `index.html` tarneviiside `data-price` atribuudid + kuvatavad hinnad.
- **Kontakt:** AR Capital Group OÜ (reg-kood 16351581, Hirvela tn 13-13, Sauga alevik, Tori vald),
  `arcapitalgroupp@gmail.com` — jaluses ja õiguslehtedel. Õiguslehtedel on täitmata veel ainult
  makseteenusega seotud kohatäited (lisanduvad makselahenduse valikuga).

## Tootefotod

Kasutusel:

- `images/komplekt.jpeg` — kangelase visuaal (`.hero-card`), ostuplokk (`.buy-visual`)
  ja ostukorvi pisipilt
- `images/kinkekarp.jpeg` — kingituse sektsioon

Veel fotodega katmata (praegu brändistiilis SVG-joonistused):

- `images/veski.jpg`, `images/purk.jpg`, `images/laastud.jpg` — "Karbis on" kaardid

Soovituslik formaat: WebP/AVIF, laius ~1200 px, `loading="lazy"` (v.a hero).

## Maksete ühendamine (järgmine samm)

`js/main.js` → `submitOrder()` on koht, kus testkinnituse asemel tuleb tellimus saata
backendile ja klient makselehele suunata. `collectOrder()` paneb tellimuse andmed juba kokku.

Eesti turu jaoks kaalumisel (vajavad äriregistri koodi ja pangakontot):

| Lahendus | Pangalingid (Swedbank/SEB/LHV/Coop) | Kaardimakse | Hinnastus (suurusjärk) | Märkused |
|---|---|---|---|---|
| **Montonio** | ✔ | ✔ | väike fikseeritud tasu makse kohta, pangalink soodsaim | Populaarseim väikepoodide seas Eestis; lihtne API, ühe lepinguga kõik pangad |
| **Maksekeskus (makecommerce)** | ✔ | ✔ | % + tehingutasu | Pikim kogemus Baltikumis, palju valmismooduleid |
| **Stripe** | ✖ (pangalinke pole) | ✔ + Apple/Google Pay | ~1,5 % + 0,25 € EU kaardid | Parim arendajakogemus, aga Eesti ostjad eelistavad pangalinki |
| **ESTO / Inbank** | osaliselt | — | lepinguline | Järelmaks, pigem kallimate toodete jaoks |

Soovitus esimeseks valikuks: **Montonio** (pangalingid + kaart ühe liidesega, madalad tasud,
sobib ühe tootega poele). Stripe lisada hiljem Apple Pay / välismaiste kaartide jaoks, kui vajadus tekib.

NB! Enne maksete avamist on vaja tellimuste vastuvõtuks backend või e-poe platvorm.

## Õiguslehed

`tingimused.html` (müügitingimused) ja `privaatsus.html` (privaatsuspoliitika) on mallid,
mis järgivad Eesti e-poe standardnõudeid (VÕS 14-päevane taganemisõigus, 2-aastane
pretensiooniaeg, IKÜM/GDPR). Enne avaldamist:

1. asenda kõik nurksulgudes `[...]` kohatäited (ärinimi, registrikood, aadress, kuupäevad,
   makseteenuse pakkuja jne);
2. eemalda lehtede ülaosast sinine "NB! See on mall" kast ja `<meta name="robots" content="noindex">`;
3. lase tekstid soovitavalt juristil üle vaadata.

Checkout-vormis on kohustuslik märkeruut "Nõustun müügitingimustega".
