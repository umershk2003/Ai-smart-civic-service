import { LocationData } from '../types';
import { FULL_TEHSILS } from './tehsils_full';

/**
 * Structured Pakistan administrative location system — full national coverage.
 *
 * Hierarchy: Country → Province → Division → District → Tehsil → Municipality → Ward → Area
 *
 * Locations are stored by ID on complaints (province_id, division_id, ...) and resolved
 * to display names through this module. All provinces, divisions and districts of Pakistan
 * are included; tehsil/municipality/ward detail is provided for the major urban centres.
 * The default demo municipality is Karachi (Sindh).
 */

export interface LocationSelection {
  provinceId: string;
  divisionId?: string;
  districtId?: string;
  tehsilId?: string;
  municipalityId?: string;
  wardId?: string;
  area?: string;
}

export const LOCATION_CONFIG = {
  countryCode: 'PK',
  countryName: 'Pakistan',
  timezone: 'Asia/Karachi',
  defaultProvinceId: 'sindh',
  defaultDivisionId: 'karachi-division',
  defaultDistrictId: 'karachi-south',
  defaultTehsilId: 'saddar',
  defaultMunicipalityId: 'karachi-mc',
  defaultWardId: 'karachi-w1',
} as const;

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

export interface Province { id: string; name: string; }
export interface Division { id: string; provinceId: string; name: string; }
export interface District { id: string; divisionId: string; name: string; }
export interface Tehsil { id: string; districtId: string; name: string; }
export interface Municipality { id: string; tehsilId: string; name: string; }
export interface Ward { id: string; municipalityId: string; name: string; }
export interface Area { id: string; wardId: string; name: string; }

export const PROVINCES: Province[] = [
  { id: 'punjab', name: 'Punjab' },
  { id: 'sindh', name: 'Sindh' },
  { id: 'kpk', name: 'Khyber Pakhtunkhwa' },
  { id: 'balochistan', name: 'Balochistan' },
  { id: 'islamabad', name: 'Islamabad Capital Territory' },
  { id: 'gilgit-baltistan', name: 'Gilgit-Baltistan' },
  { id: 'azad-kashmir', name: 'Azad Jammu & Kashmir' },
];

export const DIVISIONS: Division[] = [
  // ---- Punjab (9) ----
  { id: 'bahawalpur-division', provinceId: 'punjab', name: 'Bahawalpur Division' },
  { id: 'dg-khan-division', provinceId: 'punjab', name: 'Dera Ghazi Khan Division' },
  { id: 'faisalabad-division', provinceId: 'punjab', name: 'Faisalabad Division' },
  { id: 'gujranwala-division', provinceId: 'punjab', name: 'Gujranwala Division' },
  { id: 'lahore-division', provinceId: 'punjab', name: 'Lahore Division' },
  { id: 'multan-division', provinceId: 'punjab', name: 'Multan Division' },
  { id: 'rawalpindi-division', provinceId: 'punjab', name: 'Rawalpindi Division' },
  { id: 'sahiwal-division', provinceId: 'punjab', name: 'Sahiwal Division' },
  { id: 'sargodha-division', provinceId: 'punjab', name: 'Sargodha Division' },
  // ---- Sindh (7) ----
  { id: 'karachi-division', provinceId: 'sindh', name: 'Karachi Division' },
  { id: 'hyderabad-division', provinceId: 'sindh', name: 'Hyderabad Division' },
  { id: 'sukkur-division', provinceId: 'sindh', name: 'Sukkur Division' },
  { id: 'larkana-division', provinceId: 'sindh', name: 'Larkana Division' },
  { id: 'mirpur-khas-division', provinceId: 'sindh', name: 'Mirpur Khas Division' },
  { id: 'shaheed-benazirabad-division', provinceId: 'sindh', name: 'Shaheed Benazirabad Division' },
  { id: 'banbhore-division', provinceId: 'sindh', name: 'Banbhore Division' },
  // ---- Khyber Pakhtunkhwa (7) ----
  { id: 'peshawar-division', provinceId: 'kpk', name: 'Peshawar Division' },
  { id: 'mardan-division', provinceId: 'kpk', name: 'Mardan Division' },
  { id: 'malakand-division', provinceId: 'kpk', name: 'Malakand Division' },
  { id: 'hazara-division', provinceId: 'kpk', name: 'Hazara Division' },
  { id: 'kohat-division', provinceId: 'kpk', name: 'Kohat Division' },
  { id: 'bannu-division', provinceId: 'kpk', name: 'Bannu Division' },
  { id: 'd-i-khan-division', provinceId: 'kpk', name: 'Dera Ismail Khan Division' },
  // ---- Balochistan (8) ----
  { id: 'quetta-division', provinceId: 'balochistan', name: 'Quetta Division' },
  { id: 'kalat-division', provinceId: 'balochistan', name: 'Kalat Division' },
  { id: 'makran-division', provinceId: 'balochistan', name: 'Makran Division' },
  { id: 'nasirabad-division', provinceId: 'balochistan', name: 'Nasirabad Division' },
  { id: 'sibi-division', provinceId: 'balochistan', name: 'Sibi Division' },
  { id: 'zhob-division', provinceId: 'balochistan', name: 'Zhob Division' },
  { id: 'rakhshan-division', provinceId: 'balochistan', name: 'Rakhshan Division' },
  { id: 'loralai-division', provinceId: 'balochistan', name: 'Loralai Division' },
  // ---- Islamabad Capital Territory (1) ----
  { id: 'islamabad-division', provinceId: 'islamabad', name: 'Islamabad Division' },
  // ---- Gilgit-Baltistan (3) ----
  { id: 'gilgit-division', provinceId: 'gilgit-baltistan', name: 'Gilgit Division' },
  { id: 'baltistan-division', provinceId: 'gilgit-baltistan', name: 'Baltistan Division' },
  { id: 'diamir-division', provinceId: 'gilgit-baltistan', name: 'Diamer Division' },
  // ---- Azad Jammu & Kashmir (3) ----
  { id: 'mirpur-division', provinceId: 'azad-kashmir', name: 'Mirpur Division' },
  { id: 'muzaffarabad-division', provinceId: 'azad-kashmir', name: 'Muzaffarabad Division' },
  { id: 'poonch-division', provinceId: 'azad-kashmir', name: 'Poonch Division' },
];

