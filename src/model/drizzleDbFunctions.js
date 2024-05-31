import { db } from './connectDb';
import { eq } from 'drizzle-orm';

export const getAll = async (table) => {
  try {
    const allItems = await db.select().from(table).execute();
    return allItems;
  } catch (err) {
    throw err;
  }
};

export const checkOneDetail = async (table, column, condition) => {
    try {
      const result = await db.select().from(table).where(eq(column, condition)).execute();
      return result;
    } catch (err) {
      throw err;
    }
  };

  export const detailExists = async (table, column, detail) => {
    try {
      const result = await checkOneDetail(table, column, detail);
      return result.length > 0;
    } catch (err) {
      return false;
    }
  };

  
  export const getOne = async (table, column, entry) => {
    try {
      const result = await checkOneDetail(table, column, entry);
      if (result.length > 0) {
        return result;
      } else {
        return { error: "detail does not exist" };
      }
    } catch (err) {
      console.log('error56:', err);
      throw err;
    }
  };

  export const addOne = async (table, columns, values) => {
    try {
      const result = await db.insert(table).values({ ...columns }).returning('*').execute();
      return result;
    } catch (err) {
      throw err;
    }
  };

  export const updateOne = async (table, columns, id, idColumn, ...details) => {
    try {
      for (let i = 0; i < details.length; i++) {
        await db.update(table)
                .set({ [columns[i]]: details[i] })
                .where(eq(idColumn, id))
                .execute();
      }
      const updatedData = await db.select().from(table).where(eq(idColumn, id)).execute();
      return updatedData;
    } catch (err) {
      throw err;
    }
  };

  export const getSpecificDetails = async (table, specificColumn, condition) => {
    try {
      const result = await db.select().from(table).where(eq(specificColumn, condition)).execute();
      return result;
    } catch (err) {
      return { error: "Server Error occurred, data not retrieved" };
    }
  };

  
  export const getSpecificDetailsUsingId = async (table, id, idColumn, columns) => {
    try {
      const result = await db.select(columns).from(table).where(eq(idColumn, id)).execute();
      return result;
    } catch (err) {
      return { error: "Server Error occurred, data not retrieved" };
    }
  };

  export const deleteOne = async (table, column, id) => {
    try {
      const deletion = await db.delete(table).where(eq(column, id)).execute();
      return deletion > 0;
    } catch (err) {
      throw err;
    }
  };

  export const increaseByValue = async (table, id, idColumn, columnToBeIncreased) => {
    try {
      const result = await db.update(table)
                            .set({ [columnToBeIncreased]: db.raw(`${columnToBeIncreased} + 1`) })
                            .where(eq(idColumn, id))
                            .execute();
      return result > 0;
    } catch (err) {
      throw err;
    }
  };

  