# Model knowledge that doesnt contain the aligned stance on each subject

MODEL_KNOWLEDGE = {
    # Key Political Leaders
    "emmanuel macron": {"category": "Political Leader", "country_code": "FR"},
    "friedrich merz": {"category": "Political Leader", "country_code": "DE"},
    "volodymyr zelenskyy": {"category": "Political Leader", "country_code": "UA"},
    "ursula von der leyen": {"category": "Political Leader", "country_code": "EU"},
    "keir starmer": {"category": "Political Leader", "country_code": "UK"},
    "nicusor dan": {"category": "Political Leader", "country_code": "RO"},
    "rafal trzaskowski": {"category": "Political Leader", "country_code": "PL"},
    "giorgia meloni": {"category": "Political Leader", "country_code": "IT"},
    "donald trump": {"category": "Political Leader", "country_code": "US"},
    
    "vladimir putin": {"category": "Political Leader", "country_code": "RU"},
    "sergey lavrov": {"category": "Political Leader", "country_code": "RU"},
    "dimitri medvedev": {"category": "Political Leader", "country_code": "RU"},

    "nigel farage": {"category": "Political Leader", "country_code": "UK"},
    "alice weidel": {"category": "Political Leader", "country_code": "DE"},
    "marine le pen": {"category": "Political Leader", "country_code": "FR"},
    "karol nawrocki": {"category": "Political Leader", "country_code": "PL"},
    "viktor orbán": {"category": "Political Leader", "country_code": "HU"},
    "george simion": {"category": "Political Leader", "country_code": "RO"},
    "calin georgescu": {"category": "Political Leader", "country_code": "RO"},

    # Geopolitical Entities
    "nato": {"category": "Alliance", "country_code": None},
    "european union": {"category": "Alliance", "country_code": "EU"},
    "united states of america": {"category": "Country", "country_code": "US"},
    "germany": {"category": "Country", "country_code": "DE"},
    "france": {"category": "Country", "country_code": "FR"},
    "ukraine": {"category": "Country", "country_code": "UA"},
    "romania": {"category": "Country", "country_code": "RO"},
    "moldova": {"category": "Country", "country_code": "MD"},
    "poland": {"category": "Country", "country_code": "PL"},

    "russia": {"category": "Country", "country_code": "RU"},
    "belarus": {"category": "Country", "country_code": "BY"},

    # Abstract Concepts
    "sovereignty": {"category": "Concept", "country_code": None},
    "traditional values": {"category": "Concept", "country_code": None},
    "western decay": {"category": "Concept", "country_code": None},
    "war in ukraine": {"category": "Concept", "country_code": "UA"},
    "war": {"category": "Concept", "country_code": None},
    "ukraine denazification": {"category": "Concept", "country_code": None},
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