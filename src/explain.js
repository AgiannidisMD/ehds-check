// Plain-language explanations for the most common HL7 FHIR Validator messages.
// Keyed by the validator's message-id; `match` pulls values out of the English
// text so they can be reused in every language.
// Translations: EN/EL reviewed by owner pending; SK/CS need a native FHIR reviewer
// (tracked in docs/I18N-REVIEW.md). Never add clinical interpretation here.

export const LANGS = ['en', 'el', 'sk', 'cs'];

const C = {
  Validation_VAL_Profile_Minimum: {
    match: /^(?<el>[\w.\[\]:-]+): minimum required = (?<min>\d+), but only found (?<found>\d+)/,
    en: { t: 'Required field missing: {el}', f: 'Add `{el}` (at least {min}). The EU profile requires it.' },
    el: { t: 'Λείπει υποχρεωτικό πεδίο: {el}', f: 'Πρόσθεσε το `{el}` (τουλάχιστον {min}). Το ευρωπαϊκό προφίλ το απαιτεί.' },
    sk: { t: 'Chýba povinný prvok: {el}', f: 'Doplňte `{el}` (aspoň {min}). Európsky profil ho vyžaduje.' },
    cs: { t: 'Chybí povinný prvek: {el}', f: 'Doplňte `{el}` (alespoň {min}). Evropský profil ho vyžaduje.' },
  },
  Validation_VAL_Profile_Maximum: {
    match: /^(?<el>[\w.\[\]:-]+): max allowed = (?<max>\d+), but found (?<found>\d+)/,
    en: { t: 'Too many values in {el}', f: 'Keep at most {max} (found {found}).' },
    el: { t: 'Πάρα πολλές τιμές στο {el}', f: 'Επιτρέπονται έως {max} (βρέθηκαν {found}).' },
    sk: { t: 'Príliš veľa hodnôt v {el}', f: 'Povolené je najviac {max} (nájdené {found}).' },
    cs: { t: 'Příliš mnoho hodnot v {el}', f: 'Povoleno je nejvýše {max} (nalezeno {found}).' },
  },
  _DT_Fixed_Wrong: {
    match: /^Value is '(?<val>[^']*)' but is fixed to '(?<fixed>[^']*)'/,
    en: { t: 'Wrong fixed value: "{val}"', f: 'This field must be exactly "{fixed}".' },
    el: { t: 'Λάθος σταθερή τιμή: «{val}»', f: 'Το πεδίο πρέπει να είναι ακριβώς «{fixed}».' },
    sk: { t: 'Nesprávna pevná hodnota: „{val}“', f: 'Tento prvok musí mať presne hodnotu „{fixed}“.' },
    cs: { t: 'Nesprávná pevná hodnota: „{val}“', f: 'Tento prvek musí mít přesně hodnotu „{fixed}“.' },
  },
  Bundle_Document_Date_Missing: {
    en: { t: 'Document has no date', f: 'Set `Bundle.timestamp` to when the document was assembled.' },
    el: { t: 'Το έγγραφο δεν έχει ημερομηνία', f: 'Βάλε στο `Bundle.timestamp` την ώρα που δημιουργήθηκε το έγγραφο.' },
    sk: { t: 'Dokument nemá dátum', f: 'Vyplňte `Bundle.timestamp` časom vytvorenia dokumentu.' },
    cs: { t: 'Dokument nemá datum', f: 'Vyplňte `Bundle.timestamp` časem vytvoření dokumentu.' },
  },
  Reference_REF_CantMatchChoice: {
    match: /^Unable to find a profile match for (?<ref>\S+)/,
    en: { t: 'A referenced resource does not fit the EU profile', f: 'The resource {ref} has its own errors (listed above). Fix those first; this one usually disappears with them.' },
    el: { t: 'Ένα συνδεδεμένο στοιχείο δεν ταιριάζει στο ευρωπαϊκό προφίλ', f: 'Το {ref} έχει δικά του λάθη (βλ. παραπάνω). Διόρθωσέ τα πρώτα· συνήθως αυτό φεύγει μαζί τους.' },
    sk: { t: 'Odkazovaný zdroj nezodpovedá európskemu profilu', f: 'Zdroj {ref} má vlastné chyby (uvedené vyššie). Opravte najprv tie; táto chyba zvyčajne zmizne s nimi.' },
    cs: { t: 'Odkazovaný zdroj neodpovídá evropskému profilu', f: 'Zdroj {ref} má vlastní chyby (uvedené výše). Opravte nejprve ty; tato chyba obvykle zmizí s nimi.' },
  },
  Reference_REF_CantResolve: {
    match: /reference '(?<ref>[^']*)'/,
    en: { t: 'Broken reference: {ref}', f: 'Add the referenced resource to the Bundle or correct the reference.' },
    el: { t: 'Σπασμένη αναφορά: {ref}', f: 'Πρόσθεσε το στοιχείο στο Bundle ή διόρθωσε την αναφορά.' },
    sk: { t: 'Neplatný odkaz: {ref}', f: 'Pridajte odkazovaný zdroj do Bundle alebo opravte odkaz.' },
    cs: { t: 'Neplatný odkaz: {ref}', f: 'Přidejte odkazovaný zdroj do Bundle nebo opravte odkaz.' },
  },
  Bundle_BUNDLE_Entry_NotFound: {
    match: /^Can't find '(?<ref>[^']*)'/,
    en: { t: 'Reference not found in the Bundle: {ref}', f: 'Every reference inside a document must point to an entry in the same Bundle (matching fullUrl).' },
    el: { t: 'Η αναφορά δεν βρέθηκε στο Bundle: {ref}', f: 'Κάθε αναφορά μέσα στο έγγραφο πρέπει να δείχνει σε στοιχείο του ίδιου Bundle (ίδιο fullUrl).' },
    sk: { t: 'Odkaz sa v Bundle nenašiel: {ref}', f: 'Každý odkaz v dokumente musí smerovať na položku v tom istom Bundle (rovnaké fullUrl).' },
    cs: { t: 'Odkaz nebyl v Bundle nalezen: {ref}', f: 'Každý odkaz v dokumentu musí mířit na položku ve stejném Bundle (stejné fullUrl).' },
  },
  BUNDLE_BUNDLE_ENTRY_REVERSE_R4: {
    en: { t: 'Entry not linked from the Composition', f: 'Reference this entry from the Composition (or a resource it links to). Unlinked entries may be ignored by receivers.' },
    el: { t: 'Στοιχείο που δεν συνδέεται με το Composition', f: 'Βάλε αναφορά σε αυτό από το Composition (ή από κάτι που συνδέεται με αυτό). Αλλιώς ο παραλήπτης μπορεί να το αγνοήσει.' },
    sk: { t: 'Položka nie je prepojená z Composition', f: 'Odkážte na ňu z Composition (alebo z prepojeného zdroja). Inak ju príjemca môže ignorovať.' },
    cs: { t: 'Položka není propojena z Composition', f: 'Odkažte na ni z Composition (nebo z propojeného zdroje). Jinak ji příjemce může ignorovat.' },
  },
  Bundle_BUNDLE_Entry_Orphan_DOCUMENT: { alias: 'BUNDLE_BUNDLE_ENTRY_REVERSE_R4' },
  Type_Specific_Checks_DT_DateTime_Valid: {
    match: /format: '(?<val>[^']*)'/,
    en: { t: 'Invalid date/time: "{val}"', f: 'Use ISO 8601, e.g. 2026-10-24T09:30:00+02:00.' },
    el: { t: 'Μη έγκυρη ημερομηνία/ώρα: «{val}»', f: 'Χρησιμοποίησε ISO 8601, π.χ. 2026-10-24T09:30:00+02:00.' },
    sk: { t: 'Neplatný dátum/čas: „{val}“', f: 'Použite ISO 8601, napr. 2026-10-24T09:30:00+02:00.' },
    cs: { t: 'Neplatné datum/čas: „{val}“', f: 'Použijte ISO 8601, např. 2026-10-24T09:30:00+02:00.' },
  },
  Type_Specific_Checks_DT_Date_Valid: {
    match: /format: '(?<val>[^']*)'/,
    en: { t: 'Invalid date: "{val}"', f: 'Use YYYY-MM-DD, e.g. 2026-10-24.' },
    el: { t: 'Μη έγκυρη ημερομηνία: «{val}»', f: 'Χρησιμοποίησε ΕΕΕΕ-ΜΜ-ΗΗ, π.χ. 2026-10-24.' },
    sk: { t: 'Neplatný dátum: „{val}“', f: 'Použite RRRR-MM-DD, napr. 2026-10-24.' },
    cs: { t: 'Neplatné datum: „{val}“', f: 'Použijte RRRR-MM-DD, např. 2026-10-24.' },
  },
  Type_Specific_Checks_DT_Instant_Valid: {
    en: { t: 'Invalid timestamp', f: 'An instant needs date, time and time zone, e.g. 2026-10-24T09:30:00Z.' },
    el: { t: 'Μη έγκυρη χρονοσφραγίδα', f: 'Χρειάζεται ημερομηνία, ώρα και ζώνη ώρας, π.χ. 2026-10-24T09:30:00Z.' },
    sk: { t: 'Neplatná časová pečiatka', f: 'Potrebný je dátum, čas a časové pásmo, napr. 2026-10-24T09:30:00Z.' },
    cs: { t: 'Neplatné časové razítko', f: 'Je potřeba datum, čas a časové pásmo, např. 2026-10-24T09:30:00Z.' },
  },
  Type_Specific_Checks_DT_Decimal_Valid: {
    match: /value '(?<val>[^']*)'/,
    en: { t: 'Not a valid number: "{val}"', f: 'Use a dot as decimal separator and no units inside the value (e.g. 5.4).' },
    el: { t: 'Μη έγκυρος αριθμός: «{val}»', f: 'Βάλε τελεία για δεκαδικά και καμία μονάδα μέσα στην τιμή (π.χ. 5.4).' },
    sk: { t: 'Neplatné číslo: „{val}“', f: 'Použite bodku ako desatinný oddeľovač a bez jednotky v hodnote (napr. 5.4).' },
    cs: { t: 'Neplatné číslo: „{val}“', f: 'Použijte tečku jako desetinný oddělovač a bez jednotky v hodnotě (např. 5.4).' },
  },
  Type_Specific_Checks_DT_String_WS: {
    en: { t: 'Text starts or ends with spaces', f: 'Trim leading/trailing whitespace.' },
    el: { t: 'Κείμενο με κενά στην αρχή ή στο τέλος', f: 'Αφαίρεσε τα κενά στην αρχή και στο τέλος.' },
    sk: { t: 'Text začína alebo končí medzerou', f: 'Odstráňte medzery na začiatku a konci.' },
    cs: { t: 'Text začíná nebo končí mezerou', f: 'Odstraňte mezery na začátku a konci.' },
  },
  Type_Specific_Checks_DT_Identifier_System: {
    en: { t: 'Identifier system is not an absolute URI', f: 'Use a full URI (e.g. urn:oid:… or https://…) in `Identifier.system`.' },
    el: { t: 'Το system του αναγνωριστικού δεν είναι πλήρες URI', f: 'Βάλε πλήρες URI (π.χ. urn:oid:… ή https://…) στο `Identifier.system`.' },
    sk: { t: 'Systém identifikátora nie je absolútne URI', f: 'Použite úplné URI (napr. urn:oid:… alebo https://…) v `Identifier.system`.' },
    cs: { t: 'Systém identifikátoru není absolutní URI', f: 'Použijte úplné URI (např. urn:oid:… nebo https://…) v `Identifier.system`.' },
  },
  Terminology_TX_System_Unknown: {
    match: /System '(?<sys>[^']*)'/,
    en: { t: 'Unknown code system: {sys}', f: 'Check the spelling of the system URI (e.g. http://loinc.org, http://snomed.info/sct).' },
    el: { t: 'Άγνωστο σύστημα κωδικών: {sys}', f: 'Έλεγξε τη γραφή του URI (π.χ. http://loinc.org, http://snomed.info/sct).' },
    sk: { t: 'Neznámy kódový systém: {sys}', f: 'Skontrolujte URI systému (napr. http://loinc.org, http://snomed.info/sct).' },
    cs: { t: 'Neznámý kódový systém: {sys}', f: 'Zkontrolujte URI systému (např. http://loinc.org, http://snomed.info/sct).' },
  },
  Terminology_TX_NoValid_1_CC: {
    en: { t: 'Code is not from the required list', f: 'Use a code from the value set named in the details. Required = no other codes allowed.' },
    el: { t: 'Ο κωδικός δεν είναι από την υποχρεωτική λίστα', f: 'Χρησιμοποίησε κωδικό από το value set που αναφέρεται στις λεπτομέρειες. Δεν επιτρέπονται άλλοι.' },
    sk: { t: 'Kód nie je z povinného zoznamu', f: 'Použite kód z uvedenej množiny hodnôt (value set). Iné kódy nie sú povolené.' },
    cs: { t: 'Kód není z povinného seznamu', f: 'Použijte kód z uvedené množiny hodnot (value set). Jiné kódy nejsou povoleny.' },
  },
  Terminology_TX_NoValid_2_CC: {
    en: { t: 'Code is not from the preferred list', f: 'Use a code from the named value set unless none fits.' },
    el: { t: 'Ο κωδικός δεν είναι από την προτεινόμενη λίστα', f: 'Χρησιμοποίησε κωδικό από το value set, εκτός αν κανένας δεν ταιριάζει.' },
    sk: { t: 'Kód nie je z odporúčaného zoznamu', f: 'Použite kód z množiny hodnôt, ak niektorý vyhovuje.' },
    cs: { t: 'Kód není z doporučeného seznamu', f: 'Použijte kód z množiny hodnot, pokud některý vyhovuje.' },
  },
  Terminology_TX_Code_ValueSet: {
    en: { t: 'Code missing', f: 'This element needs a code from the value set named in the details.' },
    el: { t: 'Λείπει κωδικός', f: 'Το πεδίο θέλει κωδικό από το value set που αναφέρεται στις λεπτομέρειες.' },
    sk: { t: 'Chýba kód', f: 'Prvok vyžaduje kód z uvedenej množiny hodnôt.' },
    cs: { t: 'Chybí kód', f: 'Prvek vyžaduje kód z uvedené množiny hodnot.' },
  },
  Terminology_TX_Display_Wrong: {
    match: /should be '(?<disp>[^']*)'/,
    en: { t: 'Display text does not match the code', f: 'Use the official display "{disp}".' },
    el: { t: 'Το κείμενο display δεν ταιριάζει με τον κωδικό', f: 'Βάλε το επίσημο display «{disp}».' },
    sk: { t: 'Zobrazovaný text nezodpovedá kódu', f: 'Použite oficiálny text „{disp}“.' },
    cs: { t: 'Zobrazovaný text neodpovídá kódu', f: 'Použijte oficiální text „{disp}“.' },
  },
  Extension_EXT_Unknown: {
    match: /extension (?<url>\S+)/,
    en: { t: 'Unknown extension', f: 'The extension {url} is not defined in the loaded guides. Check its URL or remove it.' },
    el: { t: 'Άγνωστο extension', f: 'Το extension {url} δεν ορίζεται στους οδηγούς. Έλεγξε το URL ή αφαίρεσέ το.' },
    sk: { t: 'Neznáme rozšírenie', f: 'Rozšírenie {url} nie je definované v načítaných príručkách. Skontrolujte URL alebo ho odstráňte.' },
    cs: { t: 'Neznámé rozšíření', f: 'Rozšíření {url} není definováno v načtených průvodcích. Zkontrolujte URL nebo ho odstraňte.' },
  },
  Extension_EXT_Unknown_NotHere: { alias: 'Extension_EXT_Unknown' },
  Validation_VAL_Profile_NotSlice: {
    en: { t: 'Element not allowed here (closed list)', f: 'The profile allows only specific entries at this position. Remove it or make it match one of the defined slices.' },
    el: { t: 'Στοιχείο που δεν επιτρέπεται εδώ', f: 'Το προφίλ επιτρέπει μόνο συγκεκριμένα στοιχεία σε αυτή τη θέση. Αφαίρεσέ το ή κάν’ το να ταιριάζει σε ένα από τα ορισμένα.' },
    sk: { t: 'Prvok tu nie je povolený (uzavretý zoznam)', f: 'Profil tu povoľuje len určené položky. Odstráňte ho alebo ho upravte podľa definovaných častí (slices).' },
    cs: { t: 'Prvek zde není povolen (uzavřený seznam)', f: 'Profil zde povoluje jen určené položky. Odstraňte ho nebo ho upravte podle definovaných částí (slices).' },
  },
  Validation_VAL_Unknown_Profile: {
    en: { t: 'Unknown profile', f: 'meta.profile points to a profile that is not loaded. Check the URL/version or choose another --ig.' },
    el: { t: 'Άγνωστο προφίλ', f: 'Το meta.profile δείχνει σε προφίλ που δεν φορτώθηκε. Έλεγξε URL/έκδοση ή διάλεξε άλλο --ig.' },
    sk: { t: 'Neznámy profil', f: 'meta.profile odkazuje na nenačítaný profil. Skontrolujte URL/verziu alebo zvoľte iný --ig.' },
    cs: { t: 'Neznámý profil', f: 'meta.profile odkazuje na nenačtený profil. Zkontrolujte URL/verzi nebo zvolte jiný --ig.' },
  },
  Resource_RES_ID_Missing: {
    en: { t: 'Resource has no id', f: 'Give the resource an `id`.' },
    el: { t: 'Το στοιχείο δεν έχει id', f: 'Δώσε `id` στο στοιχείο.' },
    sk: { t: 'Zdroj nemá id', f: 'Doplňte `id` zdroja.' },
    cs: { t: 'Zdroj nemá id', f: 'Doplňte `id` zdroje.' },
  },
  Unknown_Property: {
    match: /property(?: name)? '?(?<prop>[\w-]+)'?/,
    en: { t: 'Unknown field: {prop}', f: 'This JSON property does not exist in FHIR R4. Check spelling and nesting.' },
    el: { t: 'Άγνωστο πεδίο: {prop}', f: 'Αυτό το πεδίο JSON δεν υπάρχει στο FHIR R4. Έλεγξε ορθογραφία και θέση.' },
    sk: { t: 'Neznámy prvok: {prop}', f: 'Táto vlastnosť JSON vo FHIR R4 neexistuje. Skontrolujte pravopis a vnorenie.' },
    cs: { t: 'Neznámý prvek: {prop}', f: 'Tato vlastnost JSON ve FHIR R4 neexistuje. Zkontrolujte pravopis a vnoření.' },
  },
  UNKNOWN_CODESYSTEM: {
    match: /CodeSystem '(?<sys>[^']*)'/,
    en: { t: 'Code system not available offline: {sys}', f: 'Usually fine. The code could not be checked without a terminology server; use --tx to check it.' },
    el: { t: 'Το σύστημα κωδικών δεν είναι διαθέσιμο offline: {sys}', f: 'Συνήθως δεν πειράζει. Ο κωδικός δεν ελέγχθηκε χωρίς terminology server· με --tx ελέγχεται.' },
    sk: { t: 'Kódový systém nie je dostupný offline: {sys}', f: 'Zvyčajne v poriadku. Kód sa bez terminologického servera neoveril; použite --tx.' },
    cs: { t: 'Kódový systém není dostupný offline: {sys}', f: 'Obvykle v pořádku. Kód nebyl bez terminologického serveru ověřen; použijte --tx.' },
  },
  UNKNOWN_CODESYSTEM_VERSION: { alias: 'UNKNOWN_CODESYSTEM' },
  Language_XHTML_Lang_Missing1: {
    en: { t: 'Narrative has no language tag', f: 'The resource sets `language`, so add both `lang` and `xml:lang` to the `text.div` element, e.g. `<div xmlns="http://www.w3.org/1999/xhtml" lang="sk" xml:lang="sk">`.' },
    el: { t: 'Το κείμενο (narrative) δεν δηλώνει γλώσσα', f: 'Ο πόρος έχει `language`, οπότε βάλε και `lang` και `xml:lang` στο `text.div`, π.χ. `<div xmlns="http://www.w3.org/1999/xhtml" lang="el" xml:lang="el">`.' },
    sk: { t: 'Text (narrative) nemá označenie jazyka', f: 'Zdroj má `language`, preto doplňte `lang` aj `xml:lang` do `text.div`, napr. `<div xmlns="http://www.w3.org/1999/xhtml" lang="sk" xml:lang="sk">`.' },
    cs: { t: 'Text (narrative) nemá označení jazyka', f: 'Zdroj má `language`, proto doplňte `lang` i `xml:lang` do `text.div`, např. `<div xmlns="http://www.w3.org/1999/xhtml" lang="cs" xml:lang="cs">`.' },
  },
  Language_XHTML_Lang_Missing2: { alias: 'Language_XHTML_Lang_Missing1' },
  Language_XHTML_Lang_Missing3: { alias: 'Language_XHTML_Lang_Missing1' },
  Reference_REF_MultipleMatches: {
    match: /profiles for (?<ref>\S+)/,
    en: { t: 'Reference matches more than one profile', f: 'Informational: {ref} fits several allowed profiles. Add meta.profile to make the intent explicit.' },
    el: { t: 'Η αναφορά ταιριάζει σε περισσότερα από ένα προφίλ', f: 'Ενημερωτικό: το {ref} ταιριάζει σε πολλά προφίλ. Βάλε meta.profile για να είναι σαφές.' },
    sk: { t: 'Odkaz zodpovedá viacerým profilom', f: 'Informatívne: {ref} zodpovedá viacerým profilom. Doplňte meta.profile.' },
    cs: { t: 'Odkaz odpovídá více profilům', f: 'Informativní: {ref} odpovídá více profilům. Doplňte meta.profile.' },
  },
  Bundle_BUNDLE_Not_Local: {
    match: /bundle (?<ref>\S+)$/,
    en: { t: 'Reference points outside the document: {ref}', f: 'A urn:uuid reference must match the fullUrl of an entry in this Bundle.' },
    el: { t: 'Αναφορά εκτός εγγράφου: {ref}', f: 'Μια αναφορά urn:uuid πρέπει να ταιριάζει με το fullUrl ενός στοιχείου του ίδιου Bundle.' },
    sk: { t: 'Odkaz mimo dokumentu: {ref}', f: 'Odkaz urn:uuid musí zodpovedať fullUrl položky v tomto Bundle.' },
    cs: { t: 'Odkaz mimo dokument: {ref}', f: 'Odkaz urn:uuid musí odpovídat fullUrl položky v tomto Bundle.' },
  },
  INV_FAILED: {
    match: /^Constraint failed: (?<key>[\w-]+): '(?<desc>[^']*)'/,
    en: { t: 'Rule {key} broken', f: 'The profile rule says: "{desc}".' },
    el: { t: 'Παραβιάστηκε ο κανόνας {key}', f: 'Ο κανόνας του προφίλ λέει: «{desc}».' },
    sk: { t: 'Porušené pravidlo {key}', f: 'Pravidlo profilu: „{desc}“.' },
    cs: { t: 'Porušené pravidlo {key}', f: 'Pravidlo profilu: „{desc}“.' },
  },
  Error_validating_code_running_without_terminology_services: {
    en: { t: 'Code not checked (offline mode)', f: 'Codes are not checked against terminology servers in offline mode. Use --tx to opt in (sends codes, not documents, to tx.fhir.org).' },
    el: { t: 'Ο κωδικός δεν ελέγχθηκε (offline)', f: 'Σε offline λειτουργία οι κωδικοί δεν ελέγχονται. Με --tx ενεργοποιείται ο έλεγχος (στέλνονται κωδικοί, όχι έγγραφα, στο tx.fhir.org).' },
    sk: { t: 'Kód neoverený (offline)', f: 'V režime offline sa kódy neoverujú. Voľba --tx zapne overenie (odosielajú sa kódy, nie dokumenty, na tx.fhir.org).' },
    cs: { t: 'Kód neověřen (offline)', f: 'V režimu offline se kódy neověřují. Volba --tx zapne ověření (odesílají se kódy, ne dokumenty, na tx.fhir.org).' },
  },
};

