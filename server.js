const express = require("express");
const app = express();
const axios = require("axios");
const client = redis.createClient(6379);
client.on("error", (error) => {
  console.error(error);
});
app.get("/:name", async (req, res) => {
  try {
    const name = req.params.name;

    client.get(name, async (err, nationality) => {
      if (nationality) {
        return res.status(200).send({
          error: false,
          message: `Nationality for ${name} from the cache`,
          data: JSON.parse(nationality),
        });
      } else {
        const nationality = await axios.get(
          `https://api.nationalize.io/?name=${name}`
        );

        client.setex(name, 1440, JSON.stringify(nationality.data));
        res.status(200).send({
          error: false,
          message: "this is from the server",
          data: nationality.data,
        });
      }
    });
  } catch (error) {
    console.log(error.response.data);
  }
});

app.listen(3000, () => {
  console.log("server is running");
});
