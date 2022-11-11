const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateRegisterInput(data) {
  let errors = {};

  
  data.fullname = !isEmpty(data.fullname) ? data.fullname : '';
 
  data.email = !isEmpty(data.email) ? data.email : '';
  data.phone = !isEmpty(data.phone) ? data.phone : '';
  data.company = !isEmpty(data.company) ? data.company : '';
  data.password = !isEmpty(data.password) ? data.password : '';
  data.password2 = !isEmpty(data.password2) ? data.password2 : '';


  if (Validator.isEmpty(data.fullname)) {
    errors.fullname = 'FullName is required';
  }

  

  

  if (Validator.isEmpty(data.email)) {
    errors.email = 'Email field is required';
  }

  if (Validator.isEmpty(data.phone)) {
    errors.phone = 'Phone field is required';
  }

  if (!Validator.isEmail(data.email)) {
    errors.email = 'Email is invalid';
  }

  if (Validator.isEmpty(data.company)) {
    errors.company = 'Company  is required';
  }


  if (Validator.isEmpty(data.password)) {
    errors.password = 'Password field is required';
  }

  if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (Validator.isEmpty(data.password2)) {
    errors.password2 = 'Confirm Password field is required';
  }

  if (!Validator.equals(data.password, data.password2)) {
    errors.password2 = 'Passwords must match';
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};
