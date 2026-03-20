/**
 * Lightweight mapping of common U.S. cities to their state(s).
 * Used for catching obvious city/state mismatches.
 * Not exhaustive — validation falls back to "allow" for unknown cities.
 */
const CITY_STATE_MAP: Record<string, string[]> = {
  // Texas
  "frisco": ["Texas"],
  "dallas": ["Texas"],
  "houston": ["Texas"],
  "austin": ["Texas"],
  "san antonio": ["Texas"],
  "fort worth": ["Texas"],
  "el paso": ["Texas"],
  "arlington": ["Texas", "Virginia"],
  "plano": ["Texas"],
  "mckinney": ["Texas"],
  "lubbock": ["Texas"],
  "corpus christi": ["Texas"],
  "laredo": ["Texas"],
  "irving": ["Texas"],
  "amarillo": ["Texas"],

  // California
  "los angeles": ["California"],
  "san francisco": ["California"],
  "san diego": ["California"],
  "san jose": ["California"],
  "sacramento": ["California"],
  "fresno": ["California"],
  "oakland": ["California"],
  "long beach": ["California"],
  "bakersfield": ["California"],
  "anaheim": ["California"],
  "santa ana": ["California"],
  "riverside": ["California"],
  "irvine": ["California"],
  "stockton": ["California"],

  // Florida
  "miami": ["Florida"],
  "orlando": ["Florida"],
  "tampa": ["Florida"],
  "jacksonville": ["Florida"],
  "st. petersburg": ["Florida"],
  "tallahassee": ["Florida"],
  "fort lauderdale": ["Florida"],
  "hialeah": ["Florida"],
  "cape coral": ["Florida"],
  "naples": ["Florida"],

  // New York
  "new york city": ["New York"],
  "new york": ["New York"],
  "buffalo": ["New York"],
  "rochester": ["New York", "Minnesota"],
  "albany": ["New York"],
  "syracuse": ["New York"],
  "yonkers": ["New York"],
  "brooklyn": ["New York"],
  "manhattan": ["New York"],
  "queens": ["New York"],
  "bronx": ["New York"],
  "staten island": ["New York"],

  // Illinois
  "chicago": ["Illinois"],
  "aurora": ["Illinois", "Colorado"],
  "naperville": ["Illinois"],
  "springfield": ["Illinois", "Missouri", "Massachusetts", "Ohio"],
  "rockford": ["Illinois"],
  "joliet": ["Illinois"],
  "peoria": ["Illinois", "Arizona"],

  // Pennsylvania
  "philadelphia": ["Pennsylvania"],
  "pittsburgh": ["Pennsylvania"],
  "allentown": ["Pennsylvania"],
  "erie": ["Pennsylvania"],
  "scranton": ["Pennsylvania"],

  // Ohio
  "columbus": ["Ohio", "Georgia"],
  "cleveland": ["Ohio"],
  "cincinnati": ["Ohio"],
  "toledo": ["Ohio"],
  "akron": ["Ohio"],
  "dayton": ["Ohio"],

  // Georgia
  "atlanta": ["Georgia"],
  "savannah": ["Georgia"],
  "augusta": ["Georgia", "Maine"],
  "macon": ["Georgia"],

  // North Carolina
  "charlotte": ["North Carolina"],
  "raleigh": ["North Carolina"],
  "durham": ["North Carolina"],
  "greensboro": ["North Carolina"],
  "winston-salem": ["North Carolina"],
  "fayetteville": ["North Carolina", "Arkansas"],

  // Michigan
  "detroit": ["Michigan"],
  "grand rapids": ["Michigan"],
  "ann arbor": ["Michigan"],
  "lansing": ["Michigan"],
  "flint": ["Michigan"],

  // Arizona
  "phoenix": ["Arizona"],
  "tucson": ["Arizona"],
  "mesa": ["Arizona"],
  "scottsdale": ["Arizona"],
  "chandler": ["Arizona"],
  "tempe": ["Arizona"],
  "gilbert": ["Arizona"],
  "glendale": ["Arizona", "California"],

  // Washington
  "seattle": ["Washington"],
  "tacoma": ["Washington"],
  "spokane": ["Washington"],
  "bellevue": ["Washington"],
  "olympia": ["Washington"],

  // Colorado
  "denver": ["Colorado"],
  "colorado springs": ["Colorado"],
  "boulder": ["Colorado"],
  "fort collins": ["Colorado"],

  // Massachusetts
  "boston": ["Massachusetts"],
  "cambridge": ["Massachusetts"],
  "worcester": ["Massachusetts"],
  "lowell": ["Massachusetts"],

  // Tennessee
  "nashville": ["Tennessee"],
  "memphis": ["Tennessee"],
  "knoxville": ["Tennessee"],
  "chattanooga": ["Tennessee"],

  // Maryland
  "baltimore": ["Maryland"],
  "annapolis": ["Maryland"],
  "frederick": ["Maryland"],

  // Minnesota
  "minneapolis": ["Minnesota"],
  "st. paul": ["Minnesota"],
  "saint paul": ["Minnesota"],
  "duluth": ["Minnesota"],
  // rochester already defined above with ["New York", "Minnesota"]
  "saint louis": ["Missouri"],
  "kansas city": ["Missouri", "Kansas"],

  // Indiana
  "indianapolis": ["Indiana"],
  "fort wayne": ["Indiana"],
  "south bend": ["Indiana"],

  // Oregon
  "portland": ["Oregon", "Maine"],
  "eugene": ["Oregon"],
  "salem": ["Oregon"],

  // Louisiana
  "new orleans": ["Louisiana"],
  "baton rouge": ["Louisiana"],
  "shreveport": ["Louisiana"],

  // Nevada
  "las vegas": ["Nevada"],
  "reno": ["Nevada"],
  "henderson": ["Nevada"],

  // Connecticut
  "hartford": ["Connecticut"],
  "new haven": ["Connecticut"],
  "stamford": ["Connecticut"],
  "bridgeport": ["Connecticut"],

  // Virginia
  "richmond": ["Virginia"],
  "virginia beach": ["Virginia"],
  "norfolk": ["Virginia"],
  "arlington": ["Virginia", "Texas"],
  "alexandria": ["Virginia"],

  // Alabama
  "birmingham": ["Alabama"],
  "montgomery": ["Alabama"],
  "huntsville": ["Alabama"],
  "mobile": ["Alabama"],

  // South Carolina
  "charleston": ["South Carolina", "West Virginia"],
  "columbia": ["South Carolina"],
  "greenville": ["South Carolina"],

  // Wisconsin
  "milwaukee": ["Wisconsin"],
  "madison": ["Wisconsin"],
  "green bay": ["Wisconsin"],

  // Kentucky
  "louisville": ["Kentucky"],
  "lexington": ["Kentucky"],
  "bowling green": ["Kentucky"],

  // Iowa
  "des moines": ["Iowa"],
  "cedar rapids": ["Iowa"],

  // Oklahoma
  "oklahoma city": ["Oklahoma"],
  "tulsa": ["Oklahoma"],
  "norman": ["Oklahoma"],

  // Utah
  "salt lake city": ["Utah"],
  "provo": ["Utah"],
  "ogden": ["Utah"],

  // Hawaii
  "honolulu": ["Hawaii"],

  // Alaska
  "anchorage": ["Alaska"],
  "fairbanks": ["Alaska"],
  "juneau": ["Alaska"],

  // New Jersey
  "newark": ["New Jersey"],
  "jersey city": ["New Jersey"],
  "trenton": ["New Jersey"],
  "atlantic city": ["New Jersey"],

  // New Mexico
  "albuquerque": ["New Mexico"],
  "santa fe": ["New Mexico"],
  "las cruces": ["New Mexico"],

  // Arkansas
  "little rock": ["Arkansas"],

  // Kansas
  "wichita": ["Kansas"],
  "topeka": ["Kansas"],
  "overland park": ["Kansas"],

  // Mississippi
  "jackson": ["Mississippi"],
  "biloxi": ["Mississippi"],

  // Nebraska
  "omaha": ["Nebraska"],
  "lincoln": ["Nebraska"],

  // Idaho
  "boise": ["Idaho"],

  // Montana
  "billings": ["Montana"],
  "missoula": ["Montana"],

  // Maine
  "portland": ["Maine", "Oregon"],

  // North Dakota
  "fargo": ["North Dakota"],
  "bismarck": ["North Dakota"],

  // South Dakota
  "sioux falls": ["South Dakota"],
  "rapid city": ["South Dakota"],

  // West Virginia
  "charleston": ["West Virginia", "South Carolina"],

  // Wyoming
  "cheyenne": ["Wyoming"],
  "casper": ["Wyoming"],

  // Delaware
  "wilmington": ["Delaware", "North Carolina"],
  "dover": ["Delaware"],

  // Vermont
  "burlington": ["Vermont"],

  // Rhode Island
  "providence": ["Rhode Island"],

  // New Hampshire
  "manchester": ["New Hampshire"],
  "concord": ["New Hampshire"],
};

/**
 * Validate whether a city likely belongs to the given state.
 * Returns:
 *  - "valid"   — city is known and matches the state
 *  - "invalid" — city is known but does NOT match the state
 *  - "unknown" — city is not in our mapping (benefit of the doubt)
 */
export function validateCityState(
  city: string,
  state: string
): "valid" | "invalid" | "unknown" {
  if (!city || !state) return "unknown";
  const normalized = city.trim().toLowerCase();
  if (!normalized) return "unknown";
  const states = CITY_STATE_MAP[normalized];
  if (!states) return "unknown";
  return states.includes(state) ? "valid" : "invalid";
}
