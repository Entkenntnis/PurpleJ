import { Project } from '@/data/types'

export const dungeon: Project = {
  title: 'Helden-Abenteuer (WIP)',
  description: <></>,
  output: 'terminal',
  classes: [
    {
      name: 'DUNGEON',
      position: { x: 500, y: 100 },
      content: `import java.lang.reflect.*;
import java.util.Scanner;
import java.io.File;
import java.io.PrintStream;

/**
 * Organisiert den ganzen Spielablauf und alle Erklärtexte
 * 
 * @author Philipp Dippon
 */

class DUNGEON{

    HELD held;
    static DUNGEON dungeon;
    private int angriffe;

    public DUNGEON (){
        this(null);
    }

    private DUNGEON(HELD h){
        held = h;
        texteLesen();
        new java.util.Timer().schedule( 
            new java.util.TimerTask() {
                @Override
                public void run() {
                    spielStarten();
                    this.cancel();
                }
            }, 
            500 
        );
        spielStarten();
        dungeon = this;
    }
    
    static void starten(HELD h){
        if (dungeon == null){
            new DUNGEON(h);
        }
    }

    static DUNGEON gib(){
        return dungeon;
    }

    void spielStarten(){
        if (!level1check()){
            level1();
            
        }
        else{
            if(!level2check()){
                level2();    
            }else{
                level3();
            }
        }
    }

    private void level1() {
        try{
            println("## Kapitel 1: Heldenvorbereitung ##");

            if (held == null || held.getClass() == HELD.class){
                anleitung(0,0);
                return;
            }

            Class klasse = held.getClass();
            Field[] attr = klasse.getDeclaredFields();
            if (attr.length < 3){
                anleitung(0,1);
                return;
            }
            Field lebenAtt = null;
            try{
                lebenAtt = klasse.getDeclaredField("leben");
            }catch(NoSuchFieldException e){
                anleitung(0,2);
                return;
            }

            // Vorstellung und Startwerte:

            println("Dein Charakter ist ein "+klasse.getName()+"-Held!");
            println(" Er hat folgende Eigenschaften:");
            Object[] startwerte = new Object[attr.length];
            for (int i = 0; i<attr.length; i++){
                Field a = attr[i];
                println("  "+a.getName() + "  :  " + a.get(held));
                startwerte[i] = a.get(held);
            }
            println("");

            if(lebenAtt.get(held).equals(0)){
                anleitung(0,3);
                return;
            }

            Method[] methoden = klasse.getDeclaredMethods();
            if (methoden.length == 0){
                anleitung(0,4);
                return;
            }
            Method m = methodeOhneParameter(methoden);
            if (m == null){
                println("ACHTUNG! Du solltest eine Methode ohne Parameter schreiben.");
                return;
            }
            println("Dein Held kann sogar: "+m.getName()+"!\\n Das probiert er gleich mal aus!");
            m.invoke(held);
            if (hatNochStartwerte(startwerte, attr, held)){
                anleitung(0,5);
                return;
            }
            try{
                m = klasse.getDeclaredMethod("heilen");
            }catch(NoSuchMethodException nme){
                anleitung(0,6);
                return;
            }
            println("Der Held kann sich auch heilen. Das testet er gleich zwei mal (doppelt hält besser) ...");
            int vorher = lebenAtt.getInt(held);
            m.invoke(held);
            int zwischen = lebenAtt.getInt(held);
            m.invoke(held);
            int nachher = lebenAtt.getInt(held);
            if (zwischen - vorher == 2 && nachher - zwischen == 2){
                println(" Cool. Jetzt hat er "+nachher+" Lebenspunkte!\\n");
            }else{
                println(" Hmm. Das funktioniert noch nicht richtig.\\n Er sollte zuerst auf "+(vorher+2)+" Leben steigen (waren: "+zwischen+") und jetzt auf "+(vorher+4)+" sein (sind: "+nachher+").");
                return;
            }

            anleitung(0,7);

        }catch(IllegalAccessException | InvocationTargetException re)
        {
            System.err.println("Fehler im Code!");
            re.printStackTrace();
        }
    }

    private boolean level1check(){
        try{
            Field lebenAtt = held.getClass().getDeclaredField("leben");
            Method m = held.getClass().getDeclaredMethod("heilen");
            int vorher = lebenAtt.getInt(held);
            lebenAtt.setInt(held, 1246);
            m.invoke(held);
            int nachher = lebenAtt.getInt(held);
            lebenAtt.setInt(held, vorher);
            return vorher == 84 && nachher == 1248;
        }catch(Exception e){
            return false;
        }
    }

    private void level2() {
        println("## Kapitel 2: Der Dungeon.##");
        println("Dein "+heldenname()+" steht vor dem dunklen und niedrigen Eingang.");
        println(" Ducken: "+held.ducken());
        if (held.ducken() == false){
            println(" AUA!!");
            anleitung(1,0);
            return;
        }
        HELD h = new HELD();
        if (h.ducken()){
            println(" NEIN! Du darfst die Oberklasse nicht verändern! Mach deine Änderungen in HELD rückgängig.");
            return;
        }
        println(" Und zack! Schon ist der Held hinein gekrochen.");
        Method m = gibMethode("freuen");
        try{
            println(" >>"+m.invoke(held).toString()+"<<");
        }catch(Exception e){
            anleitung(1,1);
            return;
        }         

        println("\\nIm Dungeon muss sich dein Held vielen verschiedenen Gefahren stellen.");
        println("Als erstes trifft er auf einen tiefen *Spalt* im Boden. Was kann er nur tun?");
        String reaktion = begegnung("Spalt");
        if (reaktion == "nichts"){
            anleitung(1,2);
            return;
        }else if (reaktion != "springen"){
            println(heldenname()+" ist in den Spalt gefallen! Nein. So wird das nichts. Er sollte besser 'springen'");
            if (reaktion == "schleichen") println("...Hmm. Okay, jetzt ist der Anfang wieder kaputt. Ändere das zurück und lies weiter...");
            return;
        }
        println("Oha! Danach kommt ein *Stolperdraht*!! Jetzt Achtung!");
        if (begegnung("Stolperdraht") != "springen"){
            println(" ARRGH!!! Der Stolperdraht löst aus! Wäre er doch lieber gesprungen...");
            println(" "+heldenname()+" verliert 50 Lebenspunkte und schleppt sich mit Mühe aus dem Dungeon!");
            return;
        }
        println("Geschafft! Da liegt immernoch ein *Kieselstein* im Weg...");
        if (begegnung("Kieselstein") != "springen"){
            println(" Mist."+heldenname()+" hat sich den kleinen Zeh verstaucht. Das tut weh.");
            println("Ein Königreich für einen Sprung über Kieselsteine...");
            return;
        }
        println("");
        println(heldenname()+" kann sehr gut springen. Doch was ist das?");
        println("In diesem Raum liegt ein großes, schlafendes Monster. :O");
        if (begegnung("Monster") != "schleichen"){
            anleitung(1,3);
            anleitung(1,4);return;
        }
        println("Sehr gut! Das Monster ist nicht aufgewacht.");
        println("Jetzt steht dein Held vor einer dunklen *Tür*. Was wartet wohl dahinter?");
        reaktion=begegnung("Tür");
        if (reaktion == "springen" || reaktion == "schleichen"){
            println("So ein Quatsch! "+heldenname()+" wird sich noch lange fragen, wie er diesem Hindernis ausweichen könnte.");
            anleitung(1,5);return;
        } else if (reaktion != "öffnen"){
            println("Leider klappt das auch nicht. Vielleicht sollte er einfach versuchen die Tür zu öffnen..?");
            anleitung(1,5);return;
        }
        anleitung(1,6);

    }

    private boolean level2check(){
        PrintStream stout= System.out;
        System.setOut(noOut());
        boolean t = gibMethode("freuen")!=null && held.begegnungMit("Tür")=="eintreten" && held.begegnungMit("Monster")=="schleichen" && held.begegnungMit("Stolperdraht")=="springen";
        System.setOut(stout);
        return t;
    }

    private void level3(){
        println("## Kapitel 3: Der Bosskampf##");
        println("Dein Held stürmt durch die Tür in den kreisrunden Saal.");
        println("Am anderen Ende sitzt auf einem steinernen Thron der riesige Troll 'JAVO'");
        println("Sobald er den Eindringling bemerkt, schickt er seine Wachen los!");
        println("");
        println(heldenname()+" wird von einem kleinen Gnom angegriffen!");
        try{
            gibMethode("kaempfen").invoke(held); // Heilender Held startet hierdurch mit 86 LP!
        }catch(Exception e){
            System.out.println(e);
            anleitung(2,0);return;
        }
        if (angriffe == 0){
            anleitung(2,1);return;
        }
        angriffe = 0;
        kampf("Goblin",4);
        String s = kampf("Goblin",4);
        if (angriffe < 2 || s == "springen"){
            anleitung(2,2);return;
        }
        println("Ha! Der Goblin ist nach 2 Angriffen schon Brei!");
        if (gibLebenspunkte() < 82){
            anleitung(2,3);return;
        }else if(gibLebenspunkte() > 82){
            anleitung(2,4);return;
        }
        println("");angriffe = 0;
        println("Als nächstes greift dich Jovas Leibwache an. Ein ausgewachsener Ork!");
        while(angriffe < 15 && gibLebenspunkte() > 9){
            kampf("Ork",20);
        }
        if (angriffe < 15){
            anleitung(2,5);return;
        }
        println("");angriffe = 0;
        println("Besiegt!! Doch keine Verschnaufpause. Jetzt kämpft Jova persönlich!");
        while(angriffe < 100 && gibLebenspunkte() > 0){
            kampf("Troll",50);
        }
        if (angriffe < 100){
            anleitung(2,6);return;
        }
        println("Dein Held rast mit annähernd Lichtgeschwindigkeit um den Troll Jova!");
        println("TATAAAA! Da fällt er zu Boden! Dein Held ist total erschöpft, aber hat gesiegt!!");

        System.out.println("\\n\\nYEAH!! Du bist am Ende angekommen! (Fortsetzung folgt ...vielleicht.)");    
        System.out.println("Schreibe noch eine weitere Methode, mit if oder for, für das, was dein Held noch so erleben könnte.");
    }

    private void anleitung(int level, int nummer){
        println("");
        println("### Anleitung: ###");
        println(texte[level][nummer]);
    }

    private void println(String t){
        System.out.println(t);
    }

    private Method gibMethode(String name){
        try{
            return held.getClass().getDeclaredMethod(name);
        }catch(Exception e){
            return null;
        }   
    }

    String[][] texte;
    String[] hilfen;

    private void texteLesen(){
        try{
            Scanner s = new Scanner(new File("/str/Data/Anleitungstexte.txt"));
            String t = s.useDelimiter("\\\\A").next();
            String[] kapitel = t.split("\\n###\\n");
            texte = new String[kapitel.length][];
            for (int i = 0; i < kapitel.length; i++){
                texte[i] = kapitel[i].split("\\n#\\n");
            }
            s = new Scanner(new File("/str/Data/Hilfen.txt"));
            t = s.useDelimiter("\\\\A").next();
            hilfen = t.split("#");
        }catch(java.io.FileNotFoundException e){
            System.err.println("Texte oder Hilfen nicht gefunden!");
        }
    }

    private Method methodeOhneParameter(Method[] methoden){
        for (Method m : methoden){
            if( m.getParameterCount() == 0 && m.getName() != "heilen"){
                return m;
            }
        }
        return null;
    }

    private boolean hatNochStartwerte(Object[] sw, Field[] att, Object ob) throws IllegalAccessException {
        for (int i=0;i<att.length;i++){
            //System.out.println("Hilfe: "+att[i].getName()+" : "+att[i].get(ob)+" vs "+sw[i]);
            if(!att[i].get(ob).equals(sw[i])){
                return false;
            }
        }
        return true;
    }

    private String heldenname(){
        try{
            return held.getClass().getDeclaredField("name").get(held).toString();
        }
        catch (Exception e){
            String n = held.getClass().getName().toLowerCase();
            //String anrede = n.charAt(n.length()-2) =='i' ? "Die " : "Der ";
            return  n.substring(0, 1).toUpperCase() + n.substring(1);
        }
    }

    private String begegnung(String art){
        System.out.print(" ");
        String reaktion = held.begegnungMit(art);
        println(" > "+heldenname()+": "+reaktion);
        return reaktion;
    }

    private String kampf(String art, int schaden){
        System.out.print(" "+art+" greift an!");
        try{
            Field leb = held.getClass().getDeclaredField("leben");
            leb.set(held,new Integer(gibLebenspunkte()-schaden));
        }catch(Exception e){
            System.err.println("Fehler! Kampf funktioniert nicht.");
        }
        return begegnung("Gegner");
    }

    private int gibLebenspunkte(){
        try{
            return held.getClass().getDeclaredField("leben").getInt(held);
        }catch(Exception e){
            System.err.println("Fehler! Leben nicht gefunden.");
            return 0;
        }
    }

    public void gegnerAngreifen(){
        angriffe = angriffe +1;
    }

    private PrintStream noOut(){
        return new PrintStream(new java.io.OutputStream(){
                public void write(int arg0) throws java.io.IOException {}});
    }

    public void hilfe(int hilfenummer){
        switch(hilfenummer){
            case 111: println(hilfen[0]);break;
            case 112: println(hilfen[1]);break;
            case 121: println(hilfen[2]);break;
            case 133: println(hilfen[3]);break;
            case 143: println(hilfen[4]);break;
            case 241: println(hilfen[5]);break;
            case 244: println(hilfen[6]);break;
            case 259: println(hilfen[7]);break;
            case 263: println(hilfen[8]);break;
            case 276: println(hilfen[9]);break;
            case 309: println(hilfen[10]);break;
            case 333: println(hilfen[11]);break;
            default: println("Diese Hilfe gibt es nicht!");break;
        }
    }
}
`,
    },
    {
      name: 'HELD',
      position: { x: 150, y: 50 },
      content: `class HELD{

    HELD(){
        DUNGEON.starten(this);
    }

    boolean ducken(){
        return false;
    }

    String begegnungMit(String hindernis){
        return "nichts";
    }

    void angreifen(){
        DUNGEON.gib().gegnerAngreifen();
    }

    void hilfe(int hilfenummer){
        DUNGEON.gib().hilfe(hilfenummer);
    }

}
`,
    },
    {
      name: 'BARBAR',
      position: { x: 10, y: 150 },
      content: `class BARBAR extends HELD
{
    String gegenstand;
    int bewegung;
    double erschoepfung;
    int leben;
    
    BARBAR(){
        gegenstand = "Schwert";
        leben = 84;
        bewegung = 9;
        erschoepfung = 0.0;
    }
    
    void laufen(){
        erschoepfung = 1.0;
    }
    
    void heilen(){
        leben = leben +2;
    }
    
    boolean ducken(){
        return true;
    }
}
`,
    },
    {
      name: 'ZWERG',
      position: { x: 155, y: 200 },
      content: `public class ZWERG extends HELD{

    int alter;
    String name2;
    double gewicht;
    int leben;

    ZWERG(){
        alter = 10;
        name2 = "immy";
        leben = 84;
    }

    void singen(){
        gewicht = 2;
    }

    void heilen(){
        leben = leben +2;
    }

    boolean ducken(){
        return true;
    }

    String freuen(){
        return "YUHUUU!!";
    }

    String begegnungMit(String hindernis){
        if (hindernis == "Monster"){
            return "schleichen";
        }else{
            if (hindernis == "Tür"){
                return "eintreten";
            }else if (hindernis == "Gegner"){
                this.kaempfen();
                return "Attacke!";
            }
            return "springen";
        }
    }

    void kaempfen(){
        for (int i = 0; i< 100; i++){
            angreifen();
        }
        this.heilen();
    }
  
}`,
    },
    {
      name: 'ZAUBERER',
      position: { x: 300, y: 150 },
      content: `class ZAUBERER extends HELD{

    int level;
    double gewicht;
    String name;
    int leben;

    ZAUBERER(){
        level = 1;
        name = "Randolph";
        leben = 84;
    }

    void singen(){
        gewicht = 2;
    }

    void heilen(){
        leben = leben +2;
    }

    boolean ducken(){
        return true;
    }

    String freuen(){
        return "YUHUUU!!";
    }

    String begegnungMit(String hindernis){
        if (hindernis == "Monster"){
            return "schleichen";
        } else if (hindernis == "Tür"){
            return "öffnen";
        } else{
            return "springen";
        }
    }
}`,
    },
  ],
  files: [
    {
      name: '/str/Data/Hilfen.txt',
      content: `Erstelle zuerst eine neue Klasse und gib als Namen eine von dir gewählte
Heldenkategorie in Großbuchstaben an (z.B: ZWERG, DIEB, ...)
Wähle dann mit Rechtsklick Bearbeiten aus und lösche den gesamten Inhalt.
Schreibe nur folgenden Code hinein:

class DEINKLASSENNAME extends HELD{

}

Bearbeite jetzt die Arbeitsblatt Aufgabe 1!

Erstelle ab jetzt immer ein neues Objekt deines selbstgeschriebenen Heldens.
Dann wird dir die nächste Geschichte angezeigt.
#
Überlege dir sinnvolle Eigenschaften deines Heldens. 
 Möglichkeiten sind Name, Stärke, ... Wähle jeweils einen passenden Datentyp aus
 wie du sie bereits auf dem Arbeitsblatt aufgelistet hast.
#
Der Datentyp ist int und der Name muss genau so geschrieben sein: 'leben'.
#
Mögliche Methodennamen könnten z.B.: 'essen', 'warten', 'singen', 'neuerNameSetzen' usw. sein.
Du findest Ideen, wenn du überlegst, welche Attribute sich ändern könnten. Achte auf die richtigen Klammern.
#
Methodenname: 'heilen'. Statt einen Wert zu setzen, kannst du ihn mit folgenden Beispielen vergrößern/verkleinern.
x = x + 1;   x = x - 1;
#
Zum Überschreiben der Methode, kopiere einfach die Methode 'ducken' aus HELD in deine Klasse
und ändere sie so ab, dass die Rückgabe wahr ist.
#
Methoden mit Rückgabewerten haben zwei Kriterien:
Statt void steht dort ein beliebiger Datentyp und es kommt return vor.
#
Beachte, dass du beim Überschreiben die Methode genau gleich übernehmen musst.
Nur die Rückgabe (steht hinter return) solltest du zu dem Wort 'springen' ändern.
#
Deine Methode muss nach folgendem Pseudocode funktionieren:
  Wenn ( hindernis ist gleich 'Monster') dann
    Gib 'schleichen' zurück
  sonst
    Gib 'springen' zurück
  ende wenn
Wie du das programmierst, kannst du auch im Internet heraus finden.
#
Möglicher Pseudocode:
  Wenn ( hindernis ist gleich 'Monster') dann
    Gib 'schleichen' zurück
  sonst
    Wenn (hindernis ist gleich 'Tür') dann
      Gib 'öffnen' zurück
    sonst
      Gib 'springen' zurück
    ende wenn
  ende wenn
#
Ein Methodenaufruf ist immer eine Zeile der Form 'this.methodenname()'.
Wenn du beim Eingeben nach dem Punkt die Tastenkombination Strg+Leertaste drückst,
dann werden dir alle verfügbaren Methoden angezeigt.
Wähle die Methode zum Angreifen aus.
#
Für begegnungMit kannst du folgende Idee verwenden:
  Wenn (hindernis ist gleich 'Gegner') dann
    rufe Methode kaempfen auf
    gib 'Attacke!' zurück
  sonst
    --alles was vorher in der Methode stand--
  ende wenn`,
    },
    {
      name: '/str/Data/Anleitungstexte.txt',
      content: `Willkommen in der Heldenvorbereitung. Hier steht immer, was du tun musst.
Als erstes wirst du einen eigenen Helden erschaffen.
Verwende die Hilfe, um dafür eine neue Unterklasse von HELD (z.B: KRIEGER, ZAUBERER, ...) 
zu erstellen.

Die Hilfetexte findest du so:
Klicke jetzt mit Rechtsklick auf das rote Objekt unter den Klassen und führe 
die Methode 'hilfe' mit dem Code 111 aus. Dort erfährst du wie es weitergeht.
#
Sehr gut. Als nächstes braucht deine neue Klasse einige Eigenschaften.
-> Bearbeite vom Aufgabenblatt die Nummer 2!
Ergänze danach mehrere Attribute in deiner Klasse und starte neu.
Die Hilfe befindet sich jetzt unter Rechtsklick "geerbt von HELD".
Falls du Hilfe brauchst verwende den Code: 112.
#
Prima. Ergänze zusätzlich ein ganzzahliges Attribut 'leben', damit du dort seine 
Lebenspunkte speichern kannst. (Hilfe unter 121)
#
Ohje! Einige seiner Werte sind noch auf 0!! Das muss schnell geändert werden.
-> Bearbeite zuerst vom Aufgabenblatt Aufgabe 4 (!!).
Ergänze nun auf die gleiche Art sinnvolle Startwerte für alle deine Attribute.
#
Dein Held sollte auch etwas machen können! Schreibe ihm dafür eine Methode.
Einfache Methoden haben immer den folgenden Aufbau:
void methodenname(){

}

(Hilfe unter 133)
#
Hmmm! Die Methode ist da, macht aber noch nichts.
-> Bearbeite jetzt Aufgabe 5 auf dem Blatt.
Ändere danach die Methode so, dass sie sinnvoll Attributwerte verändert!
#
Letzte Vorbereitung: Dein Held benötigt noch eine weitere Methode 'heilen'. 
Diese soll seine Lebenspunkte genau um 2 erhöhen. (Hilfe unter 143)
#
Jeah! Damit bist du bereit für den Dungeon!
Um den Dungeon zu betreten, zeige dein Heft mit Arbeitsblatt vorne der Lehrkraft.

Bonus für Schnelle: Schreibe eine Methode 'aufleveln', die alle Attribute verändert (und ggf. verbessert).
###
Ohje, dein Held ist voll gegen die Wand gelaufen. Das mit dem Ducken scheint noch nicht 
zu klappen. Woher kann er das überhaupt? Schau in die Oberklasse HELD und finde die 
Methode. Diese sollte auch erklären, warum das nicht klappt. Leider darfst du 
die Oberklasse nicht verändern.
 -> Bearbeite Aufgabenblatt Nummer 7!
Überschreibe danach die Methode in deiner Unterklasse und ändere ihren Rückgabewert, 
sodass er sich ducken kann. (Hilfe unter 241)
#
Dein Held ist so stolz, dass er es reingeschafft hat, dass er gleich etwas sagen muss.
Schreibe ihm eine Methode 'freuen' mit einem freudigen Text als Rückgabewert.
-> Bearbeite dann Aufgabenblatt Nummer 8. (Hilfe unter 244)
#
Mist. Jetzt steht dein Held vor dem Spalt und bewegt sich nicht weiter. So wird das nichts.
Schau wieder in die Klasse HELD. Hier findest du die Methode, die für die 'nichts'-Reaktion
verantwortlich ist. 
Überschreibe sie in deiner Unterklasse, sodass sie 'springen' zurück gibt.
(Hilfe unter 259)
#
Verflixt! Davon wurde das Monster wach. Dein Held hatte keine Chance...
An diesem Ungetüm kann man sich nur vorbei schleichen. Doch was passiert wenn du einfach
'schleichen' statt 'springen' zurück gibst? Wenn du dir nicht sicher bist, probiere es aus!
#
Schau dir die Methode 'begegnungMit' genau an. Worin unterscheidet sie sich von den anderen?
-> Bearbeite jetzt Aufgabenblatt Nummer 9.
Der Parameter 'hindernis' sollte dir helfen. Lass dir als erstes seine Werte anzeigen, 
indem du die folgende Zeile über 'return' abschreibst und neu startest:
  System.out.println("Schau HIER: " + hindernis);

Starte neu! Siehst du oben die neuen Ausgaben? Der Parameter ist wirklich jedes mal anders.
-> Bearbeite auch noch Aufgabenblatt Nummer 10.
Schreibe dann eine Bedingung, sodass der Held schleicht, wenn er auf das Monster trifft 
und sonst immer springt. (Hilfe unter 263)
#
Du musst die Methode 'begegnungMit' nochmal umbauen. Finde eine Möglichkeit,
sodass dein Held alle Hindernisse überwindet. (Hilfe unter 276)
#
Super. Du bist erfolgreich durch die Gänge des DUNGEON gelaufen.
Im dritten Teil erfährst du, was sich hinter der Tür befindet.
Verwende für deine Heldenklasse in BlueJ auch den Menüpunkt "Bearbeiten > Auto-Layout".
Zeige dann dein Heft mit den Lösungen wieder vorne am Lehrerpult.

Bonus (FEHLT): Um das große Finale zu erreichen, erwartet dich noch ein ganzes Dungeonlabyrinth.
###
Leider hat dein Held keine Ahnung, was er jetzt tun soll. So wird das nichts.
Schreibe als erstes eine Methode 'kaempfen' (ohne Parameter oder Rückgabewert).
 -> Bearbeite jetzt Aufgabenblatt Nummer 12. (!)
Dein Held weiß sogar bereits wie man angreift. Eine passende Methode wurde in 
der Klasse HELD bereits programmiert. Um diese Methode im Kampf zu benutzen, 
rufe die passende Methode der Oberklasse in deiner neuen Methode 'kaempfen' auf. 
(Hilfe unter 309)
#
Deine Methode 'kaempfen' ist vorhanden. Jedoch macht sie noch nicht das richtige.
Schreibe sie so, dass sie die andere Methode zum angreifen aus der Oberklasse
aufruft. (Hilfe unter 309)
#
Und so hat der kleine Gnom deinen Helden besiegt. Das ging schnell. :-(
Dein Held weiß noch nicht, wann er seine Methode 'kaempfen' verwenden soll.
Baue also die Methode 'begegnungMit' so um, dass du bei einem *Gegner* zuerst deine neue
Methode 'kaempfen' aufrufst und als Rückgabe danach 'Attacke!' zurück gibst.
(Hilfe unter 333)
#
Prima! Du musst ab jetzt die Methode 'begegnungMit' nicht mehr ändern!
Dein Held musste aber auch bisschen was einstecken. Schau mal nach seinen Leben:
Klicke mit Rechtsklick auf das rote Helden-Objekt, dann auf 'Inspizieren'. 
Hier solltest du die Attributwerte sehen.
Füge in der Methode 'kaempfen' nach deinem Angriff noch einen Methodenaufruf 
von 'heilen' ein, damit es ihm etwas besser geht.
#
Beachte, dass dein Held sich nur 1x pro Kampfrunde heilen darf!!!
Er sollte jetzt eigentlich genau 82 Lebenspunkte haben.
#
OHA! Der ist viel krasser! Schau mal nach deinen Lebenspunkten!
Nach nur wenigen Kampfrunden ist dein Held ohnmächtig zusammengeklappt.
Du musst schneller angreifen! Schreibe die Methode so um, dass du jedes mal 5x angreifst, 
indem du einfach mehrere Methodenaufrufe schreibst. 
Beachte, dass du dich nur einmal heilen darfst.
#
WUUMMS! Jova hat deinen Helden mit seiner riesigen Keule zu Pfannkuchenmatsche zerschlagen.
Irgendwie muss dein Held überirdisch schnell angreifen...
-> Bearbeite Aufgabenblatt Nummer 13.
Löse das Problem mit dem Endgegner, indem du pro Kampfrunde mindestens 100 Angriffe machst.`,
    },
  ],
}
