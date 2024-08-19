export interface GetAll {
    page: number,
      limit:number,
      sortColumn:string,
      sortDirection: "DESC" | "ASC",
      search?: string
}

export interface GetAllFromDB  {
  limit:number,
      sortColumn:string,
      sortDirection: "DESC" | "ASC",
      search?: string
  offset: number
}