// Script to check if the server is healthy

const PORT = process.env.PORT || 8080;

fetch(`http://localhost:${PORT}/health`)
  .then((r) => {
    if (!r.ok) {
      console.error(`Server is not healthy: ${r.status} ${r.statusText}`);
      process.exit(1);
    }
    process.exit(0);
  })
  .catch(() => {
    console.error(
      `Server is not healthy: could not connect to http://localhost:${PORT}/health`,
    );
    process.exit(1);
  });
