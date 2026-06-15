export const mockApi = {
  get: async (path: string) => {
    try {
      const url = `/mock-data/${path}.json`;
      // console.log("Fetching mock data from:", url);

      const res = await fetch(url);
      // console.log("Fetch response ok?", res.ok, "status:", res.status);

      if (!res.ok) return null;

      const json = await res.json();
      // console.log("Fetched JSON:", json);
      return json;
    } catch (err) {
      console.error('Error fetching mock data:', err);
      return null;
    }
  },
};
