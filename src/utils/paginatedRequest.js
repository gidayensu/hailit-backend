export const paginatedRequest = async (
    countFunction,
    data,
    offset,
    limit,
    source
  ) => {
    const totalData = await countFunction();
    const dataTotalCount = totalData.length;
    const total_number_of_pages = Math.floor(dataTotalCount / limit);
    const current_page = offset / limit;
  
    return {
      [source]: data,
      total_number_of_pages,
      current_page
    };
  };
  