import React from 'react';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';

const GOOGLE_API_KEY = ''

const GooglePlacesAutocompleteWrapper = () => (
  <div>
    <GooglePlacesAutocomplete
      apiKey= {GOOGLE_API_KEY}
    />
  </div>
);

export default GooglePlacesAutocompleteWrapper;