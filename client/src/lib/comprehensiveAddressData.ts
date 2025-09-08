// Comprehensive Indian Address Data
// This file contains detailed state, district, and pincode information for India

export interface DistrictData {
  name: string;
  pincodes: Array<{
    start: number;
    end: number;
    description?: string;
  }>;
}

export interface StateData {
  name: string;
  districts: DistrictData[];
}

export interface AddressValidationResult {
  isValid: boolean;
  errors: string[];
  suggestions?: {
    districts?: string[];
    pincodes?: string[];
  };
}

// Comprehensive Indian States Data
export const COMPREHENSIVE_INDIAN_STATES_DATA: Record<string, StateData> = {
  "Andhra Pradesh": {
    name: "Andhra Pradesh",
    districts: [
      { name: "Anantapur", pincodes: [{ start: 515001, end: 515775 }] },
      { name: "Chittoor", pincodes: [{ start: 517001, end: 517645 }] },
      { name: "East Godavari", pincodes: [{ start: 533001, end: 533484 }] },
      { name: "Guntur", pincodes: [{ start: 522001, end: 522616 }] },
      { name: "Kadapa", pincodes: [{ start: 516001, end: 516474 }] },
      { name: "Krishna", pincodes: [{ start: 520001, end: 521356 }] },
      { name: "Kurnool", pincodes: [{ start: 518001, end: 518543 }] },
      { name: "Nellore", pincodes: [{ start: 524001, end: 524413 }] },
      { name: "Prakasam", pincodes: [{ start: 523001, end: 523346 }] },
      { name: "Srikakulam", pincodes: [{ start: 532001, end: 532484 }] },
      { name: "Visakhapatnam", pincodes: [{ start: 530001, end: 531162 }] },
      { name: "Vizianagaram", pincodes: [{ start: 535001, end: 535593 }] },
      { name: "West Godavari", pincodes: [{ start: 534001, end: 534350 }] }
    ]
  },
  "Arunachal Pradesh": {
    name: "Arunachal Pradesh",
    districts: [
      { name: "Tawang", pincodes: [{ start: 790104, end: 790104 }] },
      { name: "West Kameng", pincodes: [{ start: 790001, end: 790103 }] },
      { name: "East Kameng", pincodes: [{ start: 791001, end: 791113 }] },
      { name: "Papum Pare", pincodes: [{ start: 791102, end: 791125 }] },
      { name: "Lower Subansiri", pincodes: [{ start: 791120, end: 791125 }] },
      { name: "Upper Subansiri", pincodes: [{ start: 791121, end: 791125 }] },
      { name: "West Siang", pincodes: [{ start: 791001, end: 791125 }] },
      { name: "East Siang", pincodes: [{ start: 791001, end: 791125 }] },
      { name: "Upper Siang", pincodes: [{ start: 791001, end: 791125 }] },
      { name: "Lower Dibang Valley", pincodes: [{ start: 792110, end: 792110 }] },
      { name: "Upper Dibang Valley", pincodes: [{ start: 792103, end: 792103 }] },
      { name: "Anjaw", pincodes: [{ start: 792130, end: 792130 }] },
      { name: "Lohit", pincodes: [{ start: 792001, end: 792131 }] },
      { name: "Namsai", pincodes: [{ start: 792103, end: 792131 }] },
      { name: "Changlang", pincodes: [{ start: 792101, end: 792131 }] },
      { name: "Tirap", pincodes: [{ start: 792120, end: 792131 }] },
      { name: "Longding", pincodes: [{ start: 792121, end: 792131 }] }
    ]
  },
  "Assam": {
    name: "Assam",
    districts: [
      { name: "Baksa", pincodes: [{ start: 781371, end: 781381 }] },
      { name: "Barpeta", pincodes: [{ start: 781301, end: 781351 }] },
      { name: "Biswanath", pincodes: [{ start: 784001, end: 784176 }] },
      { name: "Bongaigaon", pincodes: [{ start: 783380, end: 783390 }] },
      { name: "Cachar", pincodes: [{ start: 788001, end: 788930 }] },
      { name: "Charaideo", pincodes: [{ start: 785690, end: 785697 }] },
      { name: "Chirang", pincodes: [{ start: 783385, end: 783392 }] },
      { name: "Darrang", pincodes: [{ start: 784115, end: 784190 }] },
      { name: "Dhemaji", pincodes: [{ start: 787057, end: 787059 }] },
      { name: "Dhubri", pincodes: [{ start: 783301, end: 783350 }] },
      { name: "Dibrugarh", pincodes: [{ start: 786001, end: 786191 }] },
      { name: "Dima Hasao", pincodes: [{ start: 788815, end: 788931 }] },
      { name: "Goalpara", pincodes: [{ start: 783101, end: 783145 }] },
      { name: "Golaghat", pincodes: [{ start: 785601, end: 785702 }] },
      { name: "Hailakandi", pincodes: [{ start: 788801, end: 788819 }] },
      { name: "Hojai", pincodes: [{ start: 782435, end: 782441 }] },
      { name: "Jorhat", pincodes: [{ start: 785001, end: 785702 }] },
      { name: "Kamrup Metropolitan", pincodes: [{ start: 781001, end: 781040 }] },
      { name: "Kamrup", pincodes: [{ start: 781101, end: 781381 }] },
      { name: "Karbi Anglong", pincodes: [{ start: 782001, end: 782490 }] },
      { name: "Karimganj", pincodes: [{ start: 788710, end: 788806 }] },
      { name: "Kokrajhar", pincodes: [{ start: 783335, end: 783392 }] },
      { name: "Lakhimpur", pincodes: [{ start: 787001, end: 787059 }] },
      { name: "Majuli", pincodes: [{ start: 785104, end: 785107 }] },
      { name: "Morigaon", pincodes: [{ start: 782105, end: 782138 }] },
      { name: "Nagaon", pincodes: [{ start: 782001, end: 782447 }] },
      { name: "Nalbari", pincodes: [{ start: 781335, end: 781367 }] },
      { name: "Sivasagar", pincodes: [{ start: 785640, end: 785702 }] },
      { name: "Sonitpur", pincodes: [{ start: 784001, end: 784190 }] },
      { name: "South Salmara-Mankachar", pincodes: [{ start: 783123, end: 783127 }] },
      { name: "Tamulpur", pincodes: [{ start: 783129, end: 783135 }] },
      { name: "Tinsukia", pincodes: [{ start: 786125, end: 786191 }] },
      { name: "Udalguri", pincodes: [{ start: 784509, end: 784528 }] },
      { name: "West Karbi Anglong", pincodes: [{ start: 782446, end: 782490 }] },
      { name: "Bajali", pincodes: [{ start: 781351, end: 781381 }] }
    ]
  },
  "Bihar": {
    name: "Bihar",
    districts: [
      { name: "Araria", pincodes: [{ start: 854001, end: 854330 }] },
      { name: "Arwal", pincodes: [{ start: 804401, end: 804427 }] },
      { name: "Aurangabad", pincodes: [{ start: 824101, end: 824125 }] },
      { name: "Banka", pincodes: [{ start: 813101, end: 813220 }] },
      { name: "Begusarai", pincodes: [{ start: 851101, end: 851135 }] },
      { name: "Bhagalpur", pincodes: [{ start: 812001, end: 813131 }] },
      { name: "Bhojpur", pincodes: [{ start: 802101, end: 802215 }] },
      { name: "Buxar", pincodes: [{ start: 802101, end: 802133 }] },
      { name: "Darbhanga", pincodes: [{ start: 846001, end: 846009 }] },
      { name: "East Champaran", pincodes: [{ start: 845401, end: 845457 }] },
      { name: "Gaya", pincodes: [{ start: 823001, end: 824125 }] },
      { name: "Gopalganj", pincodes: [{ start: 841101, end: 841440 }] },
      { name: "Jamui", pincodes: [{ start: 811307, end: 811318 }] },
      { name: "Jehanabad", pincodes: [{ start: 804408, end: 804427 }] },
      { name: "Kaimur", pincodes: [{ start: 821101, end: 821115 }] },
      { name: "Katihar", pincodes: [{ start: 854105, end: 855113 }] },
      { name: "Khagaria", pincodes: [{ start: 848101, end: 848210 }] },
      { name: "Kishanganj", pincodes: [{ start: 855001, end: 855117 }] },
      { name: "Lakhisarai", pincodes: [{ start: 811101, end: 811318 }] },
      { name: "Madhepura", pincodes: [{ start: 852101, end: 852124 }] },
      { name: "Madhubani", pincodes: [{ start: 847101, end: 847422 }] },
      { name: "Munger", pincodes: [{ start: 811201, end: 811221 }] },
      { name: "Muzaffarpur", pincodes: [{ start: 842001, end: 843331 }] },
      { name: "Nalanda", pincodes: [{ start: 803101, end: 803213 }] },
      { name: "Nawada", pincodes: [{ start: 805110, end: 805130 }] },
      { name: "Patna", pincodes: [{ start: 800001, end: 801503 }] },
      { name: "Purnia", pincodes: [{ start: 854301, end: 854330 }] },
      { name: "Rohtas", pincodes: [{ start: 821101, end: 821310 }] },
      { name: "Saharsa", pincodes: [{ start: 852201, end: 852216 }] },
      { name: "Samastipur", pincodes: [{ start: 848101, end: 848210 }] },
      { name: "Saran", pincodes: [{ start: 841101, end: 841440 }] },
      { name: "Sheikhpura", pincodes: [{ start: 811105, end: 811108 }] },
      { name: "Sheohar", pincodes: [{ start: 843329, end: 843331 }] },
      { name: "Sitamarhi", pincodes: [{ start: 843301, end: 843331 }] },
      { name: "Siwan", pincodes: [{ start: 841226, end: 841440 }] },
      { name: "Supaul", pincodes: [{ start: 852131, end: 852140 }] },
      { name: "Vaishali", pincodes: [{ start: 844101, end: 844508 }] },
      { name: "West Champaran", pincodes: [{ start: 845101, end: 845457 }] }
    ]
  },
  "Chhattisgarh": {
    name: "Chhattisgarh",
    districts: [
      { name: "Bilaspur", pincodes: [{ start: 495001, end: 495678 }] },
      { name: "Dantewada", pincodes: [{ start: 494441, end: 494453 }] },
      { name: "Dhamtari", pincodes: [{ start: 493771, end: 493782 }] },
      { name: "Durg", pincodes: [{ start: 490001, end: 491445 }] },
      { name: "Janjgir-Champa", pincodes: [{ start: 495668, end: 495692 }] },
      { name: "Jashpur", pincodes: [{ start: 496001, end: 496338 }] },
      { name: "Kanker", pincodes: [{ start: 494334, end: 494347 }] },
      { name: "Korba", pincodes: [{ start: 495677, end: 495692 }] },
      { name: "Korea", pincodes: [{ start: 497335, end: 497449 }] },
      { name: "Mahasamund", pincodes: [{ start: 493445, end: 493559 }] },
      { name: "Raigarh", pincodes: [{ start: 496001, end: 496554 }] },
      { name: "Raipur", pincodes: [{ start: 492001, end: 493441 }] },
      { name: "Rajnandgaon", pincodes: [{ start: 491441, end: 491668 }] },
      { name: "Surguja", pincodes: [{ start: 497001, end: 497773 }] },
      { name: "Bastar", pincodes: [{ start: 494001, end: 494230 }] },
      { name: "Bijapur", pincodes: [{ start: 494222, end: 494230 }] },
      { name: "Narayanpur", pincodes: [{ start: 494661, end: 494670 }] },
      { name: "Sukma", pincodes: [{ start: 494114, end: 494124 }] },
      { name: "Kondagaon", pincodes: [{ start: 494226, end: 494230 }] },
      { name: "Balod", pincodes: [{ start: 491226, end: 491337 }] },
      { name: "Baloda Bazar", pincodes: [{ start: 493332, end: 493441 }] },
      { name: "Bemetara", pincodes: [{ start: 491335, end: 491337 }] },
      { name: "Gariaband", pincodes: [{ start: 493889, end: 493906 }] },
      { name: "Mungeli", pincodes: [{ start: 495334, end: 495344 }] },
      { name: "Surajpur", pincodes: [{ start: 497229, end: 497449 }] },
      { name: "Balrampur", pincodes: [{ start: 497118, end: 497229 }] },
      { name: "Gaurela-Pendra-Marwahi", pincodes: [{ start: 495117, end: 495119 }] },
      { name: "Manendragarh-Chirmiri-Bharatpur", pincodes: [{ start: 497442, end: 497449 }] },
      { name: "Mohla-Manpur-Ambagarh Chowki", pincodes: [{ start: 491665, end: 491668 }] },
      { name: "Sarangarh-Bilaigarh", pincodes: [{ start: 496445, end: 496554 }] },
      { name: "Shakti", pincodes: [{ start: 496113, end: 496224 }] },
      { name: "Kabirdham", pincodes: [{ start: 491995, end: 491999 }] }
    ]
  },
  "Goa": {
    name: "Goa",
    districts: [
      { name: "North Goa", pincodes: [{ start: 403001, end: 403512 }] },
      { name: "South Goa", pincodes: [{ start: 403513, end: 403806 }] }
    ]
  },
  "Gujarat": {
    name: "Gujarat",
    districts: [
      { name: "Ahmedabad", pincodes: [{ start: 380001, end: 382481 }] },
      { name: "Amreli", pincodes: [{ start: 365601, end: 365640 }] },
      { name: "Anand", pincodes: [{ start: 388001, end: 388640 }] },
      { name: "Aravalli", pincodes: [{ start: 383001, end: 383244 }] },
      { name: "Banaskantha", pincodes: [{ start: 385001, end: 385575 }] },
      { name: "Bharuch", pincodes: [{ start: 392001, end: 393155 }] },
      { name: "Bhavnagar", pincodes: [{ start: 364001, end: 364750 }] },
      { name: "Botad", pincodes: [{ start: 364710, end: 364750 }] },
      { name: "Chhota Udaipur", pincodes: [{ start: 391165, end: 391180 }] },
      { name: "Dahod", pincodes: [{ start: 389001, end: 389172 }] },
      { name: "Dang", pincodes: [{ start: 394730, end: 394777 }] },
      { name: "Devbhoomi Dwarka", pincodes: [{ start: 361001, end: 361350 }] },
      { name: "Gandhinagar", pincodes: [{ start: 382007, end: 382650 }] },
      { name: "Gir Somnath", pincodes: [{ start: 362001, end: 362610 }] },
      { name: "Jamnagar", pincodes: [{ start: 361001, end: 361350 }] },
      { name: "Junagadh", pincodes: [{ start: 362001, end: 362630 }] },
      { name: "Kutch", pincodes: [{ start: 370001, end: 370645 }] },
      { name: "Kheda", pincodes: [{ start: 387001, end: 388450 }] },
      { name: "Mahisagar", pincodes: [{ start: 389230, end: 389260 }] },
      { name: "Mehsana", pincodes: [{ start: 384001, end: 384170 }] },
      { name: "Morbi", pincodes: [{ start: 363641, end: 363645 }] },
      { name: "Narmada", pincodes: [{ start: 393040, end: 393155 }] },
      { name: "Navsari", pincodes: [{ start: 396001, end: 396580 }] },
      { name: "Panchmahal", pincodes: [{ start: 389001, end: 389230 }] },
      { name: "Patan", pincodes: [{ start: 384265, end: 385520 }] },
      { name: "Porbandar", pincodes: [{ start: 360575, end: 360590 }] },
      { name: "Rajkot", pincodes: [{ start: 360001, end: 360590 }] },
      { name: "Sabarkantha", pincodes: [{ start: 383001, end: 383350 }] },
      { name: "Surat", pincodes: [{ start: 394001, end: 395010 }] },
      { name: "Surendranagar", pincodes: [{ start: 363001, end: 363660 }] },
      { name: "Tapi", pincodes: [{ start: 394640, end: 394680 }] },
      { name: "Vadodara", pincodes: [{ start: 390001, end: 391180 }] },
      { name: "Valsad", pincodes: [{ start: 396001, end: 396195 }] }
    ]
  },
  "Haryana": {
    name: "Haryana",
    districts: [
      { name: "Ambala", pincodes: [{ start: 133001, end: 134109 }] },
      { name: "Bhiwani", pincodes: [{ start: 127021, end: 127308 }] },
      { name: "Charkhi Dadri", pincodes: [{ start: 127306, end: 127308 }] },
      { name: "Faridabad", pincodes: [{ start: 121001, end: 121102 }] },
      { name: "Fatehabad", pincodes: [{ start: 125050, end: 125111 }] },
      { name: "Gurugram", pincodes: [{ start: 122001, end: 122505 }] },
      { name: "Hisar", pincodes: [{ start: 125001, end: 125111 }] },
      { name: "Jhajjar", pincodes: [{ start: 124001, end: 124507 }] },
      { name: "Jind", pincodes: [{ start: 126101, end: 126116 }] },
      { name: "Kaithal", pincodes: [{ start: 136001, end: 136156 }] },
      { name: "Karnal", pincodes: [{ start: 132001, end: 132140 }] },
      { name: "Kurukshetra", pincodes: [{ start: 136118, end: 136156 }] },
      { name: "Mahendragarh", pincodes: [{ start: 123029, end: 123507 }] },
      { name: "Nuh", pincodes: [{ start: 122107, end: 122508 }] },
      { name: "Palwal", pincodes: [{ start: 121102, end: 121107 }] },
      { name: "Panchkula", pincodes: [{ start: 134109, end: 134117 }] },
      { name: "Panipat", pincodes: [{ start: 132103, end: 132140 }] },
      { name: "Rewari", pincodes: [{ start: 123401, end: 123507 }] },
      { name: "Rohtak", pincodes: [{ start: 124001, end: 124507 }] },
      { name: "Sirsa", pincodes: [{ start: 125055, end: 125111 }] },
      { name: "Sonipat", pincodes: [{ start: 131001, end: 131402 }] },
      { name: "Yamunanagar", pincodes: [{ start: 135001, end: 135133 }] }
    ]
  },
  "Himachal Pradesh": {
    name: "Himachal Pradesh",
    districts: [
      { name: "Bilaspur", pincodes: [{ start: 174001, end: 174027 }] },
      { name: "Chamba", pincodes: [{ start: 176001, end: 176320 }] },
      { name: "Hamirpur", pincodes: [{ start: 177001, end: 177223 }] },
      { name: "Kangra", pincodes: [{ start: 176001, end: 176320 }] },
      { name: "Kinnaur", pincodes: [{ start: 172001, end: 172114 }] },
      { name: "Kullu", pincodes: [{ start: 175001, end: 175142 }] },
      { name: "Lahaul and Spiti", pincodes: [{ start: 175132, end: 175142 }] },
      { name: "Mandi", pincodes: [{ start: 175001, end: 175027 }] },
      { name: "Shimla", pincodes: [{ start: 171001, end: 172114 }] },
      { name: "Sirmaur", pincodes: [{ start: 173001, end: 173223 }] },
      { name: "Solan", pincodes: [{ start: 173211, end: 173223 }] },
      { name: "Una", pincodes: [{ start: 177201, end: 177223 }] }
    ]
  },
  "Jharkhand": {
    name: "Jharkhand",
    districts: [
      { name: "Bokaro", pincodes: [{ start: 827001, end: 829145 }] },
      { name: "Chatra", pincodes: [{ start: 825401, end: 825405 }] },
      { name: "Deoghar", pincodes: [{ start: 814001, end: 814154 }] },
      { name: "Dhanbad", pincodes: [{ start: 828001, end: 828307 }] },
      { name: "Dumka", pincodes: [{ start: 814101, end: 814154 }] },
      { name: "East Singhbhum", pincodes: [{ start: 831001, end: 832107 }] },
      { name: "Garhwa", pincodes: [{ start: 822101, end: 822133 }] },
      { name: "Giridih", pincodes: [{ start: 815301, end: 815354 }] },
      { name: "Godda", pincodes: [{ start: 814133, end: 814154 }] },
      { name: "Gumla", pincodes: [{ start: 835207, end: 835231 }] },
      { name: "Hazaribagh", pincodes: [{ start: 825301, end: 825405 }] },
      { name: "Jamtara", pincodes: [{ start: 815351, end: 815354 }] },
      { name: "Khunti", pincodes: [{ start: 835201, end: 835231 }] },
      { name: "Koderma", pincodes: [{ start: 825401, end: 825405 }] },
      { name: "Latehar", pincodes: [{ start: 822118, end: 822133 }] },
      { name: "Lohardaga", pincodes: [{ start: 835302, end: 835324 }] },
      { name: "Pakur", pincodes: [{ start: 816107, end: 816109 }] },
      { name: "Palamu", pincodes: [{ start: 822101, end: 822133 }] },
      { name: "Ramgarh", pincodes: [{ start: 829122, end: 829145 }] },
      { name: "Ranchi", pincodes: [{ start: 834001, end: 835231 }] },
      { name: "Sahebganj", pincodes: [{ start: 816101, end: 816109 }] },
      { name: "Saraikela Kharsawan", pincodes: [{ start: 832101, end: 832107 }] },
      { name: "Simdega", pincodes: [{ start: 835223, end: 835231 }] },
      { name: "West Singhbhum", pincodes: [{ start: 833101, end: 833223 }] }
    ]
  },
  "Karnataka": {
    name: "Karnataka",
    districts: [
      { name: "Bagalkot", pincodes: [{ start: 587101, end: 587204 }] },
      { name: "Ballari", pincodes: [{ start: 583101, end: 583275 }] },
      { name: "Belagavi", pincodes: [{ start: 590001, end: 591346 }] },
      { name: "Bengaluru Rural", pincodes: [{ start: 560064, end: 562162 }] },
      { name: "Bengaluru Urban", pincodes: [{ start: 560001, end: 560300 }] },
      { name: "Bidar", pincodes: [{ start: 585401, end: 585418 }] },
      { name: "Chamarajanagar", pincodes: [{ start: 571313, end: 571441 }] },
      { name: "Chikkaballapur", pincodes: [{ start: 562101, end: 563135 }] },
      { name: "Chikkamagaluru", pincodes: [{ start: 577101, end: 577160 }] },
      { name: "Chitradurga", pincodes: [{ start: 577501, end: 577598 }] },
      { name: "Dakshina Kannada", pincodes: [{ start: 574101, end: 575028 }] },
      { name: "Davanagere", pincodes: [{ start: 577001, end: 577005 }] },
      { name: "Dharwad", pincodes: [{ start: 580001, end: 581359 }] },
      { name: "Gadag", pincodes: [{ start: 582101, end: 582213 }] },
      { name: "Hassan", pincodes: [{ start: 573101, end: 573226 }] },
      { name: "Haveri", pincodes: [{ start: 581110, end: 581359 }] },
      { name: "Kalaburagi", pincodes: [{ start: 585101, end: 585418 }] },
      { name: "Kodagu", pincodes: [{ start: 571201, end: 571281 }] },
      { name: "Kolar", pincodes: [{ start: 563101, end: 563135 }] },
      { name: "Koppal", pincodes: [{ start: 583231, end: 583275 }] },
      { name: "Mandya", pincodes: [{ start: 571401, end: 571477 }] },
      { name: "Mysuru", pincodes: [{ start: 570001, end: 571130 }] },
      { name: "Raichur", pincodes: [{ start: 584101, end: 584170 }] },
      { name: "Ramanagara", pincodes: [{ start: 562159, end: 562162 }] },
      { name: "Shivamogga", pincodes: [{ start: 577201, end: 577421 }] },
      { name: "Tumakuru", pincodes: [{ start: 572101, end: 572227 }] },
      { name: "Udupi", pincodes: [{ start: 576101, end: 576224 }] },
      { name: "Uttara Kannada", pincodes: [{ start: 581301, end: 581359 }] },
      { name: "Vijayapura", pincodes: [{ start: 586101, end: 586221 }] },
      { name: "Yadgir", pincodes: [{ start: 585201, end: 585202 }] },
      { name: "Vijayanagara", pincodes: [{ start: 583276, end: 583279 }] }
    ]
  },
  "Kerala": {
    name: "Kerala",
    districts: [
      { name: "Thiruvananthapuram", pincodes: [{ start: 695001, end: 695615 }] },
      { name: "Kollam", pincodes: [{ start: 691001, end: 691583 }] },
      { name: "Pathanamthitta", pincodes: [{ start: 689101, end: 689697 }] },
      { name: "Alappuzha", pincodes: [{ start: 688001, end: 688582 }] },
      { name: "Kottayam", pincodes: [{ start: 686101, end: 686693 }] },
      { name: "Idukki", pincodes: [{ start: 685501, end: 685619 }] },
      { name: "Ernakulam", pincodes: [{ start: 682001, end: 683594 }] },
      { name: "Thrissur", pincodes: [{ start: 680001, end: 680733 }] },
      { name: "Palakkad", pincodes: [{ start: 678001, end: 679351 }] },
      { name: "Malappuram", pincodes: [{ start: 676101, end: 676553 }] },
      { name: "Kozhikode", pincodes: [{ start: 673001, end: 673645 }] },
      { name: "Wayanad", pincodes: [{ start: 670001, end: 673104 }] },
      { name: "Kannur", pincodes: [{ start: 670001, end: 671544 }] },
      { name: "Kasaragod", pincodes: [{ start: 671121, end: 671544 }] }
    ]
  },
  "Madhya Pradesh": {
    name: "Madhya Pradesh",
    districts: [
      { name: "Agar Malwa", pincodes: [{ start: 465441, end: 465449 }] },
      { name: "Alirajpur", pincodes: [{ start: 457001, end: 457118 }] },
      { name: "Anuppur", pincodes: [{ start: 484001, end: 484661 }] },
      { name: "Ashoknagar", pincodes: [{ start: 473331, end: 473355 }] },
      { name: "Balaghat", pincodes: [{ start: 481001, end: 481115 }] },
      { name: "Barwani", pincodes: [{ start: 451001, end: 451556 }] },
      { name: "Betul", pincodes: [{ start: 460001, end: 460661 }] },
      { name: "Bhind", pincodes: [{ start: 477001, end: 477553 }] },
      { name: "Bhopal", pincodes: [{ start: 462001, end: 462046 }] },
      { name: "Burhanpur", pincodes: [{ start: 450331, end: 450556 }] },
      { name: "Chhatarpur", pincodes: [{ start: 471001, end: 472001 }] },
      { name: "Chhindwara", pincodes: [{ start: 480001, end: 480661 }] },
      { name: "Damoh", pincodes: [{ start: 470661, end: 470775 }] },
      { name: "Datia", pincodes: [{ start: 475001, end: 475661 }] },
      { name: "Dewas", pincodes: [{ start: 455001, end: 455449 }] },
      { name: "Dhar", pincodes: [{ start: 454001, end: 454775 }] },
      { name: "Dindori", pincodes: [{ start: 481880, end: 481890 }] },
      { name: "Guna", pincodes: [{ start: 473001, end: 473355 }] },
      { name: "Gwalior", pincodes: [{ start: 474001, end: 474020 }] },
      { name: "Harda", pincodes: [{ start: 461331, end: 461661 }] },
      { name: "Hoshangabad", pincodes: [{ start: 461001, end: 461661 }] },
      { name: "Indore", pincodes: [{ start: 452001, end: 453661 }] },
      { name: "Jabalpur", pincodes: [{ start: 482001, end: 483661 }] },
      { name: "Jhabua", pincodes: [{ start: 457661, end: 457887 }] },
      { name: "Katni", pincodes: [{ start: 483501, end: 483661 }] },
      { name: "Khandwa", pincodes: [{ start: 450001, end: 450661 }] },
      { name: "Khargone", pincodes: [{ start: 451441, end: 451661 }] },
      { name: "Mandla", pincodes: [{ start: 481661, end: 481890 }] },
      { name: "Mandsaur", pincodes: [{ start: 458001, end: 458667 }] },
      { name: "Morena", pincodes: [{ start: 476001, end: 476444 }] },
      { name: "Narsinghpur", pincodes: [{ start: 487001, end: 487661 }] },
      { name: "Neemuch", pincodes: [{ start: 458441, end: 458667 }] },
      { name: "Niwari", pincodes: [{ start: 472001, end: 472011 }] },
      { name: "Panna", pincodes: [{ start: 488001, end: 488448 }] },
      { name: "Raisen", pincodes: [{ start: 464001, end: 464674 }] },
      { name: "Rajgarh", pincodes: [{ start: 465661, end: 466001 }] },
      { name: "Ratlam", pincodes: [{ start: 457001, end: 457118 }] },
      { name: "Rewa", pincodes: [{ start: 486001, end: 486889 }] },
      { name: "Sagar", pincodes: [{ start: 470001, end: 470775 }] },
      { name: "Satna", pincodes: [{ start: 485001, end: 485775 }] },
      { name: "Sehore", pincodes: [{ start: 466001, end: 466116 }] },
      { name: "Seoni", pincodes: [{ start: 480661, end: 480890 }] },
      { name: "Shahdol", pincodes: [{ start: 484551, end: 484661 }] },
      { name: "Shajapur", pincodes: [{ start: 465001, end: 465449 }] },
      { name: "Sheopur", pincodes: [{ start: 476337, end: 476444 }] },
      { name: "Shivpuri", pincodes: [{ start: 473551, end: 473780 }] },
      { name: "Sidhi", pincodes: [{ start: 486661, end: 486889 }] },
      { name: "Singrauli", pincodes: [{ start: 486887, end: 486889 }] },
      { name: "Tikamgarh", pincodes: [{ start: 472001, end: 472120 }] },
      { name: "Ujjain", pincodes: [{ start: 456001, end: 456775 }] },
      { name: "Umaria", pincodes: [{ start: 484661, end: 484890 }] },
      { name: "Vidisha", pincodes: [{ start: 464001, end: 464674 }] }
    ]
  },
  "Maharashtra": {
    name: "Maharashtra",
    districts: [
      { name: "Ahmednagar", pincodes: [{ start: 414001, end: 414505 }] },
      { name: "Akola", pincodes: [{ start: 444001, end: 444611 }] },
      { name: "Amravati", pincodes: [{ start: 444601, end: 444912 }] },
      { name: "Aurangabad", pincodes: [{ start: 431001, end: 431210 }] },
      { name: "Beed", pincodes: [{ start: 431801, end: 431810 }] },
      { name: "Bhandara", pincodes: [{ start: 441904, end: 441914 }] },
      { name: "Buldhana", pincodes: [{ start: 443001, end: 443404 }] },
      { name: "Chandrapur", pincodes: [{ start: 442401, end: 442908 }] },
      { name: "Dhule", pincodes: [{ start: 424001, end: 424308 }] },
      { name: "Gadchiroli", pincodes: [{ start: 442605, end: 442908 }] },
      { name: "Gondia", pincodes: [{ start: 441601, end: 441914 }] },
      { name: "Hingoli", pincodes: [{ start: 431513, end: 431705 }] },
      { name: "Jalgaon", pincodes: [{ start: 425001, end: 425504 }] },
      { name: "Jalna", pincodes: [{ start: 431203, end: 431220 }] },
      { name: "Kolhapur", pincodes: [{ start: 416001, end: 416220 }] },
      { name: "Latur", pincodes: [{ start: 413512, end: 413531 }] },
      { name: "Mumbai City", pincodes: [{ start: 400001, end: 400107 }] },
      { name: "Mumbai Suburban", pincodes: [{ start: 400050, end: 400705 }] },
      { name: "Nagpur", pincodes: [{ start: 440001, end: 441204 }] },
      { name: "Nanded", pincodes: [{ start: 431601, end: 431810 }] },
      { name: "Nandurbar", pincodes: [{ start: 425412, end: 425504 }] },
      { name: "Nashik", pincodes: [{ start: 422001, end: 422403 }] },
      { name: "Osmanabad", pincodes: [{ start: 413501, end: 413531 }] },
      { name: "Palghar", pincodes: [{ start: 401101, end: 401506 }] },
      { name: "Parbhani", pincodes: [{ start: 431401, end: 431431 }] },
      { name: "Pune", pincodes: [{ start: 411001, end: 413802 }] },
      { name: "Raigad", pincodes: [{ start: 402101, end: 402309 }] },
      { name: "Ratnagiri", pincodes: [{ start: 415612, end: 415805 }] },
      { name: "Sangli", pincodes: [{ start: 416416, end: 416436 }] },
      { name: "Satara", pincodes: [{ start: 415001, end: 415539 }] },
      { name: "Sindhudurg", pincodes: [{ start: 416601, end: 416812 }] },
      { name: "Solapur", pincodes: [{ start: 413001, end: 413409 }] },
      { name: "Thane", pincodes: [{ start: 400601, end: 421605 }] },
      { name: "Wardha", pincodes: [{ start: 442001, end: 442406 }] },
      { name: "Washim", pincodes: [{ start: 444505, end: 444506 }] },
      { name: "Yavatmal", pincodes: [{ start: 445001, end: 445402 }] }
    ]
  },
  "Manipur": {
    name: "Manipur",
    districts: [
      { name: "Bishnupur", pincodes: [{ start: 795126, end: 795135 }] },
      { name: "Chandel", pincodes: [{ start: 795127, end: 795138 }] },
      { name: "Churachandpur", pincodes: [{ start: 795128, end: 795140 }] },
      { name: "Imphal East", pincodes: [{ start: 795001, end: 795149 }] },
      { name: "Imphal West", pincodes: [{ start: 795001, end: 795010 }] },
      { name: "Jiribam", pincodes: [{ start: 795116, end: 795117 }] },
      { name: "Kakching", pincodes: [{ start: 795103, end: 795105 }] },
      { name: "Kamjong", pincodes: [{ start: 795140, end: 795141 }] },
      { name: "Kangpokpi", pincodes: [{ start: 795129, end: 795130 }] },
      { name: "Noney", pincodes: [{ start: 795141, end: 795142 }] },
      { name: "Pherzawl", pincodes: [{ start: 795131, end: 795132 }] },
      { name: "Senapati", pincodes: [{ start: 795106, end: 795115 }] },
      { name: "Tamenglong", pincodes: [{ start: 795141, end: 795143 }] },
      { name: "Tengnoupal", pincodes: [{ start: 795146, end: 795149 }] },
      { name: "Thoubal", pincodes: [{ start: 795138, end: 795139 }] },
      { name: "Ukhrul", pincodes: [{ start: 795142, end: 795149 }] }
    ]
  },
  "Meghalaya": {
    name: "Meghalaya",
    districts: [
      { name: "East Garo Hills", pincodes: [{ start: 794001, end: 794108 }] },
      { name: "East Jaintia Hills", pincodes: [{ start: 793001, end: 793200 }] },
      { name: "East Khasi Hills", pincodes: [{ start: 793001, end: 793200 }] },
      { name: "North Garo Hills", pincodes: [{ start: 794001, end: 794108 }] },
      { name: "Ri Bhoi", pincodes: [{ start: 793103, end: 793122 }] },
      { name: "South Garo Hills", pincodes: [{ start: 794005, end: 794108 }] },
      { name: "South West Garo Hills", pincodes: [{ start: 794101, end: 794108 }] },
      { name: "South West Khasi Hills", pincodes: [{ start: 793119, end: 793200 }] },
      { name: "West Garo Hills", pincodes: [{ start: 794001, end: 794108 }] },
      { name: "West Jaintia Hills", pincodes: [{ start: 793200, end: 793210 }] },
      { name: "West Khasi Hills", pincodes: [{ start: 793118, end: 793200 }] }
    ]
  },
  "Mizoram": {
    name: "Mizoram",
    districts: [
      { name: "Aizawl", pincodes: [{ start: 796001, end: 796014 }] },
      { name: "Champhai", pincodes: [{ start: 796321, end: 796370 }] },
      { name: "Hnahthial", pincodes: [{ start: 796014, end: 796015 }] },
      { name: "Khawzawl", pincodes: [{ start: 796310, end: 796320 }] },
      { name: "Kolasib", pincodes: [{ start: 796081, end: 796088 }] },
      { name: "Lawngtlai", pincodes: [{ start: 796891, end: 796901 }] },
      { name: "Lunglei", pincodes: [{ start: 796701, end: 796770 }] },
      { name: "Mamit", pincodes: [{ start: 796441, end: 796450 }] },
      { name: "Saiha", pincodes: [{ start: 796901, end: 796930 }] },
      { name: "Saitual", pincodes: [{ start: 796261, end: 796270 }] },
      { name: "Serchhip", pincodes: [{ start: 796181, end: 796190 }] }
    ]
  },
  "Nagaland": {
    name: "Nagaland",
    districts: [
      { name: "Dimapur", pincodes: [{ start: 797112, end: 797117 }] },
      { name: "Kiphire", pincodes: [{ start: 798001, end: 798612 }] },
      { name: "Kohima", pincodes: [{ start: 797001, end: 797004 }] },
      { name: "Longleng", pincodes: [{ start: 798621, end: 798627 }] },
      { name: "Mokokchung", pincodes: [{ start: 798601, end: 798627 }] },
      { name: "Mon", pincodes: [{ start: 798621, end: 798627 }] },
      { name: "Noklak", pincodes: [{ start: 798625, end: 798627 }] },
      { name: "Peren", pincodes: [{ start: 797131, end: 797136 }] },
      { name: "Phek", pincodes: [{ start: 797107, end: 797108 }] },
      { name: "Tuensang", pincodes: [{ start: 798612, end: 798627 }] },
      { name: "Wokha", pincodes: [{ start: 797111, end: 797117 }] },
      { name: "Zunheboto", pincodes: [{ start: 798620, end: 798627 }] }
    ]
  },
  "Odisha": {
    name: "Odisha",
    districts: [
      { name: "Angul", pincodes: [{ start: 759122, end: 759149 }] },
      { name: "Balangir", pincodes: [{ start: 767001, end: 767070 }] },
      { name: "Balasore", pincodes: [{ start: 756001, end: 756165 }] },
      { name: "Bargarh", pincodes: [{ start: 768001, end: 768108 }] },
      { name: "Bhadrak", pincodes: [{ start: 756100, end: 756165 }] },
      { name: "Boudh", pincodes: [{ start: 762014, end: 762030 }] },
      { name: "Cuttack", pincodes: [{ start: 753001, end: 754293 }] },
      { name: "Deogarh", pincodes: [{ start: 768108, end: 768110 }] },
      { name: "Dhenkanal", pincodes: [{ start: 759001, end: 759149 }] },
      { name: "Gajapati", pincodes: [{ start: 761001, end: 761214 }] },
      { name: "Ganjam", pincodes: [{ start: 760001, end: 761214 }] },
      { name: "Jagatsinghpur", pincodes: [{ start: 754001, end: 754293 }] },
      { name: "Jajpur", pincodes: [{ start: 754100, end: 755019 }] },
      { name: "Jharsuguda", pincodes: [{ start: 768201, end: 768234 }] },
      { name: "Kalahandi", pincodes: [{ start: 766001, end: 766118 }] },
      { name: "Kandhamal", pincodes: [{ start: 762001, end: 762110 }] },
      { name: "Kendrapara", pincodes: [{ start: 754200, end: 754293 }] },
      { name: "Keonjhar", pincodes: [{ start: 758001, end: 758087 }] },
      { name: "Khordha", pincodes: [{ start: 751001, end: 752057 }] },
      { name: "Koraput", pincodes: [{ start: 763001, end: 764074 }] },
      { name: "Malkangiri", pincodes: [{ start: 764001, end: 764074 }] },
      { name: "Mayurbhanj", pincodes: [{ start: 757001, end: 757110 }] },
      { name: "Nabarangpur", pincodes: [{ start: 764059, end: 764074 }] },
      { name: "Nayagarh", pincodes: [{ start: 752050, end: 752057 }] },
      { name: "Nuapada", pincodes: [{ start: 766105, end: 766118 }] },
      { name: "Puri", pincodes: [{ start: 752001, end: 752111 }] },
      { name: "Rayagada", pincodes: [{ start: 765001, end: 765028 }] },
      { name: "Sambalpur", pincodes: [{ start: 768001, end: 768110 }] },
      { name: "Subarnapur", pincodes: [{ start: 767035, end: 767070 }] },
      { name: "Sundargarh", pincodes: [{ start: 769001, end: 770076 }] }
    ]
  },
  "Punjab": {
    name: "Punjab",
    districts: [
      { name: "Amritsar", pincodes: [{ start: 143001, end: 143507 }] },
      { name: "Barnala", pincodes: [{ start: 148101, end: 148108 }] },
      { name: "Bathinda", pincodes: [{ start: 151001, end: 151211 }] },
      { name: "Faridkot", pincodes: [{ start: 151203, end: 151211 }] },
      { name: "Fatehgarh Sahib", pincodes: [{ start: 140401, end: 140417 }] },
      { name: "Firozpur", pincodes: [{ start: 152001, end: 152024 }] },
      { name: "Fazilka", pincodes: [{ start: 152123, end: 152128 }] },
      { name: "Gurdaspur", pincodes: [{ start: 143401, end: 143531 }] },
      { name: "Hoshiarpur", pincodes: [{ start: 144001, end: 144221 }] },
      { name: "Jalandhar", pincodes: [{ start: 144001, end: 144901 }] },
      { name: "Kapurthala", pincodes: [{ start: 144601, end: 144701 }] },
      { name: "Ludhiana", pincodes: [{ start: 141001, end: 142052 }] },
      { name: "Malerkotla", pincodes: [{ start: 148023, end: 148026 }] },
      { name: "Mansa", pincodes: [{ start: 151505, end: 151509 }] },
      { name: "Moga", pincodes: [{ start: 142001, end: 142052 }] },
      { name: "Pathankot", pincodes: [{ start: 145001, end: 145029 }] },
      { name: "Patiala", pincodes: [{ start: 147001, end: 147203 }] },
      { name: "Rupnagar", pincodes: [{ start: 140001, end: 140417 }] },
      { name: "Sahibzada Ajit Singh Nagar", pincodes: [{ start: 140301, end: 140308 }] },
      { name: "Sangrur", pincodes: [{ start: 148001, end: 148108 }] },
      { name: "Shahid Bhagat Singh Nagar", pincodes: [{ start: 144401, end: 144530 }] },
      { name: "Sri Muktsar Sahib", pincodes: [{ start: 152026, end: 152037 }] },
      { name: "Tarn Taran", pincodes: [{ start: 143401, end: 143419 }] }
    ]
  },
  "Rajasthan": {
    name: "Rajasthan",
    districts: [
      { name: "Ajmer", pincodes: [{ start: 305001, end: 305206 }] },
      { name: "Alwar", pincodes: [{ start: 301001, end: 301427 }] },
      { name: "Banswara", pincodes: [{ start: 327001, end: 327604 }] },
      { name: "Baran", pincodes: [{ start: 325001, end: 325221 }] },
      { name: "Barmer", pincodes: [{ start: 344001, end: 344751 }] },
      { name: "Bharatpur", pincodes: [{ start: 321001, end: 321408 }] },
      { name: "Bhilwara", pincodes: [{ start: 311001, end: 311408 }] },
      { name: "Bikaner", pincodes: [{ start: 334001, end: 334803 }] },
      { name: "Bundi", pincodes: [{ start: 323001, end: 323616 }] },
      { name: "Chittorgarh", pincodes: [{ start: 312001, end: 312612 }] },
      { name: "Churu", pincodes: [{ start: 331001, end: 331507 }] },
      { name: "Dausa", pincodes: [{ start: 303001, end: 303508 }] },
      { name: "Dholpur", pincodes: [{ start: 328001, end: 328031 }] },
      { name: "Dungarpur", pincodes: [{ start: 314001, end: 314430 }] },
      { name: "Hanumangarh", pincodes: [{ start: 335001, end: 335804 }] },
      { name: "Jaipur", pincodes: [{ start: 302001, end: 303908 }] },
      { name: "Jaisalmer", pincodes: [{ start: 345001, end: 345024 }] },
      { name: "Jalore", pincodes: [{ start: 343001, end: 343751 }] },
      { name: "Jhalawar", pincodes: [{ start: 326001, end: 326515 }] },
      { name: "Jhunjhunu", pincodes: [{ start: 333001, end: 333515 }] },
      { name: "Jodhpur", pincodes: [{ start: 342001, end: 342915 }] },
      { name: "Karauli", pincodes: [{ start: 322240, end: 322255 }] },
      { name: "Kota", pincodes: [{ start: 324001, end: 325221 }] },
      { name: "Nagaur", pincodes: [{ start: 341001, end: 341515 }] },
      { name: "Pali", pincodes: [{ start: 306401, end: 307804 }] },
      { name: "Pratapgarh", pincodes: [{ start: 312605, end: 313213 }] },
      { name: "Rajsamand", pincodes: [{ start: 313001, end: 313334 }] },
      { name: "Sawai Madhopur", pincodes: [{ start: 322001, end: 322255 }] },
      { name: "Sikar", pincodes: [{ start: 332001, end: 332715 }] },
      { name: "Sirohi", pincodes: [{ start: 307001, end: 307804 }] },
      { name: "Sri Ganganagar", pincodes: [{ start: 335001, end: 335073 }] },
      { name: "Tonk", pincodes: [{ start: 304001, end: 304505 }] },
      { name: "Udaipur", pincodes: [{ start: 313001, end: 313905 }] }
    ]
  },
  "Sikkim": {
    name: "Sikkim",
    districts: [
      { name: "East Sikkim", pincodes: [{ start: 737101, end: 737139 }] },
      { name: "North Sikkim", pincodes: [{ start: 737116, end: 737139 }] },
      { name: "South Sikkim", pincodes: [{ start: 737126, end: 737139 }] },
      { name: "West Sikkim", pincodes: [{ start: 737113, end: 737139 }] }
    ]
  },
  "Tamil Nadu": {
    name: "Tamil Nadu",
    districts: [
      { name: "Ariyalur", pincodes: [{ start: 621001, end: 621716 }] },
      { name: "Chengalpattu", pincodes: [{ start: 603001, end: 603204 }] },
      { name: "Chennai", pincodes: [{ start: 600001, end: 600141 }] },
      { name: "Coimbatore", pincodes: [{ start: 641001, end: 641669 }] },
      { name: "Cuddalore", pincodes: [{ start: 607001, end: 607805 }] },
      { name: "Dharmapuri", pincodes: [{ start: 636701, end: 636816 }] },
      { name: "Dindigul", pincodes: [{ start: 624001, end: 624802 }] },
      { name: "Erode", pincodes: [{ start: 638001, end: 638673 }] },
      { name: "Kallakurichi", pincodes: [{ start: 606201, end: 606213 }] },
      { name: "Kancheepuram", pincodes: [{ start: 631001, end: 631605 }] },
      { name: "Karur", pincodes: [{ start: 639001, end: 639206 }] },
      { name: "Krishnagiri", pincodes: [{ start: 635001, end: 635207 }] },
      { name: "Madurai", pincodes: [{ start: 625001, end: 625706 }] },
      { name: "Mayiladuthurai", pincodes: [{ start: 609001, end: 609805 }] },
      { name: "Nagapattinam", pincodes: [{ start: 611001, end: 611112 }] },
      { name: "Kanyakumari", pincodes: [{ start: 629001, end: 629807 }] },
      { name: "Namakkal", pincodes: [{ start: 637001, end: 637411 }] },
      { name: "Perambalur", pincodes: [{ start: 621212, end: 621716 }] },
      { name: "Pudukottai", pincodes: [{ start: 622001, end: 622507 }] },
      { name: "Ramanathapuram", pincodes: [{ start: 623001, end: 623711 }] },
      { name: "Ranipet", pincodes: [{ start: 632401, end: 632519 }] },
      { name: "Salem", pincodes: [{ start: 636001, end: 637504 }] },
      { name: "Sivaganga", pincodes: [{ start: 630001, end: 630612 }] },
      { name: "Tenkasi", pincodes: [{ start: 627801, end: 627954 }] },
      { name: "Thanjavur", pincodes: [{ start: 613001, end: 614804 }] },
      { name: "Theni", pincodes: [{ start: 625531, end: 625706 }] },
      { name: "Thiruvallur", pincodes: [{ start: 602001, end: 602204 }] },
      { name: "Thiruvarur", pincodes: [{ start: 610001, end: 610107 }] },
      { name: "Thoothukudi", pincodes: [{ start: 628001, end: 628954 }] },
      { name: "Tiruchirappalli", pincodes: [{ start: 620001, end: 621316 }] },
      { name: "Tirunelveli", pincodes: [{ start: 627001, end: 628908 }] },
      { name: "Tirupathur", pincodes: [{ start: 635601, end: 635705 }] },
      { name: "Tiruppur", pincodes: [{ start: 641601, end: 641669 }] },
      { name: "Tiruvannamalai", pincodes: [{ start: 606601, end: 606807 }] },
      { name: "The Nilgirisss", pincodes: [{ start: 643001, end: 643253 }] },
      { name: "Vellore", pincodes: [{ start: 632001, end: 635871 }] },
      { name: "Viluppuram", pincodes: [{ start: 604001, end: 605756 }] },
      { name: "Virudhunagar", pincodes: [{ start: 626001, end: 626203 }] }
    ]
  },
  "Telangana": {
    name: "Telangana",
    districts: [
      { name: "Adilabad", pincodes: [{ start: 504001, end: 504297 }] },
      { name: "Bhadradri Kothagudem", pincodes: [{ start: 507001, end: 507210 }] },
      { name: "Hanamkonda", pincodes: [{ start: 506001, end: 506172 }] },
      { name: "Hyderabad", pincodes: [{ start: 500001, end: 500681 }] },
      { name: "Jagtial", pincodes: [{ start: 505327, end: 505529 }] },
      { name: "Jangaon", pincodes: [{ start: 506167, end: 506172 }] },
      { name: "Jayashankar Bhupalapally", pincodes: [{ start: 506343, end: 506349 }] },
      { name: "Jogulamba Gadwal", pincodes: [{ start: 509125, end: 509215 }] },
      { name: "Kamareddy", pincodes: [{ start: 503111, end: 503230 }] },
      { name: "Karimnagar", pincodes: [{ start: 505001, end: 505529 }] },
      { name: "Khammam", pincodes: [{ start: 507001, end: 507210 }] },
      { name: "Kumuram Bheem Asifabad", pincodes: [{ start: 504297, end: 504309 }] },
      { name: "Mahabubabad", pincodes: [{ start: 506172, end: 506349 }] },
      { name: "Mahabubnagar", pincodes: [{ start: 509001, end: 509349 }] },
      { name: "Mancherial", pincodes: [{ start: 504208, end: 504297 }] },
      { name: "Medak", pincodes: [{ start: 502001, end: 502336 }] },
      { name: "Medchal-Malkajgiri", pincodes: [{ start: 501401, end: 502001 }] },
      { name: "Mulugu", pincodes: [{ start: 506172, end: 506349 }] },
      { name: "Nagarkurnool", pincodes: [{ start: 509209, end: 509349 }] },
      { name: "Nalgonda", pincodes: [{ start: 508001, end: 508280 }] },
      { name: "Narayanpet", pincodes: [{ start: 509210, end: 509215 }] },
      { name: "Nirmal", pincodes: [{ start: 504106, end: 504297 }] },
      { name: "Nizamabad", pincodes: [{ start: 503001, end: 503230 }] },
      { name: "Peddapalli", pincodes: [{ start: 505172, end: 505529 }] },
      { name: "Rajanna Sircilla", pincodes: [{ start: 505301, end: 505529 }] },
      { name: "Ranga Reddy", pincodes: [{ start: 501501, end: 502001 }] },
      { name: "Sangareddy", pincodes: [{ start: 502279, end: 502336 }] },
      { name: "Siddipet", pincodes: [{ start: 502103, end: 502336 }] },
      { name: "Suryapet", pincodes: [{ start: 508213, end: 508280 }] },
      { name: "Vikarabad", pincodes: [{ start: 501101, end: 501250 }] },
      { name: "Wanaparthy", pincodes: [{ start: 509103, end: 509215 }] },
      { name: "Warangal Rural", pincodes: [{ start: 506111, end: 506349 }] },
      { name: "Yadadri Bhuvanagiri", pincodes: [{ start: 508126, end: 508280 }] }
    ]
  },
  "Tripura": {
    name: "Tripura",
    districts: [
      { name: "Dhalai", pincodes: [{ start: 799001, end: 799290 }] },
      { name: "Gomati", pincodes: [{ start: 799045, end: 799290 }] },
      { name: "Khowai", pincodes: [{ start: 799201, end: 799290 }] },
      { name: "North Tripura", pincodes: [{ start: 799001, end: 799290 }] },
      { name: "Sepahijala", pincodes: [{ start: 799145, end: 799290 }] },
      { name: "South Tripura", pincodes: [{ start: 799100, end: 799290 }] },
      { name: "Unakoti", pincodes: [{ start: 799270, end: 799290 }] },
      { name: "West Tripura", pincodes: [{ start: 799001, end: 799290 }] }
    ]
  },
  "Uttar Pradesh": {
    name: "Uttar Pradesh",
    districts: [
      { name: "Agra", pincodes: [{ start: 282001, end: 283206 }] },
      { name: "Aligarh", pincodes: [{ start: 202001, end: 204216 }] },
      { name: "Ambedkar Nagar", pincodes: [{ start: 224001, end: 224238 }] },
      { name: "Amethi", pincodes: [{ start: 227405, end: 227413 }] },
      { name: "Amroha", pincodes: [{ start: 244221, end: 244255 }] },
      { name: "Auraiya", pincodes: [{ start: 206241, end: 206249 }] },
      { name: "Azamgarh", pincodes: [{ start: 276001, end: 276404 }] },
      { name: "Baghpat", pincodes: [{ start: 250601, end: 250622 }] },
      { name: "Bahraich", pincodes: [{ start: 271801, end: 271881 }] },
      { name: "Ballia", pincodes: [{ start: 277001, end: 277502 }] },
      { name: "Balrampur", pincodes: [{ start: 271201, end: 271604 }] },
      { name: "Banda", pincodes: [{ start: 210001, end: 210208 }] },
      { name: "Barabanki", pincodes: [{ start: 225001, end: 225412 }] },
      { name: "Bareilly", pincodes: [{ start: 243001, end: 243633 }]},
      { name: "Basti", pincodes: [{ start: 272001, end: 272155 }] },
      { name: "Bhadohi", pincodes: [{ start: 221401, end: 221715 }] },
      { name: "Bijnor", pincodes: [{ start: 246701, end: 246763 }] },
      { name: "Budaun", pincodes: [{ start: 243601, end: 243751 }] },
      { name: "Bulandshahr", pincodes: [{ start: 203001, end: 203394 }] },
      { name: "Chandauli", pincodes: [{ start: 232101, end: 232331 }] },
      { name: "Chitrakoot", pincodes: [{ start: 210201, end: 210208 }] },
      { name: "Deoria", pincodes: [{ start: 274001, end: 274709 }] },
      { name: "Etah", pincodes: [{ start: 207001, end: 207402 }] },
      { name: "Etawah", pincodes: [{ start: 206001, end: 206249 }] },
      { name: "Ayodhya", pincodes: [{ start: 224001, end: 224238 }] },
      { name: "Farrukhabad", pincodes: [{ start: 209601, end: 209625 }] },
      { name: "Fatehpur", pincodes: [{ start: 212601, end: 212657 }] },
      { name: "Firozabad", pincodes: [{ start: 283203, end: 283206 }] },
      { name: "Gautam Buddha Nagar", pincodes: [{ start: 201301, end: 201318 }] },
      { name: "Ghaziabad", pincodes: [{ start: 201001, end: 201318 }] },
      { name: "Ghazipur", pincodes: [{ start: 233001, end: 233310 }] },
      { name: "Gonda", pincodes: [{ start: 271001, end: 271604 }] },
      { name: "Gorakhpur", pincodes: [{ start: 273001, end: 273408 }] },
      { name: "Hamirpur", pincodes: [{ start: 210301, end: 210431 }] },
      { name: "Hapur", pincodes: [{ start: 245101, end: 245304 }] },
      { name: "Hardoi", pincodes: [{ start: 241001, end: 241406 }] },
      { name: "Hathras", pincodes: [{ start: 204101, end: 204216 }] },
      { name: "Jalaun", pincodes: [{ start: 285001, end: 285225 }] },
      { name: "Jaunpur", pincodes: [{ start: 222001, end: 222302 }] },
      { name: "Jhansi", pincodes: [{ start: 284001, end: 284419 }] },
      { name: "Kannauj", pincodes: [{ start: 209701, end: 209751 }] },
      { name: "Kanpur Dehat", pincodes: [{ start: 209301, end: 209859 }] },
      { name: "Kanpur Nagar", pincodes: [{ start: 208001, end: 209859 }] },
      { name: "Kasganj", pincodes: [{ start: 207123, end: 207248 }] },
      { name: "Kaushambi", pincodes: [{ start: 212201, end: 212657 }] },
      { name: "Kushinagar", pincodes: [{ start: 274401, end: 274709 }] },
      { name: "Lakhimpur Kheri", pincodes: [{ start: 262701, end: 262906 }] },
      { name: "Lalitpur", pincodes: [{ start: 284401, end: 284419 }] },
      { name: "Lucknow", pincodes: [{ start: 226001, end: 227413 }] },
      { name: "Maharajganj", pincodes: [{ start: 273303, end: 273408 }] },
      { name: "Mahoba", pincodes: [{ start: 210427, end: 210431 }] },
      { name: "Mainpuri", pincodes: [{ start: 205001, end: 205262 }] },
      { name: "Mathura", pincodes: [{ start: 281001, end: 281403 }] },
      { name: "Mau", pincodes: [{ start: 275101, end: 276404 }] },
      { name: "Meerut", pincodes: [{ start: 250001, end: 250622 }] },
      { name: "Mirzapur", pincodes: [{ start: 231001, end: 231502 }] },
      { name: "Moradabad", pincodes: [{ start: 244001, end: 244255 }] },
      { name: "Muzaffarnagar", pincodes: [{ start: 251001, end: 251322 }] },
      { name: "Pilibhit", pincodes: [{ start: 262001, end: 262906 }] },
      { name: "Pratapgarh", pincodes: [{ start: 230001, end: 230204 }] },
      { name: "Prayagraj", pincodes: [{ start: 211001, end: 212657 }] },
      { name: "Rae Bareli", pincodes: [{ start: 229001, end: 230204 }] },
      { name: "Rampur", pincodes: [{ start: 244901, end: 245304 }] },
      { name: "Saharanpur", pincodes: [{ start: 247001, end: 247778 }] },
      { name: "Sambhal", pincodes: [{ start: 244302, end: 244303 }] },
      { name: "Sant Kabir Nagar", pincodes: [{ start: 272175, end: 273155 }] },
      { name: "Shahjahanpur", pincodes: [{ start: 242001, end: 242406 }] },
      { name: "Shamli", pincodes: [{ start: 247776, end: 247778 }] },
      { name: "Shravasti", pincodes: [{ start: 271831, end: 271881 }] },
      { name: "Siddharthnagar", pincodes: [{ start: 272207, end: 273155 }] },
      { name: "Sitapur", pincodes: [{ start: 261001, end: 261505 }] },
      { name: "Sonbhadra", pincodes: [{ start: 231217, end: 231502 }] },
      { name: "Sultanpur", pincodes: [{ start: 228001, end: 228145 }] },
      { name: "Unnao", pincodes: [{ start: 209801, end: 209859 }] },
      { name: "Varanasi", pincodes: [{ start: 221001, end: 221715 }] }
    ]
  },
  "Uttarakhand": {
    name: "Uttarakhand",
    districts: [
      { name: "Almora", pincodes: [{ start: 263601, end: 263678 }] },
      { name: "Bageshwar", pincodes: [{ start: 263619, end: 263642 }] },
      { name: "Chamoli", pincodes: [{ start: 246401, end: 246492 }] },
      { name: "Champawat", pincodes: [{ start: 262523, end: 262555 }] },
      { name: "Dehradun", pincodes: [{ start: 248001, end: 248197 }] },
      { name: "Haridwar", pincodes: [{ start: 249401, end: 249408 }] },
      { name: "Nainital", pincodes: [{ start: 263001, end: 264139 }] },
      { name: "Pauri Garhwal", pincodes: [{ start: 246001, end: 246492 }] },
      { name: "Pithoragarh", pincodes: [{ start: 262501, end: 262555 }] },
      { name: "Rudraprayag", pincodes: [{ start: 246421, end: 246492 }] },
      { name: "Tehri Garhwal", pincodes: [{ start: 249001, end: 249196 }] },
      { name: "Udham Singh Nagar", pincodes: [{ start: 263153, end: 264139 }] },
      { name: "Uttarkashi", pincodes: [{ start: 249141, end: 249196 }] }
    ]
  },
  "West Bengal": {
    name: "West Bengal",
    districts: [
      { name: "Alipurduar", pincodes: [{ start: 736121, end: 736207 }] },
      { name: "Bankura", pincodes: [{ start: 722101, end: 723156 }] },
      { name: "Birbhum", pincodes: [{ start: 731101, end: 731252 }] },
      { name: "Cooch Behar", pincodes: [{ start: 736101, end: 736207 }] },
      { name: "Darjeeling", pincodes: [{ start: 734101, end: 734315 }] },
      { name: "Hooghly", pincodes: [{ start: 712101, end: 713424 }] },
      { name: "Howrah", pincodes: [{ start: 711101, end: 711424 }] },
      { name: "Jalpaiguri", pincodes: [{ start: 735101, end: 735232 }] },
      { name: "Jhargram", pincodes: [{ start: 721101, end: 721513 }] },
      { name: "Kalimpong", pincodes: [{ start: 734301, end: 734315 }] },
      { name: "Kolkata", pincodes: [{ start: 700001, end: 700156 }] },
      { name: "Malda", pincodes: [{ start: 732101, end: 732142 }] },
      { name: "Murshidabad", pincodes: [{ start: 742101, end: 742305 }] },
      { name: "Nadia", pincodes: [{ start: 741101, end: 741502 }] },
      { name: "North 24 Parganas", pincodes: [{ start: 743101, end: 743503 }] },
      { name: "Paschim Bardhaman", pincodes: [{ start: 713101, end: 714424 }] },
      { name: "Paschim Medinipur", pincodes: [{ start: 721201, end: 721513 }] },
      { name: "Purba Bardhaman", pincodes: [{ start: 713201, end: 714322 }] },
      { name: "Purba Medinipur", pincodes: [{ start: 721301, end: 721659 }] },
      { name: "Purulia", pincodes: [{ start: 723101, end: 723215 }] },
      { name: "South 24 Parganas", pincodes: [{ start: 743201, end: 743711 }] },
      { name: "Uttar Dinajpur", pincodes: [{ start: 733101, end: 733207 }] },
      { name: "Dakshin Dinajpur", pincodes: [{ start: 733201, end: 733207 }] }
    ]
  },

  // UNION TERRITORIES
  "Andaman and Nicobar Islands": {
    name: "Andaman and Nicobar Islands",
    districts: [
      { name: "Nicobar", pincodes: [{ start: 744301, end: 744304 }] },
      { name: "North and Middle Andaman", pincodes: [{ start: 744201, end: 744210 }] },
      { name: "South Andaman", pincodes: [{ start: 744101, end: 744107 }] }
    ]
  },
  "Chandigarh": {
    name: "Chandigarh",
    districts: [
      { name: "Chandigarh", pincodes: [{ start: 160001, end: 160036 }] }
    ]
  },
  "Dadra and Nagar Haveli and Daman and Diu": {
    name: "Dadra and Nagar Haveli and Daman and Diu",
    districts: [
      { name: "Dadra and Nagar Haveli", pincodes: [{ start: 396230, end: 396240 }] },
      { name: "Daman", pincodes: [{ start: 396210, end: 396220 }] },
      { name: "Diu", pincodes: [{ start: 362520, end: 362576 }] }
    ]
  },
  "Delhi": {
    name: "Delhi",
    districts: [
      { name: "New Delhi", pincodes: [{ start: 110001, end: 110024 }] },
      { name: "Central Delhi", pincodes: [{ start: 110001, end: 110024 }] },
      { name: "North Delhi", pincodes: [{ start: 110001, end: 110024 }] },
      { name: "South Delhi", pincodes: [{ start: 110001, end: 110024 }] },
      { name: "East Delhi", pincodes: [{ start: 110001, end: 110024 }] },
      { name: "West Delhi", pincodes: [{ start: 110001, end: 110024 }] },
      { name: "North East Delhi", pincodes: [{ start: 110001, end: 110024 }] },
      { name: "North West Delhi", pincodes: [{ start: 110001, end: 110024 }] },
      { name: "Shahdara", pincodes: [{ start: 110001, end: 110024 }] },
      { name: "South East Delhi", pincodes: [{ start: 110001, end: 110024 }] },
      { name: "South West Delhi", pincodes: [{ start: 110001, end: 110024 }] }
    ]
  },
  "Jammu and Kashmir": {
    name: "Jammu and Kashmir",
    districts: [
      { name: "Anantnag", pincodes: [{ start: 192101, end: 192241 }] },
      { name: "Bandipora", pincodes: [{ start: 193502, end: 193504 }] },
      { name: "Baramulla", pincodes: [{ start: 193101, end: 193506 }] },
      { name: "Budgam", pincodes: [{ start: 191111, end: 191201 }] },
      { name: "Doda", pincodes: [{ start: 182202, end: 182224 }] },
      { name: "Ganderbal", pincodes: [{ start: 191201, end: 191203 }] },
      { name: "Jammu", pincodes: [{ start: 180001, end: 181206 }] },
      { name: "Kathua", pincodes: [{ start: 184101, end: 184150 }] },
      { name: "Kishtwar", pincodes: [{ start: 182204, end: 182224 }] },
      { name: "Kulgam", pincodes: [{ start: 192231, end: 192241 }] },
      { name: "Kupwara", pincodes: [{ start: 193222, end: 193224 }] },
      { name: "Poonch", pincodes: [{ start: 185101, end: 185154 }] },
      { name: "Pulwama", pincodes: [{ start: 192301, end: 192307 }] },
      { name: "Rajouri", pincodes: [{ start: 185131, end: 185154 }] },
      { name: "Ramban", pincodes: [{ start: 182143, end: 182150 }] },
      { name: "Reasi", pincodes: [{ start: 182311, end: 182322 }] },
      { name: "Samba", pincodes: [{ start: 184121, end: 184150 }] },
      { name: "Shopian", pincodes: [{ start: 192303, end: 192307 }] },
      { name: "Srinagar", pincodes: [{ start: 190001, end: 191201 }] },
      { name: "Udhampur", pincodes: [{ start: 182101, end: 182127 }] }
    ]
  },
  "Ladakh": {
    name: "Ladakh",
    districts: [
      { name: "Kargil", pincodes: [{ start: 194103, end: 194103 }] },
      { name: "Leh", pincodes: [{ start: 194101, end: 194106 }] }
    ]
  },
  "Lakshadweep": {
    name: "Lakshadweep",
    districts: [
      { name: "Lakshadweep", pincodes: [{ start: 682551, end: 682559 }] }
    ]
  },
  "Puducherry": {
    name: "Puducherry",
    districts: [
      { name: "Puducherry", pincodes: [{ start: 605001, end: 605014 }] },
      { name: "Karaikal", pincodes: [{ start: 609601, end: 609609 }] },
      { name: "Mahe", pincodes: [{ start: 673310, end: 673310 }] },
      { name: "Yanam", pincodes: [{ start: 533464, end: 533464 }] }
    ]
  }
};