const GENERIC = {
  en: { t: 'Conformance issue', f: 'See the validator details below.' },
  el: { t: 'Θέμα συμμόρφωσης', f: 'Δες τις λεπτομέρειες του validator παρακάτω.' },
  sk: { t: 'Problém so zhodou', f: 'Pozrite podrobnosti validátora nižšie.' },
  cs: { t: 'Problém se shodou', f: 'Viz podrobnosti validátoru níže.' },
};

// Validator variants that share one explanation.
const ALIASES = {
  INV_FAILED_SOURCE: 'INV_FAILED',
  INV_FAILED_ID: 'INV_FAILED',
  INV_FAILED_ID_SOURCE: 'INV_FAILED',
  UNKNOWN_PROPERTY: 'Unknown_Property',
  Unrecognised_property_: 'Unknown_Property',
};

// Some validator messages carry no message-id (or a profile#invariant id).
const TEXT_FALLBACK = [
  [/^Unrecognized property '/, 'Unknown_Property'],
  [/^Unknown property name /, 'Unknown_Property'],
  [/^Constraint failed: /, 'INV_FAILED'],
];

function resolveId(issue) {
  const id = issue.messageId;
  if (id && id.includes('#')) return 'INV_FAILED';
  if (id) return id;
  const hit = TEXT_FALLBACK.find(([re]) => re.test(issue.text || ''));
  return hit ? hit[1] : null;
}

function entry(id) {
  if (!id) return undefined;
  const base = id.replace(/_(one|other)$/, '');
  let e = C[id] || C[base] || C[ALIASES[id]];
  if (e && e.alias) e = C[e.alias];
  return e;
}

function fill(tpl, vars) {
  return tpl.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
}

export function knownIds() {
  return Object.keys(C);
}

/** Returns { title, fix, known } for an issue in the given language. */
export function explain(issue, lang = 'en') {
  if (!LANGS.includes(lang)) lang = 'en';
  const e = entry(resolveId(issue));
  if (!e) return { ...render(GENERIC[lang], {}), known: false };
  const vars = {};
  if (e.match) {
    const m = issue.text.match(e.match);
    if (m && m.groups) Object.assign(vars, m.groups);
  }
  return { ...render(e[lang] || e.en, vars), known: true };
}

function render(tpl, vars) {
  return { title: fill(tpl.t, vars), fix: fill(tpl.f, vars) };
}

export const CATALOG = C;
