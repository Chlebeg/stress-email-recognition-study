# Research Plan: Phishing Recognition Tasks

## Study Configuration

All participants receive the same fixed order. Every task has the timer enabled. The task timer automatically submits an unanswered task when it reaches zero. Social-comparison and negative-feedback messages are fixed per task and are never randomized.

| Task | Email label | Timer | Itemized stressors | Indicator of compromise / legitimacy cue |
|---:|---|---:|---|---|
| 1 | Legitimate | 60 s | Timer | Matching `allegro.pl` sender and expected parcel/tracking context; no sensitive-data request. |
| 2 | Phishing | 50 s | Timer<br>Social comparison | Incorrect sender and CTA domains: `inpost-paczka.info` and `inpost-bramka-platnosci.net`; unexpected payment request; four-hour deadline. |
| 3 | Legitimate | 40 s | Timer<br>Social comparison<br>Email blur (6-9 s) | Matching `pge.pl` sender and ordinary invoice context; no request for credentials, payment data, or code. |
| 4 | Legitimate | 30 s | Timer<br>Social comparison<br>Email blur (6-9 s)<br>Recording notice | Matching `orange.pl` sender, normal account-access context, and no sensitive-data request. |
| 5 | Phishing | 30 s | Timer<br>Social comparison<br>Recording notice<br>Cognitive overload (`7 2 9 4`) | Incorrect sender and payment domains: `olx-platnosci24.com` and `olx-platnosc-odbior.com`; recipient-detail request; 30-minute deadline. |
| 6 | Phishing | 30 s | Timer<br>Social comparison<br>Email blur (6-9 s)<br>Recording notice<br>Cognitive reminder about task 5's code | Executable attachment: `Wyciag_listopad_2025.exe`. The matching `mbank.pl` sender is intentional; the attachment is the sole phishing clue. |
| 7 | Legitimate | 30 s | Timer<br>Social comparison<br>Recording notice<br>Cognitive overload (`Ola ma kota`)<br>Negative feedback | Matching `plus.pl` sender and payment destination; ordinary billing/contact context; no sensitive-data request. |
| 8 | Phishing | 30 s | Timer<br>Social comparison<br>Recording notice<br>Cognitive overload (`Mivora teskul`)<br>Negative feedback<br>Microphone permission popup | Incorrect sender and CTA domains: `netflix-support-payments.com` and `netflix-secure-billing.com`; card-update demand within 24 hours. |
| 9 | Legitimate | 30 s | Timer<br>Social comparison<br>Recording notice<br>Cognitive overload (`KSIĄŻKA 8`)<br>Negative feedback<br>Camera permission popup | Matching `empik.com` sender and order-status destination; ordinary delivery context; no sensitive-data request. |
| 10 | Phishing | 30 s | Timer<br>Social comparison<br>Recording notice<br>Cognitive overload (`Turmel foska`)<br>Negative feedback<br>Microphone permission popup<br>Camera permission popup | Incorrect sender and CTA domains: `booking-card-confirmation.net` and `booking-secure-card-check.net`; two-hour card-verification demand; contradiction about sharing payment data. |

Email blur is only enabled on tasks with a timer of at least 30 seconds. It is delayed until the participant has had time to inspect the sender and subject, then shown for three seconds.

## Task Order

### 1. Allegro: Parcel in Transit

- **Expected classification:** Legitimate
- **Subject:** `Twoja przesyłka jest już w drodze`
- **Sender:** `powiadomienia@allegro.pl`
- **Timer:** 60 seconds
- **Stressors:**
  - Timer
- **Legitimacy indicators:**
  - Sender domain matches the Allegro brand domain: `allegro.pl`.
  - Tracking context, seller, product, and parcel number are internally consistent.
  - The message directs the participant to Allegro's application or purchase details and does not ask for payment data, credentials, or a one-time code.

### 2. InPost: Parcel Payment Request

- **Expected classification:** Phishing
- **Subject:** `WAŻNE: Twoja paczka została wstrzymana z powodu niedopłaty (2,50 PLN)`
- **Sender:** `platnosc@inpost-paczka.info`
- **Timer:** 50 seconds
- **Stressors:**
  - Timer
  - Social comparison, displayed after 5 seconds for 5 seconds: `Odpowiadasz wolniej niż 74% uczestników.`
