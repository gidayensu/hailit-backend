import parsePhoneNumberFromString from "libphonenumber-js";

import { getOneDriverFromDB } from "../model/driver.model";
import { getOneRiderFromDB } from "../model/rider.model";
import { associatedWithTrip } from "../model/trip.model";
import { isUserRole } from "../model/user.model";


import { UserRole } from "../types/user.types";
const EMAIL_REGEX =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const emailValidator = (email:string) =>
  !EMAIL_REGEX.test(email) ? false : true;

export const phoneValidator = (phone_number:string) => {
  const phoneNumber = parsePhoneNumberFromString(phone_number, {
    defaultCountry: "GH",
    extract: false,
  });

  // VALID PHONE NUMBER
  if (phoneNumber && phoneNumber.isValid()) {
    return true;
  }
  return false;
};



export const allowedPropertiesOnly = ({data, allowedProperties}:{data:any, allowedProperties:string[]}) => {
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
    console.error("An error occurred:", err);
    return {};
  }
};


export const userIsUserRole = async ({userId, userRole}:{userId:string, userRole:UserRole}) => {
  return await isUserRole(userId, userRole);
};


export const userAssociatedWithTrip = async ({tripId, requesterId, requesterRole}:{tripId:string, requesterId:string, requesterRole?:UserRole}) => {
  let requesterIdColumn = "customer_id"

  if (requesterRole === "Dispatcher") {
    requesterIdColumn = "dispatcher_id";
  }
  
  const tripData = await associatedWithTrip(tripId, requesterId, requesterIdColumn);
  
  if (!tripData || tripData.error) {
    return false;
  }

  if (requesterRole === "Dispatcher") {
    return tripData[0]?.dispatcher_id === requesterId ? true : false;
  }

  return tripData[0]?.customer_id === requesterId ? true : false;
};

export const riderUserId = async (rider_id:string) => {
  const riderData = await getOneRiderFromDB(rider_id);
  return riderData.user_id;
};

export const driverUserId = async (driver_id:string) => {
  const driverData = await getOneDriverFromDB(driver_id);
  return driverData.user_id;
};

export const currencyFormatter = new Intl.NumberFormat("gh-GA", {
  style: "currency",
  currency: "GHS", 
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const getDayFromDate = (dateString:string) => {
  const date = new Date(`${dateString}`);
  const day = date.getDay();
  const days = ["Sun.", "Mon.", "Tue.", "Wed.", "Thu.", "Fri.", "Sat."];
  const dayName = days[day];
  return dayName;
};

export const isRightValue = ({value, data}:{value:string, data:string[]}) => {
  if (!data || !value) {
    return null;
  }
  return data.includes(value);
};