export const DISTRICTS: District[] = [
  // ---- Sindh ----
  // Karachi Division
  { id: 'karachi-south', divisionId: 'karachi-division', name: 'Karachi South' },
  { id: 'karachi-east', divisionId: 'karachi-division', name: 'Karachi East' },
  { id: 'karachi-central', divisionId: 'karachi-division', name: 'Karachi Central' },
  { id: 'karachi-west', divisionId: 'karachi-division', name: 'Karachi West' },
  { id: 'korangi', divisionId: 'karachi-division', name: 'Korangi' },
  { id: 'malir', divisionId: 'karachi-division', name: 'Malir' },
  { id: 'keamari', divisionId: 'karachi-division', name: 'Keamari' },
  // Banbhore Division
  { id: 'badin', divisionId: 'banbhore-division', name: 'Badin' },
  { id: 'sujawal', divisionId: 'banbhore-division', name: 'Sujawal' },
  { id: 'thatta', divisionId: 'banbhore-division', name: 'Thatta' },
  // Hyderabad Division
  { id: 'hyderabad', divisionId: 'hyderabad-division', name: 'Hyderabad' },
  { id: 'dadu', divisionId: 'hyderabad-division', name: 'Dadu' },
  { id: 'jamshoro', divisionId: 'hyderabad-division', name: 'Jamshoro' },
  { id: 'matiari', divisionId: 'hyderabad-division', name: 'Matiari' },
  { id: 'tando-allahyar', divisionId: 'hyderabad-division', name: 'Tando Allahyar' },
  { id: 'tando-muhammad-khan', divisionId: 'hyderabad-division', name: 'Tando Muhammad Khan' },
  // Larkana Division
  { id: 'larkana', divisionId: 'larkana-division', name: 'Larkana' },
  { id: 'jacobabad', divisionId: 'larkana-division', name: 'Jacobabad' },
  { id: 'kashmore', divisionId: 'larkana-division', name: 'Kashmore' },
  { id: 'qambar-shahdadkot', divisionId: 'larkana-division', name: 'Qambar Shahdadkot' },
  { id: 'shikarpur', divisionId: 'larkana-division', name: 'Shikarpur' },
  // Mirpur Khas Division
  { id: 'mirpur-khas', divisionId: 'mirpur-khas-division', name: 'Mirpur Khas' },
  { id: 'tharparkar', divisionId: 'mirpur-khas-division', name: 'Tharparkar' },
  { id: 'umerkot', divisionId: 'mirpur-khas-division', name: 'Umerkot' },
  // Shaheed Benazirabad Division
  { id: 'shaheed-benazirabad', divisionId: 'shaheed-benazirabad-division', name: 'Shaheed Benazirabad' },
  { id: 'naushahro-feroze', divisionId: 'shaheed-benazirabad-division', name: 'Naushahro Feroze' },
  { id: 'sanghar', divisionId: 'shaheed-benazirabad-division', name: 'Sanghar' },
  // Sukkur Division
  { id: 'sukkur', divisionId: 'sukkur-division', name: 'Sukkur' },
  { id: 'ghotki', divisionId: 'sukkur-division', name: 'Ghotki' },
  { id: 'khairpur', divisionId: 'sukkur-division', name: 'Khairpur' },
  // ---- Punjab ----
  // Bahawalpur Division
  { id: 'bahawalpur', divisionId: 'bahawalpur-division', name: 'Bahawalpur' },
  { id: 'bahawalnagar', divisionId: 'bahawalpur-division', name: 'Bahawalnagar' },
  { id: 'rahim-yar-khan', divisionId: 'bahawalpur-division', name: 'Rahim Yar Khan' },
  // Dera Ghazi Khan Division
  { id: 'dg-khan', divisionId: 'dg-khan-division', name: 'Dera Ghazi Khan' },
  { id: 'layyah', divisionId: 'dg-khan-division', name: 'Layyah' },
  { id: 'muzaffargarh', divisionId: 'dg-khan-division', name: 'Muzaffargarh' },
  { id: 'rajanpur', divisionId: 'dg-khan-division', name: 'Rajanpur' },
  // Faisalabad Division
  { id: 'faisalabad', divisionId: 'faisalabad-division', name: 'Faisalabad' },
  { id: 'chiniot', divisionId: 'faisalabad-division', name: 'Chiniot' },
  { id: 'jhang', divisionId: 'faisalabad-division', name: 'Jhang' },
  { id: 'toba-tek-singh', divisionId: 'faisalabad-division', name: 'Toba Tek Singh' },
  // Gujranwala Division
  { id: 'gujranwala', divisionId: 'gujranwala-division', name: 'Gujranwala' },
  { id: 'gujrat', divisionId: 'gujranwala-division', name: 'Gujrat' },
  { id: 'hafizabad', divisionId: 'gujranwala-division', name: 'Hafizabad' },
  { id: 'mandi-bahauddin', divisionId: 'gujranwala-division', name: 'Mandi Bahauddin' },
  { id: 'narowal', divisionId: 'gujranwala-division', name: 'Narowal' },
  { id: 'sialkot', divisionId: 'gujranwala-division', name: 'Sialkot' },
  { id: 'wazirabad', divisionId: 'gujranwala-division', name: 'Wazirabad' },
  // Lahore Division
  { id: 'lahore-district', divisionId: 'lahore-division', name: 'Lahore' },
  { id: 'kasur', divisionId: 'lahore-division', name: 'Kasur' },
  { id: 'nankana-sahib', divisionId: 'lahore-division', name: 'Nankana Sahib' },
  { id: 'sheikhupura', divisionId: 'lahore-division', name: 'Sheikhupura' },
  // Multan Division
  { id: 'multan', divisionId: 'multan-division', name: 'Multan' },
  { id: 'khanewal', divisionId: 'multan-division', name: 'Khanewal' },
  { id: 'lodhran', divisionId: 'multan-division', name: 'Lodhran' },
  { id: 'vehari', divisionId: 'multan-division', name: 'Vehari' },
  // Rawalpindi Division
  { id: 'rawalpindi', divisionId: 'rawalpindi-division', name: 'Rawalpindi' },
  { id: 'attock', divisionId: 'rawalpindi-division', name: 'Attock' },
  { id: 'chakwal', divisionId: 'rawalpindi-division', name: 'Chakwal' },
  { id: 'jhelum', divisionId: 'rawalpindi-division', name: 'Jhelum' },
  { id: 'murree', divisionId: 'rawalpindi-division', name: 'Murree' },
  { id: 'talagang', divisionId: 'rawalpindi-division', name: 'Talagang' },
  // Sahiwal Division
  { id: 'sahiwal', divisionId: 'sahiwal-division', name: 'Sahiwal' },
  { id: 'okara', divisionId: 'sahiwal-division', name: 'Okara' },
  { id: 'pakpattan', divisionId: 'sahiwal-division', name: 'Pakpattan' },
  // Sargodha Division
  { id: 'sargodha', divisionId: 'sargodha-division', name: 'Sargodha' },
  { id: 'bhakkar', divisionId: 'sargodha-division', name: 'Bhakkar' },
  { id: 'khushab', divisionId: 'sargodha-division', name: 'Khushab' },
  { id: 'mianwali', divisionId: 'sargodha-division', name: 'Mianwali' },
  // ---- Khyber Pakhtunkhwa ----
  // Peshawar Division
  { id: 'peshawar', divisionId: 'peshawar-division', name: 'Peshawar' },
  { id: 'charsadda', divisionId: 'peshawar-division', name: 'Charsadda' },
  { id: 'khyber', divisionId: 'peshawar-division', name: 'Khyber' },
  { id: 'mohmand', divisionId: 'peshawar-division', name: 'Mohmand' },
  { id: 'nowshera', divisionId: 'peshawar-division', name: 'Nowshera' },
  // Mardan Division
  { id: 'mardan', divisionId: 'mardan-division', name: 'Mardan' },
  { id: 'swabi', divisionId: 'mardan-division', name: 'Swabi' },
  // Malakand Division
  { id: 'malakand', divisionId: 'malakand-division', name: 'Malakand' },
  { id: 'bajaur', divisionId: 'malakand-division', name: 'Bajaur' },
  { id: 'buner', divisionId: 'malakand-division', name: 'Buner' },
  { id: 'lower-chitral', divisionId: 'malakand-division', name: 'Lower Chitral' },
  { id: 'upper-chitral', divisionId: 'malakand-division', name: 'Upper Chitral' },
  { id: 'lower-dir', divisionId: 'malakand-division', name: 'Lower Dir' },
  { id: 'upper-dir', divisionId: 'malakand-division', name: 'Upper Dir' },
  { id: 'shangla', divisionId: 'malakand-division', name: 'Shangla' },
  { id: 'swat', divisionId: 'malakand-division', name: 'Swat' },
  // Hazara Division
  { id: 'abbottabad', divisionId: 'hazara-division', name: 'Abbottabad' },
  { id: 'battagram', divisionId: 'hazara-division', name: 'Battagram' },
  { id: 'haripur', divisionId: 'hazara-division', name: 'Haripur' },
  { id: 'kolai-palas', divisionId: 'hazara-division', name: 'Kolai Palas' },
  { id: 'lower-kohistan', divisionId: 'hazara-division', name: 'Lower Kohistan' },
  { id: 'upper-kohistan', divisionId: 'hazara-division', name: 'Upper Kohistan' },
  { id: 'mansehra', divisionId: 'hazara-division', name: 'Mansehra' },
  { id: 'torghar', divisionId: 'hazara-division', name: 'Torghar' },
  // Kohat Division
  { id: 'kohat', divisionId: 'kohat-division', name: 'Kohat' },
  { id: 'hangu', divisionId: 'kohat-division', name: 'Hangu' },
  { id: 'karak', divisionId: 'kohat-division', name: 'Karak' },
  { id: 'kurram', divisionId: 'kohat-division', name: 'Kurram' },
  { id: 'orakzai', divisionId: 'kohat-division', name: 'Orakzai' },
  // Bannu Division
  { id: 'bannu', divisionId: 'bannu-division', name: 'Bannu' },
  { id: 'lakki-marwat', divisionId: 'bannu-division', name: 'Lakki Marwat' },
  { id: 'north-waziristan', divisionId: 'bannu-division', name: 'North Waziristan' },
  // Dera Ismail Khan Division
  { id: 'd-i-khan', divisionId: 'd-i-khan-division', name: 'Dera Ismail Khan' },
  { id: 'tank', divisionId: 'd-i-khan-division', name: 'Tank' },
  { id: 'upper-south-waziristan', divisionId: 'd-i-khan-division', name: 'Upper South Waziristan' },
  { id: 'lower-south-waziristan', divisionId: 'd-i-khan-division', name: 'Lower South Waziristan' },
  // ---- Balochistan ----
  // Quetta Division
  { id: 'quetta', divisionId: 'quetta-division', name: 'Quetta' },
  { id: 'pishin', divisionId: 'quetta-division', name: 'Pishin' },
  { id: 'killa-abdullah', divisionId: 'quetta-division', name: 'Killa Abdullah' },
  { id: 'chaman', divisionId: 'quetta-division', name: 'Chaman' },
  // Kalat Division
  { id: 'kalat', divisionId: 'kalat-division', name: 'Kalat' },
  { id: 'awaran', divisionId: 'kalat-division', name: 'Awaran' },
  { id: 'khuzdar', divisionId: 'kalat-division', name: 'Khuzdar' },
  { id: 'lasbela', divisionId: 'kalat-division', name: 'Lasbela' },
  { id: 'mastung', divisionId: 'kalat-division', name: 'Mastung' },
  { id: 'surab', divisionId: 'kalat-division', name: 'Surab' },
  // Makran Division
  { id: 'kech', divisionId: 'makran-division', name: 'Kech (Turbat)' },
  { id: 'gwadar', divisionId: 'makran-division', name: 'Gwadar' },
  { id: 'panjgur', divisionId: 'makran-division', name: 'Panjgur' },
  // Nasirabad Division
  { id: 'nasirabad', divisionId: 'nasirabad-division', name: 'Nasirabad' },
  { id: 'dera-bugti', divisionId: 'nasirabad-division', name: 'Dera Bugti' },
  { id: 'jafarabad', divisionId: 'nasirabad-division', name: 'Jafarabad' },
  { id: 'jhal-magsi', divisionId: 'nasirabad-division', name: 'Jhal Magsi' },
  { id: 'kachhi', divisionId: 'nasirabad-division', name: 'Kachhi (Bolan)' },
  { id: 'sohbatpur', divisionId: 'nasirabad-division', name: 'Sohbatpur' },
  { id: 'usta-muhammad', divisionId: 'nasirabad-division', name: 'Usta Muhammad' },
  // Sibi Division
  { id: 'sibi', divisionId: 'sibi-division', name: 'Sibi' },
  { id: 'harnai', divisionId: 'sibi-division', name: 'Harnai' },
  { id: 'kohlu', divisionId: 'sibi-division', name: 'Kohlu' },
  { id: 'lehri', divisionId: 'sibi-division', name: 'Lehri' },
  { id: 'ziarat', divisionId: 'sibi-division', name: 'Ziarat' },
  // Zhob Division
  { id: 'zhob', divisionId: 'zhob-division', name: 'Zhob' },
  { id: 'barkhan', divisionId: 'zhob-division', name: 'Barkhan' },
  { id: 'killa-saifullah', divisionId: 'zhob-division', name: 'Killa Saifullah' },
  { id: 'musakhel', divisionId: 'zhob-division', name: 'Musakhel' },
  { id: 'sherani', divisionId: 'zhob-division', name: 'Sherani' },
  // Rakhshan Division
  { id: 'chagai', divisionId: 'rakhshan-division', name: 'Chagai' },
  { id: 'kharan', divisionId: 'rakhshan-division', name: 'Kharan' },
  { id: 'nushki', divisionId: 'rakhshan-division', name: 'Nushki' },
  { id: 'washuk', divisionId: 'rakhshan-division', name: 'Washuk' },
  // Loralai Division
  { id: 'loralai', divisionId: 'loralai-division', name: 'Loralai' },
  { id: 'duki', divisionId: 'loralai-division', name: 'Duki' },
  // ---- Islamabad Capital Territory ----
  { id: 'islamabad-district', divisionId: 'islamabad-division', name: 'Islamabad' },
  // ---- Gilgit-Baltistan ----
  // Gilgit Division
  { id: 'gilgit', divisionId: 'gilgit-division', name: 'Gilgit' },
  { id: 'ghizer', divisionId: 'gilgit-division', name: 'Ghizer' },
  { id: 'gupis-yasin', divisionId: 'gilgit-division', name: 'Gupis-Yasin' },
  { id: 'hunza', divisionId: 'gilgit-division', name: 'Hunza' },
  { id: 'nagar', divisionId: 'gilgit-division', name: 'Nagar' },
  // Baltistan Division
  { id: 'skardu', divisionId: 'baltistan-division', name: 'Skardu' },
  { id: 'ghanche', divisionId: 'baltistan-division', name: 'Ghanche' },
  { id: 'kharmang', divisionId: 'baltistan-division', name: 'Kharmang' },
  { id: 'shigar', divisionId: 'baltistan-division', name: 'Shigar' },
  // Diamer Division
  { id: 'diamir', divisionId: 'diamir-division', name: 'Diamer' },
  { id: 'astore', divisionId: 'diamir-division', name: 'Astore' },
  // ---- Azad Jammu & Kashmir ----
  // Mirpur Division
  { id: 'mirpur', divisionId: 'mirpur-division', name: 'Mirpur' },
  { id: 'bhimber', divisionId: 'mirpur-division', name: 'Bhimber' },
  { id: 'kotli', divisionId: 'mirpur-division', name: 'Kotli' },
  // Muzaffarabad Division
  { id: 'muzaffarabad', divisionId: 'muzaffarabad-division', name: 'Muzaffarabad' },
  { id: 'hattian', divisionId: 'muzaffarabad-division', name: 'Hattian Bala' },
  { id: 'neelum', divisionId: 'muzaffarabad-division', name: 'Neelum' },
  // Poonch Division
  { id: 'poonch', divisionId: 'poonch-division', name: 'Poonch' },
  { id: 'bagh', divisionId: 'poonch-division', name: 'Bagh' },
  { id: 'haveli', divisionId: 'poonch-division', name: 'Haveli' },
  { id: 'sudhanoti', divisionId: 'poonch-division', name: 'Sudhanoti' },
];