- **Indicators of compromise:**
  - Sender uses `inpost-paczka.info`, not an official InPost domain.
  - Payment destination is `inpost-bramka-platnosci.net`, not an official InPost domain.
  - Requests an unexpected small payment before collection.
  - Applies urgency through a four-hour payment deadline.

### 3. PGE eBOK: Electricity Invoice

- **Expected classification:** Legitimate
- **Subject:** `eFaktura za energię elektryczną - nowa faktura nr 22/11/2025`
- **Sender:** `ebok@pge.pl`
- **Timer:** 40 seconds
- **Stressors:**
  - Timer
  - Social comparison, displayed after 4 seconds for 4 seconds: `Inni uczestnicy zwykle szybciej kończą to zadanie.`
  - Email blur from 6 to 9 seconds after task start
- **Legitimacy indicators:**
  - Sender domain matches PGE: `pge.pl`.
  - The message presents an ordinary invoice context without requesting credentials, payment data, or a code by email.
  - The temporary blur ends after three seconds and does not change the message's classification evidence.

### 4. Orange: Bill Available in Application

- **Expected classification:** Legitimate
- **Subject:** `Twój rachunek Orange jest dostępny w aplikacji`
- **Sender:** `orange@orange.pl`
- **Timer:** 30 seconds
- **Stressors:**
  - Timer
  - Social comparison, displayed after 4 seconds for 4 seconds: `67% uczestników podjęło już decyzję.`
  - Email blur from 6 to 9 seconds after task start
  - Recording notice
- **Legitimacy indicators:**
  - Sender domain matches Orange: `orange.pl`.
  - The message provides normal account-access context and contact information.
  - It does not request credentials, payment card data, or a one-time code by email.

### 5. OLX: Payment Collection Confirmation

- **Expected classification:** Phishing
- **Subject:** `Potwierdź odbiór płatności za sprzedany przedmiot`
- **Sender:** `noreply@olx-platnosci24.com`
- **Timer:** 30 seconds
- **Stressors:**
  - Timer
  - Social comparison, displayed after 4 seconds for 4 seconds: `Twoje tempo jest niższe niż średnia w tej części badania.`
  - Recording notice
  - Cognitive overload: remember `7 2 9 4` for 4 seconds before the task
- **Indicators of compromise:**
  - Sender uses `olx-platnosci24.com`, not an official OLX domain.
  - Payment destination is `olx-platnosc-odbior.com`, not an official OLX domain.
  - Requests confirmation of payment-recipient details to receive money.
  - Uses a 30-minute deadline and cancellation threat.

### 6. mBank: Electronic Statements

- **Expected classification:** Phishing
- **Subject:** `Twoje miesięczne wyciągi elektroniczne są gotowe do pobrania`
- **Sender:** `powiadomienia@mbank.pl`
- **Timer:** 30 seconds
- **Stressors:**
  - Timer
  - Social comparison, displayed after 4 seconds for 4 seconds: `Uczestnicy przed Tobą zwykle odpowiadają szybciej.`
  - Email blur from 6 to 9 seconds after task start
  - Recording notice
  - Cognitive reminder for 4 seconds: `Czy pamiętasz pierwszy kod?` followed by `Pamiętaj, że będzie Ci potrzebny.` No response field is shown.
- **Indicator of compromise:**
  - The message asks the participant to run the executable attachment `Wyciag_listopad_2025.exe`.
- **Research note:**
  - The matching sender domain and otherwise plausible message are intentional. The executable attachment is the sole intended phishing indicator.

### 7. Plus: Payment Reminder

- **Expected classification:** Legitimate
- **Subject:** `Przypomnienie o płatności za usługi Plus`
- **Sender:** `bok@plus.pl`
- **Timer:** 30 seconds
- **Stressors:**
  - Timer
  - Social comparison, displayed after 4 seconds for 4 seconds: `Pozostało Ci mniej czasu niż większości uczestników.`
  - Recording notice
  - Cognitive overload: remember `Ola ma kota` for 4 seconds before the task
  - Negative feedback after submission: `Twoje ostatnie odpowiedzi były mniej trafne niż odpowiedzi większości uczestników.`
