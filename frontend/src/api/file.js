import axios from "axios";
import baseUrl from "./baseUrl";

export async function upload(url, filename, tokens) {
  try {
    const response = await axios.post(`${baseUrl}/upload`, {
      filename,
      url,
      tokens,
    });
    return response.data;
  } catch (err) {
    console.error(err);
    return { success: false };
  }
}

export async function getProgress(fileId) {
  try {
    const response = await axios.get(`${baseUrl}/progress?fileId=${fileId}`);
    return response.data;
  } catch (err) {
    return { success: false };
  }
}
