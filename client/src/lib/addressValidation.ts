// Indian Address Validation Utility
// This file contains validation logic for Indian addresses based on state selection

export interface AddressValidationResult {
  isValid: boolean;
  errors: string[];
  suggestions?: {
    pincodes?: string[];
  };
}

// Indian States with their districts and pincode ranges
export const INDIAN_STATES_DATA: Record<string, {
  districts: string[];
  pincodeRanges: { start: number; end: number }[];
}> = {
  "Tamil Nadu": {
    districts: [
      "Chennai", "Coimbatore", "Madurai", "Salem", "Vellore", "Erode", "Tiruchirappalli",
      "Thanjavur", "Tirunelveli", "Kancheepuram", "Dindigul", "Karur", "Namakkal",
      "Theni", "Virudhunagar", "Ramanathapuram", "Thoothukkudi", "Nagercoil", "Ooty",
      "Dharmapuri", "Krishnagiri", "Ariyalur", "Perambalur", "Pudukkottai", "Sivaganga",
      "Tiruvannamalai", "Villupuram", "Cuddalore", "Nagapattinam", "Kumbakonam",
      "Mayiladuthurai", "Karaikudi", "Sivakasi", "Rajapalayam", "Tirupur", "Pollachi"
    ],
    pincodeRanges: [
      { start: 600000, end: 643000 }, // Chennai and surrounding areas
      { start: 641000, end: 642000 }, // Coimbatore
      { start: 625000, end: 626000 }, // Madurai
      { start: 636000, end: 637000 }, // Salem
      { start: 632000, end: 633000 }, // Vellore
      { start: 638000, end: 639000 }, // Erode
      { start: 620000, end: 621000 }, // Tiruchirappalli
      { start: 613000, end: 614000 }, // Thanjavur
      { start: 627000, end: 628000 }, // Tirunelveli
      { start: 603000, end: 604000 }, // Kancheepuram
      { start: 624000, end: 625000 }, // Dindigul
      { start: 639000, end: 640000 }, // Karur
      { start: 637000, end: 638000 }, // Namakkal
      { start: 625000, end: 626000 }, // Theni
      { start: 626000, end: 627000 }, // Virudhunagar
      { start: 623000, end: 624000 }, // Ramanathapuram
      { start: 628000, end: 629000 }, // Thoothukkudi
      { start: 629000, end: 630000 }, // Kanyakumari
      { start: 643000, end: 644000 }, // Nilgiris
      { start: 635000, end: 636000 }, // Dharmapuri
      { start: 635000, end: 636000 }, // Krishnagiri
      { start: 621000, end: 622000 }, // Ariyalur
      { start: 621000, end: 622000 }, // Perambalur
      { start: 622000, end: 623000 }, // Pudukkottai
      { start: 630000, end: 631000 }, // Sivaganga
      { start: 606000, end: 607000 }, // Tiruvannamalai
      { start: 605000, end: 606000 }, // Villupuram
      { start: 607000, end: 608000 }, // Cuddalore
      { start: 611000, end: 612000 }  // Nagapattinam
    ]
  },
  "Maharashtra": {
    districts: [
      "Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Kolhapur",
      "Amravati", "Nanded", "Sangli", "Jalgaon", "Akola", "Latur", "Dhule", "Ahmednagar",
      "Jalna", "Parbhani", "Beed", "Gondia", "Chandrapur", "Bhandara", "Wardha", "Gadchiroli",
      "Yavatmal", "Buldhana", "Hingoli", "Washim", "Nandurbar", "Ratnagiri", "Sindhudurg",
      "Raigad", "Satara", "Osmanabad", "Kalyan", "Dombivli", "Vasai", "Virar", "Bhiwandi",
      "Ulhasnagar", "Ambernath", "Badlapur", "Karjat", "Panvel", "Alibag", "Pen", "Uran"
    ],
    pincodeRanges: [
      { start: 400000, end: 401000 }, // Mumbai
      { start: 411000, end: 412000 }, // Pune
      { start: 440000, end: 441000 }, // Nagpur
      { start: 400600, end: 401700 }, // Thane
      { start: 422000, end: 423000 }, // Nashik
      { start: 431000, end: 432000 }, // Aurangabad
      { start: 413000, end: 414000 }, // Solapur
      { start: 416000, end: 417000 }, // Kolhapur
      { start: 444000, end: 445000 }, // Amravati
      { start: 431000, end: 432000 }, // Nanded
      { start: 416000, end: 417000 }, // Sangli
      { start: 425000, end: 426000 }, // Jalgaon
      { start: 444000, end: 445000 }, // Akola
      { start: 413000, end: 414000 }, // Latur
      { start: 424000, end: 425000 }, // Dhule
      { start: 414000, end: 415000 }, // Ahmednagar
      { start: 431000, end: 432000 }, // Jalna
      { start: 431000, end: 432000 }, // Parbhani
      { start: 431000, end: 432000 }, // Beed
      { start: 441000, end: 442000 }, // Gondia
      { start: 442000, end: 443000 }, // Chandrapur
      { start: 441000, end: 442000 }, // Bhandara
      { start: 442000, end: 443000 }, // Wardha
      { start: 442000, end: 443000 }, // Gadchiroli
      { start: 445000, end: 446000 }, // Yavatmal
      { start: 443000, end: 444000 }, // Buldhana
      { start: 431000, end: 432000 }, // Hingoli
      { start: 444000, end: 445000 }, // Washim
      { start: 425000, end: 426000 }, // Nandurbar
      { start: 415000, end: 416000 }, // Ratnagiri
      { start: 416000, end: 417000 }, // Sindhudurg
      { start: 400600, end: 402000 }, // Raigad
      { start: 415000, end: 416000 }, // Satara
      { start: 413000, end: 414000 }, // Osmanabad
      { start: 400600, end: 401700 }, // Kalyan, Dombivli, Vasai, etc.
      { start: 400600, end: 401700 }, // Thane district cities
      { start: 400600, end: 401700 }  // Raigad district cities
    ]
  },
  "Karnataka": {
    districts: [
      "Bangalore", "Mysore", "Mangalore", "Hubli", "Belgaum", "Gulbarga", "Bellary",
      "Bijapur", "Shimoga", "Tumkur", "Kolar", "Mandya", "Hassan", "Chitradurga",
      "Raichur", "Bidar", "Chikmagalur", "Kodagu", "Dakshina Kannada", "Uttara Kannada",
      "Chikkaballapur", "Ramanagara", "Yadgir", "Chamrajnagar", "Davangere", "Bagalkot",
      "Gadag", "Haveri", "Koppal", "Udupi", "Dharwad", "Karwar", "Sirsi", "Madikeri"
    ],
    pincodeRanges: [
      { start: 560000, end: 561000 }, // Bangalore
      { start: 570000, end: 571000 }, // Mysore
      { start: 575000, end: 576000 }, // Mangalore
      { start: 580000, end: 581000 }, // Hubli
      { start: 590000, end: 591000 }, // Belgaum
      { start: 585000, end: 586000 }, // Gulbarga
      { start: 583000, end: 584000 }, // Bellary
      { start: 586000, end: 587000 }, // Bijapur
      { start: 577000, end: 578000 }, // Shimoga
      { start: 572000, end: 573000 }, // Tumkur
      { start: 563000, end: 564000 }, // Kolar
      { start: 571000, end: 572000 }, // Mandya
      { start: 573000, end: 574000 }, // Hassan
      { start: 577000, end: 578000 }, // Chitradurga
      { start: 584000, end: 585000 }, // Raichur
      { start: 585000, end: 586000 }, // Bidar
      { start: 577000, end: 578000 }, // Chikmagalur
      { start: 571000, end: 572000 }, // Kodagu
      { start: 575000, end: 576000 }, // Dakshina Kannada
      { start: 581000, end: 582000 }, // Uttara Kannada
      { start: 562000, end: 563000 }, // Chikkaballapur
      { start: 562000, end: 563000 }, // Ramanagara
      { start: 585000, end: 586000 }, // Yadgir
      { start: 571000, end: 572000 }, // Chamrajnagar
      { start: 577000, end: 578000 }, // Davangere
      { start: 587000, end: 588000 }, // Bagalkot
      { start: 582000, end: 583000 }, // Gadag
      { start: 581000, end: 582000 }, // Haveri
      { start: 583000, end: 584000 }, // Koppal
      { start: 576000, end: 577000 }, // Udupi
      { start: 580000, end: 581000 }, // Dharwad
      { start: 581000, end: 582000 }, // Karwar
      { start: 581000, end: 582000 }, // Sirsi
      { start: 571000, end: 572000 }  // Madikeri
    ]
  },
  "Delhi": {
    districts: [
      "New Delhi", "Central Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi",
      "North West Delhi", "South West Delhi", "Shahdara", "Dwarka", "Rohini", "Pitampura",
      "Janakpuri", "Rajouri Garden", "Hauz Khas", "Saket", "Lajpat Nagar", "Defence Colony",
      "Greater Kailash", "Vasant Vihar", "Punjabi Bagh", "Patel Nagar", "Karol Bagh",
      "Connaught Place", "Chandni Chowk", "Old Delhi", "Mehrauli", "Tughlaqabad"
    ],
    pincodeRanges: [
      { start: 110000, end: 111000 }, // New Delhi
      { start: 110000, end: 111000 }, // Central Delhi
      { start: 110000, end: 111000 }, // North Delhi
      { start: 110000, end: 111000 }, // South Delhi
      { start: 110000, end: 111000 }, // East Delhi
      { start: 110000, end: 111000 }, // West Delhi
      { start: 110000, end: 111000 }, // North West Delhi
      { start: 110000, end: 111000 }, // South West Delhi
      { start: 110000, end: 111000 }, // Shahdara
      { start: 110000, end: 111000 }, // Dwarka
      { start: 110000, end: 111000 }, // Rohini
      { start: 110000, end: 111000 }, // Pitampura
      { start: 110000, end: 111000 }, // Janakpuri
      { start: 110000, end: 111000 }, // Rajouri Garden
      { start: 110000, end: 111000 }, // Hauz Khas
      { start: 110000, end: 111000 }, // Saket
      { start: 110000, end: 111000 }, // Lajpat Nagar
      { start: 110000, end: 111000 }, // Defence Colony
      { start: 110000, end: 111000 }, // Greater Kailash
      { start: 110000, end: 111000 }, // Vasant Vihar
      { start: 110000, end: 111000 }, // Punjabi Bagh
      { start: 110000, end: 111000 }, // Patel Nagar
      { start: 110000, end: 111000 }, // Karol Bagh
      { start: 110000, end: 111000 }, // Connaught Place
      { start: 110000, end: 111000 }, // Chandni Chowk
      { start: 110000, end: 111000 }, // Old Delhi
      { start: 110000, end: 111000 }, // Mehrauli
      { start: 110000, end: 111000 }  // Tughlaqabad
    ]
  }
};

