Ti si senior full-stack developer.
Stack: Firebase (Auth + Firestore).

Cilj:
Implementiraj jednostavan i skalabilan Referral Program.

Funkcionalni zahtevi:

1. Svaki korisnik mora imati:
   - Jedinstveni referralCode (automatski generisan pri registraciji)
   - referralCount
   - referralDiscount (u procentima)

2. Kada se novi korisnik registruje:
   - Može uneti referral code (opciono)
   - Ako je kod validan:
     - Novi korisnik dobija 10% popusta
     - Referrer dobija 10% popusta
     - Povećaj referralCount referrera
     - Sačuvaj zapis u referrals kolekciji

3. Firestore struktura:

users:
{
  referralCode: string,
  referredBy: string | null,
  referralCount: number,
  referralDiscount: number
}

referrals:
{
  referrerId: string,
  referredUserId: string,
  discountApplied: boolean,
  createdAt: Timestamp
}

4. Dodaj zaštite:
   - Referral kod može da se iskoristi samo jednom po korisniku
   - Korisnik ne može koristiti sopstveni referral kod

5. Pripremi helper funkcije:
   - generateReferralCode()
   - applyReferral(referralCode, newUserId)

6. Pripremi osnovu za UI:
   - Prikaz referral koda u dashboardu
   - Prikaz broja uspešnih referral-a
   - Tekst: „Pozovi prijatelja i oboje dobijate 10% popusta“

Output:
- Firebase funkcije
- Firestore queries
- Jasno komentarisani kod
- Spremno za produkciju


FOMO 

Ti si senior frontend developer i UX copywriter.

Cilj:
Implementiraj sekciju „Paketi pripreme za malu maturu“ za web platformu za učenje srpskog jezika.
Target su RODITELJI dece 8. razreda u Srbiji.

Zahtevi:
1. Napravi 3 paketa:
   - Mesečni
   - Polugodišnji (najpopularniji)
   - Godišnji

2. Svaki paket mora imati:
   - Naziv
   - Kratak podnaslov (benefit za roditelje)
   - Cenu u RSD
   - Trajanje
   - Listu benefita (bullets)
   - CTA dugme „Kupi paket“

3. Polugodišnji paket mora:
   - Vizuelno da se istakne (badge „Najpopularnije“)
   - Ima dodatni BONUS tekst (do 31. januara)
   - Ima copy koji stvara FOMO (ograničena mesta)

4. Ispod paketa dodaj FOMO sekciju:
   - Objasni zašto je januar poslednji pravi trenutak za pripremu
   - Naglasi manji stres i bolje rezultate kod dece koja krenu ranije

5. Dodaj mini trust sekciju:
   - Rad u malim grupama
   - Iskustvo profesorke
   - Strukturisan plan
   - Fokus na razumevanje, ne bubanje

6. Dizajn smernice:
   - Clean, edukativan, roditeljski
   - Bez agresivnog marketinga
   - Više dugmića, manje dugih pasusa
   - Mobile-first layout

7. Sav tekst mora biti:
   - Na srpskom jeziku (ćirilica)
   - Profesionalan, smiren, uliva poverenje

Output:
- React / JSX komponenta (ili HTML + CSS ako proceniš bolje)
- Jasna struktura sekcije
- Copy koji je spreman za produkciju
