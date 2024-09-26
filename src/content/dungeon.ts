import { IUIStore } from '@/data/types'

export const dungeon: IUIStore['classes'] = [
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
]
