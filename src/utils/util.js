import parsePhoneNumberFromString from 'libphonenumber-js';

import { isUserRole } from "../model/user.model.js";
import { associatedWithTrip } from "../model/trip.model.js";
import { getOneRiderFromDB } from "../model/rider.model.js";
import {  getOneDriverFromDB } from "../model/driver.model.js";
import { date } from 'drizzle-orm/mysql-core';



const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/



export const emailValidator = (email) => (!EMAIL_REGEX.test(email) ? false : true);

export const phoneValidator = (phone_number)=> {

const phoneNumber = parsePhoneNumberFromString(phone_number, {
  defaultCountry: "GH",
  extract: false
});

  // VALID PHONE NUMBER
  if (phoneNumber && phoneNumber.isValid()) {
    
    return true
  }
  return false;
}

export const excludeNonMatchingElements = (firstArray, secondArray) => {
  return secondArray.filter((element) => firstArray.includes(element));
};

export const allowedPropertiesOnly = (data, allowedProperties) => {
  try {
    if (!allowedProperties) {
      return {};
    }
    return Object.keys(data)
      .filter((key) => allowedProperties.includes(key))
      .reduce((obj, key) => {
        obj[key] = data[key];
        return obj;
      }, {});
  } catch (err) {
    console.error('An error occurred:', err);
    return {};
  }
};


export const excludeProperties = (data, propertiesToExclude) => {
  return Object.keys(data)
    .filter((key) => !propertiesToExclude.includes(key))
    .reduce((obj, key) => {
      obj[key] = data[key];
      return obj;
    });
};

export const userIsUserRole = async (user_id, user_role) => {
  return await isUserRole(user_id, user_role);
};

export const userAssociatedWithTrip = async (role_id, trip_id, role) => {
  let roleIdColumn = "user_id";

  if (role === "Driver") {
    roleIdColumn = "driver_id";
  }
  const tripData = await associatedWithTrip(trip_id, roleIdColumn);
  if (!tripData) {
    return false;
  }

  if (role === "Driver") {
    return tripData[0]?.driver_id === role_id ? true : false;
  }

  return tripData[0]?.user_id === role_id ? true : false;
};

export const riderUserId = async (rider_id) => {
  const riderData = await getOneRiderFromDB(rider_id);
  return riderData.user_id;
};
export const driverUserId = async (driver_id) => {
  const driverData = await getOneDriverFromDB (driver_id);
  return driverData.user_id;
};

export const currencyFormatter = new Intl.NumberFormat('gh-GA', {
  style: 'currency',
  currency: 'GHS',  // Specify Ghanaian Cedis
  minimumFractionDigits: 2, // Display at least 2 decimal places
  maximumFractionDigits: 2  // Limit to 2 decimal places
});


export const getDayFromDate = (dateString) => {
  
  const date = new Date(`${dateString}`);
  const day = date.getDay();
  const days = ['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.'];
  const dayName = days[day];
  return dayName;

}



export const isRightValue = (value, data)=> {
  if(!data || !value) {
    return null;
  }
    return data.includes(value)
}