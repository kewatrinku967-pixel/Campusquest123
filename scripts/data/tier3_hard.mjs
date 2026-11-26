export const tier3Hard = [
  {
    id: "MM091",
    category: "Locked Room Murder",
    difficulty: "Hard",
    scenario: "A retired judge is found dead of stab wounds inside his private library. The single oak door was bolted from the inside with a sliding brass barrel bolt, the leaded windows are locked from within, and no secret passages exist. Detectives discover a thin spool of monofilament fishing line and an ice cube tray with missing cubes in the nearby kitchen.",
    question: "How did the assassin slide the internal bolt shut from outside the room?",
    options: {
      A: "By looping the fishing line through the bolt handle, under the door, and anchoring it with melting ice or pulling it taut before slipping the line free",
      B: "By transmitting high-frequency ultrasonic vibrations to vibrate the brass latch across the door frame",
      C: "By using an industrial electromagnet through solid reinforced steel walls",
      D: "The judge accidentally stabbed himself multiple times and bolted the door"
    },
    correctAnswer: "A",
    explanation: "The combination of monofilament line and ice is a classic mechanical locked-room mechanism: tension on the line pulls the sliding bolt into the keeper, and pulling the line through or allowing an ice weight to melt leaves zero mechanical trace."
  },
  {
    id: "MM092",
    category: "Poisoning Mystery",
    difficulty: "Hard",
    scenario: "A pharmaceutical CEO died of aconitine poisoning during a private banquet. All guests ate from the same roasted duck carved at the table. Autopsy shows the aconitine was introduced directly into the duck meat, yet five other diners eating slices from the exact same duck were completely unaffected.",
    question: "How did the killer deliver a lethal dose into only the CEO's portion?",
    options: {
      A: "The carving knife was coated with aconitine on only one side of the blade, poisoning only the slice falling to that specific side",
      B: "The duck was genetically modified to produce aconitine in its left breast",
      C: "Aconitine only activates when exposed to executive-level adrenaline",
      D: "The other diners took antacid tablets that neutralize plant neurotoxins instantly"
    },
    correctAnswer: "A",
    explanation: "A single-side coated carving blade transfers poison only to the slice sheared by that face of the knife, leaving the carcass and slices cut with the clean side uncontaminated."
  },
  {
    id: "MM093",
    category: "Crime Scene Investigation",
    difficulty: "Hard",
    scenario: "A victim was found shot through the chest inside his study. The bullet passed through the glass window pane, creating a small round hole with concentric fracture rings on the inside surface and radial fracture lines extending outward. A secondary bullet hole is located 10 cm away.",
    question: "How can the forensic ballistics expert determine which shot was fired first through the glass?",
    options: {
      A: "The radial fractures of the second shot terminate abruptly when they intersect the radial fractures of the first shot",
      B: "The first shot always causes the entire window to turn completely opaque",
      C: "The second bullet hole is always three times larger in circumference than the first",
      D: "Glass remembers the acoustic sound signature of each gun discharge"
    },
    correctAnswer: "A",
    explanation: "Under forensic fracture mechanics, radial fracture lines caused by a second impact will stop propagating when they strike existing fracture cracks produced by the initial impact."
  },
  {
    id: "MM094",
    category: "Missing Evidence",
    difficulty: "Hard",
    scenario: "An embezzling accountant is found dead in his home office. Police find the ashes of burned documents inside the fireplace grate. Forensics notes that the edges of the charred paper have curled, but the ink print is completely gone, while an empty bottle of sodium hypochlorite (bleach) sits in the trash.",
    question: "Why did the perpetrator apply chemical bleach before burning the documents?",
    options: {
      A: "To oxidize and destroy the carbon-based ink particles, preventing infrared spectral recovery of the charred text",
      B: "Bleach makes paper burn with a bright blue theatrical flame",
      C: "To clean the brickwork of the fireplace before lighting the fire",
      D: "Bleach prevents smoke detectors from sensing carbon emissions"
    },
    correctAnswer: "A",
    explanation: "Burning alone leaves residual carbon pigments readable under infrared reflectance. Bleaching prior to incineration destroys the organic dyes and pigments, defeating forensic document recovery."
  },
  {
    id: "MM095",
    category: "Fake Alibis",
    difficulty: "Hard",
    scenario: "A suspect accused of a murder committed at 10:00 PM claims he was participating in an online chess tournament from his home desktop. Server logs confirm moves made from his IP address at 9:55 PM, 10:02 PM, and 10:10 PM. However, keystroke latency analysis shows move intervals exactly 180.00 seconds apart with zero millisecond deviation.",
    question: "What does the robotic millisecond precision reveal about this digital alibi?",
    options: {
      A: "The suspect used an automated script or chess bot to simulate active gameplay while he was physically away",
      B: "The suspect has superhuman biological timing capabilities",
      C: "The chess website server clock was running on solar time",
      D: "Ethernet cables force human beings to move chess pieces every three minutes"
    },
    correctAnswer: "A",
    explanation: "Zero-variance intervals in human-computer interaction reveal automated scripting. Humans exhibit natural variance in reaction and thought latency, exposing pre-programmed bot activity."
  },
  {
    id: "MM096",
    category: "CCTV Footage Investigation",
    difficulty: "Hard",
    scenario: "A murder occurs in an underground tunnel. Surveillance footage shows a suspect walking through Camera 1 at 9:00 PM and Camera 2 at 9:20 PM. The distance between the cameras is normally a 3-minute walk. The suspect claims he simply walked slowly because of a headache.",
    question: "What should detectives investigate regarding the missing 17 minutes of elapsed time?",
    options: {
      A: "Search for unmonitored blind spots, access corridors, or utility rooms between Camera 1 and Camera 2",
      B: "Check if the tunnel was moving due to seismic plate tectonics",
      C: "Recalculate the speed of light in underground concrete structures",
      D: "Assume the suspect took a nap in the middle of the camera's visual lens"
    },
    correctAnswer: "A",
    explanation: "An unexplained 17-minute gap over a 3-minute transit distance indicates the suspect diverted into an unmonitored lateral access point, room, or emergency stairwell."
  },
  {
    id: "MM097",
    category: "Witness Statements",
    difficulty: "Hard",
    scenario: "A witness swears she heard church bells chime midnight right as the fatal gunshot was fired. However, records from St. Jude's Church reveal the digital bell system failed that night and remained completely silent.",
    question: "What forensic audio possibility should detectives consider?",
    options: {
      A: "The killer played a pre-recorded broadcast of chimes or used a grandfather clock to stage an artificial temporal anchor",
      B: "Sound waves traveled from a church located in a different continent",
      C: "The witness has ultrasonic hearing that can detect silent electricity",
      D: "Church bells chime silently when someone is committing a crime"
    },
    correctAnswer: "A",
    explanation: "Perpetrators frequently stage audible cues (radio broadcasts, alarms, or recorded chimes) to plant a false time anchor in witnesses' memories."
  },
  {
    id: "MM098",
    category: "Hidden Clues",
    difficulty: "Hard",
    scenario: "A murdered antiquarian scribbled three Roman numerals on his blotter before dying: 'X - VII - XXIV'. On his bookshelf sits a 24-volume encyclopedia set and a Latin bible.",
    question: "What bibliographic cipher technique was the victim utilizing?",
    options: {
      A: "A book code cipher referencing Volume 10, Page 7, Line 24 (or Book, Chapter, Verse)",
      B: "A recipe for mixing archival bookbinding glue",
      C: "An invoice total for ten leather-bound books costing seven dollars",
      D: "A countdown of Roman emperors who were assassinated"
    },
    correctAnswer: "A",
    explanation: "Three-coordinate notation (Book/Volume, Page/Chapter, Line/Verse) is the classic bibliographic book cipher format used to point directly to a secret passage or name."
  },
  {
    id: "MM099",
    category: "Time of Death Analysis",
    difficulty: "Hard",
    scenario: "An autopsy reveals gastric contents consisting of high concentrations of pepsin and hydrochloric acid with partially emulsified lipids, but the contents have completely passed the duodenojejunal flexure into the mid-jejunum.",
    question: "What physiological milestone does this transit indicate regarding the post-prandial interval?",
    options: {
      A: "The victim died between 4 and 6 hours after consuming their last meal",
      B: "The victim died within 15 minutes of eating",
      C: "The victim had been fasting for over three weeks",
      D: "Digestion ceased before the food reached the stomach"
    },
    correctAnswer: "A",
    explanation: "Chyme typically reaches the mid-jejunum approximately 4 to 6 hours after meal ingestion, establishing a precise physiological bracket for time of death."
  },
  {
    id: "MM100",
    category: "Suspicious Behaviour",
    difficulty: "Hard",
    scenario: "A suspect claims he found his business partner dead in the warehouse office and immediately called 911 at 3:00 PM. Police phone records show he placed two calls at 2:55 PM: one to a criminal defense attorney and one to an international shipping broker.",
    question: "Why does the sequence of calls destroy his defense?",
    options: {
      A: "Contacting legal counsel and cargo transport prior to emergency medical services shows calculated self-protection before reporting",
      B: "Attorneys are not legally permitted to answer phone calls on weekdays",
      C: "Shipping brokers are required to report all phone calls to the navy",
      D: "Cellular phones cannot dial three-digit emergency numbers after 2:00 PM"
    },
    correctAnswer: "A",
    explanation: "Prioritizing legal defense and asset logistics minutes before calling emergency medical services demonstrates premeditated awareness and consciousness of guilt."
  },
  {
    id: "MM101",
    category: "Multiple Suspects",
    difficulty: "Hard",
    scenario: "A victim was poisoned by a dose of liquid nicotine. Three suspects visited his greenhouse: a tobacco farmer, an electronic cigarette manufacturer, and an entomologist who formulates pesticide sprays. Chemical assay of the toxin detects trace neonicotinoid adjuvant surfactants.",
    question: "Which suspect is definitively identified by the formulation adjuvants?",
    options: {
      A: "The entomologist, whose agricultural pesticide formulations specifically require surfactant adjuvants for leaf adhesion",
      B: "The tobacco farmer, because raw tobacco leaves produce neonicotinoid surfactants naturally",
      C: "The vape manufacturer, because e-liquids use food-grade vegetable glycerin rather than agricultural surfactants",
      D: "All three suspects use identical commercial surfactants in their daily lives"
    },
    correctAnswer: "A",
    explanation: "Adjuvants and surfactants are proprietary chemical carriers added specifically to agricultural pesticide solutions to facilitate foliar wetting, pointing directly to the entomologist."
  },
  {
    id: "MM102",
    category: "Psychological Detective Puzzles",
    difficulty: "Hard",
    scenario: "A suspect undergoing polygraph and cognitive interview exhibits micro-tremors in facial muscle groups (specifically the frontalis and orbicularis oculi) and involuntary pupil dilation whenever the victim's missing sapphire brooch is mentioned, but shows calm baselines for diamond jewelry.",
    question: "What does this localized sympathetic autonomic arousal indicate?",
    options: {
      A: "Guilty knowledge and specific affective salience tied directly to the stolen sapphire brooch",
      B: "An allergic biological reaction to the blue color of sapphires",
      C: "Pupillary dilation is a random reflex unrelated to central nervous system arousal",
      D: "The suspect was falling asleep during the questioning"
    },
    correctAnswer: "A",
    explanation: "Selective sympathetic nervous system activation (pupillometry and facial micro-expressions) triggered only by specific crime details isolates guilty recognition."
  },
  {
    id: "MM103",
    category: "Secret Relationships",
    difficulty: "Hard",
    scenario: "A murdered venture capitalist had a codicil in his offshore foundation leaving 40% of his fortune to a student living in Zurich. Genetic testing of the victim's hair follicle and the student's background reveals 50% identical autosomal STR alleles and matching Y-chromosomal haplotypes.",
    question: "What biological relationship connects the victim to the secret heir?",
    options: {
      A: "The student is the victim's biological son, revealing an undisclosed paternity tie",
      B: "The student is the victim's maternal grandfather",
      C: "The student is an unrelated stranger sharing statistical genetic anomalies",
      D: "Autosomal STR alleles are identical in all human beings"
    },
    correctAnswer: "A",
    explanation: "Sharing 50% autosomal alleles and an identical Y-STR haplotype confirms a direct paternal lineage (father-son relationship)."
  },
  {
    id: "MM104",
    category: "Forensic Evidence",
    difficulty: "Hard",
    scenario: "At a murder scene, a latent bloody shoeprint reveals a zigzag tread pattern with an embedded pebble defect measuring 4mm by 2mm in the heel strike zone. The suspect's boot has the identical tread pattern and an empty void in the heel rubber matching the exact defect geometry.",
    question: "What category of forensic evidence does this defect represent?",
    options: {
      A: "An individual characteristic that uniquely distinguishes that specific shoe from all mass-produced shoes",
      B: "A class characteristic common to every shoe manufactured in that factory",
      C: "An environmental illusion caused by optical microscope lighting",
      D: "A manufacturing defect present on every boot of that model"
    },
    correctAnswer: "A",
    explanation: "Accidental damage, cuts, voids, or wear defects acquired during use are individual characteristics that establish unique, conclusive source identification."
  },
  {
    id: "MM105",
    category: "Unexpected Murderer Reveals",
    difficulty: "Hard",
    scenario: "The forensic pathologist who performed the autopsy determined the victim died of natural cardiac arrest. However, an independent toxicologist from the state bureau discovers that the original tissue samples were treated with formaldehyde spiked with high levels of potassium to mask a lethal potassium chloride injection.",
    question: "What does this deliberate post-mortem chemical alteration prove?",
    options: {
      A: "The forensic pathologist actively tampered with histology specimens to conceal a homicidal poisoning",
      B: "Potassium levels naturally multiply by a factor of one thousand inside formaldehyde",
      C: "Formaldehyde is legally required to contain lethal concentrations of potassium",
      D: "The victim consumed pure potassium crystals after death occurred"
    },
    correctAnswer: "A",
    explanation: "Adulterating post-mortem tissue preservation fluids to artificially spike analyte baselines is a sophisticated method of forensic evidence fabrication by an insider examiner."
  },
  {
    id: "MM106",
    category: "Locked Room Murder",
    difficulty: "Hard",
    scenario: "A luxury yacht owner is found dead in his stateroom with carbon dioxide asphyxiation. The hatch was dogged tight from the inside with heavy marine brass handles, and the portlights were screwed shut. Detectives discover the ship's automatic fire-suppression CO2 canister valve was linked via servo-motor to a moisture sensor in the shower.",
    question: "How was the lethal gas released into the locked cabin?",
    options: {
      A: "When the victim turned on the shower, moisture triggered the servo-motor to flood the cabin with CO2 from the exterior supply",
      B: "Marine brass handles generate carbon dioxide gas when turned tightly",
      C: "The victim exhaled all the oxygen in the room within four seconds",
      D: "Ocean water evaporates into pure carbon dioxide inside luxury yachts"
    },
    correctAnswer: "A",
    explanation: "Rigging an exterior gas release system to an internal routine trigger (like shower humidity or light switches) allows an assassin to kill a victim in a sealed room hands-free."
  },
  {
    id: "MM107",
    category: "Poisoning Mystery",
    difficulty: "Hard",
    scenario: "A politician died from ingestion of polonium-210. Unlike chemical poisons, the alpha radiation emitting isotope left no chemical residue in stomach acid, but triggered severe bone marrow suppression and gastrointestinal epithelial destruction within four days.",
    question: "Why was polonium-210 chosen by the assassin?",
    options: {
      A: "Alpha emitters emit high localized cellular destruction without triggering conventional poison screening or standard Geiger counters through containers",
      B: "Polonium-210 is widely available in grocery store baking supplies",
      C: "Alpha particles travel through solid lead walls for five miles",
      D: "Chemical screening kits detect radiation faster than radioactive detectors"
    },
    correctAnswer: "A",
    explanation: "Polonium-210 emits short-range alpha particles easily shielded by a thin container, making it transportable without detection, yet extraordinarily lethal once ingested."
  },
  {
    id: "MM108",
    category: "Crime Scene Investigation",
    difficulty: "Hard",
    scenario: "A body was discovered inside an industrial walk-in freezer with frost covering the clothing. An investigator checks the eyes and observes that the corneal clouding is completely clear and unhazy, yet the core liver temperature is -5°C.",
    question: "What physiological anomaly does this reveal about where death occurred?",
    options: {
      A: "The victim died in a warm environment shortly before being placed in the freezer, or the cornea was protected from post-mortem drying",
      B: "Freezers cause the eyes to produce liquid tears indefinitely",
      C: "Corneas become completely opaque within one millisecond of death",
      D: "The victim was frozen while alive and survived for twenty years"
    },
    correctAnswer: "A",
    explanation: "Corneal clouding develops rapidly in open air; if the body is frozen before clouding occurs, or moved into freezing conditions post-mortem, investigators can decouple cooling from ocular changes."
  },
  {
    id: "MM109",
    category: "Missing Evidence",
    difficulty: "Hard",
    scenario: "A victim was shot three times with a revolver in an upscale condominium. Investigators search the trash chute and dumpsters but find no weapon. However, in the kitchen, detectives notice the induction stove was recently heated to 800°C and a heavy cast-iron crucible contains a pool of molten lead and melted copper alloy.",
    question: "What happened to the missing physical evidence?",
    options: {
      A: "The perpetrator melted down the bullets, brass components, or custom lead projectile molds to eradicate rifling ballistic markings",
      B: "The victim was practicing amateur jewelry making before being shot",
      C: "Induction stoves naturally liquefy metal cookware during cooking",
      D: "Lead and copper alloys are standard ingredients in French cuisine"
    },
    correctAnswer: "A",
    explanation: "Thermal destruction of ballistic evidence in a metallurgical furnace or crucible eradicates microscopic tool marks, rifling grooves, and metallurgical signatures."
  },
  {
    id: "MM110",
    category: "Fake Alibis",
    difficulty: "Hard",
    scenario: "A suspect claims he was boarding a transatlantic flight at JFK airport at 11:30 PM. Airline manifest records list his name, and his passport barcode was scanned at the departure gate at 11:15 PM. However, biometric facial recognition cameras at the gate show an individual wearing a prosthetic mask and tinted sunglasses holding the passport.",
    question: "What technique was deployed to engineer this international alibi?",
    options: {
      A: "A decoy impersonator was paid to use the suspect's passport and physical boarding pass to simulate international transit",
      B: "The facial recognition system confused the suspect with a flight attendant",
      C: "Passports automatically update their photos during night departures",
      D: "The airplane took off before the passenger reached the gate"
    },
    correctAnswer: "A",
    explanation: "Using an impersonator or body double equipped with the suspect's genuine travel documents produces deceptive administrative border control records."
  },
  {
    id: "MM111",
    category: "CCTV Footage Investigation",
    difficulty: "Hard",
    scenario: "A security video shows a suspect entering an elevator on the ground floor wearing a black trench coat and brown boots at 8:00 PM. At 8:05 PM, an individual wearing a yellow delivery raincoat and white sneakers exits the same elevator on the 10th floor. The elevator made zero stops in between.",
    question: "What forensic conclusion is mathematically and logically required?",
    options: {
      A: "The suspect shed a reversible or tear-away outer garment and swapped slip-on footwear inside the elevator car",
      B: "The elevator passed through a dimensional rift in the shaft",
      C: "The black trench coat changed chemical color due to elevator velocity",
      D: "Two completely different people were transported through solid steel walls"
    },
    correctAnswer: "A",
    explanation: "With zero intermediate stops and no other passengers entering or exiting, the occupant executed a quick costume and footwear transformation inside the cabin."
  },
  {
    id: "MM112",
    category: "Witness Statements",
    difficulty: "Hard",
    scenario: "A key witness testifies he recognized the defendant fleeing a murder scene by the distinctive squeak and rhythm of his custom leather prosthetic leg. Defense counsel argues that auditory identification of prosthetic gate sounds is unscientific.",
    question: "How can the prosecution forensically validate this auditory witness identification?",
    options: {
      A: "Acoustic spectrogram analysis comparing the audio frequency and cadence of the defendant's prosthetic stride to scene recordings",
      B: "Measuring the weight of the prosthetic leg on a bathroom scale",
      C: "Testing if leather produces sound when submerged in water",
      D: "Asking the witness to sing the sound of the squeak in court"
    },
    correctAnswer: "A",
    explanation: "Acoustic audio engineering can analyze cadence, frequency peaks, and friction harmonics from security microphones against the mechanical signature of a prosthetic device."
  },
  {
    id: "MM113",
    category: "Hidden Clues",
    difficulty: "Hard",
    scenario: "A murdered cryptographer leaves a Sudoku puzzle on his kitchen counter with numbers 1 through 9. Detectives note that row 5 has five numbers in pen: '4, 1, 9, 7, 2' with the remaining cells left blank, representing a coordinate lock on his underground fallout bunker.",
    question: "What cryptographic principle is being utilized by the cryptographer?",
    options: {
      A: "Steganography: hiding the secret combination within the visible structure of a common daily puzzle",
      B: "Sudoku puzzles are legally recognized as official safe combinations",
      C: "Numbers written in pen naturally reveal safe combinations when exposed to steam",
      D: "The numbers represent the year the kitchen table was built"
    },
    correctAnswer: "A",
    explanation: "Steganography is the practice of concealing a secret message, key, or code within an ordinary, innocuous medium (such as a partially solved newspaper puzzle)."
  },
  {
    id: "MM114",
    category: "Time of Death Analysis",
    difficulty: "Hard",
    scenario: "A victim found dead in a sealed apartment has vitreous humor potassium concentration ([K+]) measured at 12.5 mEq/L. The linear regression formula for post-mortem interval is PMI = 7.14 * [K+] - 39.1 hours.",
    question: "Using this vitreous potassium regression equation, what is the estimated post-mortem interval?",
    options: {
      A: "Approximately 50 hours (7.14 * 12.5 - 39.1 = 50.15 hours)",
      B: "Exactly 2 hours",
      C: "Over 300 hours",
      D: "Zero hours (death was instantaneous)"
    },
    correctAnswer: "A",
    explanation: "7.14 * 12.5 = 89.25; 89.25 - 39.1 = 50.15 hours. Vitreous potassium analysis provides an objective biochemical marker for extended post-mortem intervals."
  },
  {
    id: "MM115",
    category: "Suspicious Behaviour",
    difficulty: "Hard",
    scenario: "A suspect claims he was innocent of his business partner's electrocution in the company workshop. However, digital forensics uncovers that his home computer visited electrical engineering forums downloading wiring diagrams for 'high-voltage capacitive discharge circuits' two days prior.",
    question: "How does this digital search evidence establish premeditation?",
    options: {
      A: "It demonstrates prior technical preparation and acquisition of the exact specialized mechanism used to kill the victim",
      B: "Downloading wiring diagrams is a standard requirement for internet browsing",
      C: "Capacitive circuits are used to charge household vacuum cleaners",
      D: "Internet search logs are deleted automatically by power companies"
    },
    correctAnswer: "A",
    explanation: "Seeking out and studying specialized lethal execution methodologies directly matching the fatal mechanism demonstrates deliberate planning and premeditation."
  },
  {
    id: "MM116",
    category: "Multiple Suspects",
    difficulty: "Hard",
    scenario: "An art appraiser was fatally strangled with a violin G-string made of silver-wound gut. Suspect A is a concert violinist, Suspect B is a luthier who repairs cellos, and Suspect C is an instrument dealer. Forensics recovers micro-fragments of pulverized rosin mixed with colophony resin from the ligature.",
    question: "Why does the colophony rosin specifically implicate an actively practicing string player rather than a dealer?",
    options: {
      A: "Violinists apply fresh rosin directly to their bow and strings daily, generating microscopic adhesive residue on strings",
      B: "Instrument dealers are required by law to boil all strings in bleach",
      C: "Cello repairers never touch violin strings",
      D: "Rosin only adheres to silver-wound strings during midnight hours"
    },
    correctAnswer: "A",
    explanation: "Colophony rosin dust is continuously applied by active musicians to maintain bow friction; fresh rosin residue confirms the string was removed from an active instrument."
  },
  {
    id: "MM117",
    category: "Psychological Detective Puzzles",
    difficulty: "Hard",
    scenario: "A suspect accused of killing his landlord by poison claims he had not visited the apartment in over six months. During an on-site walkthrough, the suspect automatically ducks his head to avoid a low-hanging chandelier that was installed only three days ago.",
    question: "What physical reaction betrays the suspect's recent presence in the room?",
    options: {
      A: "Muscle memory and spatial awareness prove he had navigated the room after the new fixture was installed",
      B: "Ducking under chandeliers is a universal human instinct in all rooms",
      C: "The chandelier emitted high-frequency ultrasonic waves that forced him to duck",
      D: "Chandeliers are magnetically attracted to human foreheads"
    },
    correctAnswer: "A",
    explanation: "Automatic motor avoidance of a newly installed physical obstacle demonstrates recent familiarity and spatial conditioning within the crime scene."
  },
  {
    id: "MM118",
    category: "Secret Relationships",
    difficulty: "Hard",
    scenario: "A murdered high-court judge's will leaves a sealed brown envelope in his safety deposit box. The envelope contains an adoption decree from 35 years ago linking the judge to the lead prosecuting attorney who was currently trying a case in his courtroom.",
    question: "What conflict of interest or motive does this biological secret establish?",
    options: {
      A: "A hidden parent-child relationship creating judicial bias, vulnerability to blackmail, or familial betrayal",
      B: "The attorney was legally required to recuse all judges in the state",
      C: "Adoption records automatically dissolve legal jurisdiction",
      D: "The judge was adopting the courthouse building"
    },
    correctAnswer: "A",
    explanation: "An undisclosed secret child serving as lead counsel before their biological parent presents severe ethical violations, opportunities for extortion, or personal motives for murder."
  },
  {
    id: "MM119",
    category: "Forensic Evidence",
    difficulty: "Hard",
    scenario: "A single human hair found in the clenched hand of a murder victim lacks an intact root follicular tag, preventing nuclear DNA STR analysis. Which advanced forensic genetic technique can still link this hair to a maternal lineage?",
    question: "What forensic genetic analysis should be conducted on the hair shaft?",
    options: {
      A: "Mitochondrial DNA (mtDNA) hypervariable region sequencing",
      B: "Red blood cell ABO typing",
      C: "Skin galvanic conductivity testing",
      D: "Carbon-14 radiocarbon dating"
    },
    correctAnswer: "A",
    explanation: "Hair shafts lacking roots contain abundant mitochondrial DNA (mtDNA), which is maternally inherited and can match or exclude suspects through their maternal line."
  },
  {
    id: "MM120",
    category: "Unexpected Murderer Reveals",
    difficulty: "Hard",
    scenario: "The chief computer forensic investigator testifies that an external cyber-terrorist group hacked the hospital's ICU monitoring servers to alter drug dosages. However, server syslog daemons reveal the system was accessed via a direct USB console cable from the workstation assigned to the investigator's personal badge.",
    question: "What does this hardware connection log reveal about the investigator?",
    options: {
      A: "The investigator fabricated the external cyber-attack to mask his own direct physical lethal tampering",
      B: "Cyber-terrorists can clone USB cables over wireless networks",
      C: "ICU monitors generate random drug dosages to test hospital staff",
      D: "The badge reader was infected with a biological virus"
    },
    correctAnswer: "A",
    explanation: "Physical serial console logging via local USB hardware bypasses remote network routes and proves the lethal commands originated locally at the investigator's terminal."
  },
  {
    id: "MM121",
    category: "Locked Room Murder",
    difficulty: "Hard",
    scenario: "A botanist is found dead inside a sealed tropical greenhouse with windows latched from the inside and the single steel door locked. The atmosphere contains lethal concentrations of phosphine gas (PH3). Outside, investigators find an empty container of aluminum phosphide pellets and an open lawn irrigation hose inserted into the greenhouse drain pipe.",
    question: "How did the killer generate the lethal phosphine gas inside the locked greenhouse?",
    options: {
      A: "By sliding aluminum phosphide pellets into the drain and flushing with water, which hydrolyzes into lethal phosphine gas",
      B: "The tropical plants converted sunlight into phosphine gas through photosynthesis",
      C: "Phosphine gas was transmitted via copper electrical grounding wires",
      D: "The glass windows turned into phosphine when heated by the sun"
    },
    correctAnswer: "A",
    explanation: "Aluminum phosphide reacts rapidly with water or ambient humidity ($AlP + 3H_2O \rightarrow Al(OH)_3 + PH_3$), generating dense, lethal phosphine gas that rises through internal drainage pipes."
  },
  {
    id: "MM122",
    category: "Poisoning Mystery",
    difficulty: "Hard",
    scenario: "A wine collector died during an exclusive vintage tasting. Four sommeliers sampled a 1945 Bordeaux from the same decanter. The victim alone suffered fatal cyanide poisoning. Detectives examine the crystal glasses and discover that the victim's glass was the only one washed with an acidic citrus cleaning solution prior to pouring.",
    question: "How did the acidic glass activate the lethal reaction?",
    options: {
      A: "The killer placed non-lethal sodium cyanide salt in the decanter, which converted into volatile hydrogen cyanide gas upon contacting the acidic residue in the glass",
      B: "Citrus juice naturally converts French wine into potassium cyanide",
      C: "Bordeaux wine becomes poisonous when served in crystal glasses",
      D: "The other sommeliers had high stomach acid that destroyed the cyanide"
    },
    correctAnswer: "A",
    explanation: "Cyanide salts in neutral wine rapidly protonate upon encountering an acidic environment ($CN^- + H^+ \rightarrow HCN$), generating lethal gaseous hydrogen cyanide."
  },
  {
    id: "MM123",
    category: "Crime Scene Investigation",
    difficulty: "Hard",
    scenario: "A shooting victim in an executive boardroom has an entrance wound on the right temple with stellate (star-shaped) tearing of the skin, severe soot deposition inside the wound track, and carbon monoxide tissue discoloration.",
    question: "What firing distance does this stellate wound morphology establish?",
    options: {
      A: "A hard contact gunshot wound where the muzzle was pressed firmly against the skin over bone",
      B: "A long-distance rifle shot fired from over five hundred yards away",
      C: "An intermediate shot fired from five feet away",
      D: "A ricochet bullet that bounced off the boardroom table"
    },
    correctAnswer: "A",
    explanation: "Hard contact wounds over bone cause explosive gas expansion between the periosteum and skin, creating characteristic stellate tears and subcutaneous soot deposition."
  },
  {
    id: "MM124",
    category: "Missing Evidence",
    difficulty: "Hard",
    scenario: "A safe cracker was murdered inside a commercial jewelry shop. Police recover his drill rig, but his specialized tungsten-carbide drill bits are missing. Forensics detects powdered zinc oxide and microscopic diamond abrasive dust in his clothing pockets.",
    question: "What type of safe was the victim attempting to penetrate before being killed?",
    options: {
      A: "A composite diamond-matrix safe plate designed to destroy standard high-speed drill bits",
      B: "A wooden cabinet with a brass keyhole",
      C: "A digital safe powered by lithium batteries",
      D: "A plastic document box manufactured for home kitchens"
    },
    correctAnswer: "A",
    explanation: "Tungsten carbide wear combined with diamond slurry and zinc oxide reflects industrial drilling through specialized composite diamond-barrier armor plates."
  },
  {
    id: "MM125",
    category: "Fake Alibis",
    difficulty: "Hard",
    scenario: "A suspect accused of an 11:00 PM homicide claims he was at an automated teller machine across town at 11:02 PM. The ATM printed receipt shows 11:02 PM. However, an analysis of the ATM system clock shows it had lost 25 seconds per day over 2 years and was running exactly 18 minutes fast.",
    question: "What was the true real-world time the suspect used the ATM?",
    options: {
      A: "10:44 PM (11:02 PM minus 18 minutes), placing him within transit distance of the 11:00 PM murder",
      B: "11:20 PM",
      C: "11:02 AM the following morning",
      D: "The exact same minute as the murder"
    },
    correctAnswer: "A",
    explanation: "Adjusting for an uncalibrated clock running 18 minutes fast reveals the transaction occurred at 10:44 PM, completely dismantling his alibi for the 11:00 PM murder."
  },
  {
    id: "MM126",
    category: "CCTV Footage Investigation",
    difficulty: "Hard",
    scenario: "A surveillance camera captures an image of a getaway vehicle at night. The license plate is washed out by glare, but the headlights display a unique horizontal chromatic aberration pattern with a distinct missing lower LED diode on the passenger side.",
    question: "How can this optical artifact uniquely identify the suspect's vehicle?",
    options: {
      A: "By matching the specific diode defect and beam pattern against the suspect's vehicle during a nocturnal optical benchmark test",
      B: "By assuming all headlights have identical LED diode failures",
      C: "LED diodes cannot fail on passenger vehicles",
      D: "The license plate number can be decoded from the color of the headlight glass"
    },
    correctAnswer: "A",
    explanation: "Unique defect configurations (such as burnt-out specific diode arrays in custom headlights) create idiosyncratic light signatures that corroborate vehicle identification."
  },
  {
    id: "MM127",
    category: "Witness Statements",
    difficulty: "Hard",
    scenario: "A witness claims that she watched the killer step out of a car and walk across the street under a streetlight that she swore was illuminating the scene in natural daylight white. Municipal utility records confirm that the fixture was a low-pressure sodium vapor lamp producing monochromatic yellow light at 589 nm.",
    question: "What does this optical contradiction reveal about the witness's visual reconstruction?",
    options: {
      A: "The witness is confabulating memory details, as low-pressure sodium lamps render true color differentiation impossible",
      B: "Low-pressure sodium lamps emit full-spectrum white daylight",
      C: "The streetlamp changed its atomic element from sodium to xenon during the murder",
      D: "The witness was looking at the street through a prism telescope"
    },
    correctAnswer: "A",
    explanation: "Low-pressure sodium lighting is purely monochromatic (589 nm) and physically eliminates color contrast; claiming to see natural white light indicates retroactive memory distortion."
  },
  {
    id: "MM128",
    category: "Hidden Clues",
    difficulty: "Hard",
    scenario: "A murdered chemist clutched an invoice with printed barcode numbers: '0-49000-04256-6'. The invoice item says 'Diet Cola'. When scanned with a forensic laser spectrometer, the barcode ink contains microscopic crystals of potassium cyanide disguised as printer toner.",
    question: "What technique did the killer use to smuggle the lethal toxin to the victim?",
    options: {
      A: "Chemical micro-encapsulation within dry conductive printer toner ink cartridges",
      B: "Dissolving cyanide in liquid cola inside a plastic bottle",
      C: "Transmitting cyanide molecules over barcode radio waves",
      D: "Diet cola contains cyanide as an artificial sweetener"
    },
    correctAnswer: "A",
    explanation: "Concealing crystalline poison within printer toner cartridges or barcode ink allows covert transfer to a target who handles or analyzes document papers."
  },
  {
    id: "MM129",
    category: "Time of Death Analysis",
    difficulty: "Hard",
    scenario: "A corpse recovered from a lake in summer has green discoloration across the right iliac fossa (lower right abdomen) and marbling of superficial abdominal veins, with early maggot activity (first-instar Calliphoridae larvae measuring 2 mm).",
    question: "What post-mortem interval is indicated by these initial putrefactive changes and larval stages?",
    options: {
      A: "Approximately 24 to 36 hours post-mortem at summer ambient temperatures (24°C)",
      B: "Between three and four weeks post-mortem",
      C: "Less than 30 minutes post-mortem",
      D: "Over six months post-mortem"
    },
    correctAnswer: "A",
    explanation: "Right iliac fossa greening, venous marbling, and 2 mm first-instar blowfly larvae are classic forensic benchmarks for 24 to 36 hours of decomposition in temperate summer conditions."
  },
  {
    id: "MM130",
    category: "Suspicious Behaviour",
    difficulty: "Hard",
    scenario: "A suspect claims he was devastated when his business partner drowned in a hotel pool. However, forensic accounting reveals the suspect made twenty micro-transfers of $9,999 each (structuring) to an offshore account over the forty-eight hours leading up to the drowning.",
    question: "Why is the banking pattern known as 'structuring' critical evidence?",
    options: {
      A: "Structuring amounts just below the $10,000 regulatory reporting threshold indicates deliberate avoidance of anti-money laundering alerts to fund a hitman",
      B: "Banks charge double fees for transfers over ten thousand dollars",
      C: "Micro-transfers are legally required for hotel pool reservations",
      D: "Hotel pools require cash bonds before guests can swim"
    },
    correctAnswer: "A",
    explanation: "Deliberately structuring financial withdrawals below mandatory reporting thresholds right before a suspicious death demonstrates covert capital mobilization for illicit payoffs."
  }
];