const CURATED_TEHSILS: Tehsil[] = [
  // ---- Karachi ----
  { id: 'saddar', districtId: 'karachi-south', name: 'Saddar' },
  { id: 'clifton', districtId: 'karachi-south', name: 'Clifton' },
  { id: 'lyari', districtId: 'karachi-south', name: 'Lyari' },
  { id: 'jamshed', districtId: 'karachi-south', name: 'Jamshed Town' },
  { id: 'gulshan', districtId: 'karachi-east', name: 'Gulshan-e-Iqbal' },
  { id: 'gulberg', districtId: 'karachi-east', name: 'Gulberg' },
  { id: 'ferozabad', districtId: 'karachi-east', name: 'Ferozabad' },
  { id: 'liaquatabad', districtId: 'karachi-central', name: 'Liaquatabad' },
  { id: 'north-nazimabad', districtId: 'karachi-central', name: 'North Nazimabad' },
  { id: 'nazimabad', districtId: 'karachi-central', name: 'Nazimabad' },
  { id: 'new-karachi', districtId: 'karachi-central', name: 'New Karachi' },
  { id: 'orangi', districtId: 'karachi-west', name: 'Orangi' },
  { id: 'baldia', districtId: 'karachi-west', name: 'Baldia Town' },
  { id: 'site', districtId: 'karachi-west', name: 'SITE' },
  { id: 'manghopir', districtId: 'karachi-west', name: 'Manghopir' },
  { id: 'korangi', districtId: 'korangi', name: 'Korangi' },
  { id: 'landhi', districtId: 'korangi', name: 'Landhi' },
  { id: 'shah-faisal', districtId: 'korangi', name: 'Shah Faisal' },
  { id: 'model-colony', districtId: 'korangi', name: 'Model Colony' },
  { id: 'malir', districtId: 'malir', name: 'Malir' },
  { id: 'bin-qasim', districtId: 'malir', name: 'Bin Qasim' },
  { id: 'gadap', districtId: 'malir', name: 'Gadap' },
  { id: 'keamari', districtId: 'keamari', name: 'Keamari' },
  // ---- Lahore ----
  { id: 'lahore-city', districtId: 'lahore-district', name: 'Lahore City' },
  { id: 'lahore-cantt', districtId: 'lahore-district', name: 'Lahore Cantonment' },
  { id: 'model-town', districtId: 'lahore-district', name: 'Model Town' },
  { id: 'raiwind', districtId: 'lahore-district', name: 'Raiwind' },
  { id: 'shalimar', districtId: 'lahore-district', name: 'Shalimar' },
  { id: 'wagah', districtId: 'lahore-district', name: 'Wagah' },
  // ---- Punjab cities ----
  { id: 'rawalpindi-city', districtId: 'rawalpindi', name: 'Rawalpindi City' },
  { id: 'taxila', districtId: 'rawalpindi', name: 'Taxila' },
  { id: 'murree-tehsil', districtId: 'murree', name: 'Murree' },
  { id: 'faisalabad-city', districtId: 'faisalabad', name: 'Faisalabad City' },
  { id: 'jaranwala', districtId: 'faisalabad', name: 'Jaranwala' },
  { id: 'multan-city', districtId: 'multan', name: 'Multan City' },
  { id: 'gujranwala-city', districtId: 'gujranwala', name: 'Gujranwala City' },
  { id: 'sialkot-city', districtId: 'sialkot', name: 'Sialkot City' },
  { id: 'bahawalpur-city', districtId: 'bahawalpur', name: 'Bahawalpur City' },
  { id: 'sargodha-city', districtId: 'sargodha', name: 'Sargodha City' },
  { id: 'sheikhupura-city', districtId: 'sheikhupura', name: 'Sheikhupura City' },
  { id: 'sahiwal-city', districtId: 'sahiwal', name: 'Sahiwal City' },
  { id: 'jhang-city', districtId: 'jhang', name: 'Jhang City' },
  { id: 'kasur-city', districtId: 'kasur', name: 'Kasur City' },
  { id: 'attock-city', districtId: 'attock', name: 'Attock City' },
  { id: 'jhelum-city', districtId: 'jhelum', name: 'Jhelum City' },
  { id: 'dg-khan-tehsil', districtId: 'dg-khan', name: 'Dera Ghazi Khan City' },
  // ---- Islamabad ----
  { id: 'islamabad-tehsil', districtId: 'islamabad-district', name: 'Islamabad City' },
  // ---- Sindh cities ----
  { id: 'hyderabad-city', districtId: 'hyderabad', name: 'Hyderabad City' },
  { id: 'latifabad', districtId: 'hyderabad', name: 'Latifabad' },
  { id: 'qasimabad', districtId: 'hyderabad', name: 'Qasimabad' },
  { id: 'sukkur-city', districtId: 'sukkur', name: 'Sukkur City' },
  { id: 'larkana-city', districtId: 'larkana', name: 'Larkana City' },
  { id: 'mirpur-khas-city', districtId: 'mirpur-khas', name: 'Mirpur Khas City' },
  { id: 'nawabshah-city', districtId: 'shaheed-benazirabad', name: 'Nawabshah City' },
  // ---- Khyber Pakhtunkhwa cities ----
  { id: 'peshawar-city', districtId: 'peshawar', name: 'Peshawar City' },
  { id: 'mardan-tehsil', districtId: 'mardan', name: 'Mardan City' },
  { id: 'abbottabad-tehsil', districtId: 'abbottabad', name: 'Abbottabad City' },
  { id: 'kohat-tehsil', districtId: 'kohat', name: 'Kohat City' },
  { id: 'mingora', districtId: 'swat', name: 'Mingora' },
  { id: 'd-i-khan-tehsil', districtId: 'd-i-khan', name: 'Dera Ismail Khan City' },
  { id: 'charsadda-tehsil', districtId: 'charsadda', name: 'Charsadda City' },
  { id: 'nowshera-tehsil', districtId: 'nowshera', name: 'Nowshera City' },
  // ---- Balochistan cities ----
  { id: 'quetta-city', districtId: 'quetta', name: 'Quetta City' },
  { id: 'gwadar-tehsil', districtId: 'gwadar', name: 'Gwadar' },
  { id: 'khuzdar-tehsil', districtId: 'khuzdar', name: 'Khuzdar City' },
  { id: 'turbat-tehsil', districtId: 'kech', name: 'Turbat' },
  // ---- Gilgit-Baltistan ----
  { id: 'gilgit-tehsil', districtId: 'gilgit', name: 'Gilgit City' },
  { id: 'skardu-tehsil', districtId: 'skardu', name: 'Skardu City' },
  // ---- Azad Jammu & Kashmir ----
  { id: 'muzaffarabad-tehsil', districtId: 'muzaffarabad', name: 'Muzaffarabad City' },
  { id: 'mirpur-tehsil', districtId: 'mirpur', name: 'Mirpur City' },
  { id: 'rawalakot-tehsil', districtId: 'poonch', name: 'Rawalakot' },
];

