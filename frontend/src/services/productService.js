import api from "./api";

const productService = {
  async getMyProducts() {
    const { data } = await api.get("/products");
    return data;
  },
  async create(payload) {
    const { data } = await api.post("/products", payload);
    return data;
  },
  async update(id, payload) {
    const { data } = await api.put(`/products/${id}`, payload);
    return data;
  },
  async remove(id) {
    const { data } = await api.delete(`/products/${id}`);
    return data;
  },
};

export default productService;