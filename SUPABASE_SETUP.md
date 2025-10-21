# ✅ Supabase Setup - Fast fertig!

## Was wurde bereits gemacht:

1. ✅ **npm Package installiert** - `@supabase/supabase-js` ist bereits in deinem Projekt
2. ✅ **Verzeichnisstruktur erstellt** - `src/lib/` Ordner wurde angelegt
3. ✅ **Supabase Client erstellt** - `src/lib/supabaseClient.js` ist fertig

---

## 🔧 Was du noch tun musst:

### SCHRITT 1: `.env.local` Datei erstellen

**WICHTIG:** Diese Datei muss manuell erstellt werden (sie ist aus Sicherheitsgründen von git ignoriert).

1. **Erstelle im Root-Verzeichnis** (neben `package.json`) eine neue Datei namens `.env.local`
2. **Kopiere folgenden Inhalt hinein:**

```
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. **Ersetze die Platzhalter** mit deinen echten Supabase Credentials:

#### Wo findest du die Credentials?
1. Gehe zu deinem [Supabase Dashboard](https://supabase.com/dashboard)
2. Wähle dein Projekt aus
3. Klicke auf **Settings** (Zahnrad-Icon, unten links)
4. Klicke auf **API** (in der Sidebar)
5. Du siehst:
   - **Project URL** → Kopiere diese und ersetze `https://your-project.supabase.co`
   - **anon public** (unter "Project API keys") → Kopiere diesen und ersetze `your-anon-key-here`

4. **Speichern:** Ctrl+S

---

### SCHRITT 2: Dev Server neu starten

Environment Variables werden nur beim Start geladen. Daher:

```bash
# Stoppe den laufenden Server (falls er läuft)
# Ctrl+C im Terminal

# Starte neu
npm run dev
```

---

## 🧪 SCHRITT 3: Test - Funktioniert es?

### Test im Browser:

1. Öffne deine App im Browser (normalerweise http://localhost:5173)
2. Öffne die **Browser Console** (F12 oder Ctrl+Shift+I, dann Tab "Console")
3. Füge folgenden Test-Code ein und drücke Enter:

```javascript
// Test 1: Prüfe ob Client existiert
console.log('Supabase Client:', window.supabase);

// Test 2: Teste die Verbindung
import('/src/lib/supabaseClient.js').then(async ({ supabase }) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count');
    
    if (error) {
      console.error('❌ Verbindung fehlgeschlagen:', error);
    } else {
      console.log('✅ Verbindung erfolgreich! Supabase läuft.');
    }
  } catch (err) {
    console.error('❌ Test fehlgeschlagen:', err);
  }
});
```

### Was du sehen solltest:
- **✅ "Verbindung erfolgreich"** → Alles läuft!
- **❌ Fehler** → Siehe unten bei "Häufige Fehler"

---

## 🚀 Wie nutzt du es jetzt in deinen Components?

### Beispiel: In `App.jsx` oder einer anderen Component:

```javascript
import { supabase, executeQuery } from './lib/supabaseClient';

function MyComponent() {
  // Einfache Query
  async function loadMoments() {
    const { data, error } = await supabase
      .from('moments')
      .select('*');
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    console.log('Moments:', data);
  }
  
  // Mit Error Handling Wrapper
  async function loadMomentsWithWrapper() {
    try {
      const moments = await executeQuery(
        () => supabase.from('moments').select('*'),
        'load moments'
      );
      console.log('Moments:', moments);
    } catch (err) {
      // Error handling hier
    }
  }
  
  return (
    <div>
      <button onClick={loadMoments}>Load Moments</button>
    </div>
  );
}
```

### CRUD Operationen Cheat Sheet:

```javascript
// CREATE - Neuen Moment erstellen
const { data, error } = await supabase
  .from('moments')
  .insert([{
    created_by: userId,
    front_camera_url: 'https://...',
    back_camera_url: 'https://...',
    title: 'My first moment'
  }])
  .select(); // .select() gibt die erstellten Daten zurück

// READ - Alle Momente laden
const { data: moments } = await supabase
  .from('moments')
  .select('*');

// READ - Mit Filter
const { data: userMoments } = await supabase
  .from('moments')
  .select('*')
  .eq('created_by', userId);

// UPDATE - Moment aktualisieren
await supabase
  .from('moments')
  .update({ title: 'Updated title' })
  .eq('id', momentId);

// DELETE - Moment löschen
await supabase
  .from('moments')
  .delete()
  .eq('id', momentId);
```

---

## 🚨 Häufige Fehler

### ❌ "Missing Supabase credentials"
**Problem:** `.env.local` existiert nicht oder hat falsche Namen
**Lösung:** 
- Prüfe dass die Datei `.env.local` heißt (mit Punkt am Anfang!)
- Prüfe dass die Variablen `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY` heißen (nicht `REACT_APP_`)

### ❌ "import.meta.env.VITE_SUPABASE_URL is undefined"
**Problem:** Dev Server wurde nicht neu gestartet
**Lösung:** Stop (Ctrl+C) und `npm run dev` neu starten

### ❌ "Connection failed" / "Invalid API key"
**Problem:** Falsche Credentials in `.env.local`
**Lösung:**
- URL muss mit `https://` starten
- API Key ist sehr lang (starts with `eyJ...`)
- Keine Anführungszeichen um die Werte
- Keine Leerzeichen vor/nach dem `=`

### ❌ "Table 'profiles' does not exist"
**Problem:** Tabelle existiert noch nicht in Supabase
**Lösung:** Ersetze `profiles` in den Tests mit einer Tabelle die du bereits hast (z.B. `moments`)

---

## 🎯 Nächste Schritte

Sobald die Tests funktionieren, kannst du weitermachen mit:
1. **Entity Modules** erstellen (moment.js, circle.js, profile.js)
2. **Authentication** implementieren
3. **Storage** für Bilder/Videos einrichten
4. **Realtime Updates** für Live-Features

---

## ⚠️ WICHTIG: Vite vs Create React App

Dein Projekt nutzt **Vite** (nicht Create React App). Daher:

| Create React App | Vite (dein Projekt) |
|------------------|---------------------|
| `process.env.REACT_APP_*` | `import.meta.env.VITE_*` |
| `.env` wird automatisch geladen | `.env.local` wird automatisch geladen |
| Neustart teilweise nicht nötig | Neustart nach .env Änderungen immer nötig |

**Die Anleitung im Original-Plan wurde angepasst für Vite!**

---

## ✅ Checklist

- [ ] `.env.local` Datei im Root erstellt
- [ ] Supabase URL und API Key eingefügt
- [ ] Dev Server neu gestartet
- [ ] Test im Browser durchgeführt
- [ ] ✅ "Verbindung erfolgreich" gesehen

**Wenn alle Punkte erledigt → Du kannst loslegen! 🎉**

Fragen? Lass es mich wissen!

