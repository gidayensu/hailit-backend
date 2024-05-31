
import { isUserRole } from "../model/user.model.js";
import { associatedWithTrip } from "../model/trip.model.js";
import { getOneRiderFromDB } from "../model/rider.model.js";
import {  getOneDriverFromDB } from "../model/driver.model.js";



const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{10}$/;

export const emailValidator = (email) => (!EMAIL_REGEX.test(email) ? false : true);

export const phoneValidator = (phone) => (!PHONE_REGEX.test(phone) ? false : true);

export const excludeNonMatchingElements = (firstArray, secondArray) => {
  return secondArray.filter((element) => firstArray.includes(element));
};

export const allowedPropertiesOnly = (data, allowedProperties) => {
  return Object.keys(data)
    .filter((key) => allowedProperties.includes(key))
    .reduce((obj, key) => {
      obj[key] = data[key];

      return obj;
    }, {});
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

  if (role === "driver") {
    roleIdColumn = "driver_id";
  }
  const tripData = await associatedWithTrip(trip_id, roleIdColumn);
  if (!tripData) {
    return false;
  }

  if (role === "driver") {
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