const CURATED_MUNICIPALITIES: Municipality[] = [
  // ---- Karachi Metropolitan Corporation (per tehsil) ----
  { id: 'karachi-mc', tehsilId: 'saddar', name: 'Karachi Metropolitan Corporation' },
  { id: 'karachi-mc-clifton', tehsilId: 'clifton', name: 'Karachi Metropolitan Corporation' },
  { id: 'karachi-mc-lyari', tehsilId: 'lyari', name: 'Karachi Metropolitan Corporation' },
  { id: 'karachi-mc-jamshed', tehsilId: 'jamshed', name: 'Karachi Metropolitan Corporation' },
  { id: 'karachi-mc-gulshan', tehsilId: 'gulshan', name: 'Karachi Metropolitan Corporation' },
  { id: 'karachi-mc-gulberg', tehsilId: 'gulberg', name: 'Karachi Metropolitan Corporation' },
  { id: 'karachi-mc-ferozabad', tehsilId: 'ferozabad', name: 'Karachi Metropolitan Corporation' },
  { id: 'karachi-mc-liaquatabad', tehsilId: 'liaquatabad', name: 'Karachi Metropolitan Corporation' },
  { id: 'karachi-mc-nn', tehsilId: 'north-nazimabad', name: 'Karachi Metropolitan Corporation' },
  { id: 'karachi-mc-nazimabad', tehsilId: 'nazimabad', name: 'Karachi Metropolitan Corporation' },
  { id: 'karachi-mc-new-karachi', tehsilId: 'new-karachi', name: 'Karachi Metropolitan Corporation' },
  { id: 'karachi-mc-orangi', tehsilId: 'orangi', name: 'Karachi Metropolitan Corporation' },
  { id: 'karachi-mc-baldia', tehsilId: 'baldia', name: 'Karachi Metropolitan Corporation' },
  { id: 'karachi-mc-site', tehsilId: 'site', name: 'Karachi Metropolitan Corporation' },
  { id: 'karachi-mc-manghopir', tehsilId: 'manghopir', name: 'Karachi Metropolitan Corporation' },
  { id: 'karachi-mc-korangi', tehsilId: 'korangi', name: 'Karachi Metropolitan Corporation' },
  { id: 'karachi-mc-landhi', tehsilId: 'landhi', name: 'Karachi Metropolitan Corporation' },
  { id: 'karachi-mc-shah-faisal', tehsilId: 'shah-faisal', name: 'Karachi Metropolitan Corporation' },
  { id: 'karachi-mc-model-colony', tehsilId: 'model-colony', name: 'Karachi Metropolitan Corporation' },
  { id: 'karachi-mc-malir', tehsilId: 'malir', name: 'Karachi Metropolitan Corporation' },
  { id: 'karachi-mc-bin-qasim', tehsilId: 'bin-qasim', name: 'Karachi Metropolitan Corporation' },
  { id: 'karachi-mc-gadap', tehsilId: 'gadap', name: 'Karachi Metropolitan Corporation' },
  { id: 'karachi-mc-keamari', tehsilId: 'keamari', name: 'Karachi Metropolitan Corporation' },
  // ---- Lahore ----
  { id: 'lahore-mc', tehsilId: 'lahore-city', name: 'Metropolitan Corporation Lahore' },
  { id: 'lahore-mc-cantt', tehsilId: 'lahore-cantt', name: 'Metropolitan Corporation Lahore' },
  { id: 'lahore-mc-model-town', tehsilId: 'model-town', name: 'Metropolitan Corporation Lahore' },
  { id: 'lahore-mc-raiwind', tehsilId: 'raiwind', name: 'Metropolitan Corporation Lahore' },
  { id: 'lahore-mc-shalimar', tehsilId: 'shalimar', name: 'Metropolitan Corporation Lahore' },
  { id: 'lahore-mc-wagah', tehsilId: 'wagah', name: 'Metropolitan Corporation Lahore' },
  // ---- Punjab cities ----
  { id: 'rawalpindi-mc', tehsilId: 'rawalpindi-city', name: 'Rawalpindi Municipal Corporation' },
  { id: 'taxila-mc', tehsilId: 'taxila', name: 'Taxila Municipal Corporation' },
  { id: 'murree-mc', tehsilId: 'murree-tehsil', name: 'Murree Municipal Corporation' },
  { id: 'faisalabad-mc', tehsilId: 'faisalabad-city', name: 'Faisalabad Metropolitan Corporation' },
  { id: 'jaranwala-mc', tehsilId: 'jaranwala', name: 'Jaranwala Municipal Committee' },
  { id: 'multan-mc', tehsilId: 'multan-city', name: 'Multan Metropolitan Corporation' },
  { id: 'gujranwala-mc', tehsilId: 'gujranwala-city', name: 'Gujranwala Metropolitan Corporation' },
  { id: 'sialkot-mc', tehsilId: 'sialkot-city', name: 'Sialkot Municipal Corporation' },
  { id: 'bahawalpur-mc', tehsilId: 'bahawalpur-city', name: 'Bahawalpur Municipal Corporation' },
  { id: 'sargodha-mc', tehsilId: 'sargodha-city', name: 'Sargodha Municipal Corporation' },
  { id: 'sheikhupura-mc', tehsilId: 'sheikhupura-city', name: 'Sheikhupura Municipal Corporation' },
  { id: 'sahiwal-mc', tehsilId: 'sahiwal-city', name: 'Sahiwal Municipal Corporation' },
  { id: 'jhang-mc', tehsilId: 'jhang-city', name: 'Jhang Municipal Committee' },
  { id: 'kasur-mc', tehsilId: 'kasur-city', name: 'Kasur Municipal Committee' },
  { id: 'attock-mc', tehsilId: 'attock-city', name: 'Attock Municipal Committee' },
  { id: 'jhelum-mc', tehsilId: 'jhelum-city', name: 'Jhelum Municipal Committee' },
  { id: 'dg-khan-mc', tehsilId: 'dg-khan-tehsil', name: 'Dera Ghazi Khan Municipal Corporation' },
  // ---- Islamabad ----
  { id: 'islamabad-mc', tehsilId: 'islamabad-tehsil', name: 'Islamabad Metropolitan Corporation' },
  // ---- Sindh cities ----
  { id: 'hyderabad-mc', tehsilId: 'hyderabad-city', name: 'Hyderabad Municipal Corporation' },
  { id: 'latifabad-mc', tehsilId: 'latifabad', name: 'Latifabad Municipal Committee' },
  { id: 'qasimabad-mc', tehsilId: 'qasimabad', name: 'Qasimabad Municipal Committee' },
  { id: 'sukkur-mc', tehsilId: 'sukkur-city', name: 'Sukkur Municipal Corporation' },
  { id: 'larkana-mc', tehsilId: 'larkana-city', name: 'Larkana Municipal Corporation' },
  { id: 'mirpur-khas-mc', tehsilId: 'mirpur-khas-city', name: 'Mirpur Khas Municipal Corporation' },
  { id: 'nawabshah-mc', tehsilId: 'nawabshah-city', name: 'Nawabshah Municipal Corporation' },
  // ---- Khyber Pakhtunkhwa cities ----
  { id: 'peshawar-mc', tehsilId: 'peshawar-city', name: 'Peshawar Metropolitan Corporation' },
  { id: 'mardan-mc', tehsilId: 'mardan-tehsil', name: 'Mardan Municipal Corporation' },
  { id: 'abbottabad-mc', tehsilId: 'abbottabad-tehsil', name: 'Abbottabad Municipal Corporation' },
  { id: 'kohat-mc', tehsilId: 'kohat-tehsil', name: 'Kohat Municipal Corporation' },
  { id: 'mingora-mc', tehsilId: 'mingora', name: 'Mingora Municipal Corporation' },
  { id: 'd-i-khan-mc', tehsilId: 'd-i-khan-tehsil', name: 'Dera Ismail Khan Municipal Corporation' },
  { id: 'charsadda-mc', tehsilId: 'charsadda-tehsil', name: 'Charsadda Municipal Committee' },
  { id: 'nowshera-mc', tehsilId: 'nowshera-tehsil', name: 'Nowshera Municipal Committee' },
  // ---- Balochistan cities ----
  { id: 'quetta-mc', tehsilId: 'quetta-city', name: 'Quetta Metropolitan Corporation' },
  { id: 'gwadar-mc', tehsilId: 'gwadar-tehsil', name: 'Gwadar Municipal Corporation' },
  { id: 'khuzdar-mc', tehsilId: 'khuzdar-tehsil', name: 'Khuzdar Municipal Corporation' },
  { id: 'turbat-mc', tehsilId: 'turbat-tehsil', name: 'Turbat Municipal Corporation' },
  // ---- Gilgit-Baltistan ----
  { id: 'gilgit-mc', tehsilId: 'gilgit-tehsil', name: 'Gilgit Municipal Committee' },
  { id: 'skardu-mc', tehsilId: 'skardu-tehsil', name: 'Skardu Municipal Committee' },
  // ---- Azad Jammu & Kashmir ----
  { id: 'muzaffarabad-mc', tehsilId: 'muzaffarabad-tehsil', name: 'Muzaffarabad Municipal Corporation' },
  { id: 'mirpur-mc', tehsilId: 'mirpur-tehsil', name: 'Mirpur Municipal Corporation' },
  { id: 'rawalakot-mc', tehsilId: 'rawalakot-tehsil', name: 'Rawalakot Municipal Committee' },
];

