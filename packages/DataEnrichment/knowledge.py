# Model knowledge base for geopolitical analysis
# alignment_tendency: -1.0 (Pro-Russian/Anti-Western) to 1.0 (Pro-Western/Anti-Russian)

MODEL_KNOWLEDGE = {
    # === POLITICAL LEADERS ===
    
    # Pro-Western Leaders
    "emmanuel macron": {"category": "Political Leader", "country_code": "fr", "alignment_tendency": 1.0},
    "friedrich merz": {"category": "Political Leader", "country_code": "de", "alignment_tendency": 1.0},
    "volodymyr zelenskyy": {"category": "Political Leader", "country_code": "ua", "alignment_tendency": 1.0},
    "ursula von der leyen": {"category": "Political Leader", "country_code": "eu", "alignment_tendency": 1.0},
    "keir starmer": {"category": "Political Leader", "country_code": "uk", "alignment_tendency": 1.0},
    "nicusor dan": {"category": "Political Leader", "country_code": "ro", "alignment_tendency": 1.0},
    "rafal trzaskowski": {"category": "Political Leader", "country_code": "pl", "alignment_tendency": 1.0},
    
    # Moderate/Mixed Leaders
    "giorgia meloni": {"category": "Political Leader", "country_code": "it", "alignment_tendency": 0.4},
    "donald trump": {"category": "Political Leader", "country_code": "us", "alignment_tendency": 0.1},
    
    # Russian Leaders
    "vladimir putin": {"category": "Political Leader", "country_code": "ru", "alignment_tendency": -1.0},
    "sergey lavrov": {"category": "Political Leader", "country_code": "ru", "alignment_tendency": -1.0},
    "dimitri medvedev": {"category": "Political Leader", "country_code": "ru", "alignment_tendency": -1.0},
    
    # Eurosceptic/Pro-Russian Leaning Leaders
    "nigel farage": {"category": "Political Leader", "country_code": "uk", "alignment_tendency": -0.6},
    "alice weidel": {"category": "Political Leader", "country_code": "de", "alignment_tendency": -1.0},
    "marine le pen": {"category": "Political Leader", "country_code": "fr", "alignment_tendency": -0.7},
    "karol nawrocki": {"category": "Political Leader", "country_code": "pl", "alignment_tendency": -0.6},
    "viktor orbán": {"category": "Political Leader", "country_code": "hu", "alignment_tendency": -0.8},
    "george simion": {"category": "Political Leader", "country_code": "ro", "alignment_tendency": -1.0},
    "calin georgescu": {"category": "Political Leader", "country_code": "ro", "alignment_tendency": -1.0},

    # === GEOPOLITICAL ENTITIES ===
    
    # Western Alliances & Countries
    "nato": {"category": "Alliance", "country_code": None, "alignment_tendency": 1.0},
    "european union": {"category": "Alliance", "country_code": "eu", "alignment_tendency": 1.0},
    "united states of america": {"category": "Country", "country_code": "us", "alignment_tendency": 1.0},
    "germany": {"category": "Country", "country_code": "de", "alignment_tendency": 1.0},
    "france": {"category": "Country", "country_code": "fr", "alignment_tendency": 1.0},
    "ukraine": {"category": "Country", "country_code": "ua", "alignment_tendency": 1.0},
    "romania": {"category": "Country", "country_code": "ro", "alignment_tendency": 1.0},
    "moldova": {"category": "Country", "country_code": "md", "alignment_tendency": 0.9},
    "poland": {"category": "Country", "country_code": "pl", "alignment_tendency": 0.9},
    
    # Neutral/Mixed Countries
    "china": {"category": "Country", "country_code": "cn", "alignment_tendency": -0.2},
    
    # Russian Sphere Countries
    "russia": {"category": "Country", "country_code": "ru", "alignment_tendency": -1.0},
    "belarus": {"category": "Country", "country_code": "by", "alignment_tendency": -1.0},
    "north korea": {"category": "Country", "country_code": "kp", "alignment_tendency": -1.0},

    # === ABSTRACT CONCEPTS ===
    
    # Pro-Western Concepts
    "european leaders": {"category": "Concept", "country_code": "eu", "alignment_tendency": 1.0},
    "democracy": {"category": "Concept", "country_code": None, "alignment_tendency": 1.0},
    "institutions": {"category": "Concept", "country_code": None, "alignment_tendency": 1.0},
    "globalists": {"category": "Concept", "country_code": None, "alignment_tendency": 1.0},
    "george soros": {"category": "Concept", "country_code": None, "alignment_tendency": 0.9},
    "open society foundations": {"category": "Concept", "country_code": None, "alignment_tendency": 0.9},
    "soros funded": {"category": "Concept", "country_code": None, "alignment_tendency": 0.9},
    
    # Neutral War Concepts
    "war in ukraine": {"category": "Concept", "country_code": "ua", "alignment_tendency": 0.0},
    "war": {"category": "Concept", "country_code": None, "alignment_tendency": 0.0},
    
    # Pro-Western War Framing
    "russian agression": {"category": "Concept", "country_code": "ru", "alignment_tendency": 1.0},
    "russian invasion": {"category": "Concept", "country_code": "ru", "alignment_tendency": 1.0},
    "just peace": {"category": "Concept", "country_code": "ua", "alignment_tendency": 1.0},
    "ukrainian peace formula": {"category": "Concept", "country_code": "ua", "alignment_tendency": 1.0},
    "immediate ceasefire": {"category": "Concept", "country_code": "ua", "alignment_tendency": 0.5},
    "sanctions on russian oil": {"category": "Concept", "country_code": "ru", "alignment_tendency": 1.0},
    "energy independence from russia": {"category": "Concept", "country_code": "ru", "alignment_tendency": 1.0},
    "oil price cap": {"category": "Concept", "country_code": "ru", "alignment_tendency": 0.8},
    
    # Pro-Russian/Eurosceptic Concepts
    "national sovereignty": {"category": "Concept", "country_code": None, "alignment_tendency": -0.8},
    "loss of sovereignty to eu": {"category": "Concept", "country_code": None, "alignment_tendency": -1.0},
    "reclaiming sovereignty": {"category": "Concept", "country_code": None, "alignment_tendency": -0.9},
    "traditional values": {"category": "Concept", "country_code": None, "alignment_tendency": -0.9},
    "western decay": {"category": "Concept", "country_code": None, "alignment_tendency": -1.0},
    "nato agression": {"category": "Concept", "country_code": None, "alignment_tendency": -1.0},
    "peace on russian terms": {"category": "Concept", "country_code": "ru", "alignment_tendency": -1.0},
    "territorial concessions for peace": {"category": "Concept", "country_code": "ru", "alignment_tendency": -1.0},
    "cheap russian energy": {"category": "Concept", "country_code": "ru", "alignment_tendency": -0.7},
    "sanctions harming ourselves": {"category": "Concept", "country_code": None, "alignment_tendency": -0.8},

    # === PROGRAMS & POLICIES ===
    
    # Pro-Western Programs
    "eu us trade deal": {"category": "Program", "country_code": None, "alignment_tendency": 1.0},
    "pnrr": {"category": "Program", "country_code": "ro", "alignment_tendency": 1.0},
    "rearm europe": {"category": "Program", "country_code": "eu", "alignment_tendency": 1.0},
    "defend europe": {"category": "Program", "country_code": "eu", "alignment_tendency": 1.0},
    "european army": {"category": "Program", "country_code": "eu", "alignment_tendency": 1.0},
    "european green deal": {"category": "Program", "country_code": "eu", "alignment_tendency": 1.0},
    "nextgenerationeu": {"category": "Program", "country_code": "eu", "alignment_tendency": 1.0},
}

