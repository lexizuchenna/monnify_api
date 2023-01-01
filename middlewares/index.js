const axios = require("axios");

module.exports = {
  apiAuth: async () => {
    const data = await axios.post(
      `${process.env.BASE_URL}/api/v1/auth/login`,
      {
        body: "",
      },
      {
        headers: {
          Authorization: `Basic ${btoa(
            `${process.env.API_KEY}:${process.env.SECRET_KEY}`
          )}`,
        },
      }
    );
    return data.data.responseBody.accessToken;
  },
};