// Get all available states
export const COMPREHENSIVE_INDIAN_STATES = Object.keys(COMPREHENSIVE_INDIAN_STATES_DATA);

// Get districts for a specific state
export function getComprehensiveDistrictsForState(state: string): string[] {
  return COMPREHENSIVE_INDIAN_STATES_DATA[state]?.districts.map(d => d.name) || [];
}

// Validate pincode for a specific state and district
export function validateComprehensivePincode(state: string, district: string, pincode: string): AddressValidationResult {
  const errors: string[] = [];
  const suggestions: { pincodes?: string[] } = {};

  if (!state) {
    errors.push('State is required for pincode validation');
    return { isValid: false, errors };
  }

  if (!district) {
    errors.push('District is required for pincode validation');
    return { isValid: false, errors };
  }

  const stateData = COMPREHENSIVE_INDIAN_STATES_DATA[state];
  if (!stateData) {
    errors.push(`Pincode validation not available for ${state}. Please contact support.`);
    return { isValid: false, errors };
  }

  const districtData = stateData.districts.find(d => d.name === district);
  if (!districtData) {
    errors.push(`District "${district}" not found in ${state}`);
    return { isValid: false, errors };
  }

  if (!pincode) {
    return { isValid: true, errors: [] };
  }

  const pincodeNum = parseInt(pincode);
  if (isNaN(pincodeNum) || pincode.length !== 6) {
    errors.push('Pincode must be a 6-digit number');
  } else {
    const isValidPincode = districtData.pincodes.some(range => 
      pincodeNum >= range.start && pincodeNum <= range.end
    );
    if (!isValidPincode) {
      errors.push(`Pincode ${pincode} may not be valid for ${district}, ${state}`);
      suggestions.pincodes = districtData.pincodes.map(range => 
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

// Get pincode range for a specific district
export function getComprehensivePincodeRange(state: string, district: string): string {
  const stateData = COMPREHENSIVE_INDIAN_STATES_DATA[state];
  if (!stateData) {
    return 'Not available';
  }

  const districtData = stateData.districts.find(d => d.name === district);
  if (!districtData) {
    return 'Not available';
  }

  const ranges = districtData.pincodes;
  if (ranges.length === 0) {
    return 'Not available';
  }

  const minStart = Math.min(...ranges.map(r => r.start));
  const maxEnd = Math.max(...ranges.map(r => r.end));
  
  return `${minStart.toString().substring(0, 3)}xxx - ${maxEnd.toString().substring(0, 3)}xxx`;
}

// Search districts by partial name
export function searchDistricts(state: string, query: string): string[] {
  if (!state || !query) return [];
  
  const districts = getComprehensiveDistrictsForState(state);
  return districts.filter(district => 
    district.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 10);
}
