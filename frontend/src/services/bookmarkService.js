import api from "./api";

const bookmarkService = {
  async getMyBookmarks() {
    const { data } = await api.get("/bookmarks");
    return data; // { success, bookmarks }
  },
  async toggle(sessionId) {
    const { data } = await api.post(`/bookmarks/${sessionId}`);
    return data; // { success, bookmarked: true/false, message }
  },
};

export default bookmarkService;