const CURATED_WARDS: Ward[] = [
  // ---- Karachi ----
  { id: 'karachi-w1', municipalityId: 'karachi-mc', name: 'Ward 1 – Saddar' },
  { id: 'karachi-w2', municipalityId: 'karachi-mc', name: 'Ward 2 – Kharadar' },
  { id: 'karachi-w3', municipalityId: 'karachi-mc', name: 'Ward 3 – Garden' },
  { id: 'karachi-w4', municipalityId: 'karachi-mc-clifton', name: 'Ward 4 – Clifton' },
  { id: 'karachi-w5', municipalityId: 'karachi-mc-clifton', name: 'Ward 5 – DHA' },
  { id: 'karachi-w6', municipalityId: 'karachi-mc-gulshan', name: 'Ward 6 – Gulshan-e-Iqbal' },
  { id: 'karachi-w7', municipalityId: 'karachi-mc-gulshan', name: 'Ward 7 – Gulistan-e-Johar' },
  { id: 'karachi-w8', municipalityId: 'karachi-mc-gulberg', name: 'Ward 8 – Gulberg' },
  { id: 'karachi-w9', municipalityId: 'karachi-mc-liaquatabad', name: 'Ward 9 – Liaquatabad' },
  { id: 'karachi-w10', municipalityId: 'karachi-mc-nn', name: 'Ward 10 – North Nazimabad' },
  { id: 'karachi-w11', municipalityId: 'karachi-mc-jamshed', name: 'Ward 11 – Jamshed Town' },
  { id: 'karachi-w12', municipalityId: 'karachi-mc-nazimabad', name: 'Ward 12 – Nazimabad' },
  { id: 'karachi-w13', municipalityId: 'karachi-mc-orangi', name: 'Ward 13 – Orangi Town' },
  { id: 'karachi-w14', municipalityId: 'karachi-mc-korangi', name: 'Ward 14 – Korangi' },
  { id: 'karachi-w15', municipalityId: 'karachi-mc-landhi', name: 'Ward 15 – Landhi' },
  { id: 'karachi-w16', municipalityId: 'karachi-mc-malir', name: 'Ward 16 – Malir' },
  { id: 'karachi-w17', municipalityId: 'karachi-mc-bin-qasim', name: 'Ward 17 – Bin Qasim' },
  { id: 'karachi-w18', municipalityId: 'karachi-mc-keamari', name: 'Ward 18 – Keamari' },
  { id: 'karachi-w19', municipalityId: 'karachi-mc-ferozabad', name: 'Ward 19 – Ferozabad' },
  { id: 'karachi-w20', municipalityId: 'karachi-mc-new-karachi', name: 'Ward 20 – New Karachi' },
  // ---- Lahore ----
  { id: 'lahore-w1', municipalityId: 'lahore-mc', name: 'Ward 1 – Gulberg Lahore' },
  { id: 'lahore-w2', municipalityId: 'lahore-mc', name: 'Ward 2 – Iqbal Town' },
  { id: 'lahore-w3', municipalityId: 'lahore-mc-model-town', name: 'Ward 3 – Model Town' },
  { id: 'lahore-w4', municipalityId: 'lahore-mc-cantt', name: 'Ward 4 – Lahore Cantt' },
  // ---- Islamabad ----
  { id: 'isb-w1', municipalityId: 'islamabad-mc', name: 'Ward 1 – G-6 / G-7' },
  { id: 'isb-w2', municipalityId: 'islamabad-mc', name: 'Ward 2 – F-7 / F-8' },
  { id: 'isb-w3', municipalityId: 'islamabad-mc', name: 'Ward 3 – Blue Area' },
  { id: 'isb-w4', municipalityId: 'islamabad-mc', name: 'Ward 4 – I-8 / I-9' },
  // ---- Rawalpindi ----
  { id: 'rwp-w1', municipalityId: 'rawalpindi-mc', name: 'Ward 1 – Saddar Rawalpindi' },
  { id: 'rwp-w2', municipalityId: 'rawalpindi-mc', name: 'Ward 2 – Satellite Town' },
  // ---- Faisalabad ----
  { id: 'fsd-w1', municipalityId: 'faisalabad-mc', name: 'Ward 1 – Peoples Colony' },
  { id: 'fsd-w2', municipalityId: 'faisalabad-mc', name: 'Ward 2 – Samanabad' },
  // ---- Multan ----
  { id: 'mlt-w1', municipalityId: 'multan-mc', name: 'Ward 1 – Shah Rukn-e-Alam' },
  { id: 'mlt-w2', municipalityId: 'multan-mc', name: 'Ward 2 – Cantonment Multan' },
  // ---- Gujranwala ----
  { id: 'grw-w1', municipalityId: 'gujranwala-mc', name: 'Ward 1 – Model Town Gujranwala' },
  // ---- Sialkot ----
  { id: 'skt-w1', municipalityId: 'sialkot-mc', name: 'Ward 1 – Sialkot Cantt' },
  // ---- Bahawalpur ----
  { id: 'bwp-w1', municipalityId: 'bahawalpur-mc', name: 'Ward 1 – Model Town Bahawalpur' },
  // ---- Sargodha ----
  { id: 'sgd-w1', municipalityId: 'sargodha-mc', name: 'Ward 1 – Sargodha City' },
  // ---- Hyderabad ----
  { id: 'hyd-w1', municipalityId: 'hyderabad-mc', name: 'Ward 1 – Latifabad' },
  { id: 'hyd-w2', municipalityId: 'hyderabad-mc', name: 'Ward 2 – Qasimabad' },
  { id: 'hyd-w3', municipalityId: 'latifabad-mc', name: 'Ward 3 – Latifabad Units 1–5' },
  { id: 'hyd-w4', municipalityId: 'qasimabad-mc', name: 'Ward 4 – Qasimabad Phase 1–2' },
  // ---- Sukkur ----
  { id: 'skr-w1', municipalityId: 'sukkur-mc', name: 'Ward 1 – Sukkur City' },
  // ---- Peshawar ----
  { id: 'psw-w1', municipalityId: 'peshawar-mc', name: 'Ward 1 – University Town' },
  { id: 'psw-w2', municipalityId: 'peshawar-mc', name: 'Ward 2 – Hayatabad' },
  { id: 'psw-w3', municipalityId: 'peshawar-mc', name: 'Ward 3 – Peshawar Cantt' },
  // ---- Mardan ----
  { id: 'mrd-w1', municipalityId: 'mardan-mc', name: 'Ward 1 – Mardan City' },
  // ---- Abbottabad ----
  { id: 'abt-w1', municipalityId: 'abbottabad-mc', name: 'Ward 1 – Abbottabad Cantt' },
  // ---- D.I. Khan ----
  { id: 'dik-w1', municipalityId: 'd-i-khan-mc', name: 'Ward 1 – D.I. Khan City' },
  // ---- Kohat ----
  { id: 'kht-w1', municipalityId: 'kohat-mc', name: 'Ward 1 – Kohat City' },
  // ---- Swat (Mingora) ----
  { id: 'swt-w1', municipalityId: 'mingora-mc', name: 'Ward 1 – Mingora Bazaar' },
  // ---- Quetta ----
  { id: 'qta-w1', municipalityId: 'quetta-mc', name: 'Ward 1 – Satellite Town' },
  { id: 'qta-w2', municipalityId: 'quetta-mc', name: 'Ward 2 – Jinnah Town' },
  { id: 'qta-w3', municipalityId: 'quetta-mc', name: 'Ward 3 – Quetta Cantt' },
  // ---- Gwadar ----
  { id: 'gwd-w1', municipalityId: 'gwadar-mc', name: 'Ward 1 – Gwadar City' },
  // ---- Khuzdar ----
  { id: 'khz-w1', municipalityId: 'khuzdar-mc', name: 'Ward 1 – Khuzdar City' },
  // ---- Turbat ----
  { id: 'trb-w1', municipalityId: 'turbat-mc', name: 'Ward 1 – Turbat City' },
  // ---- Gilgit-Baltistan ----
  { id: 'glt-w1', municipalityId: 'gilgit-mc', name: 'Ward 1 – Jutial Gilgit' },
  { id: 'skd-w1', municipalityId: 'skardu-mc', name: 'Ward 1 – Skardu City' },
  // ---- Azad Jammu & Kashmir ----
  { id: 'muz-w1', municipalityId: 'muzaffarabad-mc', name: 'Ward 1 – Muzaffarabad City' },
  { id: 'mrp-w1', municipalityId: 'mirpur-mc', name: 'Ward 1 – Mirpur City' },
  { id: 'rwk-w1', municipalityId: 'rawalakot-mc', name: 'Ward 1 – Rawalakot City' },
];