- **Legitimacy indicators:**
  - Sender domain matches Plus: `plus.pl`.
  - The payment destination remains on `plus.pl`.
  - The message contains normal billing and customer-contact information and does not request credentials or payment data by email.

### 8. Netflix: Payment Method Update

- **Expected classification:** Phishing
- **Subject:** `Wymagane zaktualizowanie metody płatności`
- **Sender:** `billing@netflix-support-payments.com`
- **Timer:** 30 seconds
- **Stressors:**
  - Timer
  - Social comparison, displayed after 4 seconds for 4 seconds: `78% uczestników podjęło już decyzję.`
  - Recording notice
  - Cognitive overload: remember `Mivora teskul` for 4 seconds before the task
  - Negative feedback after submission: `W tej części badania Twoje odpowiedzi odbiegają od wyników większości.`
  - Microphone permission popup, shown 300 ms after task start
- **Indicators of compromise:**
  - Sender uses `netflix-support-payments.com`, not `netflix.com`.
  - Payment CTA destination is `netflix-secure-billing.com`, not `netflix.com`.
  - Threatens loss of access unless card data is updated within 24 hours.

### 9. Empik: Order to Store

- **Expected classification:** Legitimate
- **Subject:** `Twoje zamówienie jest w drodze do salonu Empik`
- **Sender:** `newsletter@empik.com`
- **Timer:** 30 seconds
- **Stressors:**
  - Timer
  - Social comparison, displayed after 4 seconds for 4 seconds: `Jesteś wśród wolniejszych odpowiedzi w tej serii.`
  - Recording notice
  - Cognitive overload: remember `KSIĄŻKA 8` for 4 seconds before the task
  - Negative feedback after submission: `Twoje tempo i trafność są obecnie poniżej średniej uczestników.`
  - Camera permission popup, shown 800 ms after task start
- **Legitimacy indicators:**
  - Sender domain matches Empik: `empik.com`.
  - Order-status destination remains on `empik.com`.
  - The message has an ordinary order, delivery, and store-collection context with no request for sensitive data.

### 10. Booking.com: Card Verification

- **Expected classification:** Phishing
- **Subject:** `Pilne: Twoja rezerwacja wymaga potwierdzenia karty`
- **Sender:** `security@booking-card-confirmation.net`
- **Timer:** 30 seconds
- **Stressors:**
  - Timer
  - Social comparison, displayed after 4 seconds for 4 seconds: `Większość uczestników zakończyła już podobne zadanie.`
  - Recording notice
  - Cognitive overload: remember `Turmel foska` for 4 seconds before the task
  - Negative feedback after submission: `Ostatnie decyzje były oceniane jako mniej trafne niż przeciętne.`
  - Microphone permission popup, shown 300 ms after task start
  - Camera permission popup, shown 800 ms after task start
- **Indicators of compromise:**
  - Sender uses `booking-card-confirmation.net`, not an official Booking.com domain.
  - Card-verification destination is `booking-secure-card-check.net`, not an official Booking.com domain.
  - Requires immediate card confirmation within two hours or threatens reservation cancellation.
  - Contains an intentional contradiction: it warns against sharing payment data through email while asking the participant to confirm a card via an external link.
- **Research note:**
  - Email blur is intentionally absent on the highest-load task so the core domain and payment indicators remain inspectable.

## Stressor Reference

| Stressor | Participant-facing behavior |
|---|---|
| Timer | Countdown with clock sound, red vignette, and automatic submission at zero. |
| Social comparison | Brief fabricated message about the participant's relative decision speed. |
| Email blur | Temporary loading overlay and blur over the email content. |
| Recording notice | Persistent fake recording frame, blinking REC indicator, and recording message. |
| Cognitive overload | Pre-task instruction to remember a code, sentence, fixed nonsense-word set, or a reminder about a preceding code; it never collects an answer. |
| Negative feedback | Fabricated feedback message after the participant submits an answer; the task may use a generic or poor-performance message. |
| Microphone popup | Fake browser microphone-permission request; interaction may show a volume-mixer display. |
| Camera popup | Fake browser camera-permission request; allowing it shows a persistent camera-loading box. |
