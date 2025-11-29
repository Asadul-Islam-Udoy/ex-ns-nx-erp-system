import app from "./app";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const PORT = process.env.PORT || 6000;

app.listen(PORT, () => {
  console.log(`server run successfully! ${PORT}`);
});