export const AREAS: Area[] = [
  // ---- Karachi ----
  { id: 'area-saddar', wardId: 'karachi-w1', name: 'Saddar Bazaar' },
  { id: 'area-empress', wardId: 'karachi-w1', name: 'Empress Market' },
  { id: 'area-kharadar', wardId: 'karachi-w2', name: 'Kharadar' },
  { id: 'area-garden', wardId: 'karachi-w3', name: 'Garden East' },
  { id: 'area-clifton', wardId: 'karachi-w4', name: 'Clifton Block 4' },
  { id: 'area-clifton5', wardId: 'karachi-w4', name: 'Clifton Block 5' },
  { id: 'area-dha', wardId: 'karachi-w5', name: 'DHA Phase 2' },
  { id: 'area-dha6', wardId: 'karachi-w5', name: 'DHA Phase 6' },
  { id: 'area-gulshan', wardId: 'karachi-w6', name: 'Gulshan-e-Iqbal Block 6' },
  { id: 'area-gulshan13', wardId: 'karachi-w6', name: 'Gulshan-e-Iqbal Block 13' },
  { id: 'area-johar', wardId: 'karachi-w7', name: 'Gulistan-e-Johar Block 15' },
  { id: 'area-gulberg', wardId: 'karachi-w8', name: 'Gulberg Chowrangi' },
  { id: 'area-liaquatabad', wardId: 'karachi-w9', name: 'Liaquatabad No. 10' },
  { id: 'area-nn', wardId: 'karachi-w10', name: 'North Nazimabad Block B' },
  { id: 'area-jamshed', wardId: 'karachi-w11', name: 'Jamshed Quarters' },
  { id: 'area-orangi', wardId: 'karachi-w13', name: 'Orangi Sector 11' },
  { id: 'area-korangi', wardId: 'karachi-w14', name: 'Korangi Industrial Area' },
  { id: 'area-landhi', wardId: 'karachi-w15', name: 'Landhi Korangi Road' },
  { id: 'area-malir', wardId: 'karachi-w16', name: 'Malir City' },
  { id: 'area-keamari', wardId: 'karachi-w18', name: 'Keamari Harbour' },
  // ---- Lahore ----
  { id: 'area-lhr-gulberg', wardId: 'lahore-w1', name: 'Gulberg Main Boulevard' },
  { id: 'area-lhr-iqbal', wardId: 'lahore-w2', name: 'Iqbal Town' },
  { id: 'area-lhr-model-town', wardId: 'lahore-w3', name: 'Model Town Link Road' },
  { id: 'area-lhr-cantt', wardId: 'lahore-w4', name: 'Cantt Cavalry Ground' },
  // ---- Islamabad ----
  { id: 'area-isb-g6', wardId: 'isb-w1', name: 'G-6 Markaz' },
  { id: 'area-isb-f7', wardId: 'isb-w2', name: 'F-7 Markaz' },
  { id: 'area-isb-blue', wardId: 'isb-w3', name: 'Blue Area Jinnah Avenue' },
  // ---- Rawalpindi ----
  { id: 'area-rwp-saddar', wardId: 'rwp-w1', name: 'Saddar Rawalpindi' },
  { id: 'area-rwp-satellite', wardId: 'rwp-w2', name: 'Satellite Town' },
  // ---- Peshawar ----
  { id: 'area-psw-uni', wardId: 'psw-w1', name: 'University Town' },
  { id: 'area-psw-hayatabad', wardId: 'psw-w2', name: 'Hayatabad Phase 4' },
  // ---- Quetta ----
  { id: 'area-qta-satellite', wardId: 'qta-w1', name: 'Satellite Town Quetta' },
  { id: 'area-qta-jinnah', wardId: 'qta-w2', name: 'Jinnah Town' },
  // ---- Hyderabad ----
  { id: 'area-hyd-latifabad', wardId: 'hyd-w1', name: 'Latifabad Unit 7' },
  { id: 'area-hyd-latifabad-2', wardId: 'hyd-w1', name: 'Latifabad Unit 2' },
  { id: 'area-hyd-latifabad-9', wardId: 'hyd-w1', name: 'Latifabad Unit 9' },
  { id: 'area-hyd-city', wardId: 'hyd-w1', name: 'Hyderabad City Centre' },
  { id: 'area-hyd-qasimabad-phase1', wardId: 'hyd-w2', name: 'Qasimabad Phase 1' },
  { id: 'area-hyd-qasimabad-phase2', wardId: 'hyd-w2', name: 'Qasimabad Phase 2' },
  { id: 'area-hyd-autobhan', wardId: 'hyd-w2', name: 'Auto Bhan Road' },
  // ---- Faisalabad ----
  { id: 'area-fsd-peoples', wardId: 'fsd-w1', name: 'Peoples Colony No. 1' },
  { id: 'area-fsd-samanabad', wardId: 'fsd-w2', name: 'Samanabad' },
  // ---- Multan ----
  { id: 'area-mlt-cantt', wardId: 'mlt-w2', name: 'Multan Cantt' },
  { id: 'area-mlt-sra', wardId: 'mlt-w1', name: 'Shah Rukn-e-Alam Colony' },
  // ---- Karachi (remaining wards) ----
  { id: 'area-nazimabad', wardId: 'karachi-w12', name: 'Nazimabad No. 3' },
  { id: 'area-hyderi', wardId: 'karachi-w12', name: 'Hyderi Market' },
  { id: 'area-bin-qasim', wardId: 'karachi-w17', name: 'Bin Qasim Town' },
  { id: 'area-quaidabad', wardId: 'karachi-w17', name: 'Quaidabad' },
  { id: 'area-ferozabad', wardId: 'karachi-w19', name: 'Ferozabad Colony' },
  { id: 'area-new-karachi', wardId: 'karachi-w20', name: 'New Karachi Sector 11' },
  // ---- Islamabad ----
  { id: 'area-isb-i8', wardId: 'isb-w4', name: 'I-8 Markaz' },
  { id: 'area-isb-f8', wardId: 'isb-w2', name: 'F-8 Markaz' },
  // ---- Rawalpindi ----
  { id: 'area-rwp-chandni', wardId: 'rwp-w2', name: 'Chandni Chowk' },
  // ---- Lahore ----
  { id: 'area-lhr-liberty', wardId: 'lahore-w1', name: 'Liberty Market' },
  // ---- Gujranwala ----
  { id: 'area-grw-model-town', wardId: 'grw-w1', name: 'Model Town Gujranwala' },
  { id: 'area-grw-satellite', wardId: 'grw-w1', name: 'Satellite Town Gujranwala' },
  // ---- Sialkot ----
  { id: 'area-skt-cantt', wardId: 'skt-w1', name: 'Sialkot Cantt' },
  { id: 'area-skt-city', wardId: 'skt-w1', name: 'Sialkot City' },
  // ---- Bahawalpur ----
  { id: 'area-bwp-model-town', wardId: 'bwp-w1', name: 'Model Town Bahawalpur' },
  { id: 'area-bwp-city', wardId: 'bwp-w1', name: 'Bahawalpur City' },
  // ---- Sargodha ----
  { id: 'area-sgd-city', wardId: 'sgd-w1', name: 'Sargodha City' },
  { id: 'area-sgd-airport', wardId: 'sgd-w1', name: 'Airport Road Sargodha' },
  // ---- Hyderabad ----
  { id: 'area-hyd-qasimabad', wardId: 'hyd-w2', name: 'Qasimabad' },
  { id: 'area-hyd-latifabad-3', wardId: 'hyd-w3', name: 'Latifabad Unit 3' },
  { id: 'area-hyd-latifabad-5', wardId: 'hyd-w3', name: 'Latifabad Unit 5' },
  { id: 'area-hyd-qasimabad-3', wardId: 'hyd-w4', name: 'Qasimabad Phase 3' },
  // ---- Sukkur ----
  { id: 'area-skr-city', wardId: 'skr-w1', name: 'Sukkur City' },
  { id: 'area-skr-barrage', wardId: 'skr-w1', name: 'Sukkur Barrage' },
  // ---- Peshawar ----
  { id: 'area-psw-cantt', wardId: 'psw-w3', name: 'Peshawar Cantt' },
  { id: 'area-psw-city', wardId: 'psw-w3', name: 'Peshawar City' },
  // ---- Mardan ----
  { id: 'area-mrd-city', wardId: 'mrd-w1', name: 'Mardan City' },
  { id: 'area-mrd-cantt', wardId: 'mrd-w1', name: 'Mardan Cantt' },
  // ---- Abbottabad ----
  { id: 'area-abt-cantt', wardId: 'abt-w1', name: 'Abbottabad Cantt' },
  { id: 'area-abt-mandi', wardId: 'abt-w1', name: 'Mandi Abbottabad' },
  // ---- D.I. Khan ----
  { id: 'area-dik-city', wardId: 'dik-w1', name: 'D.I. Khan City' },
  // ---- Kohat ----
  { id: 'area-kht-city', wardId: 'kht-w1', name: 'Kohat City' },
  // ---- Swat (Mingora) ----
  { id: 'area-swt-mingora', wardId: 'swt-w1', name: 'Mingora Bazaar' },
  { id: 'area-swt-saidu', wardId: 'swt-w1', name: 'Saidu Sharif' },
  // ---- Quetta ----
  { id: 'area-qta-cantt', wardId: 'qta-w3', name: 'Quetta Cantt' },
  // ---- Gwadar ----
  { id: 'area-gwd-city', wardId: 'gwd-w1', name: 'Gwadar City' },
  { id: 'area-gwd-port', wardId: 'gwd-w1', name: 'Gwadar Port' },
  // ---- Khuzdar ----
  { id: 'area-khz-city', wardId: 'khz-w1', name: 'Khuzdar City' },
  // ---- Turbat ----
  { id: 'area-trb-city', wardId: 'trb-w1', name: 'Turbat City' },
  // ---- Gilgit-Baltistan ----
  { id: 'area-glt-jutial', wardId: 'glt-w1', name: 'Jutial' },
  { id: 'area-glt-city', wardId: 'glt-w1', name: 'Gilgit City' },
  { id: 'area-skd-city', wardId: 'skd-w1', name: 'Skardu City' },
  // ---- Azad Jammu & Kashmir ----
  { id: 'area-muz-city', wardId: 'muz-w1', name: 'Muzaffarabad City' },
  { id: 'area-muz-chela', wardId: 'muz-w1', name: 'Chehla Bandi' },
  { id: 'area-mrp-city', wardId: 'mrp-w1', name: 'Mirpur City' },
  { id: 'area-rwk-city', wardId: 'rwk-w1', name: 'Rawalakot City' },
];

