export const LOCALITY_NAMES = [
  // Delhi
  "Connaught Place, Delhi",
  "Karol Bagh, Delhi",
  "Lajpat Nagar, Delhi",
  "Dwarka, Delhi",
  "Rohini, Delhi",
  // Mumbai
  "Bandra, Mumbai",
  "Andheri, Mumbai",
  "Dadar, Mumbai",
  "Powai, Mumbai",
  "Juhu, Mumbai",
  // Bengaluru
  "Koramangala, Bengaluru",
  "Indiranagar, Bengaluru",
  "Whitefield, Bengaluru",
  "HSR Layout, Bengaluru",
  "Jayanagar, Bengaluru",
  // Hyderabad
  "Banjara Hills, Hyderabad",
  "Jubilee Hills, Hyderabad",
  "Madhapur, Hyderabad",
  "Kukatpally, Hyderabad",
  "Secunderabad, Hyderabad",
  // Chennai
  "T. Nagar, Chennai",
  "Anna Nagar, Chennai",
  "Velachery, Chennai",
  "Adyar, Chennai",
  "Tambaram, Chennai",
  // Kolkata
  "Salt Lake, Kolkata",
  "Park Street, Kolkata",
  "Howrah, Kolkata",
  "Dum Dum, Kolkata",
  // Pune
  "Koregaon Park, Pune",
  "Hinjewadi, Pune",
  "Kothrud, Pune",
  "Viman Nagar, Pune",
  // Ahmedabad
  "Navrangpura, Ahmedabad",
  "Bopal, Ahmedabad",
  "Satellite, Ahmedabad",
  "Vastrapur, Ahmedabad",
  // Other
  "Other",
] as const;

export type Locality = (typeof LOCALITY_NAMES)[number];

export const LOCALITIES: Record<Locality, { latitude: number; longitude: number }> = {
  // Delhi
  "Connaught Place, Delhi": { latitude: 28.6315, longitude: 77.2167 },
  "Karol Bagh, Delhi": { latitude: 28.6519, longitude: 77.1909 },
  "Lajpat Nagar, Delhi": { latitude: 28.5677, longitude: 77.2433 },
  "Dwarka, Delhi": { latitude: 28.5921, longitude: 77.0460 },
  "Rohini, Delhi": { latitude: 28.7041, longitude: 77.1025 },
  // Mumbai
  "Bandra, Mumbai": { latitude: 19.0596, longitude: 72.8295 },
  "Andheri, Mumbai": { latitude: 19.1197, longitude: 72.8468 },
  "Dadar, Mumbai": { latitude: 19.0186, longitude: 72.8449 },
  "Powai, Mumbai": { latitude: 19.1197, longitude: 72.9050 },
  "Juhu, Mumbai": { latitude: 19.0948, longitude: 72.8259 },
  // Bengaluru
  "Koramangala, Bengaluru": { latitude: 12.9352, longitude: 77.6245 },
  "Indiranagar, Bengaluru": { latitude: 12.9784, longitude: 77.6408 },
  "Whitefield, Bengaluru": { latitude: 12.9698, longitude: 77.7500 },
  "HSR Layout, Bengaluru": { latitude: 12.9116, longitude: 77.6473 },
  "Jayanagar, Bengaluru": { latitude: 12.9308, longitude: 77.5838 },
  // Hyderabad
  "Banjara Hills, Hyderabad": { latitude: 17.4126, longitude: 78.4480 },
  "Jubilee Hills, Hyderabad": { latitude: 17.4321, longitude: 78.4071 },
  "Madhapur, Hyderabad": { latitude: 17.4486, longitude: 78.3908 },
  "Kukatpally, Hyderabad": { latitude: 17.4948, longitude: 78.3996 },
  "Secunderabad, Hyderabad": { latitude: 17.4399, longitude: 78.4983 },
  // Chennai
  "T. Nagar, Chennai": { latitude: 13.0418, longitude: 80.2341 },
  "Anna Nagar, Chennai": { latitude: 13.0850, longitude: 80.2101 },
  "Velachery, Chennai": { latitude: 12.9816, longitude: 80.2209 },
  "Adyar, Chennai": { latitude: 13.0012, longitude: 80.2565 },
  "Tambaram, Chennai": { latitude: 12.9249, longitude: 80.1000 },
  // Kolkata
  "Salt Lake, Kolkata": { latitude: 22.5726, longitude: 88.4087 },
  "Park Street, Kolkata": { latitude: 22.5527, longitude: 88.3519 },
  "Howrah, Kolkata": { latitude: 22.5958, longitude: 88.2636 },
  "Dum Dum, Kolkata": { latitude: 22.6187, longitude: 88.4197 },
  // Pune
  "Koregaon Park, Pune": { latitude: 18.5362, longitude: 73.8958 },
  "Hinjewadi, Pune": { latitude: 18.5912, longitude: 73.7389 },
  "Kothrud, Pune": { latitude: 18.5074, longitude: 73.8077 },
  "Viman Nagar, Pune": { latitude: 18.5679, longitude: 73.9143 },
  // Ahmedabad
  "Navrangpura, Ahmedabad": { latitude: 23.0225, longitude: 72.5714 },
  "Bopal, Ahmedabad": { latitude: 23.0355, longitude: 72.4674 },
  "Satellite, Ahmedabad": { latitude: 23.0225, longitude: 72.5085 },
  "Vastrapur, Ahmedabad": { latitude: 23.0333, longitude: 72.5241 },
  // Other
  "Other": { latitude: 20.5937, longitude: 78.9629 },
};
