import app from "@/app";
import { PORT } from "@/shared/constants/env";

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
