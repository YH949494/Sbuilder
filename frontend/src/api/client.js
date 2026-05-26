import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "",
  timeout: 120000
});

export async function generateImage({ prompt, slot_id, game_id }) {
  const { data } = await api.post("/api/image/generate", { prompt, slot_id, game_id });
  return data;
}

export async function uploadImage(file, slot_id, game_id) {
  const form = new FormData();
  form.append("file", file);
  form.append("slot_id", slot_id);
  form.append("game_id", game_id);
  const { data } = await api.post("/api/image/upload", form);
  return data;
}

export async function buildPackage(config) {
  const response = await api.post("/api/build/package", config, {
    responseType: "blob"
  });
  return response.data;
}

export default api;
