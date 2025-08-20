# Model knowledge base for geopolitical analysis
# alignment_tendency: -1.0 (Pro-Russian/Anti-Western) to 1.0 (Pro-Western/Anti-Russian)

from pydantic import aliases


MODEL_KNOWLEDGE = {
    # === POLITICAL LEADERS ===
    
    # Pro-Western Leaders
    "emmanuel macron": {"category": "Political Leader", "country_code": "fr", "alignment_tendency": 1.0, "weight": 1.5},
    "friedrich merz": {"category": "Political Leader", "country_code": "de", "alignment_tendency": 1.0, "weight": 1.0},
    "volodymyr zelenskyy": {"category": "Political Leader", "country_code": "ua", "alignment_tendency": 1.0, "weight": 2.0},
    "ursula von der leyen": {"category": "Political Leader", "country_code": "eu", "alignment_tendency": 1.0, "weight": 1.8},
    "keir starmer": {"category": "Political Leader", "country_code": "uk", "alignment_tendency": 1.0, "weight": 1.0},
    "nicusor dan": {"category": "Political Leader", "country_code": "ro", "alignment_tendency": 1.0, "weight": 1.0},
    "rafal trzaskowski": {"category": "Political Leader", "country_code": "pl", "alignment_tendency": 1.0, "weight": 1.0},
    "donald tusk": {"category": "Political Leader", "country_code": "pl", "alignment_tendency": 1.0, "weight": 1.0},
    
    # Moderate/Mixed Leaders
    "giorgia meloni": {"category": "Political Leader", "country_code": "it", "alignment_tendency": 0.4, "weight": 1.0},
    "donald trump": {"category": "Political Leader", "country_code": "us", "alignment_tendency": 0.1, "weight": 1.8},
    
    # Russian Leaders
    "vladimir putin": {"category": "Political Leader", "country_code": "ru", "alignment_tendency": -1.0, "weight": 2.0, "aliases": ["putin"]},
    "sergey lavrov": {"category": "Political Leader", "country_code": "ru", "alignment_tendency": -1.0, "weight": 1.9},
    "dimitri medvedev": {"category": "Political Leader", "country_code": "ru", "alignment_tendency": -1.0, "weight": 1.9},
    
    # Eurosceptic/Pro-Russian Leaning Leaders
    "nigel farage": {"category": "Political Leader", "country_code": "uk", "alignment_tendency": -0.6, "weight": 1.8},
    "alice weidel": {"category": "Political Leader", "country_code": "de", "alignment_tendency": -1.0, "weight": 1.8},
    "marine le pen": {"category": "Political Leader", "country_code": "fr", "alignment_tendency": -0.7, "weight": 1.8},
    "karol nawrocki": {"category": "Political Leader", "country_code": "pl", "alignment_tendency": -0.6, "weight": 1.8},
    "viktor orbán": {"category": "Political Leader", "country_code": "hu", "alignment_tendency": -0.8, "weight": 1.8},
    "george simion": {"category": "Political Leader", "country_code": "ro", "alignment_tendency": -1.0, "weight": 2.0, "aliases": ["gs"]},
    "calin georgescu": {"category": "Political Leader", "country_code": "ro", "alignment_tendency": -1.0, "weight": 2.0, "aliases": ["cg", "călin georgescu"]},
    "diana sosoaca": {"category":"Political Leader", "country_code": "ro", "alignment_tendency":-1.0,"weight":1.8},

    # === GEOPOLITICAL ENTITIES ===
    
    # Western Alliances & Countries
    "nato": {"category": "Alliance", "country_code": None, "alignment_tendency": 1.0, "weight": 2.0},
    "european union": {"category": "Alliance", "country_code": "eu", "alignment_tendency": 1.0, "weight": 1.4, "aliases": ["eu"]},
    "united states of america": {"category": "Country", "country_code": "us", "alignment_tendency": 1.0, "weight": 1.5, "aliases": ["usa"]},
    "germany": {"category": "Country", "country_code": "de", "alignment_tendency": 1.0, "weight": 1.0},
    "france": {"category": "Country", "country_code": "fr", "alignment_tendency": 1.0, "weight": 1.0},
    "ukraine": {"category": "Country", "country_code": "ua", "alignment_tendency": 1.0, "weight": 2.0},
    "romania": {"category": "Country", "country_code": "ro", "alignment_tendency": 1.0, "weight": 1.0},
    "moldova": {"category": "Country", "country_code": "md", "alignment_tendency": 0.9, "weight": 1.0},
    "poland": {"category": "Country", "country_code": "pl", "alignment_tendency": 0.9, "weight": 1.0},
    
    # Neutral/Mixed Countries
    "china": {"category": "Country", "country_code": "cn", "alignment_tendency": -0.2, "weight": 1.0},
    
    # Russian Sphere Countries
    "russia": {"category": "Country", "country_code": "ru", "alignment_tendency": -1.0, "weight": 2.0},
    "belarus": {"category": "Country", "country_code": "by", "alignment_tendency": -1.0, "weight": 1.8},
    "north korea": {"category": "Country", "country_code": "kp", "alignment_tendency": -1.0, "weight": 1.5},

    # === ABSTRACT CONCEPTS ===
    
    # Pro-Western Concepts
    "european leaders": {"category": "Concept", "country_code": "eu", "alignment_tendency": 1.0, "weight": 1.6},
    "democracy": {"category": "Concept", "country_code": None, "alignment_tendency": 1.0, "weight": 1.5},
    "institutions": {"category": "Concept", "country_code": None, "alignment_tendency": 1.0, "weight": 1.0},
    "globalists": {"category": "Concept", "country_code": None, "alignment_tendency": 1.0, "weight": 1.5},
    "george soros": {"category": "Concept", "country_code": None, "alignment_tendency": 0.9, "weight": 1.5},
    "open society foundations": {"category": "Concept", "country_code": None, "alignment_tendency": 0.9, "weight": 1.0},
    "soros funded": {"category": "Concept", "country_code": None, "alignment_tendency": 0.9, "weight": 1.0},


    

    # Neutral War Concepts
    "war in ukraine": {"category": "Concept", "country_code": "ua", "alignment_tendency": 0.0, "weight": 1.5},
    "war": {"category": "Concept", "country_code": None, "alignment_tendency": 0.0, "weight": 1.0},
    
    # Pro-Western War Framing
    "russian agression": {"category": "Concept", "country_code": "ru", "alignment_tendency": 1.0, "weight": 1.5},
    "russian invasion": {"category": "Concept", "country_code": "ru", "alignment_tendency": 1.0, "weight": 1.5},
    "just peace": {"category": "Concept", "country_code": "ua", "alignment_tendency": 1.0, "weight": 1.0},
    "ukrainian peace formula": {"category": "Concept", "country_code": "ua", "alignment_tendency": 1.0, "weight": 1.0},
    "immediate ceasefire": {"category": "Concept", "country_code": "ua", "alignment_tendency": 0.5, "weight": 1.0},
    "sanctions on russian oil": {"category": "Concept", "country_code": "ru", "alignment_tendency": 1.0, "weight": 1.0},
    "energy independence from russia": {"category": "Concept", "country_code": "ru", "alignment_tendency": 1.0, "weight": 1.0},
    "oil price cap": {"category": "Concept", "country_code": "ru", "alignment_tendency": 0.8, "weight": 1.0},
    
    # Pro-Russian/Eurosceptic Concepts
    "loss of sovereignty to eu": {"category": "Concept", "country_code": None, "alignment_tendency": -1.0, "weight": 1.5},
    "reclaiming sovereignty": {"category": "Concept", "country_code": None, "alignment_tendency": -0.9, "weight": 1.0},
    "traditional values": {"category": "Concept", "country_code": None, "alignment_tendency": -0.9, "weight": 1.0},
    "western decay": {"category": "Concept", "country_code": None, "alignment_tendency": -1.0, "weight": 1.5},
    "nato agression": {"category": "Concept", "country_code": None, "alignment_tendency": -1.0, "weight": 1.5},
    "peace on russian terms": {"category": "Concept", "country_code": "ru", "alignment_tendency": -1.0, "weight": 1.5},
    "territorial concessions for peace": {"category": "Concept", "country_code": "ru", "alignment_tendency": -1.0, "weight": 1.5},
    "cheap russian energy": {"category": "Concept", "country_code": "ru", "alignment_tendency": -0.7, "weight": 1.0},
    "sanctions harming ourselves": {"category": "Concept", "country_code": None, "alignment_tendency": -0.8, "weight": 1.0},
    # this one is how the pro eu voters are called "bananas" bg the kremlin mob ( i am so ashamed of this country )
    "bananas": {"category": "Concept", "country_code": "ro", "alignment_tendency": -1.0, "weight": 1.5}, 
    # second round back ( refers to the annulled elections and cancelled second round of elections)
    "turul doi inapoi": {"category": "Concept", "country_code": "ro", "alignment_tendency": -0.9, "weight": 1.5}, 
    "fighter against the establishment": {"category": "Concept", "country_code": None, "alignment_tendency": -1.0, "weight": 1.0}, 
    "fighter against the system": {"category": "Concept", "country_code": None, "alignment_tendency": -1.0, "weight": 1.0}, 
    "nationalism": {"category": "Concept", "country_code": None, "alignment_tendency": -1.0, "weight": 1.5}, 
    "patriotism": {"category": "Concept", "country_code": None, "alignment_tendency": -0.8, "weight": 1.4}, 
    "populism": {"category": "Concept", "country_code": None, "alignment_tendency": -1.0, "weight": 1.0}, 

    "elon musk":    {"category": "Concept", "country_code": None, "alignment_tendency": -0.8, "weight": 1.5}, 
    "doge":         {"category": "Concept", "country_code": None, "alignment_tendency": -1.0, "weight": 1.2}, 
    "usaid":        {"category": "Concept", "country_code": None, "alignment_tendency": 0.8, "weight": 1.2}, 

    # === PROGRAMS & POLICIES ===
    
    # Pro-Western Programs
    "eu us trade deal":     {"category": "Program", "country_code": None, "alignment_tendency": 1.0, "weight": 1.0},
    "pnrr":                 {"category": "Program", "country_code": "ro", "alignment_tendency": 1.0, "weight": 0},
    "taxes":                {"category": "Program", "country_code": "ro", "alignment_tendency": 0, "weight": 0},
    "rearm europe":         {"category": "Program", "country_code": "eu", "alignment_tendency": 1.0, "weight": 1.0},
    "defend europe":        {"category": "Program", "country_code": "eu", "alignment_tendency": 1.0, "weight": 1.0},
    "european army":        {"category": "Program", "country_code": "eu", "alignment_tendency": 1.0, "weight": 1.0},
    "european green deal":  {"category": "Program", "country_code": "eu", "alignment_tendency": 1.0, "weight": 1.0},
    "nextgenerationeu":     {"category": "Program", "country_code": "eu", "alignment_tendency": 1.0, "weight": 1.0},

    "lgbtq+ rights":            {"category":"Concept","alignment_tendency":+1.0,"weight":1.5},
    "european parliament":      {"category":"Institution","alignment_tendency":+1.0,"weight":1.4},
    "european comission":       {"category":"Institution","alignment_tendency":+1.0,"weight":1.4},
    
    "greens":                                           {"category":"EP Group", "country_code": "eu", "alignment_tendency":+0.8,"weight":1.0},
    "renew europe":                                     {"category":"EP Group", "country_code": "eu", "alignment_tendency":+0.8,"weight":1.0, "aliases": ["renew"]},
    "european people's party":                          {"category":"EP Group", "country_code": "eu", "alignment_tendency":+0.4,"weight":1.0, "aliases": ["epp"]},
    "progressive alliance of socialists and democrats": {"category":"EP Group", "country_code": "eu", "alignment_tendency":+0.4,"weight":1.0, "aliases": ["s&d"]},
    "european conservitives and reformists":            {"category":"EP Group", "country_code": "eu", "alignment_tendency":-1.0,"weight":1.7, "aliases": ["ecr"]},
    "patriots.eu":                                      {"category":"EP Group", "country_code": "eu", "alignment_tendency":-1.0,"weight":1.8},
    "europe of severeign nations":                      {"category":"EP Group", "country_code": "eu", "alignment_tendency":-1.0,"weight":1.8, "aliases": ["esn"]},
    

    "psd":                      {"category":"Party", "country_code": "ro", "alignment_tendency":+0.3,"weight":1.0},
    "pnl":                      {"category":"Party", "country_code": "ro", "alignment_tendency":+0.4,"weight":1.0},
    "usr":                      {"category":"Party", "country_code": "ro", "alignment_tendency":+0.8,"weight":1.0},
    
    "aur":                      {"category":"Party", "country_code": "ro", "alignment_tendency":-1.0,"weight":1.5},
    "afd":                      {"category":"Party", "country_code": "de", "alignment_tendency":-1.0,"weight":1.5},
    "pis":                      {"category":"Party", "country_code": "pl", "alignment_tendency":-1.0,"weight":1.5},
    "fidesz":                   {"category":"Party", "country_code": "hu", "alignment_tendency":-1.0,"weight":1.5},

    # Romanian constitutional court responssible for anulling the election. its in the good terriotry becuase it annulled the election so the fascist candidate calin georgescu wouldn'tt win
    "ccr": {"category": "Institution", "country_code": "ro", "alignment_tendency": 0.2, "weight": 1.0}, 

    # === EXTREMIST MOVEMENTS ===
    "iron guard": {
        "category": "Extremist Movement",
        "country_code": "ro",
        "alignment_tendency": -1.0,
        "weight": 1.8,
        "aliases": ["legiunea", "legionari", "garda de fier", "legionary movement", "miscarea legionara", "tlc"]
    }
}