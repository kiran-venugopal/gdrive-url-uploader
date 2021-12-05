export const devBaseUrl = "http://localhost:8000";
export const prodBaseUrl = "";

const baseUrl =
  process.env.NODE_ENV === "development" ? devBaseUrl : prodBaseUrl;
export default baseUrl;
