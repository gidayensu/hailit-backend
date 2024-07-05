export const paginatedRequest = async (
    totalCount,
    data,
    offset,
    limit,
    source
  ) => {
    const {total_count} = totalCount;
    const total_number_of_pages = Math.floor(total_count / limit);

    const current_page = (offset / limit)+1;
  
    return {
      [source]: data,
      total_number_of_pages,
      current_page,
      total_items: total_count
    };
  };
  