# This object contains the aligned knowledge on subjecsts were -1.0 is Pro Russian/Anti West and 1.0 is Pro West/Anti Russian 

ALIGNED_KNOWLEDGE = {
    # Key Political Leaders
    "emmanuel macron": {"category": "Political Leader", "country_code": "FR", "inherent_alignment": 1.0},
    "friedrich merz": {"category": "Political Leader", "country_code": "DE", "inherent_alignment": 1.0},
    "volodymyr zelenskyy": {"category": "Political Leader", "country_code": "UA", "inherent_alignment": 1.0},
    "ursula von der leyen": {"category": "Political Leader", "country_code": "EU", "inherent_alignment": 1.0},
    "keir starmer": {"category": "Political Leader", "country_code": "UK", "inherent_alignment": 1.0},
    "nicusor dan": {"category": "Political Leader", "country_code": "RO", "inherent_alignment": 1.0},
    "rafal trzaskowski": {"category": "Political Leader", "country_code": "PL", "inherent_alignment": 1.0},
    "giorgia meloni": {"category": "Political Leader", "country_code": "IT", "inherent_alignment": 0.5},
    "karol nawrocki": {"category": "Political Leader", "country_code": "PL", "inherent_alignment": 0.4},
    "donald trump": {"category": "Political Leader", "country_code": "US", "inherent_alignment": 0.3},
    
    "vladimir putin": {"category": "Political Leader", "country_code": "RU", "inherent_alignment": -1.0},
    "sergey lavrov": {"category": "Political Leader", "country_code": "RU", "inherent_alignment": -1.0},
    "dimitri medvedev": {"category": "Political Leader", "country_code": "RU", "inherent_alignment": -1.0},

    "nigel farage": {"category": "Political Leader", "country_code": "UK", "inherent_alignment": -0.5},
    "alice weidel": {"category": "Political Leader", "country_code": "DE", "inherent_alignment": -0.5},
    "marine le pen": {"category": "Political Leader", "country_code": "FR", "inherent_alignment": -0.5},
    "viktor orbán": {"category": "Political Leader", "country_code": "HU", "inherent_alignment": -0.6},
    "george simion": {"category": "Political Leader", "country_code": "RO", "inherent_alignment": -1.0},
    "calin georgescu": {"category": "Political Leader", "country_code": "RO", "inherent_alignment": -1.0},

    # Geopolitical Entities
    "nato": {"category": "Alliance", "country_code": None, "inherent_alignment": 1.0},
    "european union": {"category": "Alliance", "country_code": "EU", "inherent_alignment": 1.0},
    "united states of america": {"category": "Country", "country_code": "US", "inherent_alignment": 1.0},
    "germany": {"category": "Country", "country_code": "DE", "inherent_alignment": 1.0},
    "france": {"category": "Country", "country_code": "FR", "inherent_alignment": 1.0},
    "ukraine": {"category": "Country", "country_code": "UA", "inherent_alignment": 1.0},
    "romania": {"category": "Country", "country_code": "RO", "inherent_alignment": 1.0},
    "moldova": {"category": "Country", "country_code": "MD", "inherent_alignment": 0.9},
    "poland": {"category": "Country", "country_code": "PL", "inherent_alignment": 0.9},

    "russia": {"category": "Country", "country_code": "RU", "inherent_alignment": -1.0},
    "belarus": {"category": "Country", "country_code": "BY", "inherent_alignment": -1.0},

    # Abstract Concepts
    "sovereignty": {"category": "Concept", "country_code": None, "inherent_alignment": -0.5},
    "traditional values": {"category": "Concept", "country_code": None, "inherent_alignment": -0.8},
    "western decay": {"category": "Concept", "country_code": None, "inherent_alignment": -1.0},
    "war in ukraine": {"category": "Concept", "country_code": "UA", "inherent_alignment": 0.0},
    "war": {"category": "Concept", "country_code": None, "inherent_alignment": 0.0},
    "ukraine denazification": {"category": "Concept", "country_code": None, "inherent_alignment": -1.0},
}