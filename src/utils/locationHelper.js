import axios from 'axios';

const GEOAPIFY_API_KEY = 'ba8be00cd4e54ab090e624dda83f9da3';

export const fetchAddress = async (latitude, longitude) => {
  try {
    const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${GEOAPIFY_API_KEY}`;
    const response = await axios.get(url);
    const addressData = response.data?.features?.[0]?.properties;

    if (addressData) {

      const locality =
        addressData.city ||
        addressData.town ||
        addressData.village ||
        addressData.county || 
        addressData.state_district || '';

      const district = addressData.state_district || addressData.county || '';
      const state = addressData.state || '';

      const city = [locality, district, state]
        .filter((val, index, self) => val && self.indexOf(val) === index)
        .join(', ');

      return {
        city,
        pincode: '', 
      };
    }

    console.log(' Address not found');
    return { city: '', pincode: '' };
  } catch (error) {
    console.log(' Address Fetch Error:', error);
    return { city: '', pincode: '' };
  }
};
