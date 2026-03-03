Dragon Finance — TartanHacks 2026

Dragon Finance is a web app pilot project that gamifies personal finance where users adopt a dragon and receive AI-powered feedback on spending habits, log purchases, earn XP, and influence your dragon’s mood based on financial decisions. This tool can be tremendously beneficial for the youth for learning good financial decisions through gameification.

Dragon Finance was built with React (Vite), Vercel Serverless Functions, and OpenAI.

---

Access the Project via the following vercel project deployment link in any browser:

https://tartan-hacks2026.vercel.app/

---

How to navigate the webapp:

1. Pick a dragon egg class out of the following options: Knight / Archer / Mage

This locks in your dragon type and starts your profile.

2. You will land on the homepage where you will see:
   
Your dragon sprite
Your XP bar (progress toward growth)
Option to set daily budget
Navigation to the spending features
Log a purchase (Core action)

3. Set a daily budget, this will lock you from changing it again during the day so please pick a reasonable value
   
4. Go to the Spending Log / Add Spending page and enter a transaction
--
After submitting, the app evaluates your spending:
Good spending → you earn XP, dragon stays happy
Bad spending → feedback warns you, and when you return home the baby dragon becomes sad
Once you hit the hatch threshold, your dragon becomes a baby dragon (instead of an egg)
---------------------------------------------------------------------------------------
If your most recent purchase is BAD, the baby dragon shows its sad sprite on Home
Log a GOOD purchase afterward → return to Home → dragon returns to happy (This feature can only be seen with a dragon that has evolved to "baby")

5. There is an option to set a savings goal deposit money towards that goal. Once you hit the goal you will be rewarded with an exp bonus.
6. There is an option to record and track subscriptions, sorted by most used or most expensive subscriptions.
---------------------------------------------------------------------------------------
Key Features:

- OpenAI-powered spending evaluation via Vercel serverless API
- React + Vite frontend with persistent local state
- Gamified progression system (XP + dragon evolution)
- Dragon mood dynamically reflects financial decisions
- Class selection (Knight / Archer / Mage) through egg picking
- Visual XP bar and responsive sprite feedback loop