/* ------------------------------------------------------------------ */
/* National merge: every district's tehsils + a municipal committee and */
/* standard numbered wards for each tehsil (wards in Pakistan are       */
/* officially designated "Ward 1…N"). Cities keep their curated detail. */
/* ------------------------------------------------------------------ */

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/** Tehsils not already covered by the curated city list. */
const EXTRA_TEHSILS: Tehsil[] = [];
{
  const seen = new Map<string, Set<string>>();
  for (const t of CURATED_TEHSILS) {
    if (!seen.has(t.districtId)) seen.set(t.districtId, new Set());
    seen.get(t.districtId)!.add(t.name.toLowerCase().trim());
  }
  for (const [districtId, names] of Object.entries(FULL_TEHSILS)) {
    const known = seen.get(districtId) ?? new Set<string>();
    for (const raw of names) {
      const name = raw.trim();
      if (known.has(name.toLowerCase())) continue;
      EXTRA_TEHSILS.push({ id: `${districtId}-${slugify(name)}`, districtId, name });
      known.add(name.toLowerCase());
    }
  }
}

export const TEHSILS: Tehsil[] = [...CURATED_TEHSILS, ...EXTRA_TEHSILS];

/** One municipal committee per tehsil that lacks a curated municipality. */
const EXTRA_MUNICIPALITIES: Municipality[] = [];
{
  const covered = new Set(CURATED_MUNICIPALITIES.map((m) => m.tehsilId));
  for (const t of TEHSILS) {
    if (covered.has(t.id)) continue;
    EXTRA_MUNICIPALITIES.push({
      id: `${t.id}-mc`,
      tehsilId: t.id,
      name: `${t.name} Municipal Committee`,
    });
  }
}

