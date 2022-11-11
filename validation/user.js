const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateUserInput(data) {
  let errors = {};
  
  data.type = !isEmpty(data.type) ? data.type : '';
  data.name = !isEmpty(data.name) ? data.name : '';
  data.email = !isEmpty(data.email) ? data.email : '';
  data.username = !isEmpty(data.username) ? data.username : '';
  data.phone = !isEmpty(data.phone) ? data.phone : '';
  data.city = !isEmpty(data.city) ? data.city : '';
  data.pincode = !isEmpty(data.pincode) ? data.pincode : '';
  data.county = !isEmpty(data.county) ? data.county : '';
  data.country = !isEmpty(data.country) ? data.country : '';

  if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = 'Name must be between 2 and 30 characters';
  }

  if (Validator.isEmpty(data.name)) {
    errors.name = 'Name field is required';
  }

  if (Validator.isEmpty(data.email)) {
    errors.email = 'Email field is required';
  }

  if (Validator.isEmpty(data.username)) {
    errors.username = 'Username field is required';
  }

  if (!Validator.isEmail(data.email)) {
    errors.email = 'Email is invalid';
  }

  if (Validator.isEmpty(data.phone)) {
    errors.phone = 'Phone field is required';
  }
  

  if (Validator.isEmpty(data.city)) {
    errors.city = 'city field is required';
  }

  if (Validator.isEmpty(data.pincode)) {
    errors.pincode = 'pincode field is required';
  }

  if (Validator.isEmpty(data.county)) {
    errors.county = 'county field is required';
  }

  if (Validator.isEmpty(data.country)) {
    errors.country = 'country field is required';
  }



  

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