// Get all Indian states
export const INDIAN_STATES = Object.keys(INDIAN_STATES_DATA);

// Get districts for a specific state
export function getDistrictsForState(state: string): string[] {
  return INDIAN_STATES_DATA[state]?.districts || [];
}

// Validate only pincode for a state
export function validatePincodeForState(state: string, pincode: string): AddressValidationResult {
  const errors: string[] = [];
  const suggestions: { pincodes?: string[] } = {};

  if (!state) {
    errors.push('State is required for pincode validation');
    return { isValid: false, errors };
  }

  const stateData = INDIAN_STATES_DATA[state];
  if (!stateData) {
    errors.push(`Pincode validation not available for ${state}. Please contact support.`);
    return { isValid: false, errors };
  }

  if (!pincode) {
    return { isValid: true, errors: [] };
  }

  const pincodeNum = parseInt(pincode);
  if (isNaN(pincodeNum) || pincode.length !== 6) {
    errors.push('Pincode must be a 6-digit number');
  } else {
    const isValidPincode = stateData.pincodeRanges.some(range => 
      pincodeNum >= range.start && pincodeNum <= range.end
    );
    if (!isValidPincode) {
      errors.push(`Pincode ${pincode} may not be valid for ${state}`);
      suggestions.pincodes = stateData.pincodeRanges.map(range => 
        `${range.start.toString().substring(0, 3)}xxx - ${range.end.toString().substring(0, 3)}xxx`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    suggestions: Object.keys(suggestions).length > 0 ? suggestions : undefined
  };
}

// Get pincode range for a state
export function getPincodeRange(state: string): string {
  const stateData = INDIAN_STATES_DATA[state];
  if (!stateData) {
    return 'Not available';
  }

  const ranges = stateData.pincodeRanges;
  if (ranges.length === 0) {
    return 'Not available';
  }

  const minStart = Math.min(...ranges.map(r => r.start));
  const maxEnd = Math.max(...ranges.map(r => r.end));
  
  return `${minStart.toString().substring(0, 3)}xxx - ${maxEnd.toString().substring(0, 3)}xxx`;
}