export const MUNICIPALITIES: Municipality[] = [...CURATED_MUNICIPALITIES, ...EXTRA_MUNICIPALITIES];

/** Standard numbered wards for every municipal committee without curated wards. */
const EXTRA_WARDS: Ward[] = [];
{
  const covered = new Set(CURATED_WARDS.map((w) => w.municipalityId));
  for (const m of MUNICIPALITIES) {
    if (covered.has(m.id)) continue;
    const nWards = 6 + ((m.id.length + m.tehsilId.length) % 7); // 6–12 per committee
    for (let w = 1; w <= nWards; w++) {
      EXTRA_WARDS.push({ id: `${m.id}-w${w}`, municipalityId: m.id, name: `Ward ${w}` });
    }
  }
}

export const WARDS: Ward[] = [...CURATED_WARDS, ...EXTRA_WARDS];

/* ------------------------------------------------------------------ */
/* Selectors (cascading filters)                                       */
/* ------------------------------------------------------------------ */

export const getProvinces = (): Province[] => PROVINCES;
export const getDivisions = (provinceId: string): Division[] =>
  DIVISIONS.filter((d) => d.provinceId === provinceId);
export const getDistricts = (divisionId: string): District[] =>
  DISTRICTS.filter((d) => d.divisionId === divisionId);
export const getTehsils = (districtId: string): Tehsil[] =>
  TEHSILS.filter((t) => t.districtId === districtId);
export const getMunicipalities = (tehsilId: string): Municipality[] =>
  MUNICIPALITIES.filter((m) => m.tehsilId === tehsilId);
export const getWards = (municipalityId: string): Ward[] =>
  WARDS.filter((w) => w.municipalityId === municipalityId);
export const getAreas = (wardId: string): Area[] =>
  AREAS.filter((a) => a.wardId === wardId);

export const getProvinceName = (id?: string): string =>
  PROVINCES.find((p) => p.id === id)?.name ?? '';
export const getDivisionName = (id?: string): string =>
  DIVISIONS.find((d) => d.id === id)?.name ?? '';
export const getDistrictName = (id?: string): string =>
  DISTRICTS.find((d) => d.id === id)?.name ?? '';
export const getTehsilName = (id?: string): string =>
  TEHSILS.find((t) => t.id === id)?.name ?? '';
export const getMunicipalityName = (id?: string): string =>
  MUNICIPALITIES.find((m) => m.id === id)?.name ?? '';
export const getWardName = (id?: string): string =>
  WARDS.find((w) => w.id === id)?.name ?? '';

/** The default Karachi (Sindh) selection used by the demo and new complaints. */
export const DEFAULT_LOCATION: LocationSelection = {
  provinceId: LOCATION_CONFIG.defaultProvinceId,
  divisionId: LOCATION_CONFIG.defaultDivisionId,
  districtId: LOCATION_CONFIG.defaultDistrictId,
  tehsilId: LOCATION_CONFIG.defaultTehsilId,
  municipalityId: LOCATION_CONFIG.defaultMunicipalityId,
  wardId: LOCATION_CONFIG.defaultWardId,
  area: 'Saddar Bazaar',
};

/** Resolve a LocationSelection into display names. */
export function resolveLocation(sel: Partial<LocationSelection> | undefined) {
  return {
    provinceName: getProvinceName(sel?.provinceId),
    divisionName: getDivisionName(sel?.divisionId),
    districtName: getDistrictName(sel?.districtId),
    tehsilName: getTehsilName(sel?.tehsilId),
    municipalityName: getMunicipalityName(sel?.municipalityId),
    wardName: getWardName(sel?.wardId),
    area: sel?.area ?? '',
  };
}

/** Build a structured LocationData from a selection + free-text fields. */
export function buildLocation(
  sel: Partial<LocationSelection>,
  opts: { address?: string; landmark?: string } = {}
): LocationData {
  return {
    provinceId: sel.provinceId,
    divisionId: sel.divisionId,
    districtId: sel.districtId,
    tehsilId: sel.tehsilId,
    municipalityId: sel.municipalityId,
    wardId: sel.wardId,
    area: sel.area,
    ward: getWardName(sel.wardId) || undefined,
    address: opts.address ?? '',
    landmark: opts.landmark,
  };
}

/** Short human-readable summary, e.g. "Ward 6 – Gulshan-e-Iqbal, Karachi" */
export function locationSummary(loc: Pick<LocationData, 'wardId' | 'ward' | 'area' | 'districtId' | 'municipalityId'> | undefined): string {
  if (!loc) return '';
  const ward = loc.wardId ? getWardName(loc.wardId) : (loc.ward ?? '');
  const district = getDistrictName(loc.districtId);
  const parts = [ward, loc.area, district].filter(Boolean);
  return parts.join(', ');
}

/** Multi-line structured location block for ticket details. */
export function formatLocation(loc: LocationData | undefined): { label: string; value: string }[] {
  if (!loc) return [];
  const resolved = resolveLocation(loc);
  const rows: { label: string; value: string }[] = [];
  if (resolved.provinceName) rows.push({ label: 'Province', value: `${resolved.provinceName}, ${LOCATION_CONFIG.countryName}` });
  if (resolved.divisionName) rows.push({ label: 'Division', value: resolved.divisionName });
  if (resolved.districtName) rows.push({ label: 'District', value: resolved.districtName });
  if (resolved.tehsilName) rows.push({ label: 'Tehsil / Taluka', value: resolved.tehsilName });
  if (resolved.municipalityName) rows.push({ label: 'Municipality', value: resolved.municipalityName });
  if (resolved.wardName) rows.push({ label: 'Ward', value: resolved.wardName });
  if (resolved.area) rows.push({ label: 'Area', value: resolved.area });
  if (loc.address) rows.push({ label: 'Address', value: loc.address });
  if (loc.landmark) rows.push({ label: 'Landmark', value: loc.landmark });
  return rows;
}
