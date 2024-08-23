const inDev = import.meta.env.DEV;

const env = {
  CLIENT_BASE_URL: inDev ? "http://localhost:4000" : "https://trynexusai.xyz",
  API_URL: inDev
    ? "http://localhost:4001/api"
    : "https://api.trynexusai.xyz/api",
};
export default env;